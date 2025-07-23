# 시스템 패턴 (System Patterns)

이 문서는 Lexical 프로젝트에서 사용되는 주요 아키텍처 패턴, 설계 결정, 그리고 컴포넌트 간의 관계를 조망하는 최상위 가이드입니다. 각 주제에 대한 심층적인 분석은 연결된 상세 문서를 참고하시기 바랍니다.

## 1. Lexical 핵심 원칙

Lexical은 **확장성(Extensibility)**, **접근성(Accessibility)**, **성능(Performance)** 이라는 세 가지 핵심 원칙을 기반으로 설계되었습니다. 코어 패키지를 최소화하고, 필요한 기능은 플러그인으로 추가하는 'pay-for-what-you-need' 철학을 따릅니다.

## 2. 단방향 데이터 흐름 (Unidirectional Data Flow)

Lexical은 React의 설계 사상에 영향을 받아, 데이터의 흐름을 예측 가능하게 하고 디버깅을 용이하게 하는 단방향 데이터 흐름을 따릅니다.

-   **흐름**: `EditorState` (상태) → `Editor` (코어 로직) → `DOM` (뷰)
-   **정보의 원천 (Source of Truth)**: `EditorState`는 에디터의 모든 상태를 포함하는 유일한 정보의 원천이며, 업데이트가 완료되면 변경할 수 없는 불변(Immutable) 객체가 됩니다.

> **[심층 분석]** `OnChangePlugin`과 리스너를 통해 이 데이터 흐름이 실제로 어떻게 구현되는지에 대한 자세한 내용은 아래 문서를 참고하세요.
>
> -   `./analysis/data_flow_and_state_update_analysis.md`

## 3. 핵심 상호작용 및 상태 관리 패턴

### 3.1. 상태 변경 (State Mutation)

-   `EditorState`를 안전하게 변경하기 위한 유일한 통로는 **`editor.update(callback, options?)`** 입니다.
-   Lexical은 **더블 버퍼링(Double Buffering)** 과 유사한 트랜잭션 메커니즘을 사용하여, 변경 중인 상태(`pending`)와 현재 상태(`current`)를 분리하여 안정성을 확보합니다.
-   `$` 접두사가 붙은 함수들(`$getNodeByKey` 등)은 `editor.update()`와 같이 정해진 스코프 내에서만 호출되어야 하며, `@lexical/eslint-plugin`이 이 규칙을 강제합니다.

> **[심층 분석]** `editor.update`의 전체 워크플로우, `$beginUpdate`, `$commitPendingUpdates` 등 코어 업데이트 메커니즘의 상세한 내부 동작은 아래 문서에 상세히 분석되어 있습니다.
>
> -   `./analysis/core_update_mechanism_analysis.md`

### 3.2. 상태 구독 (Listeners) 및 UI 동기화

-   **`editor.registerUpdateListener(callback)`**: DOM 반영이 완료된 **후**에 실행되며, 주로 UI(e.g., 툴바)를 현재 에디터 상태와 동기화하는 데 사용됩니다.
-   **`editor.registerMutationListener(NodeClass, callback)`**: 특정 노드 클래스의 생명주기(생성, 파괴, 업데이트)를 추적하여 관련 UI를 관리하는 데 유용합니다.

### 3.3. 노드 변환 (Node Transforms)

-   `EditorState`가 변경될 때 특정 노드를 다른 노드로 자동 변환하는 **가장 효율적인 메커니즘**입니다.
-   DOM에 변경 사항이 반영되기 **전**에 실행되므로, 불필요한 리렌더링을 유발하는 "폭포수 업데이트"를 원천적으로 방지하여 성능상 가장 유리합니다. 마크다운 단축키 구현이 대표적인 예시입니다.

## 4. 기능 확장 패턴

### 4.1. 플러그인 아키텍처 (Plugin Architecture)

-   Lexical은 핵심 기능을 최소화하고, 대부분의 기능을 '플러그인'을 통해 확장하도록 설계되었습니다.
-   React 환경에서 플러그인은 `useLexicalComposerContext()` 훅으로 `editor` 인스턴스를 받아 `useEffect` 내에서 기능을 등록/해제하는 컴포넌트입니다.

### 4.2. 커맨드 시스템 (Command System)

-   **역할 분리**: `Command`는 기능의 '호출부'(UI)와 '구현부'(플러그인)를 명확히 분리하여 코드의 결합도를 낮춥니다.
-   **우선순위 기반 실행**: `editor.registerCommand` 시 `priority`를 설정할 수 있으며, 리스너가 `true`를 반환하면 이벤트 전파가 중단됩니다.

> **[심층 분석]** 플러그인과 커맨드 시스템의 동작 원리 및 실제 사용 사례에 대한 자세한 내용은 아래 문서를 참고하세요.
>
> -   `./analysis/plugin_and_command_system_analysis.md`

## 5. 노드 시스템 아키텍처

-   Lexical의 모든 콘텐츠는 '노드(Node)'라는 기본 단위로 구성됩니다. `ElementNode`, `TextNode`, `DecoratorNode` 등 기본 노드를 상속받아 커스텀 노드를 만들 수 있습니다.
-   커스텀 노드는 `createEditor`의 `initialConfig.nodes` 배열에 클래스를 추가하여 에디터에 등록해야 합니다.

> **[심층 분석]** 노드 시스템의 계층 구조, 필수 구현 메서드, 그리고 커스텀 노드를 생성하고 등록하는 전체 과정은 아래 문서에 상세히 분석되어 있습니다.
>
> -   `./analysis/node_system_and_custom_nodes_analysis.md` 