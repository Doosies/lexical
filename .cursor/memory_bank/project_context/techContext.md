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
## 7. 주요 패키지 역할

Lexical은 기능별로 세분화된 모듈(패키지)로 구성되어 있어, 필요한 기능만 선택적으로 사용할 수 있습니다.

- **`lexical`**: 프레임워크의 핵심 로직. `EditorState`, `LexicalNode` 등 모든 것의 기반이 됩니다. **중요한 것은 이 코어 패키지는 특정 플랫폼이나 프레임워크에 종속되지 않는다는 점입니다.** 즉, `lexical` 자체는 브라우저의 사용자 입력(키보드, 마우스 이벤트 등)을 직접 수신하거나 처리하지 않습니다. 모든 이벤트 리스닝과 그에 따른 상태 업데이트 로직은 `@lexical/react`와 같은 헬퍼 패키지나 개발자가 직접 구현해야 합니다. 이는 Lexical의 뛰어난 확장성과 이식성을 보장하는 핵심 설계 사상입니다.
- **`@lexical/react`**: `LexicalComposer`, `useLexicalComposerContext` 등 React(v17+) 환경에서 Lexical을 사용하기 위한 컴포넌트와 훅을 제공합니다.
- **`@lexical/plain-text`**: 일반 텍스트 편집 기능을 제공하는 플러그인입니다.
- **`@lexical/rich-text`**: 제목, 인용구 등 리치 텍스트 기능을 제공하는 플러그인입니다.
- **`@lexical/list`**: 순서/비순서/체크 리스트 기능을 제공하는 플러그인 및 노드입니다.
- **`@lexical/code`**: 코드 블록 및 구문 강조 기능을 제공합니다. (기본 엔진: Prism.js)
- **`@lexical/code-shiki`**: `shikijs` 엔진을 사용하여 코드 하이라이터를 제공하는 대체 패키지입니다.
- **`@lexical/link`**: 링크 기능을 제공합니다.
- **`@lexical/markdown`**: 마크다운 단축키 및 변환 기능을 제공합니다.
- **`@lexical/mark`**: 텍스트의 특정 부분을 '마크'하여 강조하거나 주석을 다는 등의 기능을 구현하는 데 사용되는 노드 및 헬퍼를 제공합니다.
- **`@lexical/offset`**: `Selection` 객체의 오프셋(커서 위치 등)을 계산하고 조작하는 데 사용되는 헬퍼 함수들을 제공합니다.
- **`@lexical/overflow`**: 특정 컨테이너의 경계를 벗어나는 텍스트나 노드(오버플로우)를 관리하기 위한 `OverflowNode` 및 관련 헬퍼를 제공합니다. '더보기...'와 같은 기능을 구현하는 데 사용될 수 있습니다.
- **`@lexical/selection`**: `Selection` 객체(커서 위치, 선택 영역 등)를 가져오거나 수정하는 등 관련된 다양한 헬퍼 함수를 제공합니다.
- **`@lexical/table`**: 테이블 생성, 편집, 셀 선택, 복사/붙여넣기 등 테이블 관련 모든 기능을 제공합니다.
- **`@lexical/text`**: 텍스트 노드의 생성, 수정 등 텍스트 처리에 관련된 기본적인 유틸리티와 헬퍼 함수를 제공합니다.
- **`@lexical/clipboard`**: 복사/붙여넣기 관련 로직을 처리합니다.
- **`@lexical/history`**: Undo/Redo 기록 스택을 관리합니다.
- **`@lexical/html`**: Lexical 상태와 HTML 문자열 간의 변환을 담당합니다.
- **`@lexical/headless`**: DOM이 없는 환경(e.g., Node.js)에서 Lexical 상태를 다룰 수 있게 합니다.
- **`@lexical/yjs`**: Y.js를 사용하여 실시간 협업 기능을 구현하기 위한 바인딩을 제공합니다.
- **`@lexical/utils`**: 다양한 유틸리티 함수들을 포함합니다.
- **`@lexical/devtools-core`**: Lexical 에디터의 상태를 시각화하고 디버깅하는 데 필요한 핵심 개발 도구를 제공합니다. 이는 Lexical Developer Tools 브라우저 확장 프로그램의 기반이 되며, 이를 통해 `EditorState`의 노드 트리, Selection 등을 시각적으로 확인할 수 있습니다.
- **`@lexical/dragon`**: 음성 인식 소프트웨어인 Dragon NaturallySpeaking 접근성 도구와의 호환성을 제공합니다.
- **`@lexical/file`**: 파일 가져오기/내보내기 관련 기능을 제공합니다. 

## 8. 지원 브라우저 (Supported Browsers)

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