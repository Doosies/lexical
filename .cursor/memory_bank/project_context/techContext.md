# 기술 컨텍스트 (Tech Context)

이 문서는 Lexical 프로젝트의 기술 스택, 주요 의존성, 빌드 시스템, 그리고 개발 환경에 대한 핵심 정보를 담고 있습니다.

## 1. 개요

- **프로젝트 타입**: TypeScript 기반의 모노레포 (Monorepo)
- **핵심 프레임워크**: React
- **주요 목적**: 확장 가능한 텍스트 편집기 프레임워크 개발
- **특이사항**: TypeScript와 Flow를 함께 사용

## 2. 주요 기술 스택

- **언어**: TypeScript, JavaScript, Flow
- **UI 라이브러리/프레임워크**: React (v18+)
- **상태 관리**: `yjs`를 통한 협업(Collab) 상태 관리 지원
- **번들러/빌드 도구**: Rollup, Vite
- **테스트**:
  - **Unit/Integration**: Jest
  - **E2E**: Playwright
- **코드 품질**:
  - **Linter**: ESLint
  - **Formatter**: Prettier

## 3. 프로젝트 구조

- **워크스페이스 관리**: `npm workspaces` (`packages/*`)
- **패키지 참조**: `tsconfig.json`의 `paths`를 사용하여 내부 패키지 간의 의존성을 관리합니다. (e.g., `lexical` -> `./packages/lexical/src/index.ts`)

## 4. 주요 의존성 (Dependencies)

- `react`, `react-dom`: 핵심 UI 라이브러리
- `yjs`: 실시간 협업 기능을 위한 CRDT(Conflict-free Replicated Data Type) 라이브러리
- `typescript`: 메인 프로그래밍 언어
- `flow-bin`: 정적 타입 검사기 (TypeScript와 병용)
- `jest`: 단위 및 통합 테스트 프레임워크
- `playwright`: End-to-End 테스트 프레임워크
- `eslint`: 코드 린팅 도구
- `prettier`: 코드 포맷터
- `rollup`: 프로덕션 빌드를 위한 번들러

## 5. 빌드 및 스크립트

- **빌드**: `node scripts/build.js` 스크립트를 통해 Rollup 기반의 복잡한 빌드 프로세스를 수행합니다.
- **개발 서버**: `vite`를 사용하여 `lexical-playground` 패키지의 개발 서버를 실행합니다.
- **테스트 실행**: `jest`와 `playwright`를 사용하여 다양한 종류의 테스트(unit, integration, e2e)를 실행합니다.

## 6. 개발 환경

- **TypeScript 설정**: `tsconfig.json`에서 `strict: true` 옵션을 사용하여 강력한 타입 검사를 강제합니다.
- **모듈 시스템**: `ESNext` 모듈 시스템을 사용하며, 번들러 해상도 전략은 `bundler`로 설정되어 있습니다. 