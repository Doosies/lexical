# React 환경 문제 해결 가이드 (React Troubleshooting Guide)

이 문서는 React, 특히 `StrictMode` 및 HMR(Hot Module Replacement) 환경에서 Lexical을 사용할 때 발생할 수 있는 일반적인 문제와 해결 방법을 정리합니다.

## 1. `StrictMode`에서 앱이 동작하지 않는 경우

React의 `StrictMode`는 잠재적인 문제를 발견하기 위해 `useEffect`와 같은 훅을 의도적으로 두 번 실행합니다. 이로 인해 Lexical에서 예기치 않은 동작이 발생할 수 있습니다.

- **원인**:
  - `useEffect` 내의 부수 효과(side-effect)가 멱등성(idempotent)을 가지지 않을 경우, 플러그인 초기화 로직 등이 중복 실행될 수 있습니다.
  - 리스너 등록 및 해제가 `StrictMode`의 렌더링-정리-재렌더링 사이클과 꼬여, 일부 리스너가 제대로 호출되지 않을 수 있습니다.

- **해결 방안**:
  - **멱등성 보장**: `useEffect` 내의 로직이 여러 번 실행되어도 동일한 결과를 내도록 설계해야 합니다. 예를 들어, 문서를 수정하는 로직이라면 실행 전에 이미 수정이 적용되었는지 확인하거나, 클린업(cleanup) 함수에서 변경 사항을 원상 복구해야 합니다.
  - **`useLexicalSubscription` 활용**: 상태를 구독하고 UI를 업데이트할 때는, 직접 `useEffect`에서 리스너를 등록하는 것보다 `useLexicalEditable`과 같이 상태 변경을 안정적으로 구독하는 내장 훅을 사용하는 것이 좋습니다. 이 훅들은 `StrictMode`의 동작을 고려하여 설계되었습니다.
  - **`initialConfig` 주의**: `<LexicalComposer>`의 `initialConfig` prop은 컴포넌트가 처음 렌더링될 때 **단 한 번만** 고려됩니다. `StrictMode`에 의해 컴포넌트가 다시 렌더링되어도 `initialConfig`는 다시 사용되지 않습니다. 초기 상태 주입은 이 점을 반드시 고려해야 합니다.

## 2. `LexicalComposerContext.useLexicalComposerContext: cannot find a LexicalComposerContext` 오류

이 오류는 `useLexicalComposerContext()` 훅이 `<LexicalComposer>`의 자식 컴포넌트가 아닌 곳에서 호출될 때 발생합니다.

- **주요 원인**:
  1.  **컴포넌트 계층 구조 문제**: 훅을 사용하는 컴포넌트가 `<LexicalComposer>`의 하위에 위치하지 않은 경우. 만약 상위 컴포넌트에서 에디터 컨텍스트가 필요하다면, `<EditorRefPlugin>`을 사용하여 `editor` 인스턴스를 ref로 전달받는 방법을 사용해야 합니다.
  2.  **Lexical 빌드 중복 문제**: 프로젝트 내에 두 개 이상의 다른 버전 또는 다른 빌드(ESM과 CJS 혼용 등)의 Lexical 라이브러리가 포함된 경우. 이는 특정 의존성 패키지가 Lexical을 `peerDependencies`가 아닌 `dependencies`로 가지고 있을 때 자주 발생합니다.

- **해결 방안**:
  - `package.json`의 `overrides` (npm) 나 `resolutions` (yarn) 필드를 사용하여 Lexical 관련 패키지들의 버전을 하나로 강제합니다.
  - 웹팩(Webpack)이나 Vite 등 번들러 설정에서 alias를 사용하여 모든 `lexical` import가 단일 빌드 파일을 가리키도록 설정합니다.

## 3. 개발 서버에서 HMR(Fast Refresh) 사용 시 문제

HMR은 페이지를 새로고침하지 않고 변경된 모듈만 교체하므로, 에디터 인스턴스나 노드 클래스의 상태가 꼬일 수 있습니다.

- **증상**: 파일을 수정한 후 에디터가 비정상적으로 동작하지만, 페이지를 새로고침하면 문제가 해결됩니다.
- **해결 방안**:
  - 문제가 발생하는 파일 상단에 프레임워크가 제공하는 '전체 새로고침' 지시자를 추가합니다.
  - **예시 (Next.js)**: 파일 상단에 `// @refresh reset` 주석을 추가하면, 해당 파일이 변경될 때 HMR 대신 페이지 전체 새로고침이 트리거됩니다. 
  