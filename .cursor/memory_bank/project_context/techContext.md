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

## 4. 핵심 기술과 역할

Lexical은 기능별로 세분화된 모듈(패키지)로 구성되어 있어, 필요한 기능만 선택적으로 사용할 수 있습니다. 각 기술 요소는 생태계 내에서 다음과 같은 명확한 역할을 수행합니다.

### 4.1. 코어 및 플랫폼 바인딩

- **`lexical`**: 프레임워크의 핵심 로직. `EditorState`, `LexicalNode` 등 모든 것의 기반이 됩니다. **중요한 것은 이 코어 패키지는 특정 플랫폼이나 프레임워크에 종속되지 않는다는 점입니다.** 즉, `lexical` 자체는 브라우저의 사용자 입력(키보드, 마우스 이벤트 등)을 직접 수신하거나 처리하지 않습니다. 모든 이벤트 리스닝과 그에 따른 상태 업데이트 로직은 `@lexical/react`와 같은 헬퍼 패키지나 개발자가 직접 구현해야 합니다. 이는 Lexical의 뛰어난 확장성과 이식성을 보장하는 핵심 설계 사상입니다.
- **`@lexical/react`**: `LexicalComposer`, `useLexicalComposerContext` 등 React(v17+) 환경에서 Lexical을 사용하기 위한 **필수적인 컴포넌트와 훅을 제공하는 핵심 바인딩 라이브러리**입니다. 플랫폼 독립적인 `lexical` 코어와 React 애플리케이션을 연결하는 다리 역할을 합니다.
- **`@lexical/headless`**: DOM이 없는 환경(e.g., Node.js 서버)에서 Lexical 상태를 다룰 수 있게 합니다. 서버 사이드 렌더링(SSR)이나 콘텐츠 검증 등에 사용될 수 있습니다.

### 4.2. 주요 기능 플러그인

- **`@lexical/plain-text`**: 일반 텍스트 편집 환경을 구성하는 데 필요한 최소한의 기본 플러그인을 제공합니다.
- **`@lexical/rich-text`**: 제목, 인용구 등 리치 텍스트 편집에 필요한 기본 플러그인 묶음을 제공합니다.
- **`@lexical/history`**: Undo/Redo 기록 스택을 관리합니다.
- **`@lexical/list`**: 순서/비순서/체크 리스트 기능을 제공하는 플러그인 및 노드입니다.
- **`@lexical/link`**: 링크의 생성, 수정, 제거 기능을 제공합니다.
- **`@lexical/table`**: 테이블 생성, 편집, 셀 병합 등 복잡한 테이블 관련 기능을 제공합니다.
- **`@lexical/markdown`**: 마크다운 단축키(`* text *` -> bold) 및 변환 기능을 제공합니다.
- **기타**: `@lexical/code`, `@lexical/clipboard`, `@lexical/html` 등 특정 기능을 독립적으로 제공하는 다수의 패키지가 있습니다.

### 4.3. 개발 환경 및 도구

- **`@lexical/eslint-plugin`**: **개발 생산성과 안정성을 위해 거의 필수적인 정적 분석 도구입니다.** `$` 접두사 함수의 올바른 사용법(e.g., `editor.update()` 외부에서 `$getNodeByKey` 호출 금지)을 강제하여, 복잡한 런타임 오류를 코딩 단계에서 미리 방지합니다.
- **`@lexical/devtools-core`**: Lexical Developer Tools 브라우저 확장의 핵심 로직으로, `EditorState`의 노드 트리, 선택 영역(Selection) 등을 시각적으로 디버깅할 수 있게 도와줍니다.
- **`typescript` & `flow-bin`**: 프로젝트 전반의 타입 안정성을 보장하기 위해 두 가지 정적 타입 검사기를 함께 사용합니다.
- **`jest` & `playwright`**: 각각 단위/통합 테스트와 End-to-End 테스트를 담당하여 코드의 신뢰성을 높입니다.
- **`rollup` & `vite`**: 각각 프로덕션 빌드와 플레이그라운드 개발 서버 실행을 담당합니다.

### 4.4. 협업 (Collaboration)

- **`yjs`**: 실시간 동시 편집 기능을 구현하기 위한 CRDT(Conflict-free Replicated Data Type) 라이브러리입니다.
- **`@lexical/yjs`**: `lexical`의 상태를 `yjs`와 동기화하여 협업 환경을 구축하기 위한 바인딩을 제공합니다.

## 5. 빌드 및 스크립트

- **빌드**: `node scripts/build.js` 스크립트를 통해 Rollup 기반의 복잡한 빌드 프로세스를 수행합니다.
- **개발 서버**: `vite`를 사용하여 `lexical-playground` 패키지의 개발 서버를 실행합니다.
- **테스트 실행**: `jest`와 `playwright`를 사용하여 다양한 종류의 테스트(unit, integration, e2e)를 실행합니다.

## 6. 개발 환경

- **TypeScript 설정**: `tsconfig.json`에서 `strict: true` 옵션을 사용하여 강력한 타입 검사를 강제합니다.
- **모듈 시스템**: `ESNext` 모듈 시스템을 사용하며, 번들러 해상도 전략은 `bundler`로 설정되어 있습니다.

## 7. 지원 환경 (Supported Environments)

### 7.1. React 버전
- React 17+ (React 18, 19 베타 테스트 완료)

### 7.2. 지원 브라우저 (Supported Browsers)
- **미지원**: Internet Explorer, 레거시 Edge
- **데스크톱**:
  - Firefox 52+
  - Chrome 49+
  - Edge 79+ (Chromium 기반)
  - Safari 11+
- **모바일**:
  - iOS 11+ (Safari)
  - iPad OS 13+ (Safari)
  - Android Chrome 72+ 