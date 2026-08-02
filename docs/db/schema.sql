-- 부서 주간업무 일지 서비스 — 데이터베이스 스키마 초안 (Task 002)
--
-- 이 파일은 설계 문서입니다. 아직 실행하지 않았습니다.
-- 실제 적용(mcp__supabase__apply_migration)과 RLS 활성화는 Task 009에서 수행합니다.
-- PRD 데이터 모델(docs/PRD.md의 "데이터 모델" 절)과 1:1로 대응합니다.

-- =====================================================================
-- 1. departments (부서) — 신규 테이블
-- =====================================================================

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- 2. profiles (기존 테이블 확장) — department_id, role 컬럼 추가
-- =====================================================================

create type public.user_role as enum ('user', 'admin');

alter table public.profiles
  add column if not exists department_id uuid references public.departments(id),
  add column if not exists role public.user_role not null default 'user';

-- =====================================================================
-- 3. weekly_reports (주간업무 일지) — 신규 테이블
-- =====================================================================

create table if not exists public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id),
  author_id uuid not null references public.profiles(id),
  week_start_date date not null,
  content text not null,
  target_end_date date,
  notion_page_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 목록 조회(부서+주차 최신순)와 작성자별 조회를 위한 인덱스
create index if not exists weekly_reports_department_week_idx
  on public.weekly_reports (department_id, week_start_date desc);

create index if not exists weekly_reports_author_idx
  on public.weekly_reports (author_id);

-- updated_at 자동 갱신 트리거
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger weekly_reports_set_updated_at
  before update on public.weekly_reports
  for each row
  execute function public.set_updated_at();

-- =====================================================================
-- 4. RLS 정책 설계 (문서화만 — 활성화 및 적용은 Task 009)
-- =====================================================================
--
-- 핵심 원칙(PRD F006): weekly_reports에 대한 SELECT/INSERT/UPDATE/DELETE는
-- 전부 "department_id가 요청자의 profiles.department_id와 일치" 하거나
-- "요청자 role = 'admin'" 인 경우에만 허용한다. author_id는 권한 판단에 사용하지 않는다
-- (같은 부서면 작성자와 무관하게 수정/삭제 가능해야 하므로).
--
-- profiles를 RLS 정책 내부에서 직접 조회하면 재귀(recursion) 문제가 생길 수 있으므로,
-- SECURITY DEFINER 헬퍼 함수로 우회한다.
--
-- alter table public.weekly_reports enable row level security;
--
-- create or replace function public.current_department_id()
-- returns uuid
-- language sql
-- security definer
-- stable
-- as $$
--   select department_id from public.profiles where id = auth.uid()
-- $$;
--
-- create or replace function public.is_admin()
-- returns boolean
-- language sql
-- security definer
-- stable
-- as $$
--   select role = 'admin' from public.profiles where id = auth.uid()
-- $$;
--
-- create policy "weekly_reports_select" on public.weekly_reports
--   for select
--   using (department_id = public.current_department_id() or public.is_admin());
--
-- create policy "weekly_reports_insert" on public.weekly_reports
--   for insert
--   with check (department_id = public.current_department_id() or public.is_admin());
--
-- create policy "weekly_reports_update" on public.weekly_reports
--   for update
--   using (department_id = public.current_department_id() or public.is_admin());
--
-- create policy "weekly_reports_delete" on public.weekly_reports
--   for delete
--   using (department_id = public.current_department_id() or public.is_admin());
--
-- departments: 로그인 사용자는 전체 SELECT 가능, 쓰기는 차단(MVP는 대시보드에서 수동 시딩)
--
-- alter table public.departments enable row level security;
--
-- create policy "departments_select" on public.departments
--   for select
--   to authenticated
--   using (true);
--
-- profiles.role: 사용자가 직접 UPDATE할 수 없도록 차단(권한 상승 방지).
-- 기존 profiles UPDATE 정책이 본인 행 전체를 허용한다면, role 컬럼만 별도로 막는
-- BEFORE UPDATE 트리거(요청자가 관리자가 아니면 new.role := old.role) 또는
-- 컬럼 단위 GRANT 제한으로 구현한다. 구체적인 방식은 Task 009에서 기존 profiles
-- RLS 정책을 확인한 뒤 확정한다.
