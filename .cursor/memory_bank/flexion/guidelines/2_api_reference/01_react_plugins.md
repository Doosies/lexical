# 01. React 플러그인 레퍼런스

**문서 상태**: `v1.0` (apiReference.md에서 분리)

이 문서는 `@lexical/react` 패키지에서 제공하는 주요 플러그인 컴포넌트들의 API와 사용법을 정리한 레퍼런스입니다.

## 주요 플러그인 컴포넌트

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