# 기본 에디터 설정 예시 (Basic Editor Setup Example)

이 문서는 Lexical의 여러 API와 플러그인을 조합하여 기본적인 리치 텍스트 에디터를 설정하는 실용적인 예시와 패턴을 정리합니다.

## 1. 기본 구조

- **`<LexicalComposer>`**: 에디터의 최상위 래퍼(Wrapper)로, `initialConfig`를 통해 초기 설정을 주입합니다. React의 Context Provider와 유사하게 동작하여, 하위 플러그인과 컴포넌트들이 `editor` 인스턴스에 접근할 수 있게 합니다.
- **주요 플러그인**:
  - `<RichTextPlugin>`: `ContentEditable` div와 `LexicalErrorBoundary`를 렌더링하여 리치 텍스트 편집의 핵심 기반을 제공합니다.
  - `<HistoryPlugin>`: Undo/Redo 기능을 위한 기록 스택을 관리합니다.
  - `<AutoFocusPlugin>`: 에디터가 처음 렌더링될 때 자동으로 포커스를 설정합니다.

## 2. 스타일링 (Theming)

- **`initialConfig.theme`**: 에디터의 다양한 요소(단락, 헤딩, 리스트, 텍스트 포맷 등)에 CSS 클래스를 매핑하는 객체입니다.
- **작동 방식**: Lexical은 특정 노드(e.g., `HeadingNode`)나 텍스트 포맷(e.g., `bold`)에 해당하는 `theme` 객체의 키(e.g., `theme.heading.h1`, `theme.text.bold`)를 찾아, 그 값을 실제 DOM 요소의 `className`으로 적용합니다.
- **예시**:
  ```javascript
  const editorTheme = {
    ltr: 'ltr',
    rtl: 'rtl',
    paragraph: 'editor-paragraph',
    heading: {
      h1: 'editor-heading-h1',
      h2: 'editor-heading-h2',
    },
    text: {
      bold: 'editor-text-bold',
      italic: 'editor-text-italic',
    },
  };
  ```

## 3. 툴바 및 상호작용

- **커맨드 디스패치 (`dispatchCommand`)**:
  - 사용자의 액션(e.g., 버튼 클릭)에 따라 에디터의 상태를 변경하는 주된 방법입니다.
  - `editor.dispatchCommand(COMMAND_TYPE, payload)` 형태로 사용합니다.
  - **예시**: 굵게(bold) 버튼 클릭 시 `editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')`를 호출하여 선택된 텍스트의 포맷을 변경합니다.

- **툴바 상태 동기화 (상세 패턴)**:
  - **현재 선택 영역의 포맷 감지**: `SELECTION_CHANGE_COMMAND` 커맨드 리스너와 `registerUpdateListener`를 함께 사용하여 선택 영역이나 내용이 변경될 때마다 콜백 함수(`updateToolbar`)를 호출합니다. 이 콜백 내에서 `$getSelection()`으로 현재 선택 객체를 얻고, `selection.hasFormat('bold')`와 같은 메서드를 통해 현재 텍스트에 적용된 포맷을 확인하여 툴바 버튼의 활성화/선택 상태를 UI에 반영합니다.
  - **Undo/Redo 가능 여부 감지**: `canUndoCommand`와 `canRedoCommand` 커맨드 리스너를 등록하여, Undo/Redo 가능 상태가 변경될 때마다 `payload` (boolean 값)를 받아 버튼의 활성화/비활성화 상태를 UI에 반영합니다.

- **키보드 단축키 (Key Bindings)**:
  - `KEY_DOWN_COMMAND` (또는 각 키에 해당하는 특정 커맨드)에 대한 리스너를 등록하여 키보드 입력을 감지합니다.
  - 리스너 콜백은 `event` 객체를 인자로 받으며, `event.ctrlKey`나 `event.key` 등을 확인하여 특정 키 조합(e.g., `Ctrl+B`)이 눌렸을 때, 해당 `FORMAT_TEXT_COMMAND`를 `dispatchCommand`를 통해 실행합니다.

## 4. 커스텀 블록 타입 (e.g., 헤딩)

- 헤딩(H1, H2)과 같은 블록 레벨 요소를 적용하는 것은 인라인 텍스트 포맷팅과 약간 다릅니다.
- **패턴**:
  1. 먼저, `initialConfig.nodes` 배열에 `HeadingNode`, `ListNode` 등 사용하려는 노드 클래스를 등록해야 합니다.
  2. `@lexical/selection` 패키지의 `$setBlocksType` 함수를 사용합니다.
  3. `editor.update` 콜백 내에서, 현재 `selection`과 생성할 노드 타입을 인자로 `query`와 `$createHeadingNode('h1')`와 같은 생성 함수를 `$setBlocksType`에 전달합니다.

## 5. 상태 저장 및 불러오기

- **상태 저장 (Serialization)**:
  - **패턴**:
    1. `editor.registerUpdateListener`를 사용하여 에디터 상태 변경을 감지합니다.
    2. 성능을 위해 `use-debounce`와 같은 라이브러리를 사용하여, 타이핑이 멈췄을 때만 저장 로직이 실행되도록 합니다.
    3. 콜백 함수 내에서 현재 `editorState`를 `JSON.stringify()`를 통해 문자열로 변환하여 데이터베이스나 로컬 스토리지에 저장합니다.
    4. 불필요한 저장을 막기 위해, `dirtyElements`와 `dirtyLeaves`의 사이즈를 확인하여 실제 변경이 있을 때만 저장 로직을 실행하는 것이 좋습니다.

- **상태 불러오기 (Deserialization)**:
  - **패턴**:
    1. 컴포넌트가 마운트될 때(`useEffect`), 저장된 JSON 문자열을 불러옵니다.
    2. `editor.parseEditorState(jsonString)`를 사용하여 문자열을 `EditorState` 객체로 변환합니다.
    3. `editor.setEditorState(parsedEditorState)`를 호출하여 에디터의 내용을 복원합니다.
    4. 데이터 로딩 중 사용자가 편집하는 것을 막기 위해, 초기에는 `editable`을 `false`로 설정했다가, 로딩이 완료된 후 `editor.setEditable(true)`로 설정하는 것이 좋습니다.

## 6. 읽기/편집 모드 전환 (Read/Edit Mode)

Lexical은 에디터를 동적으로 읽기 전용(read-only) 모드로 전환하거나 다시 편집 가능 모드로 되돌리는 기능을 지원합니다.

- **모드 설정**: `editor.setEditable(boolean)` 메서드를 호출하여 모드를 변경합니다.
  - `editor.setEditable(false)`: 읽기 모드. 사용자가 내용을 수정할 수 없습니다.
  - `editor.setEditable(true)`: 편집 모드. 기본값이며, 사용자가 내용을 수정할 수 있습니다.
- **초기 모드 설정**: `createEditor` 또는 `<LexicalComposer>`의 `initialConfig`에서 `editable: false` 옵션을 주어 초기 상태를 읽기 모드로 시작할 수 있습니다.
- **모드 변경 감지**: `editor.registerEditableListener((isEditable) => { ... })`를 사용하여 모드 변경 시점을 감지하고, UI 상태(e.g., 편집 버튼 활성화/비활성화)를 업데이트하는 등의 부가적인 로직을 처리할 수 있습니다. 