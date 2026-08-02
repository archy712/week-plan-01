# 부서 주간업무 일지 서비스 개발 로드맵

부서 구성원이 주간업무를 손쉽게 기록하고, 관리자는 전 부서 현황을 한곳에서 파악하며 필요 시 PDF로 공유할 수 있게 하는 서비스.

## 개요

부서 주간업무 일지 서비스는 **회사/조직 내 부서 소속 실무자와 전체 부서 현황을 취합해야 하는 관리자**를 위한 **주간업무 기록·공유 도구**로 다음 기능을 제공합니다:

- **주간업무 일지 CRUD (F001/F002/F003/F009/F010)**: 소속 부서의 주간업무를 주차 단위로 작성·조회·수정·삭제
- **부서 온보딩 및 접근 제어 (F004/F005/F006)**: 부서 선택을 강제하고, 부서 소속이면 작성자와 무관하게 전권 CRUD, 타 부서 데이터는 완전 격리
- **관리자 전체 부서 조회 (F007)**: `role = admin` 사용자가 부서를 선택해 전 부서 일지를 조회·수정·삭제
- **Notion 경유 PDF 다운로드 (F008)**: 서비스 소유 Notion 워크스페이스에 임시 페이지를 생성한 뒤 headless 브라우저로 PDF 변환해 즉시 전달

### 현재 코드베이스 상태 (개발 착수 시점)

| 영역 | 상태 |
|------|------|
| 인증 (F011) | ✅ 구현 완료 — `app/auth/*`, `components/login-form.tsx`, `sign-up-form.tsx`, `forgot-password-form.tsx`, `update-password-form.tsx`, `app/auth/confirm/route.ts` |
| 다크모드 (F012) | ✅ 구현 완료 — `next-themes` + `components/theme-switcher.tsx` (`app/layout.tsx`에서 `ThemeProvider` 직접 사용) |
| 프로필 수정 | ⚠️ 부분 구현 — `components/profile-form.tsx` (username / full_name / avatar_url만, **부서 선택 필드 없음**) |
| 세션/리다이렉트 | ✅ 구현 완료 — `proxy.ts` → `lib/supabase/proxy.ts`의 `updateSession()` (미인증 시 `/auth/login` 리다이렉트) |
| DB 스키마 | ⚠️ `profiles` 테이블만 존재 (`department_id`, `role` 컬럼 없음). `departments`, `weekly_reports` 테이블 **미존재** |
| F001~F010 | ❌ 전부 미구현 (신규 개발 범위) |

### 프로젝트 컨벤션 (모든 Task 공통 준수 사항)

- **`src/` 디렉토리 없음** — `app/`, `components/`, `lib/`는 프로젝트 루트. 경로 별칭 `@/*` → `./*`
- **Supabase 클라이언트 3종 엄격 분리**
  - `lib/supabase/client.ts` (`createBrowserClient`) → `"use client"` 컴포넌트 전용
  - `lib/supabase/server.ts` (`createServerClient` + `next/headers`의 `cookies()`) → Server Component / Route Handler에서 `await createClient()`. **전역 변수 저장 금지, 매 요청 새로 생성**
  - `lib/supabase/proxy.ts` (`updateSession()`) → `proxy.ts` 전용. 쿠키 읽기/재기록 로직은 임의 변경 금지
- **세션 확인은 `supabase.auth.getClaims()`** (`getUser()` 아님). 사용자 ID는 `data.claims.sub`
- **Next.js 16**: `middleware.ts`가 아니라 **`proxy.ts`** (`export function proxy`). `cacheComponents: true`이므로 인증 의존 데이터 페칭은 `Suspense` 경계 안에서 처리. `cookies()`, `headers()`, `params`, `searchParams`는 전부 **비동기**
- **폼 패턴**: Server Action이 아니라 **Client Component에서 `supabase.*`를 직접 호출** (`login-form.tsx`, `profile-form.tsx` 참고)
- **스타일링**: Tailwind v4 + shadcn/ui(`new-york`)이나, 색상 토큰은 `app/globals.css`의 `:root`/`.dark` HSL 변수 + `tailwind.config.ts`의 `theme.extend.colors` **양쪽을 함께** 수정. 클래스 조합은 `cn()`
- **네이밍**: 파일명 kebab-case, 컴포넌트명 PascalCase
- **DB 타입**: 스키마 변경 시 `mcp__supabase__generate_typescript_types`로 `lib/supabase/database.types.ts` 재생성. 컴포넌트에서는 `Tables<"테이블명">` + `Pick`
- **상세 가이드**: `docs/guides/`의 `product-structure.md`, `component-patterns.md`, `styling-guide.md`, `forms-react-hook-form.md`, `nextjs-16.md`를 작업 전 참고

---

## 개발 워크플로우

1. **작업 계획**

- 기존 코드베이스를 학습하고 현재 상태를 파악
- 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
- 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**

- 기존 코드베이스를 학습하고 현재 상태를 파악
- 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
- API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)
- 새 작업 문서에는 빈 체크박스만 있어야 하며, 변경 사항 요약은 완료 후에 채운다

3. **작업 구현**

- 작업 파일의 명세서를 따름
- 기능과 기능성 구현
- **API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수**
- 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
- 구현 완료 후 Playwright MCP를 사용한 E2E 테스트 실행
- 테스트 통과 확인 후 다음 단계로 진행
- 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**

- 로드맵에서 완료된 작업을 ✅로 표시

---

## 개발 단계

### Phase 1: 애플리케이션 골격 구축

> 전체 라우트/타입/레이아웃의 뼈대를 먼저 세워, Phase 2(UI)와 Phase 3(데이터)가 병렬로 진행될 수 있는 기반을 만든다. 이 Phase에서는 **실제 DB 접근이나 비즈니스 로직을 구현하지 않는다.**

- **Task 001: 주간업무 라우트 구조 및 페이지 스캐폴딩** - ✅ 완료
  - `app/protected/reports/page.tsx` (주간업무 목록), `app/protected/reports/new/page.tsx` (작성), `app/protected/reports/[id]/page.tsx` (상세) 빈 껍데기 생성
  - `app/protected/admin/page.tsx` (관리자 대시보드 - 전체 부서 조회) 빈 껍데기 생성
  - 각 세그먼트에 `loading.tsx` / `error.tsx` 추가 (`cacheComponents: true` 환경에서 Suspense 폴백 확보)
  - `app/protected/[id]` 동적 세그먼트의 `params`를 **비동기(`await params`)로 수신**하는 시그니처로 작성 (Next.js 16 규칙)
  - 스타터킷 잔여물 정리: `app/protected/page.tsx`를 `/protected/reports`로 리다이렉트하도록 변경, `components/tutorial/*` 참조 제거
  - 각 페이지는 제목 + 자리표시자 텍스트만 렌더링하고 데이터 페칭 없음
  - 수락 기준: `npm run build` 성공, 로그인 후 4개 신규 경로가 모두 200으로 응답

- **Task 002: 도메인 타입 정의 및 데이터베이스 스키마 설계** - ✅ 완료
  - `lib/types/department.ts`: `Department`(id, name, created_at) 타입 정의
  - `lib/types/weekly-report.ts`: `WeeklyReport`(id, department_id, author_id, week_start_date, content, target_end_date, notion_page_id, created_at, updated_at), 목록용 조인 뷰 타입(`WeeklyReportListItem`: 작성자 이름/부서명 포함), 폼 입력 타입(`WeeklyReportInput`) 정의
  - `lib/types/profile.ts`: `UserRole = "user" | "admin"`, 부서 정보가 결합된 `ProfileWithDepartment` 타입 정의
  - `lib/types/api.ts`: PDF 다운로드 등 Route Handler 응답 타입(`ApiResult<T>`, `ApiError`) 정의
  - `docs/db/schema.sql` 초안 작성 (실행하지 않음): `departments` 신규 테이블, `profiles`에 `department_id uuid → departments.id` + `role` enum(`user`/`admin`, 기본값 `user`) 컬럼 추가, `weekly_reports` 신규 테이블 DDL
  - `weekly_reports` 인덱스 설계 명시: `(department_id, week_start_date desc)` 복합 인덱스, `author_id` 인덱스
  - RLS 정책 설계 문서화(구현은 Task 009): 조회/삽입/수정/삭제 모두 **`department_id`가 요청자의 `profiles.department_id`와 일치하거나 요청자 `role = 'admin'`** 인 경우에만 허용 (author_id는 권한 판단에 사용하지 않음 — PRD 명시)
  - 수락 기준: `npx tsc --noEmit` 무오류, 모든 타입이 PRD 데이터 모델 필드와 1:1 대응

- **Task 003: 역할 기반 공통 레이아웃 및 네비게이션 골격 구현** - ✅ 완료
  - `app/protected/layout.tsx`를 스타터킷 데모 형태에서 서비스 레이아웃으로 교체 (`DeployButton` 제거, 서비스명 반영)
  - `components/main-nav.tsx` 신규: 주간업무 목록 / 주간업무 작성 / 전체 부서 조회 / 프로필 / 로그아웃 메뉴 골격 (표시 조건은 props로 주입, 이 단계에서는 하드코딩 값 사용)
  - PRD 메뉴 구조 3종 분기 자리 확보: ① 일반 사용자(부서 선택 완료) ② 부서 미선택(온보딩 강제 — 목록/작성 메뉴 비노출) ③ 관리자(전체 부서 조회 메뉴 추가)
  - 푸터에 기존 `components/theme-switcher.tsx` 유지 (F012 재사용, 신규 개발 없음)
  - `lib/auth/guards.ts` **시그니처만** 정의: `requireUser()`, `requireDepartment()`, `requireAdmin()` (내부 구현은 Task 010/012에서 채움)
  - 모바일 대응 네비게이션 구조(햄버거 토글 자리) 마련
  - 수락 기준: 3종 메뉴 상태를 props로 전환했을 때 각각 올바른 메뉴 세트가 렌더링됨

### Phase 2: UI/UX 완성 (더미 데이터 활용)

> 모든 화면을 하드코딩 더미 데이터로 완성한다. 이 Phase가 끝나면 DB 없이도 전체 사용자 플로우를 클릭으로 체험할 수 있어야 한다.

- **Task 004: 공통 UI 컴포넌트 및 더미 데이터 레이어 구축** - ✅ 완료
  - shadcn/ui 프리미티브 추가: `npx shadcn@latest add select textarea table dialog alert-dialog skeleton sonner separator` (현재 badge/button/card/checkbox/dropdown-menu/input/label만 존재)
  - `components/ui/` 추가분이 `new-york` 스타일 및 기존 HSL 변수 테마와 충돌하지 않는지 확인 (새 색상 토큰 필요 시 `app/globals.css`의 `:root`/`.dark`와 `tailwind.config.ts`를 함께 수정)
  - `lib/mock/departments.ts`: 고정 부서 목록 더미 (개발/기획/디자인/영업 등 4~5개)
  - `lib/mock/weekly-reports.ts`: 주차·부서·작성자가 섞인 주간업무 더미 20건 이상
  - `lib/utils/week.ts`: 주차 계산 유틸 (`getWeekStartDate()`, `formatWeekRange()`, `toWeekOptions()`) — 주 시작 기준(월요일)을 상수로 고정
  - `components/empty-state.tsx`, `components/page-header.tsx` 공통 컴포넌트 작성
  - 수락 기준: 더미 데이터가 Task 002의 타입을 그대로 만족(`satisfies` 검증), 주차 유틸 경계값(연말/연초) 수동 확인

- **Task 005: 프로필·온보딩 화면 UI 구현 (F004/F005 UI)** - ✅ 완료
  - `components/profile-form.tsx` 확장: 기존 사용자 이름/이름 필드 유지 + **부서 선택 드롭다운**(`Select`) 추가
  - 부서 미선택 시 안내 배너 표시: "부서를 선택해야 서비스를 이용할 수 있습니다"
  - 온보딩 강제 상태에서는 네비게이션에 프로필/로그아웃만 노출되도록 Task 003 레이아웃과 연결
  - React Hook Form + Zod로 폼 상태/검증 전환 (`docs/guides/forms-react-hook-form.md` 준수), 부서는 필수 값으로 스키마 정의
  - 저장 성공/실패 피드백 UI (이 단계에서는 더미 핸들러, 실제 저장은 Task 010)
  - 수락 기준: 부서 미선택/선택 완료 두 상태의 화면이 모두 시각적으로 완성됨

- **Task 006: 주간업무 목록 화면 UI 구현 (F002/F010 UI)** - ✅ 완료
  - `app/protected/reports/page.tsx` UI 완성 (더미 데이터 기반, 최신순 정렬)
  - `components/weekly-report-list.tsx`: 주차 시작일 / 작성자 / 내용 요약 / 목표 종료일 컬럼 표시, 항목 클릭 시 상세로 이동
  - `components/week-filter.tsx`: 주차 필터 드롭다운
  - **새 일지 작성** 버튼(→ `/protected/reports/new`), 항목별 **삭제** 아이콘 + `AlertDialog` 확인 모달
  - **PDF 다운로드** 버튼(부서 단위) 자리 배치 + 로딩/진행 상태 UI (실제 동작은 Task 013)
  - 데이터 없음 상태(`EmptyState`), 로딩 스켈레톤 처리
  - 반응형: 모바일에서는 테이블 대신 카드 리스트로 전환
  - 수락 기준: 더미 데이터로 목록·필터·삭제 확인 모달까지 클릭 플로우가 끊김 없이 동작

- **Task 007: 주간업무 작성·상세 화면 UI 구현 (F001/F003/F009 UI)** - ✅ 완료
  - `components/weekly-report-form.tsx`: 작성/수정 공용 폼 — 주차(시작일) 선택, 업무 내용 자유 텍스트(`Textarea`), 목표 종료일(선택 입력), **저장** / **취소** 버튼
  - React Hook Form + Zod 스키마: `week_start_date` 필수, `content` 필수(최소 길이), `target_end_date` nullable + `week_start_date` 이후 날짜 검증
  - `app/protected/reports/new/page.tsx`: 작성 모드 연결, 취소 시 목록 복귀
  - `app/protected/reports/[id]/page.tsx`: 상세 조회 + 인라인 수정 + **삭제** 버튼(확인 모달) + **목록으로** 이동
  - 상세 화면에 작성자·부서·생성/수정 일시 표시 (작성자는 표시용, 권한 판단에는 사용하지 않음)
  - 진입 경로에 따른 복귀 처리 설계: 목록에서 왔으면 목록으로, 관리자 대시보드에서 왔으면 대시보드로 (`?from=` 쿼리 파라미터, `searchParams`는 **await** 필요)
  - 수락 기준: 작성 → 목록 복귀, 상세 → 수정 → 복귀, 상세 → 삭제 → 복귀 3개 플로우가 더미 데이터로 완주

- **Task 008: 관리자 대시보드 화면 UI 구현 (F007 UI)** - ✅ 완료
  - `app/protected/admin/page.tsx` UI 완성: 전체 부서 목록에서 부서 선택 → 해당 부서 주간업무 목록 표시
  - Task 006의 `weekly-report-list.tsx` / `week-filter.tsx`를 **부서 파라미터만 확장해 재사용** (중복 구현 금지)
  - 부서 선택 드롭다운, 항목별 삭제 아이콘, 부서 단위 **PDF 다운로드** 버튼 배치
  - 관리자는 읽기 전용이 아님을 UI에서 명확히 표현 (수정·삭제 액션 노출)
  - 일반 사용자에게는 이 메뉴 자체가 비노출임을 Task 003 네비게이션과 연결해 확인
  - 수락 기준: 더미 데이터로 부서 전환 시 목록이 바뀌고, 항목 클릭 시 `?from=admin`으로 상세 진입

### Phase 3: 핵심 기능 구현

> 더미 데이터를 실제 Supabase 데이터로 교체하고 RLS 기반 권한을 확정한다. 이 Phase의 모든 Task는 Playwright MCP 테스트가 **필수**다.

- **Task 009: 데이터베이스 스키마 마이그레이션 및 RLS 정책 구현** - ✅ 완료
  - `mcp__supabase__apply_migration`으로 마이그레이션 적용:
    - `departments` 테이블 생성 (id uuid pk default gen_random_uuid(), name text not null unique, created_at timestamptz default now())
    - `user_role` enum 타입(`user` / `admin`) 생성
    - `profiles`에 `department_id uuid references departments(id)`(nullable), `role user_role not null default 'user'` 컬럼 추가
    - `weekly_reports` 테이블 생성 (id, department_id → departments.id not null, author_id → profiles.id, week_start_date date not null, content text not null, target_end_date date null, notion_page_id text null, created_at/updated_at timestamptz)
    - `updated_at` 자동 갱신 트리거, `(department_id, week_start_date desc)` 복합 인덱스
  - RLS 활성화 및 정책 작성 (F006 핵심):
    - 헬퍼 함수 `public.current_department_id()`, `public.is_admin()` (SECURITY DEFINER, `profiles` 조회 시 RLS 재귀 방지)
    - `weekly_reports` SELECT/INSERT/UPDATE/DELETE 4개 정책 모두 `department_id = current_department_id() OR is_admin()` 조건 — **author_id 조건 사용 금지**
    - `departments` SELECT는 로그인 사용자 전체 허용, 쓰기는 차단 (MVP는 대시보드에서 수동 시딩)
    - `profiles`의 `role` 컬럼은 사용자가 직접 UPDATE할 수 없도록 정책/트리거로 차단 (권한 상승 방지)
  - 고정 부서 목록 시딩 (Supabase 대시보드 또는 seed 마이그레이션)
  - `mcp__supabase__generate_typescript_types`로 `lib/supabase/database.types.ts` 재생성
  - `mcp__supabase__get_advisors`로 보안 경고(RLS 미적용 테이블, SECURITY DEFINER 뷰 등) 0건 확인
  - 수락 기준: 서로 다른 부서 계정 2개로 교차 조회/수정/삭제 시도가 **DB 레벨에서** 전부 차단됨

#### 테스트 체크리스트 (Task 009)
- [ ] `mcp__supabase__execute_sql`로 A부서 사용자 세션에서 B부서 `weekly_reports` SELECT 시 0건 반환
- [ ] A부서 사용자가 B부서 레코드 UPDATE/DELETE 시도 시 0행 영향
- [ ] `role = 'admin'` 계정이 전 부서 레코드를 SELECT/UPDATE/DELETE 가능
- [ ] 일반 사용자가 자신의 `profiles.role`을 `admin`으로 UPDATE 시도 시 실패
- [ ] `department_id`가 null인 사용자가 `weekly_reports` INSERT 시도 시 실패
- [ ] `get_advisors` security 카테고리 경고 0건

- **Task 010: 부서 선택 온보딩 및 강제 리디렉션 구현 (F004/F005)**
  - `components/profile-form.tsx`의 부서 선택을 실제 저장으로 연결: 클라이언트에서 `lib/supabase/client.ts`의 `createClient()`로 `profiles.update({ department_id })` (프로젝트 폼 컨벤션 준수)
  - `app/protected/profile/page.tsx`에서 `lib/supabase/server.ts`의 `createClient()` + `getClaims()`로 프로필과 `departments` 목록을 서버에서 페칭해 폼에 주입
  - `lib/auth/guards.ts` 구현: `requireUser()`(getClaims 실패 시 `/auth/login`), `requireDepartment()`(`department_id`가 null이면 `/protected/profile`로 `redirect()`)
  - `app/protected/layout.tsx`(또는 `app/protected/reports/layout.tsx`)에서 `requireDepartment()` 호출 — 온보딩 미완료 사용자의 주간업무 영역 접근 차단
  - `lib/supabase/proxy.ts`의 `updateSession()` 확장: 공개 경로 판정 로직을 정리하고, 로그인 성공 후 기본 진입지를 `/protected/reports`로 유도. **쿠키 getAll/setAll 처리부와 `createServerClient`↔`getClaims()` 사이 코드 삽입 금지 규칙은 그대로 유지**
    - 트레이드오프 명시: `department_id`는 JWT 클레임에 없어 proxy에서 판정하려면 요청마다 DB 조회가 발생. MVP는 **proxy = 인증 여부만, Server Component 가드 = 부서/역할 판정**으로 분리한다
  - Task 003 네비게이션에 실제 부서/역할 상태 주입 (부서 미선택 시 목록/작성 메뉴 비노출)
  - 부서 저장 성공 시 `/protected/reports`로 이동 + `router.refresh()`
  - 수락 기준: 부서 미선택 계정이 `/protected/reports`, `/protected/reports/new`, `/protected/admin` 직접 URL 입력 시 모두 `/protected/profile`로 리다이렉트

#### 테스트 체크리스트 (Task 010)
- [ ] Playwright MCP: 신규 가입 → 로그인 → 자동으로 프로필 페이지 도달 및 안내 배너 노출 확인
- [ ] Playwright MCP: 부서 미선택 상태에서 `/protected/reports` 직접 접근 → 프로필로 리다이렉트
- [ ] Playwright MCP: 부서 선택·저장 → 주간업무 목록으로 이동, 네비게이션에 목록/작성 메뉴 등장
- [ ] Playwright MCP: 재로그인 시 부서가 유지되고 프로필로 되돌아가지 않음
- [ ] 미인증 상태에서 보호 경로 접근 시 `/auth/login` 리다이렉트(기존 동작 회귀 없음)
- [ ] 부서 미선택 저장 시도 시 Zod 검증 에러 노출

- **Task 011: 주간업무 CRUD 데이터 연동 (F001/F002/F003/F009/F010)**
  - `lib/data/weekly-reports.ts` 신규: `listReportsByDepartment(departmentId, weekStart?)`, `getReportById(id)` — Server Component용 조회 함수 (`lib/supabase/server.ts` 사용, `profiles` 조인으로 작성자명 포함)
  - `app/protected/reports/page.tsx`에서 더미 데이터를 실제 조회로 교체, 주차 필터를 `searchParams`(await 필요)와 연결
  - `app/protected/reports/[id]/page.tsx`에서 `await params`로 id 수신 후 실제 조회, 미존재 시 `notFound()`
  - 작성/수정/삭제는 Client Component에서 `lib/supabase/client.ts`로 직접 `insert` / `update` / `delete` 실행 후 `router.refresh()` + 목록 복귀
  - INSERT 시 `department_id`는 클라이언트 입력이 아니라 **서버에서 내려준 사용자 프로필 값**을 사용, `author_id`는 현재 사용자 id
  - `cacheComponents: true` 대응: 인증 의존 데이터 페칭을 `Suspense` 경계 안에 배치하고 캐시 오염이 없는지 확인
  - 에러 핸들링: Supabase 에러를 사용자 메시지로 변환, `error.tsx`에서 복구 UI 제공
  - 수락 기준: 더미 데이터 참조(`lib/mock/*`)가 제품 코드에서 완전히 제거됨

#### 테스트 체크리스트 (Task 011)
- [ ] Playwright MCP: 일지 작성 → 목록에 즉시 반영(최신순 최상단) 확인
- [ ] Playwright MCP: 목록 항목 클릭 → 상세 진입 → 내용 수정 → 저장 → 목록에 반영된 내용 확인
- [ ] Playwright MCP: 상세에서 삭제 → 확인 모달 → 목록에서 사라짐 확인
- [ ] Playwright MCP: 목록에서 항목별 삭제 아이콘 → 확인 모달 → 즉시 삭제 확인
- [ ] Playwright MCP: 주차 필터 변경 시 해당 주차 항목만 노출
- [ ] Playwright MCP: 같은 부서 **다른 사용자**가 작성한 일지를 수정·삭제할 수 있음 (F006 핵심)
- [ ] 엣지 케이스: 존재하지 않는 `[id]` 접근 시 404, 빈 목록일 때 EmptyState, `content` 미입력 시 검증 에러, `target_end_date` 미입력 시 정상 저장

- **Task 012: 부서별 RBAC 및 관리자 전체 부서 조회 구현 (F006/F007)**
  - `lib/auth/guards.ts`에 `requireAdmin()` 구현: `profiles.role !== 'admin'`이면 `/protected/reports`로 리다이렉트(또는 404 처리)
  - `app/protected/admin/page.tsx`에서 `requireAdmin()` 적용 + 실제 `departments` 목록 조회, 선택 부서를 `searchParams`로 관리
  - Task 011의 `listReportsByDepartment()`를 **부서 파라미터만 확장해 재사용** (관리자 전용 중복 조회 함수 작성 금지)
  - 상세 페이지 접근 제어: 조회 결과가 RLS로 걸러지므로 결과 없음 → `notFound()`. 애플리케이션 레벨에서도 부서/관리자 이중 방어 확인
  - 네비게이션의 "전체 부서 조회" 메뉴를 `role === 'admin'`일 때만 렌더링 (메뉴 은닉은 UX일 뿐, 실제 차단은 가드 + RLS)
  - 관리자가 타 부서 일지를 수정·삭제할 수 있음을 확인 (PRD: 읽기 전용 아님)
  - 수락 기준: 일반 사용자의 `/protected/admin` 직접 접근이 차단되고, 관리자는 전 부서 CRUD 가능

#### 테스트 체크리스트 (Task 012)
- [ ] Playwright MCP: 일반 사용자 로그인 → 네비게이션에 "전체 부서 조회" 미노출
- [ ] Playwright MCP: 일반 사용자가 `/protected/admin` 직접 URL 접근 → 차단/리다이렉트
- [ ] Playwright MCP: 일반 사용자가 타 부서 일지 상세 URL 직접 접근 → 404
- [ ] Playwright MCP: 관리자 로그인 → 전체 부서 조회 진입 → 부서 전환 시 목록 변경 확인
- [ ] Playwright MCP: 관리자가 타 부서 일지를 상세 진입 → 수정 저장 → 반영 확인
- [ ] Playwright MCP: 관리자가 타 부서 일지 삭제 → 목록에서 제거 확인
- [ ] 엣지 케이스: 부서가 0건일 때 관리자 대시보드 EmptyState, 선택 부서에 일지가 없을 때 안내

- **Task 013: Notion 경유 PDF 다운로드 구현 (F008)**
  - 의존성 추가: `@notionhq/client`, headless 렌더링용 `puppeteer-core` + `@sparticuz/chromium`(Vercel 서버리스 호환) 또는 `playwright-core`
  - 환경변수 추가: `NOTION_API_KEY`, `NOTION_PARENT_PAGE_ID`(서비스 소유 워크스페이스의 부모 페이지/DB). `.env.local` 및 `lib/utils.ts`의 `hasEnvVars` 패턴에 맞춘 누락 감지 처리
  - `lib/notion/client.ts`: Notion SDK 클라이언트 팩토리 (**서버 전용**, `NEXT_PUBLIC_` 접두사 절대 금지)
  - `lib/notion/report-page.ts`: 부서/주차 데이터를 Notion 블록으로 변환해 임시 페이지 생성, 생성된 page id를 `weekly_reports.notion_page_id`에 캐시
  - `lib/pdf/render.ts`: 생성된 Notion 페이지를 공유 상태로 전환 → headless 브라우저로 렌더링 → PDF 버퍼 반환
  - `app/api/reports/pdf/route.ts` Route Handler: `lib/supabase/server.ts`의 `createClient()` + `getClaims()`로 인증 확인 → **요청한 department_id에 대한 권한 재검증(본인 부서 또는 admin)** → PDF 생성 → `Content-Type: application/pdf`, `Content-Disposition: attachment` 응답
  - 목록 페이지 / 관리자 대시보드의 PDF 다운로드 버튼을 실제 호출로 연결 (생성 대기 로딩 상태, 실패 시 토스트)
  - 실행 시간 대비: Route Handler `maxDuration` 상향, 타임아웃/재시도 정책, Notion rate limit(초당 3req) 대응
  - 임시 Notion 페이지 정리 전략 문서화 (재사용 vs 즉시 아카이브)
  - 수락 기준: 부서 단위 PDF가 실제로 다운로드되고, 타 부서 department_id로 요청 시 403

#### 테스트 체크리스트 (Task 013)
- [ ] Playwright MCP: 목록 페이지에서 PDF 다운로드 클릭 → 다운로드 이벤트 발생 및 파일 수신 확인
- [ ] Playwright MCP: 관리자 대시보드에서 선택 부서 PDF 다운로드 확인
- [ ] Playwright MCP `browser_network_requests`: `/api/reports/pdf` 응답이 200 + `application/pdf` 확인
- [ ] 권한 테스트: 타 부서 `department_id` 파라미터로 API 직접 호출 시 403 (일반 사용자), 관리자는 200
- [ ] 미인증 상태에서 API 직접 호출 시 401
- [ ] 엣지 케이스: 일지 0건인 부서 PDF 요청 시 처리, Notion API 실패 시 사용자 친화적 에러 메시지, 다운로드 중 중복 클릭 방지
- [ ] `NOTION_API_KEY` 미설정 환경에서 앱이 크래시하지 않고 기능만 비활성화되는지 확인

- **Task 013-1: 핵심 기능 통합 테스트**
  - Playwright MCP를 사용한 전체 사용자 플로우 E2E 테스트 (PRD 사용자 여정 1~6단계 전 구간)
  - 3종 계정 시나리오: ① 부서 미선택 신규 사용자 ② 부서 소속 일반 사용자 ③ 관리자
  - 부서 격리 검증: A부서 계정으로 B부서 데이터에 접근하는 모든 경로(목록/상세 URL/API) 차단 확인
  - 협업 편집 검증: 동일 부서 다른 사용자가 작성한 일지의 수정·삭제 성공 확인
  - 에러 핸들링 및 엣지 케이스: 네트워크 실패, 세션 만료 후 액션, 동시 편집(뒤 저장 우선), 잘못된 날짜 입력, 초장문 content
  - 다크모드(F012) 전환 시 신규 화면 전부 정상 렌더링 확인
  - 반응형 검증: `browser_resize`로 모바일(375px)/태블릿(768px)/데스크톱(1440px) 레이아웃 확인
  - 콘솔 에러 0건 확인 (`browser_console_messages`)
  - 수락 기준: F001~F012 전 기능의 수락 시나리오가 모두 통과

### Phase 4: 고급 기능 및 최적화

- **Task 014: 사용자 경험 향상 및 예외 처리 고도화**
  - 전역 토스트(`sonner`) 도입: 저장/삭제/PDF 생성 성공·실패 알림 통일
  - 낙관적 업데이트 및 삭제 후 목록 갱신 UX 개선
  - `loading.tsx` 스켈레톤 정교화, 스트리밍 SSR 경계 최적화
  - 접근성: 폼 라벨/에러 `aria-*` 연결, 키보드 내비게이션, 다이얼로그 포커스 트랩 검증
  - 주차 필터 기본값(이번 주) 및 URL 상태 동기화, 목록 페이지네이션 또는 무한 스크롤
  - 세션 만료 감지 시 안내 후 로그인 유도

- **Task 015: 성능 최적화 및 배포 파이프라인 구축**
  - `cacheComponents: true` 기반 캐싱 전략 정리: 부서 목록 등 정적 데이터에 `"use cache"` 적용, 사용자별 데이터는 캐시 제외
  - 번들 분석 및 클라이언트 컴포넌트 최소화 (Server Component 우선 원칙 점검)
  - DB 쿼리 최적화: 목록 조회 select 컬럼 최소화, 조인/인덱스 실행 계획 확인, N+1 제거
  - Vercel 배포 설정: 환경변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NOTION_API_KEY`, `NOTION_PARENT_PAGE_ID`) 구성, PDF 생성 함수 메모리/타임아웃 설정
  - CI 파이프라인: `npm run lint` + `npx tsc --noEmit` + `npm run build` 자동 검증
  - `mcp__supabase__get_advisors`(security/performance) 정기 점검 및 `get_logs` 기반 에러 모니터링 절차 문서화
  - `README.md`/`CLAUDE.md`에 신규 라우트·환경변수·부서 시딩 절차 반영

---

## 기능 커버리지 매트릭스

| 기능 ID | 기능명 | 담당 Task |
|---------|--------|-----------|
| F001 | 주간업무 작성 | Task 001, 007, 011 |
| F002 | 주간업무 목록 조회 | Task 001, 006, 011 |
| F003 | 주간업무 상세 조회 | Task 001, 007, 011 |
| F004 | 부서 선택(온보딩) | Task 005, 009, 010 |
| F005 | 온보딩 강제 리디렉션 | Task 003, 010 |
| F006 | 부서별 접근 제어(RBAC) | Task 002, 009, 012 |
| F007 | 관리자 전체 부서 조회 | Task 008, 012 |
| F008 | Notion 경유 PDF 다운로드 | Task 006, 008, 013 |
| F009 | 주간업무 수정 | Task 007, 011, 012 |
| F010 | 주간업무 삭제 | Task 006, 007, 011 |
| F011 | 기본 인증 | ✅ 기존 스타터킷 재사용 (신규 개발 없음) |
| F012 | 다크모드 토글 | ✅ 기존 `ThemeSwitcher` 재사용 (Task 003에서 레이아웃 배치만) |

## MVP 제외 범위 (개발하지 않음)

- 주간업무 항목별 세분화(할 일/이슈/다음 주 계획 구조화 필드) — MVP는 자유 텍스트 `content` 1개 필드
- 댓글/피드백, 승인 워크플로우(결재선)
- 부서 관리 UI(생성/수정/삭제) — Supabase 대시보드에서 고정 목록 직접 시딩 (Task 009)
- 관리자 역할 부여 UI — Supabase 대시보드에서 `profiles.role` 직접 수정
- 사용자별 Notion OAuth 연동 — 서비스 소유 워크스페이스 하나로 처리 (Task 013)
- 알림(마감 리마인더), 통계/대시보드 차트
- 프로필 상세 관리 확장(아바타 업로드 등)

## 주요 리스크 및 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| Notion API에 공식 PDF export 엔드포인트 없음 | F008 구현 불확실성 최상 | 옵션 A(서비스 소유 워크스페이스 + headless 렌더링) 채택. Task 013 착수 전 렌더링 PoC를 먼저 수행하고, 실패 시 서버 사이드 HTML→PDF 직접 생성으로 폴백 |
| Vercel 서버리스에서 headless Chromium 실행 제약 | PDF 다운로드 실패 | `@sparticuz/chromium` 사용, 함수 메모리/`maxDuration` 상향, 장기적으로 별도 렌더링 서비스 분리 검토 |
| `department_id`가 JWT 클레임에 없어 proxy에서 온보딩 판정 불가 | 요청마다 DB 조회 시 성능 저하 | proxy는 인증 여부만 판정, 부서/역할 판정은 Server Component 가드(`lib/auth/guards.ts`)에서 처리 |
| RLS 정책 오류로 부서 간 데이터 유출 | 서비스 신뢰성 치명 | Task 009에서 교차 계정 SQL 테스트 필수, `get_advisors` 경고 0건 확인, Task 012/013-1에서 재검증 |
| `cacheComponents: true` 환경에서 사용자별 데이터 캐시 오염 | 타 사용자 데이터 노출 | 인증 의존 페칭은 `Suspense` 경계 내 동적 렌더링, `"use cache"`는 부서 목록 등 비개인 데이터에만 적용 |
