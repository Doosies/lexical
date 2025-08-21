# 03. EditorState 및 테마 레퍼런스

**문서 상태**: `v1.0` (apiReference.md에서 분리)

이 문서는 에디터의 핵심 데이터 구조인 `EditorState`와 관련된 주요 API 및 시각적 표현을 담당하는 테마 시스템에 대해 설명합니다.

## 1. 상태 저장 및 불러오기 (Save & Load)

- **저장 (Save)**: `<LexicalOnChangePlugin>`을 사용하여 `EditorState`가 변경될 때마다 외부(e.g., React state, 데이터베이스)에 저장합니다.
- **포커스 관리**:
  - **기본 동작**: `editor.update`나 `editor.dispatchCommand`가 실행되면, Lexical은 내부 상태와 DOM의 선택 영역을 일치시키는 동기화 과정을 거칩니다. 이 과정에서 브라우저는 DOM 선택 영역을 따라가므로, 에디터가 자동으로 포커스를 받게 됩니다.
  - **포커스 이동 방지**: 백그라운드에서 상태만 업데이트하고 현재 사용자의 포커스는 그대로 유지하고 싶을 때가 있습니다. 이 경우, `update` 스코프 내에서 `$addUpdateTag('SKIP_DOM_SELECTION_TAG')`를 호출하면 DOM 선택 영역 동기화를 건너뛰어 포커스 이동을 막을 수 있습니다.

> **[심층 분석]** `OnChangePlugin`을 통한 상태 변경 감지, `editor.update`의 상세 동작 방식, 그리고 포커스 이동을 방지하는 `SKIP_DOM_SELECTION_TAG`와 같은 고급 기법에 대한 자세한 내용은 아래 문서들을 참고하세요.
>
> -   **[데이터 흐름과 상태 업데이트 심층 분석](../analysis/data_flow_and_state_update_analysis.md)**
> -   **[EditorState 심층 분석](../analysis/update_mechanism/01_editor_state.md)**
> -   **[업데이트 태그(Update Tags) 심층 분석](../analysis/update_mechanism/04_update_tags.md)**

## 2. 테마(Theming)

- **개념**: `initialConfig`에 `theme` 객체를 전달하여 에디터의 모든 시각적 요소를 CSS 클래스를 통해 제어하는 시스템입니다.
- **작동 원리**: `theme` 객체의 키는 노드나 텍스트 포맷에 해당하며, 값은 실제 DOM에 적용될 CSS 클래스 이름입니다.
- **포괄적인 예시**:
  ```javascript
  const editorTheme = {
    ltr: 'ltr',
    rtl: 'rtl',
    paragraph: 'editor-paragraph',
    // ... (기타 모든 theme 속성)
  };
  ```

> **[사용 예시]** 실제 `theme` 객체 설정과 CSS 파일 작성법에 대한 구체적인 예시는 아래 문서를 참고하세요.
>
> -   **[기본 에디터 설정 예시](../examples/basic_editor_setup.md#2-스타일링-theming)**

## 3. 에디터 모드 관리 (읽기/쓰기)

- **`editor.setEditable(isEditable: boolean)`**: 에디터의 모드를 편집 가능(`true`) 또는 읽기 전용(`false`)으로 동적으로 설정합니다.
- **`editor.isEditable(): boolean`**: 현재 에디터가 편집 가능한 상태인지 여부를 반환합니다.
- **`editor.registerEditableListener(callback)`**: 에디터의 편집 가능 상태가 변경될 때마다 콜백 함수를 실행합니다.

> **[사용 예시]** `setEditable`과 `registerEditableListener`를 활용한 실제 구현 패턴은 아래 문서를 참고하세요.
>
> -   **[기본 에디터 설정 예시](../examples/basic_editor_setup.md#6-읽기편집-모드-전환-readedit-mode)**

## 4. Selection 관리

- **`$getSelection(): BaseSelection | null`**: 현재 `EditorState`의 `Selection` 객체를 반환합니다.
- **`$setSelection(selection: BaseSelection | null)`**: `Selection`을 명시적으로 설정합니다.
- **`SELECTION_CHANGE_COMMAND`**: 선택 영역이 변경될 때마다 발행되는 내장 커맨드입니다.

> **[심층 분석]** `RangeSelection`, `NodeSelection` 등 다양한 선택 유형과 관련 API, 그리고 포커스 관리 기법에 대한 자세한 내용은 아래 문서를 참고하세요.
>
> -   **[Selection 및 포커스 관리 심층 분석](../analysis/selection/01_selection_and_focus_management.md)** 