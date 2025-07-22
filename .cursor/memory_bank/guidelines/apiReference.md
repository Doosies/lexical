# Lexical API 레퍼런스

이 문서는 Lexical의 주요 플러그인, HTML 변환, 직렬화, 테마 등 핵심 API 활용법에 대한 레퍼런스입니다.

## 1. 주요 플러그인 및 기능

- **`PlainTextPlugin`**: 일반 텍스트 편집에 필요한 타이핑, 삭제, 복사/붙여넣기 등 핵심 기능을 제공합니다.
- **`RichTextPlugin`**: `PlainTextPlugin`의 기능을 포함하여, 굵게, 기울임 등 리치 텍스트 서식과 관련된 추가 기능을 제공합니다.
- **`HistoryPlugin`**: Undo/Redo 기능(기록 스택 관리)을 추가합니다.
- **`OnChangePlugin`**: `EditorState`가 변경될 때마다 콜백을 실행합니다. `ignoreSelectionChange` 같은 옵션으로 콜백 트리거 조건을 세밀하게 제어할 수 있습니다.
- **`LinkPlugin`**: 링크 노드와 관련 기능을 지원합니다.
- **`ListPlugin`**: 순서(ordered) 및 비순서(unordered) 리스트 기능을 지원합니다.
- **`CheckListPlugin`**: 체크리스트 기능을 지원합니다.
- **`TablePlugin`**: 테이블 생성 및 편집 기능을 지원합니다.
- **`AutoLinkPlugin`**: 정규식(Matcher)을 기반으로 URL 같은 텍스트를 자동으로 링크 노드로 변환합니다.
- **`MarkdownShortcutPlugin`**: 헤딩, 리스트, 코드 블록, 인용 등 마크다운 단축키 기능을 추가합니다.
- **`TabIndentationPlugin`**: `Tab` 키를 사용한 들여쓰기/내어쓰기 기능을 활성화합니다.
- **`TableOfContentsPlugin`**: 에디터 내의 헤딩(h1-h3) 노드를 감지하여 목차 데이터를 실시간으로 생성 및 업데이트합니다.
- **`EditorRefPlugin`**: `LexicalComposer` 외부의 다른 컴포넌트에서 `editor` 인스턴스에 접근해야 할 때, React `ref`를 통해 인스턴스를 전달하는 통로 역할을 합니다.
- **`SelectionAlwaysOnDisplay`**: 에디터가 포커스를 잃어도 텍스트 선택 영역이 계속 보이도록 유지합니다.

## 2. HTML 변환

- **`@lexical/html`**: `EditorState`와 HTML 문자열 간의 양방향 변환을 담당하는 유틸리티 함수를 제공하며, 복사/붙여넣기 기능의 기반이 됩니다.
- **`$generateHtmlFromNodes(editor, selection | null)`**: 현재 `EditorState` 또는 특정 `selection`을 HTML 문자열로 변환합니다.
- **`$generateNodesFromDOM(editor, dom)`**: DOM 객체를 `Lexical` 노드의 배열로 변환합니다. 변환된 노드는 에디터 초기화나 `$insertNodes`를 통해 특정 위치에 삽입하는 데 사용될 수 있습니다.
- **Headless 지원**: `JSDOM`과 같은 라이브러리를 사용하여 서버 환경에서도 HTML 변환을 완벽하게 지원합니다.

## 3. 상태 저장 및 불러오기 (Save & Load)

- **저장 (Save)**: `<LexicalOnChangePlugin>`
- **포커스 관리**:
  - 기본적으로 `editor.update`가 실행되면 Lexical이 DOM selection을 동기화하면서 자동으로 에디터에 포커스가 갑니다.
  - 포커스 이동을 원치 않을 경우(e.g., 백그라운드 작업), 업데이트 내에서 `$addUpdateTag('SKIP_DOM_SELECTION_TAG')`를 호출하여 DOM selection 동기화를 건너뛸 수 있습니다.

## 4. 직렬화(Serialization)와 역직렬화(Deserialization)

- **개념**: `EditorState`는 Lexical 내부에서 사용하는 인메모리(in-memory) 데이터 구조입니다. 이를 외부로 저장(e.g., 데이터베이스)하거나 다른 시스템과 데이터를 교환하기 위해, 특정 포맷(주로 JSON)으로 변환하는 과정을 **직렬화**라고 하며, 그 반대 과정을 **역직렬화**라고 합니다.
- **JSON 직렬화/역직렬화**:
  - **직렬화 (EditorState → JSON)**: `editor.getEditorState().toJSON()` 메서드를 호출하여 `EditorState` 전체를 순수한 JSON 객체로 변환합니다.
  - **역직렬화 (JSON → EditorState)**: `editor.parseEditorState(json)` 메서드를 사용하여 JSON 객체로부터 `EditorState` 인스턴스를 다시 생성합니다.
- **커스텀 노드의 직렬화 처리**:
  - **`static exportJSON()`**: 개발자가 직접 만든 커스텀 노드가 JSON으로 어떻게 표현될지를 정의하는 메서드입니다. 이 메서드 내에서 반드시 `super.exportJSON()`을 호출하여 부모 노드로부터 상속받은 속성들을 포함시켜야 합니다.
  - **`static importJSON()`**: 직렬화된 JSON 객체로부터 커스텀 노드 인스턴스를 어떻게 생성할지 정의하는 정적(static) 메서드입니다. `type` 필드를 기반으로 올바른 노드 클래스를 찾아 이 메서드를 호출합니다.
  - **`updateFromJSON()`**: `importJSON`의 구현을 단순화하고, 부모 클래스의 역직렬화 로직을 재사용하기 위해 제공되는 헬퍼 메서드입니다. `importJSON` 내부에서 이 메서드를 호출하는 것이 권장됩니다.
- **하위 호환성 및 버전 관리**:
  - 직렬화된 데이터의 스키마를 변경할 때는 하위 호환성을 유지하는 것이 매우 중요합니다.
  - 기존 속성을 변경하거나 제거하는 대신, 새로운 속성을 **선택적(optional)**으로 추가하는 방식이 권장됩니다.
  - 각 노드가 자신의 속성에 대한 기본값을 제공하도록 설계하면, JSON 페이로드를 줄이고 유연성을 높일 수 있습니다.

## 5. 테마(Theming)

- **개념**: Lexical은 `initialConfig`에 `theme` 객체를 전달하여 에디터의 모든 시각적 요소를 CSS 클래스를 통해 제어하는 유연한 테마 시스템을 제공합니다.
- **작동 원리**: `theme` 객체의 각 키는 Lexical의 특정 노드나 텍스트 포맷에 해당하며, 그 값은 실제 DOM 요소에 적용될 CSS 클래스 이름입니다. 개발자는 이 클래스에 대해 CSS 스타일을 직접 정의합니다.
- **주요 테마 속성**:
  - **블록 요소**: `paragraph`, `quote`, `heading` (h1-h6), `list` (ol, ul, listitem) 등 블록 레벨 요소의 스타일을 지정합니다.
  - **인라인 요소**: `text` 객체 내부에 `bold`, `italic`, `code`, `strikethrough`, `underline` 등 인라인 텍스트 포맷에 대한 클래스를 정의합니다.
  - **특수 노드**: `link`, `hashtag`, `image` 등 특정 노드에 대한 스타일을 지정합니다.
  - **코드 하이라이팅**: `code` 속성으로 코드 블록 전체의 스타일을, `codeHighlight` 객체 내부에서 Prism.js와 같은 구문 강조 라이브러리가 사용하는 각 토큰(`keyword`, `string`, `comment` 등)의 스타일을 세밀하게 제어할 수 있습니다.
- **예시**:
  ```javascript
  const editorTheme = {
    paragraph: 'editor-paragraph',
    text: {
      bold: 'editor-text-bold',
      italic: 'editor-text-italic',
    },
    list: {
      ul: 'editor-list-ul',
      ol: 'editor-list-ol',
    }
  };
  ```
  ```css
  .editor-paragraph {
    margin-bottom: 15px;
  }
  .editor-text-bold {
    font-weight: bold;
  }
  ```

## 6. DOM 이벤트 처리

Lexical은 자체적인 커맨드 시스템을 통해 대부분의 사용자 상호작용을 추상화하지만, 때로는 특정 노드의 네이티브 DOM 이벤트(e.g., `mouseover`, `click`)에 직접 접근해야 하는 경우가 있습니다. Lexical은 이를 위한 세 가지 주요 패턴을 제공합니다.

1.  **이벤트 위임 (Event Delegation)**:
    - **방법**: `editor.registerRootListener`를 사용하여 에디터의 최상위(root) DOM 요소에 이벤트 리스너를 한 번만 등록합니다.
    - **특징**: 핸들러 내부에서 `event.target`을 확인하여 이벤트를 발생시킨 실제 DOM 노드를 식별하고, 특정 노드 타입에 대한 로직을 수행해야 합니다. 모든 이벤트를 root에서 처리하므로 효율적일 수 있습니다.

2.  **직접 핸들러 붙이기 (Directly Attach Handlers)**:
    - **방법**: `editor.registerMutationListener`를 사용하여 특정 타입의 노드가 생성(`created`)되거나 업데이트(`updated`)될 때를 감지하고, `editor.getElementByKey(nodeKey)`로 해당 노드의 DOM 요소를 가져와 직접 `addEventListener`를 호출합니다.
    - **특징**: 특정 노드 타입에 대한 이벤트만 선별적으로 처리하므로 핸들러 로직이 더 간단해집니다.

3.  **`NodeEventPlugin` 사용 (React 한정)**:
    - **방법**: `@lexical/react`의 `<NodeEventPlugin>` 컴포넌트를 사용합니다.
    - **특징**: 2번 패턴(직접 핸들러 붙이기)을 React 컴포넌트로 편리하게 추상화한 것입니다. `nodeType`, `eventType`, `eventListener` prop만 전달하면 내부적으로 `MutationListener`를 사용하여 이벤트 핸들러를 관리해줍니다. 