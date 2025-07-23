# Lexical API 레퍼런스

**문서 상태**: `v1.2` (상세 내용 복원 및 심층 분석 링크 추가)

이 문서는 Lexical의 주요 플러그인, HTML 변환, 직렬화, 테마 등 핵심 API 활용법에 대한 레퍼런스입니다. 각 API에 대한 상세한 설명과 함께, 더 깊이 있는 정보를 담고 있는 **심층 분석 문서로의 링크**를 제공합니다.

## 1. 주요 React 플러그인 컴포넌트

`@lexical/react` 패키지는 Vanilla JS용 핵심 로직을 React 컴포넌트로 편리하게 감싼(wrapping) 플러그인들을 제공합니다. 이 플러그인들은 `<LexicalComposer>` 컨텍스트 내에서 사용되어야 하며, 필요한 경우 `initialConfig`의 `nodes` 배열에 관련 노드 클래스를 등록해야 합니다.

- **`<PlainTextPlugin>` / `<RichTextPlugin>`**: 일반 텍스트 및 리치 텍스트 편집의 핵심 기능을 제공하는 기본 플러그인입니다.
- **`<HistoryPlugin>`**: Undo/Redo 기능(기록 스택 관리)을 추가합니다.
- **`<OnChangePlugin onChange={...}>`**: `EditorState`가 변경될 때마다 콜백을 실행합니다. `ignoreSelectionChange` 같은 옵션으로 콜백 트리거 조건을 세밀하게 제어할 수 있습니다.
- **`<LinkPlugin>`**: 링크 노드와 `$toggleLink` 커맨드 등을 지원합니다.
- **`<ListPlugin>`**: 순서(ordered) 및 비순서(unordered) 리스트 기능을 지원합니다.
- **`<CheckListPlugin>`**: 체크리스트 기능을 지원합니다. (체크/언체크 마크 렌더링을 위한 별도 CSS 필요)
- **`<TablePlugin>`**: 테이블 생성 및 편집 기능을 지원합니다.
- **`<AutoLinkPlugin matchers={...}>`**: 정규식(Matcher)을 기반으로 URL 같은 텍스트를 자동으로 링크 노드로 변환합니다. `matchers` prop으로 커스텀 로직을 전달할 수 있습니다.
- **`<MarkdownShortcutPlugin>`**: 헤딩, 리스트, 코드 블록 등 마크다운 단축키 기능을 추가합니다.
- **`<TabIndentationPlugin>`**: `Tab` 키를 사용한 들여쓰기/내어쓰기 기능을 활성화합니다.
- **`<TableOfContentsPlugin>`**: 에디터 내의 헤딩(h1-h3) 노드를 감지하여 목차 데이터를 실시간으로 생성하고, 자식으로 전달된 콜백 함수를 통해 `[[key, text, tag], ...]` 형태의 배열을 전달합니다.
- **`<EditorRefPlugin editorRef={...}>`**: `LexicalComposer` 외부의 다른 컴포넌트에서 `editor` 인스턴스에 접근해야 할 때, React `ref`를 통해 인스턴스를 전달하는 통로 역할을 합니다.
- **`<SelectionAlwaysOnDisplay>`**: 에디터가 포커스를 잃어도 텍스트 선택 영역이 계속 보이도록 유지합니다.

> **[심층 분석]** 플러그인 시스템의 전체적인 아키텍처와, 플러그인 간의 통신을 가능하게 하는 커맨드 시스템의 동작 원리가 궁금하다면 아래 문서를 참고하세요.
>
> -   **[플러그인 아키텍처 및 커맨드 시스템 심층 분석](../analysis/plugin_and_command_system_analysis.md)**

## 2. HTML 변환

- **`@lexical/html`**: `EditorState`와 HTML 문자열 간의 양방향 변환을 담당하는 유틸리티 함수를 제공하며, 복사/붙여넣기 기능의 기반이 됩니다.
- **`$generateHtmlFromNodes(editor, selection | null)`**: 현재 `EditorState` 또는 특정 `selection`을 HTML 문자열로 변환합니다.
- **`$generateNodesFromDOM(editor, dom)`**: DOM 객체를 `Lexical` 노드의 배열로 변환합니다. 변환된 노드는 에디터 초기화나 `$insertNodes`를 통해 특정 위치에 삽입하는 데 사용될 수 있습니다.
- **Headless 지원**: `JSDOM`과 같은 라이브러리를 사용하여 서버 환경에서도 HTML 변환을 완벽하게 지원합니다.

> **[심층 분석]** HTML 변환을 위한 상세한 API 사용법과 커스텀 노드의 `exportDOM`/`importDOM` 구현 방법은 아래 문서를 참고하세요.
>
> -   **[직렬화 및 역직렬화 심층 분석](../analysis/serialization/01_serialization_and_deserialization.md#3-html-직렬화-및-역직렬화)**

## 3. 상태 저장 및 불러오기 (Save & Load)

- **저장 (Save)**: `<LexicalOnChangePlugin>`을 사용하여 `EditorState`가 변경될 때마다 외부(e.g., React state, 데이터베이스)에 저장합니다.
- **포커스 관리**:
  - **기본 동작**: `editor.update`나 `editor.dispatchCommand`가 실행되면, Lexical은 내부 상태와 DOM의 선택 영역을 일치시키는 동기화 과정을 거칩니다. 이 과정에서 브라우저는 DOM 선택 영역을 따라가므로, 에디터가 자동으로 포커스를 받게 됩니다.
  - **포커스 이동 방지**: 백그라운드에서 상태만 업데이트하고 현재 사용자의 포커스는 그대로 유지하고 싶을 때가 있습니다. 이 경우, `update` 스코프 내에서 `$addUpdateTag('SKIP_DOM_SELECTION_TAG')`를 호출하면 DOM 선택 영역 동기화를 건너뛰어 포커스 이동을 막을 수 있습니다.

> **[심층 분석]** `OnChangePlugin`을 통한 상태 변경 감지, `editor.update`의 상세 동작 방식, 그리고 포커스 이동을 방지하는 `SKIP_DOM_SELECTION_TAG`와 같은 고급 기법에 대한 자세한 내용은 아래 문서들을 참고하세요.
>
> -   **[데이터 흐름과 상태 업데이트 심층 분석](../analysis/data_flow_and_state_update_analysis.md)**
> -   **[EditorState 심층 분석](../analysis/update_mechanism/01_editor_state.md)**
> -   **[업데이트 태그(Update Tags) 심층 분석](../analysis/update_mechanism/04_update_tags.md)**

## 4. 직렬화(Serialization)와 역직렬화(Deserialization)

`EditorState`는 Lexical 내부에서 사용하는 인메모리(in-memory) 데이터 구조입니다. 이를 외부(DB, 파일)에 저장하거나 다른 시스템과 데이터를 교환하기 위해, 특정 포맷으로 변환하는 과정을 **직렬화**라고 하며, 그 반대 과정을 **역직렬화**라고 합니다.

### 4.1. JSON 직렬화/역직렬화

- **`editor.getEditorState().toJSON()`**: `EditorState` 전체를 순수한 JSON 객체로 변환합니다.
- **`editor.parseEditorState(json)`**: JSON 객체로부터 `EditorState` 인스턴스를 다시 생성합니다.
- **`node.exportJSON(): SerializedLexicalNode`**: 커스텀 노드가 JSON으로 어떻게 표현될지 정의하는 인스턴스 메서드입니다.
- **`Node.importJSON(serializedNode): LexicalNode`**: 직렬화된 JSON 객체로부터 커스텀 노드 인스턴스를 어떻게 생성할지 정의하는 정적(static) 메서드입니다.

### 4.2. HTML 직렬화/역직렬화

- **`$generateHtmlFromNodes(editor, selection | null)`**: 현재 `EditorState` 또는 특정 `selection`을 HTML 문자열로 변환합니다.
- **`$generateNodesFromDOM(editor, dom)`**: DOM 객체를 Lexical 노드의 배열로 변환합니다.
- **`node.exportDOM(editor): DOMExportOutput`**: 커스텀 노드가 HTML로 어떻게 표현될지 정의하는 인스턴스 메서드입니다.
- **`Node.importDOM(): DOMConversionMap | null`**: `HTMLElement`를 어떤 Lexical 노드로 변환할지 정의하는 정적(static) 메서드입니다.

> **[심층 분석]** 각 직렬화 API의 상세한 사용법, 버전 관리 전략 등은 아래 문서를 참고하세요.
>
> -   **[직렬화 및 역직렬화 심층 분석](../analysis/serialization/01_serialization_and_deserialization.md)**
> -   **[노드 개발 마스터 가이드](./node_development_guide.md#3-커스텀-노드-생성하기)**

## 5. 테마(Theming)

- **개념**: `initialConfig`에 `theme` 객체를 전달하여 에디터의 모든 시각적 요소를 CSS 클래스를 통해 제어하는 시스템입니다.
- **작동 원리**: `theme` 객체의 키는 노드나 텍스트 포맷에 해당하며, 값은 실제 DOM에 적용될 CSS 클래스 이름입니다.
- **포괄적인 예시**:
  ```javascript
  const editorTheme = {
    ltr: 'ltr',
    rtl: 'rtl',
    paragraph: 'editor-paragraph',
    quote: 'editor-quote',
    heading: {
      h1: 'editor-heading-h1',
      h2: 'editor-heading-h2',
      h3: 'editor-heading-h3',
      h4: 'editor-heading-h4',
      h5: 'editor-heading-h5',
      h6: 'editor-heading-h6',
    },
    list: {
      nested: {
        listitem: 'editor-nested-listitem',
      },
      ol: 'editor-list-ol',
      ul: 'editor-list-ul',
      listitem: 'editor-listItem',
      listitemChecked: 'editor-listItemChecked',
      listitemUnchecked: 'editor-listItemUnchecked',
    },
    hashtag: 'editor-hashtag',
    image: 'editor-image',
    link: 'editor-link',
    text: {
      bold: 'editor-textBold',
      code: 'editor-textCode',
      italic: 'editor-textItalic',
      strikethrough: 'editor-textStrikethrough',
      subscript: 'editor-textSubscript',
      superscript: 'editor-textSuperscript',
      underline: 'editor-textUnderline',
      underlineStrikethrough: 'editor-textUnderlineStrikethrough',
    },
    code: 'editor-code',
    codeHighlight: {
      'atrule': 'editor-tokenAttr',
      'attr': 'editor-tokenAttr',
      'boolean': 'editor-tokenProperty',
      'builtin': 'editor-tokenSelector',
      'cdata': 'editor-tokenComment',
      'char': 'editor-tokenSelector',
      'class': 'editor-tokenFunction',
      'class-name': 'editor-tokenFunction',
      'comment': 'editor-tokenComment',
      'constant': 'editor-tokenProperty',
      'deleted': 'editor-tokenProperty',
      'doctype': 'editor-tokenComment',
      'entity': 'editor-tokenOperator',
      'function': 'editor-tokenFunction',
      'important': 'editor-tokenVariable',
      'inserted': 'editor-tokenSelector',
      'keyword': 'editor-tokenAttr',
      'namespace': 'editor-tokenVariable',
      'number': 'editor-tokenProperty',
      'operator': 'editor-tokenOperator',
      'prolog': 'editor-tokenComment',
      'property': 'editor-tokenProperty',
      'punctuation': 'editor-tokenPunctuation',
      'regex': 'editor-tokenVariable',
      'selector': 'editor-tokenSelector',
      'string': 'editor-tokenSelector',
      'symbol': 'editor-tokenProperty',
      'tag': 'editor-tokenProperty',
      'url': 'editor-tokenOperator',
      'variable': 'editor-tokenVariable',
    },
  };
  ```

> **[사용 예시]** 실제 `theme` 객체 설정과 CSS 파일 작성법에 대한 구체적인 예시는 아래 문서를 참고하세요.
>
> -   **[기본 에디터 설정 예시](../examples/basic_editor_setup.md#2-스타일링-theming)**

## 6. DOM 이벤트 처리

Lexical은 네이티브 DOM 이벤트(e.g., `mouseover`, `click`)에 직접 접근하기 위한 세 가지 주요 패턴을 제공합니다.

1.  **이벤트 위임 (Event Delegation)**: `editor.registerRootListener` 사용.
2.  **직접 핸들러 붙이기 (Directly Attach Handlers)**: `editor.registerMutationListener` 사용.
3.  **`NodeEventPlugin` 사용 (React 한정)**: `<NodeEventPlugin>` 컴포넌트 사용.

> **[심층 분석]** 세 가지 이벤트 처리 패턴에 대한 자세한 설명과 사용 예시는 아래 문서를 참고하세요.
>
> -   **[DOM 이벤트 처리 심층 분석](../analysis/dom_interaction/01_dom_event_handling.md)**

## 7. 에디터 모드 관리 (읽기/쓰기)

- **`editor.setEditable(isEditable: boolean)`**: 에디터의 모드를 편집 가능(`true`) 또는 읽기 전용(`false`)으로 동적으로 설정합니다.
- **`editor.isEditable(): boolean`**: 현재 에디터가 편집 가능한 상태인지 여부를 반환합니다.
- **`editor.registerEditableListener(callback)`**: 에디터의 편집 가능 상태가 변경될 때마다 콜백 함수를 실행합니다.

> **[사용 예시]** `setEditable`과 `registerEditableListener`를 활용한 실제 구현 패턴은 아래 문서를 참고하세요.
>
> -   **[기본 에디터 설정 예시](../examples/basic_editor_setup.md#6-읽기편집-모드-전환-readedit-mode)**

## 8. Selection 관리

- **`$getSelection(): BaseSelection | null`**: 현재 `EditorState`의 `Selection` 객체를 반환합니다.
- **`$setSelection(selection: BaseSelection | null)`**: `Selection`을 명시적으로 설정합니다.
- **`SELECTION_CHANGE_COMMAND`**: 선택 영역이 변경될 때마다 발행되는 내장 커맨드입니다.

> **[심층 분석]** `RangeSelection`, `NodeSelection` 등 다양한 선택 유형과 관련 API, 그리고 포커스 관리 기법에 대한 자세한 내용은 아래 문서를 참고하세요.
>
> -   **[Selection 및 포커스 관리 심층 분석](../analysis/selection/01_selection_and_focus_management.md)**

## 9. 노드 변환 (Node Transforms)

`Node Transform`은 `EditorState`가 변경될 때, DOM에 렌더링되기 전에 특정 노드를 자동으로 변환하는 가장 효율적인 방법입니다.

- **`editor.registerNodeTransform<T>(nodeType, transformFn)`**: 특정 노드 타입에 대한 변환 함수를 등록합니다.

> **[심층 분석]** `registerNodeTransform`의 동작 원리와 활용법은 아래 문서를 참고하세요.
>
> -   **[`beginUpdate` 트랜잭션 심층 분석](../analysis/update_mechanism/03_begin_update_transaction.md#2-applyalltransforms)**