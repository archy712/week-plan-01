-- 부서 주간업무 일지 서비스 — 데이터베이스 스키마 (Task 009에서 적용 완료)
--
-- 이 파일은 Supabase 프로젝트에 실제 적용된 스키마를 그대로 기록한 참고 문서입니다.
-- 아래 내용은 이미 mcp__supabase__apply_migration으로 적용되었으며, 실제 마이그레이션은
-- 다음 이름으로 분리되어 있습니다 (mcp__supabase__list_migrations로 확인 가능):
--   1. create_weekly_report_schema      — 테이블/인덱스/updated_at 트리거
--   2. weekly_report_rls_policies       — RLS 활성화, 헬퍼 함수, 정책, role 자기승격 방지
--   3. seed_departments                 — 고정 부서 5개 시딩
--   4. restrict_helper_function_execute (v2) — anon/authenticated에 대한 과도한 EXECUTE 권한 제거
--   5. move_rls_helpers_to_private_schema    — 헬퍼 함수를 PostgREST에 노출되지 않는
--      private 스키마로 이동 (get_advisors의 "Public/Signed-in Can Execute
--      SECURITY DEFINER Function" 경고 해소)
--
-- 스키마를 추가로 변경할 때는 이 파일을 초안으로 먼저 수정한 뒤 apply_migration으로
-- 적용하고, 적용이 끝나면 이 파일도 함께 최신 상태로 갱신합니다.
-- PRD 데이터 모델(docs/PRD.md의 "데이터 모델" 절)과 1:1로 대응합니다.

-- =====================================================================
-- 1. departments (부서)
-- =====================================================================

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

insert into public.departments (name) values
  ('개발팀'), ('기획팀'), ('디자인팀'), ('영업팀'), ('인사팀');

-- =====================================================================
-- 2. profiles (기존 테이블 확장) — department_id, role 컬럼
-- =====================================================================

create type public.user_role as enum ('user', 'admin');

alter table public.profiles
  add column department_id uuid references public.departments(id),
  add column role public.user_role not null default 'user';

-- =====================================================================
-- 3. weekly_reports (주간업무 일지)
-- =====================================================================

create table public.weekly_reports (
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

create index weekly_reports_department_week_idx
  on public.weekly_reports (department_id, week_start_date desc);

create index weekly_reports_author_idx
  on public.weekly_reports (author_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
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
-- 4. RLS — 부서별 접근 제어 (F006 핵심)
-- =====================================================================
--
-- 원칙: weekly_reports에 대한 SELECT/INSERT/UPDATE/DELETE는 전부
-- "department_id가 요청자의 profiles.department_id와 일치" 하거나
-- "요청자 role = 'admin'" 인 경우에만 허용한다. author_id는 권한 판단에
-- 사용하지 않는다 (같은 부서면 작성자와 무관하게 수정/삭제 가능해야 하므로).
--
-- 헬퍼 함수는 private 스키마에 둔다 — PostgREST는 public 스키마만 REST API로
-- 노출하므로, private 스키마의 함수는 /rest/v1/rpc/*로 직접 호출할 수 없다
-- (RLS 정책 안에서 참조하는 것은 스키마와 무관하게 가능).
-- profiles를 정책 안에서 직접 조회하면 재귀(recursion) 문제가 생기므로
-- SECURITY DEFINER로 우회한다.

create schema private;

create or replace function private.current_department_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select department_id from public.profiles where id = auth.uid()
$$;

create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  )
$$;

grant usage on schema private to authenticated;
grant execute on function private.current_department_id() to authenticated;
grant execute on function private.is_admin() to authenticated;

alter table public.weekly_reports enable row level security;

create policy "weekly_reports_select" on public.weekly_reports
  for select
  to authenticated
  using (department_id = private.current_department_id() or private.is_admin());

create policy "weekly_reports_insert" on public.weekly_reports
  for insert
  to authenticated
  with check (department_id = private.current_department_id() or private.is_admin());

create policy "weekly_reports_update" on public.weekly_reports
  for update
  to authenticated
  using (department_id = private.current_department_id() or private.is_admin())
  with check (department_id = private.current_department_id() or private.is_admin());

create policy "weekly_reports_delete" on public.weekly_reports
  for delete
  to authenticated
  using (department_id = private.current_department_id() or private.is_admin());

-- departments: 로그인 사용자는 전체 SELECT 가능, 쓰기는 정책이 없어 기본 차단
-- (MVP는 부서 목록을 대시보드/SQL로 수동 시딩, 앱 내 관리 화면 없음)

alter table public.departments enable row level security;

create policy "departments_select" on public.departments
  for select
  to authenticated
  using (true);

-- profiles.role 자기 승격 방지: 기존 "Users can update their own profile" 정책이
-- 본인 행의 모든 컬럼을 허용하므로, role 변경만 별도로 트리거에서 차단한다.
-- 인증된 클라이언트 컨텍스트(auth.role() = 'authenticated')에서의 변경 시도만
-- 막고, 관리자 승격은 Supabase 대시보드/SQL(서비스 컨텍스트)로만 수행한다.

create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and auth.role() = 'authenticated' then
    raise exception 'role 컬럼은 직접 수정할 수 없습니다';
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_self_escalation
  before update on public.profiles
  for each row
  execute function public.prevent_role_self_escalation();

-- =====================================================================
-- 5. 검증 결과 (Task 009 테스트 체크리스트, execute_sql로 JWT 시뮬레이션해 확인)
-- =====================================================================
--
-- [x] A부서 사용자 세션에서 B부서 weekly_reports SELECT 시 0건 반환
-- [x] A부서 사용자가 B부서 레코드 UPDATE/DELETE 시도 시 0행 영향
-- [x] role = 'admin' 계정이 전 부서 레코드를 SELECT/UPDATE/DELETE 가능
-- [x] 일반 사용자가 자신의 profiles.role을 admin으로 UPDATE 시도 시 실패
--     (예외: "role 컬럼은 직접 수정할 수 없습니다")
-- [x] department_id가 null인 사용자가 weekly_reports INSERT 시도 시 실패
--     (42501: row-level security policy violation)
-- [x] get_advisors(security) 경고 0건 — 남은 경고는 이번 스키마 작업과 무관한
--     기존 프로젝트 설정(Auth의 Leaked Password Protection 비활성화)뿐이며,
--     apply_migration/execute_sql로는 변경할 수 없는 Auth 서비스 설정이라
--     별도로 대시보드에서 확인 필요
