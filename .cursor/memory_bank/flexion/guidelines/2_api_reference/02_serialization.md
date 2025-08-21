# 02. 직렬화(Serialization) 레퍼런스

**문서 상태**: `v1.0` (apiReference.md에서 분리)

`EditorState`는 Lexical 내부에서 사용하는 인메모리(in-memory) 데이터 구조입니다. 이를 외부(DB, 파일)에 저장하거나 다른 시스템과 데이터를 교환하기 위해, 특정 포맷으로 변환하는 과정을 **직렬화**라고 하며, 그 반대 과정을 **역직렬화**라고 합니다.

## 1. HTML 변환

- **`@lexical/html`**: `EditorState`와 HTML 문자열 간의 양방향 변환을 담당하는 유틸리티 함수를 제공하며, 복사/붙여넣기 기능의 기반이 됩니다.
- **`$generateHtmlFromNodes(editor, selection | null)`**: 현재 `EditorState` 또는 특정 `selection`을 HTML 문자열로 변환합니다.
- **`$generateNodesFromDOM(editor, dom)`**: DOM 객체를 `Lexical` 노드의 배열로 변환합니다. 변환된 노드는 에디터 초기화나 `$insertNodes`를 통해 특정 위치에 삽입하는 데 사용될 수 있습니다.
- **Headless 지원**: `JSDOM`과 같은 라이브러리를 사용하여 서버 환경에서도 HTML 변환을 완벽하게 지원합니다.

## 2. JSON 직렬화/역직렬화

- **`editor.getEditorState().toJSON()`**: `EditorState` 전체를 순수한 JSON 객체로 변환합니다.
- **`editor.parseEditorState(json)`**: JSON 객체로부터 `EditorState` 인스턴스를 다시 생성합니다.
- **`node.exportJSON(): SerializedLexicalNode`**: 커스텀 노드가 JSON으로 어떻게 표현될지 정의하는 인스턴스 메서드입니다.
- **`Node.importJSON(serializedNode): LexicalNode`**: 직렬화된 JSON 객체로부터 커스텀 노드 인스턴스를 어떻게 생성할지 정의하는 정적(static) 메서드입니다.

## 3. 커스텀 노드 직렬화 API

- **`node.exportDOM(editor): DOMExportOutput`**: 커스텀 노드가 HTML로 어떻게 표현될지 정의하는 인스턴스 메서드입니다.
- **`Node.importDOM(): DOMConversionMap | null`**: `HTMLElement`를 어떤 Lexical 노드로 변환할지 정의하는 정적(static) 메서드입니다.

> **[심층 분석]** 각 직렬화 API의 상세한 사용법, 버전 관리 전략 등은 아래 문서들을 참고하세요.
>
> -   **[직렬화 및 역직렬화 심층 분석](../analysis/serialization/01_serialization_and_deserialization.md)**
> -   **[노드 개발 마스터 가이드](./node_development_guide.md#3-커스텀-노드-생성하기)** 