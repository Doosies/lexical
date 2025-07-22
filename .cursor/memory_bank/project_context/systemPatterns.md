# 시스템 패턴 (System Patterns)

이 문서는 프로젝트에서 사용되는 주요 아키텍처 패턴, 설계 결정, 그리고 컴포넌트 간의 관계를 기록합니다.

## Lexical 핵심 원칙

Lexical은 다음과 같은 세 가지 핵심 원칙을 기반으로 설계되었습니다.

- **확장성 (Extensibility)**: Lexical은 개발자가 독특한 텍스트 편집 경험을 쉽게 만들 수 있도록 매우 확장성이 뛰어난 아키텍처를 가지고 있습니다.
- **접근성 (Accessibility)**: 모든 사용자가 쉽게 사용할 수 있도록 접근성을 중요하게 생각합니다.
- **성능 (Performance)**: 코어 패키지는 22kb(min+gzip)로 매우 작으며, 필요한 기능만 플러그인으로 추가하여 사용하는 'pay-for-what-you-need' 철학을 따릅니다. 이를 통해 뛰어난 성능을 보장합니다.

### 1. 단방향 데이터 흐름 (Unidirectional Data Flow)

Lexical은 React의 설계 사상에 큰 영향을 받아 단방향 데이터 흐름을 따릅니다. 이는 데이터의 흐름을 예측 가능하게 하고 디버깅을 용이하게 만듭니다.

- **흐름:** `EditorState` (상태) → `Editor` (코어 로직) → `DOM` (뷰).
- **정보의 원천 (Source of Truth):** `EditorState`는 에디터의 모든 상태(콘텐츠, 선택 영역 등)를 포함하는 유일한 정보의 원천입니다.
- **정규화 (Normalization):** HTML과 달리, `EditorState`는 구조와 포맷팅을 분리하고 항상 정규화된 단일 구조를 유지하여 일관성을 보장합니다. 예를 들어 `<i><b>text</b></i>`와 `<b><i>text</i>`는 DOM에서는 다르게 표현될 수 있지만, Lexical 내부에서는 동일한 정규화된 구조로 관리됩니다.
- **불변성 (Immutability)과 스냅샷:** `EditorState`는 업데이트가 완료되면 잠기고, 다시는 변경할 수 없는 불변(Immutable) 객체, 즉 "스냅샷"이 됩니다. 이 스냅샷은 `editor.getEditorState()`를 통해 얻을 수 있습니다.

### 2. 핵심 상호작용 및 상태 관리 패턴

- **상태 변경 (State Mutation):**
  - **`editor.update(callback, options?)`**: `EditorState`를 안전하게 변경하기 위한 유일한 통로입니다.
    - **더블 버퍼링 (Double Buffering)**: `update`가 호출되면, 현재의 불변 상태(`current`)를 복제하여 변경 가능한 임시 상태(`pending`)를 만듭니다. 모든 상태 변경 로직(노드 생성, 수정, 삭제)은 이 `pending` 상태에 적용됩니다.
    - **비동기 DOM 반영 (Async Reconciliation)**: Lexical은 여러 `update` 요청을 하나로 묶어(batching) 비동기적으로 단 한 번만 실제 DOM에 반영하여 성능을 최적화합니다. DOM 반영이 완료되면 `pending` 상태가 새로운 `current` 상태가 됩니다.
    - **동기적 업데이트 (`discrete: true`)**: `editor.update(..., { discrete: true })` 옵션을 주면, 업데이트를 즉시 동기적으로 DOM에 반영합니다. 서버에서 상태를 변경하고 바로 DB에 저장하는 등, 변경 직후의 상태가 반드시 필요할 때 사용됩니다.
  - **`editor.setEditorState(newState)`**: 현재 `EditorState`를 인자로 받은 새로운 상태로 완전히 교체합니다.
  - **`$` 접두사 함수**: `editor.update()`, `editorState.read()`, `registerCommand()`, `registerNodeTransform()` 과 같이 Lexical의 상태에 접근할 수 있는 특정 스코프 내부에서만 호출되어야 하는 특별한 함수들입니다. 이 `$` 접두사는 해당 함수가 특별한 스코프 내에서만 사용되어야 함을 나타내는 시각적 신호이며, React 훅(Hook)과 유사한 개념으로 볼 수 있습니다.
  - **`@lexical/eslint-plugin`**: 이 ESLint 플러그인은 `$` 함수의 올바른 사용법을 강제하여 런타임 오류를 방지하는 핵심적인 역할을 합니다.
      - **규칙**: `$`로 시작하지 않는 함수가 내부에서 `$` 함수를 호출하면, 자동으로 `$` 접두사를 붙이도록 수정 제안(autofix)합니다.
      - **예외**: `$is...`와 같이 상태에 의존하지 않고 단순히 타입 체크만 하는 함수들은 이 규칙에서 제외되어 어디서든 안전하게 호출할 수 있습니다.
  - **비제어 컴포넌트(Uncontrolled Component) 원칙**: Lexical은 기본적으로 비제어 컴포넌트로 설계되었습니다. React의 `useState`로 `editorState`를 관리하고 `onChange`마다 `setEditorState`를 통해 다시 주입하는 제어 컴포넌트 패턴은 피해야 합니다. 상태는 Lexical 코어에서 관리하도록 두고, 필요시 `<LexicalOnChangePlugin>`을 통해 외부로 동기화하는 단방향 흐름을 따라야 합니다.

- **상태 구독 (Listeners) 및 UI 동기화:**
  - **`editor.registerUpdateListener(callback)`**: DOM 반영이 완료된 **후**에 실행됩니다. UI(e.g., 툴바)를 현재 에디터 상태와 동기화하는 핵심적인 역할을 합니다. 콜백은 `editorState`, `prevEditorState`, `tags`를 포함한 객체를 인자로 받습니다.
    - **주의 (폭포수 업데이트)**: 이 리스너 내부에서 다시 `editor.update()`를 호출하면 불필요한 추가 DOM 업데이트(re-rendering)를 유발하여 성능 저하의 원인이 될 수 있습니다. 이런 경우에는 DOM 반영 전에 실행되는 `Node Transform` 사용이 강력히 권장됩니다.
  - **`editor.registerTextContentListener(callback)`**: DOM 반영 후, 텍스트 내용이 실제로 변경되었을 때만 실행되어 더 효율적입니다.
  - **`editor.registerMutationListener(NodeClass, callback)`**: 특정 노드 클래스의 생명주기(생성, 파괴, 업데이트)를 추적합니다. 특정 노드와 연관된 외부 UI(e.g., 이미지 편집 툴바)를 관리하거나, 노드 변경에 따른 부가적인 로직을 처리하는 데 매우 유용합니다.
  - **기타 리스너**:
    - **`registerEditableListener`**: 에디터의 편집 가능 모드가 변경될 때 실행됩니다.
    - **`registerDecoratorListener`**: `DecoratorNode`의 렌더링 결과가 변경될 때 실행됩니다.
    - **`registerRootListener`**: 에디터의 루트 DOM 요소가 변경될 때 실행됩니다.
  - **UI 업데이트 절차**:
    1.  리스너 콜백 내에서 `editorState.read()`를 실행합니다.
    2.  `$getSelection()`으로 현재 선택 영역을 가져옵니다.
    3.  **블록 타입 확인**: `selection.anchor.getNode().getTopLevelElementOrThrow()`로 최상위 블록 노드를 가져와 `$isHeadingNode(node)` 등으로 타입을 확인하고, `node.getTag()`로 세부 타입을 얻습니다.
    4.  **인라인 스타일 확인**: `$isRangeSelection(selection)`이 참일 때, `selection.hasFormat('bold')`와 같은 메서드를 사용하여 현재 선택 영역에 특정 인라인 스타일이 적용되었는지 확인합니다.
    5.  얻어온 타입/포맷 정보로 React의 `state`를 업데이트하여 툴바 버튼의 활성화 상태 등을 변경합니다.

- **노드 변환 (Node Transforms):**
  - **개념**: `EditorState`가 변경될 때, 특정 조건을 만족하는 `Node`를 다른 `Node`로 자동으로 변환하는 가장 효율적인 메커니즘입니다.
  - **실행 시점 및 효율성**: `editor.update()` 콜백이 끝난 직후, DOM 반영 **전**에 실행됩니다. `updateListener` 내부에서 다시 `update`를 호출하여 불필요한 추가 렌더링을 유발하는 "폭포수 업데이트"를 원천적으로 방지하므로 성능상 가장 유리합니다.
  - **내부 동작 원리**:
    - **더티 노드 (Dirty Nodes)**: `node.getWritable()`이 호출되면 해당 노드는 "의도적으로 더러운(Intentionally Dirty)" 상태가 되고, 이 상태는 부모 노드로 전파됩니다. DOM 조정(reconciliation)은 더티 노드가 없는 서브트리에서는 멈추므로 효율적인 업데이트가 가능합니다.
    - **변환 휴리스틱 (Transform Heuristic)**: Lexical은 (1)리프 노드 변환 → (2)엘리먼트 노드 변환 순서로, 더 이상 새로운 더티 노드가 발생하지 않을 때까지(fixed point) 변환을 반복적으로 실행합니다.
    - **무한 루프 방지 (Precondition)**: 변환 함수 내에서 불필요하게 노드를 다시 더티 상태로 만드는 것을 피하기 위해, 로직 실행 전 반드시 `if (!node.hasFormat('bold'))`와 같은 전제 조건을 확인하여 무한 루프를 방지해야 합니다.
  - **안정적인 사용자 입력 감지**: 브라우저의 `input` 이벤트는 IME, 스크린 리더, 서드파티 확장 프로그램 등 다양한 환경에서 신뢰할 수 없게 동작하는 경우가 많습니다. `Node Transform`은 이러한 DOM 이벤트에 의존하는 대신, 순수한 `EditorState`의 변화를 기반으로 동작하므로, 사용자의 텍스트 입력을 감지하고 수정하는 가장 안정적인 방법입니다.
  - **활용**: 마크다운 단축키 구현이 대표적인 예시입니다. `@lexical/react/LexicalMarkdownShortcutPlugin`은 내부적으로 `Node Transform`을 사용하여 `# text`와 같은 일반 텍스트 입력을 `HeadingNode`로 자동 변환합니다.
  - **확장성 (Transformers):** `Lexical`은 다양한 종류의 변환기를 제공하며, 개발자는 이를 조합하거나 직접 만들어 특정 텍스트 패턴을 커스텀 노드로 자동 변환하는 기능을 구현할 수 있습니다.
    - **Element Transformer**: `h1`, `ul`과 같은 블록 레벨 요소를 처리합니다.
    - **Text Format Transformer**: `**bold**`와 같은 인라인 텍스트 서식을 처리합니다.
    - **Text Match Transformer**: `[link](url)`과 같이 특정 패턴을 가진 텍스트를 찾아 `LinkNode` 등으로 변환합니다.

    - **실행 순서**:
        `editor.update()`가 호출되면, (1) **커맨드 리스너**가 즉시 실행되고, (2) `update` 콜백이 끝난 후 **노드 변환**이 실행되며, (3) DOM 반영이 완료된 후에 **업데이트 리스너**와 **뮤테이션 리스너**가 실행됩니다. 이 순서를 이해하는 것은 복잡한 상호작용을 디버깅하는 데 매우 중요합니다.

### 2.4. 업데이트 태그 (Update Tags)

- **개념**: 특정 업데이트의 목적이나 종류를 나타내는 문자열 식별자입니다. 리스너(Listener)가 모든 종류의 업데이트에 무분별하게 반응하는 것을 막고, 특정 목적의 업데이트에만 선별적으로 반응하도록 제어하는 매우 중요한 메커니즘입니다.
- **사용법**:
  - **태그 추가**: `editor.update(..., { tag: 'my-tag' })` 또는 `update` 클로저 내에서 `$addUpdateTag('my-tag')`를 통해 업데이트에 태그를 추가합니다.
  - **태그 확인**: `registerUpdateListener`나 `registerMutationListener`의 콜백 함수에서 `payload.tags` (Set 객체)를 확인하여, 특정 태그가 포함된 업데이트에만 반응하는 로직을 작성합니다.
- **주요 내장 태그**:
  - `HISTORY_PUSH_TAG`: 새로운 history 항목을 강제로 생성합니다.
  - `HISTORY_MERGE_TAG`: 이전 history 항목과 현재 업데이트를 병합합니다.
  - `SKIP_DOM_SELECTION_TAG`: DOM selection 업데이트를 건너뛰어 포커스에 영향을 주지 않습니다.
  - `COLLABORATION_TAG`: 협업 관련 업데이트임을 표시합니다.
- **커스텀 태그**: 개발자가 직접 태그를 상수로 정의하여 특정 기능(e.g., 'my-autosave-feature')에서 발생하는 업데이트를 식별하고, 리스너에서 이를 구분하여 처리하는 데 유용하게 사용할 수 있습니다.

### 3. 기능 확장 패턴

- **플러그인 아키텍처 (Plugin Architecture):**
  - **개념**: Lexical은 핵심 기능을 최소화하고, 대부분의 기능을 '플러그인'을 통해 확장하도록 설계되었습니다.
  - **Vanilla JS 플러그인**: 프레임워크에 독립적인 플러그인은 `LexicalEditor` 인스턴스를 인자로 받아, 등록 해제(cleanup) 함수를 반환하는 **함수**입니다. `@lexical/utils`의 `mergeRegister`를 사용하여 여러 플러그인의 정리 함수를 하나로 묶을 수 있습니다.
  - **React 기반 플러그인:** `@lexical/react` 환경에서 플러그인은 본질적으로 React 컴포넌트입니다.
    - **핵심 컴포넌트**:
        - **`<LexicalComposer>`**: 모든 Lexical 관련 기능의 최상위 Wrapper 컴포넌트입니다. `initialConfig`를 통해 에디터의 초기 상태, 테마, 노드 등을 설정합니다.
        - **`<RichTextPlugin>`**: 리치 텍스트 편집에 필요한 기본 플러그인들을 제공합니다.
        - **`<ContentEditable>`**: 실제 사용자가 텍스트를 입력하는 `contenteditable` 영역을 렌더링합니다.
        - **`<HistoryPlugin>`**: Undo/Redo 기능을 추가합니다.
        - **`<LexicalErrorBoundary>`**: Lexical 내부 오류가 앱 전체를 중단시키지 않도록 하는 안전장치입니다.
    - **`useLexicalComposerContext()`**: 플러그인 컴포넌트가 `<LexicalComposer>`를 통해 생성된 `editor` 인스턴스에 접근할 수 있도록 해주는 핵심 훅(Hook)입니다.
    - **동작 방식 및 모범 사례(Best Practice)**:
        - 플러그인 컴포넌트는 `useLexicalComposerContext`로 `editor`에 접근한 뒤, `useEffect` 훅 내부에서 리소스를 등록하고 정리(cleanup) 함수를 반환하는 패턴을 사용합니다.
        - **`registerXXX` 패턴**: `registerHistory`, `registerCommand`와 같이 `register`로 시작하는 함수들은 에디터에 특정 기능을 등록하고, 반드시 등록된 기능을 해제하는 **정리(cleanup) 함수를 반환**합니다.
        - **`useEffect`와의 결합**: `useEffect(() => editor.registerCommand(...), [editor])`와 같이 `registerXXX`를 `useEffect` 내부에서 호출하고 그 반환값을 그대로 `useEffect`의 반환값으로 사용하면, 컴포넌트 마운트 시 기능이 등록되고 언마운트 시 자동으로 해제되는 안전하고 일반적인 패턴이 완성됩니다.
        - 플러그인이 특정 커스텀 노드를 사용한다면, `editor.hasNodes([CustomNodeClass])`를 통해 해당 노드가 `initialConfig`에 등록되었는지 먼저 확인하는 것이 좋습니다.

- **커맨드 시스템 (Command System):**
  - **역할 분리 (Flux 아키텍처와 유사)**: `Command`를 통해 기능의 '호출부'(UI)와 '구현부'(플러그인)를 명확히 분리합니다. 이는 사용자의 액션(Action)이 디스패처를 통해 스토어(Store)를 변경하는 Flux 패턴과 유사합니다.
  - **구성 요소**:
      - **`createCommand<PayloadType>()`**: 전달할 데이터(payload)의 타입을 지정하여 새로운 커맨드를 생성합니다.
      - **`editor.dispatchCommand(COMMAND, payload)`**: 시스템에 커맨드를 발송합니다.
      - **`editor.registerCommand(COMMAND, listener, priority)`**: 커맨드에 대한 리스너를 등록합니다.
  - **동작 원리**:
      - **우선순위 기반 실행**: `priority`가 높은 리스너부터 순차적으로 실행됩니다 (`CRITICAL` > `HIGH` > ... > `LOW`).
      - **전파 제어**: 리스너가 `true`를 반환하면, 해당 커맨드는 '처리됨'으로 간주되어 더 낮은 우선순위의 리스너에게 전파되지 않습니다. 이를 통해 특정 상황에서 기본 동작을 무시하고 커스텀 동작을 우선 처리할 수 있습니다.
      - **실행 컨텍스트**: 리스너는 항상 `editor.update` 컨텍스트 내에서 호출되므로, 내부에서 `$` 함수를 안전하게 사용할 수 있습니다. 