# Certed+ — 투자 포트폴리오·보고 관리

투자사가 펀드와 피투자사를 관리하고, 피투자사가 정기 보고서를 제출하는 역할 기반 웹 앱입니다.

## 주요 기능

- 투자사·피투자사 회원가입, 프로필 및 접근 화면 분리
- 펀드 생성과 피투자사 등록·연결
- 보고 주기·항목 설정, 보고서 요청과 제출 현황 대시보드
- 초대 수락·이메일 인증·보고서 제출
- 기업별 상세 정보와 보고서 확인

## 로컬 실행

Node.js와 npm이 필요합니다. 프로젝트별 의존성은 `package-lock.json`으로 고정합니다.

```bash
git clone https://github.com/hyscodebase/certed-bright-insight.git
cd certed-bright-insight
npm ci
# 아래 환경 설정을 먼저 준비한 뒤 실행합니다.
npm run dev
```

기본 개발 주소는 `http://localhost:8080`입니다. 포트가 사용 중이면 터미널에 표시되는 실제 주소를 확인하세요.

## 백엔드 설정

루트에 `.env.local`을 만들고 본인의 프로젝트 값으로 설정합니다.

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

`supabase/migrations/`에 펀드·기업·보고서·초대 관련 스키마와 정책이 있습니다. 개발용 DB에 마이그레이션을 준비하고 Supabase Auth 및 함수 배포를 설정하세요.

이메일 함수(`send-invitation-email`, `send-report-request-email`, `send-verification-code`)는 서버 환경의 `GMAIL_USER`, `GMAIL_APP_PASSWORD`를 사용합니다. 인증코드 함수는 Supabase 서버 환경도 필요합니다. 메일 발송은 프론트엔드만 실행해서 사용할 수 없습니다.

서버 전용 API 키와 `SUPABASE_SERVICE_ROLE_KEY`는 Edge Functions의 환경에만 설정합니다. 프론트엔드의 `VITE_` 변수에는 넣지 마세요. [Supabase 환경변수 안내](https://supabase.com/docs/guides/functions/secrets)를 참고하세요.

## 화면과 코드

| 경로 | 역할 |
|---|---|
| [src/App.tsx](src/App.tsx) | 투자사·피투자사별 라우팅 |
| [src/pages/](src/pages/) | 펀드·기업·보고서·인증 화면 |
| [src/components/reports/](src/components/reports/) | 보고 항목과 요청·상세 보기 |
| [src/hooks/](src/hooks/) | 펀드·피투자사·보고서 데이터 호출 |
| [supabase/](supabase/) | 이메일 함수와 DB 마이그레이션 |

## 개발 명령

| 명령 | 역할 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | ESLint 검사 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run test` | Vitest 실행 |

실제 스크립트 정의는 [package.json](package.json)에 있습니다. 기본 예제 테스트와 실제 기능의 검증 범위는 구분해 확인하세요.

## 사용 참고

투자사 화면은 펀드를 먼저 만든 뒤 피투자사를 배정하는 흐름입니다. 역할별 접근, 실제 이메일 전달, 초대 링크의 호스팅 주소는 준비한 백엔드 환경에서 확인하세요. 이 프로젝트는 포트폴리오 운영 정보를 관리하며 투자 수익을 예측하는 모델은 포함하지 않습니다.
