# ===============================================
# Lexical Selection 및 포커스 관리 심층 분석
# ===============================================
# 이 문서는 Lexical의 Selection 시스템의 종류, 조작 API, 그리고 "Focus Stealing" 문제와 해결책을 심층적으로 분석합니다.
# 원본: packages/lexical-website/docs/concepts/selection.md
# ===============================================

## 1. Lexical Selection 개요

Lexical의 Selection(선택)은 `EditorState`의 일부로 관리되는 **불변(immutable) 객체**입니다. 이는 모든 업데이트 사이클에서 Selection이 노드 트리(Node Tree)의 상태와 항상 일관성을 유지함을 의미합니다.

Lexical에는 주로 4가지 종류의 Selection이 존재합니다.

-   `RangeSelection`: 가장 일반적인 텍스트 범위 선택.
-   `NodeSelection`: 여러 개의 노드(예: 이미지)를 동시에 선택.
-   `TableSelection`: 테이블의 셀 범위를 격자 형태로 선택 (`@lexical/table`에서 구현).
-   `null`: 에디터에 활성화된 선택이 없는 상태 (예: blur).

---

## 2. Selection 유형 상세 분석

### 2.1. `RangeSelection`

브라우저의 DOM Selection 및 Range API를 정규화한 형태로, 가장 흔하게 사용됩니다. 주요 속성은 다음과 같습니다.

-   **`anchor`**: 선택이 시작된 지점(Point).
-   **`focus`**: 선택이 끝난 지점(Point).
-   **`format`**: 현재 선택된 범위에 활성화된 텍스트 포맷(굵게, 기울임 등)을 나타내는 숫자 플래그.

`anchor`와 `focus`는 동일한 구조를 가지는 **Point 객체**이며, 각각 다음 속성을 가집니다.

-   `key`: 선택된 `LexicalNode`의 고유 `NodeKey`.
-   `offset`: 노드 내에서의 위치. `TextNode`의 경우 글자 단위의 오프셋, `ElementNode`의 경우 자식 노드의 인덱스.
-   `type`: `'text'` 또는 `'element'`.

### 2.2. `NodeSelection`

여러 개의 특정 노드들을 직접 선택하는 데 사용됩니다. 예를 들어, 여러 개의 이미지를 동시에 선택한 경우가 해당됩니다.

-   `getNodes()`: 선택된 `LexicalNode`들의 배열을 반환합니다.

### 2.3. `TableSelection`

테이블과 같은 격자 구조의 선택을 나타냅니다.

-   `tableKey`: 선택이 일어난 부모 테이블 노드의 `NodeKey`.
-   `anchor`, `focus`: 각각 시작 셀과 끝 셀의 `NodeKey`를 참조하는 Point 객체.

---

## 3. 선택(Selection) 조작 API

선택 정보는 `lexical` 패키지에서 제공하는 `$getSelection()` 헬퍼 함수를 통해 얻을 수 있습니다. 이 함수는 `update`, `read`, 커맨드 리스너 등 `EditorState`에 접근 가능한 모든 컨텍스트에서 사용할 수 있습니다.

```javascript
import { $getSelection, SELECTION_CHANGE_COMMAND } from 'lexical';

// SELECTION_CHANGE_COMMAND는 선택이 변경될 때마다 실행됩니다.
editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
  const selection = $getSelection();
  // selection 객체를 사용하여 로직 처리
  return false;
});
```

반대로, `update`나 커맨드 리스너 내에서 프로그래밍 방식으로 선택을 직접 생성하거나 변경할 수도 있습니다.

```javascript
import { $setSelection, $createRangeSelection, $createNodeSelection, $getNodeByKey } from 'lexical';

editor.update(() => {
  // 1. RangeSelection 생성 및 설정
  const rangeSelection = $createRangeSelection();
  // ... anchor, focus 설정 ...
  $setSelection(rangeSelection);

  // 2. NodeSelection 생성 및 설정
  const nodeSelection = $createNodeSelection();
  nodeSelection.add('someNodeKey'); // 선택할 노드의 키 추가
  $setSelection(nodeSelection);

  // 3. 노드 메서드를 이용한 간접적 선택
  const someNode = $getNodeByKey('someNodeKey');
  someNode.select(); // 노드 전체를 선택 (결과는 RangeSelection 또는 NodeSelection일 수 있음)
  someNode.selectStart(); // 노드의 시작 부분에 캐럿 위치

  // 4. 선택 해제
  $setSelection(null);
});
```

---

## 4. 포커스 관리: "Focus Stealing" 문제와 해결

### 4.1. 문제 현상

`editor.update()`나 `editor.dispatchCommand()`를 호출하면, 현재 에디터에 `Selection`이 있고 편집 가능한(editable) 상태일 경우, **의도치 않게 에디터로 포커스가 이동하는 현상**이 발생할 수 있습니다. 이를 "Focus Stealing"이라고 합니다.

이는 Lexical의 상태 업데이트 후 DOM을 동기화하는 과정(reconciliation)에서 Lexical의 Selection을 실제 DOM Selection에 반영하고, 브라우저는 DOM Selection을 따라 포커스를 이동시키기 때문에 발생하는 자연스러운 동작입니다.

### 4.2. 해결 방안: `SKIP_DOM_SELECTION_TAG`

포커스를 이동시키지 않고 에디터 상태만 업데이트하고 싶을 때가 많습니다. (예: 페이지 상단 툴바 버튼 클릭 시)

이 경우, `update` 시점에 특별한 태그를 추가하여 DOM Selection 동기화 과정을 건너뛰도록 할 수 있습니다.

```javascript
import { $addUpdateTag, SKIP_DOM_SELECTION_TAG } from 'lexical';

// editor.update나 커맨드 리스너 내부에서 사용
editor.update(() => {
  // 이 태그를 추가하면 이 업데이트에서는 DOM Selection이 변경되지 않습니다.
  $addUpdateTag(SKIP_DOM_SELECTION_TAG);

  // 포커스 이동 없이 실행하고 싶은 로직
  editor.dispatchCommand(...);
});
```

이 방법을 사용하면, 사용자가 다른 입력 필드에 포커스를 둔 상태에서 툴바 버튼을 눌러도, 원래의 포커스를 잃지 않고 Lexical 에디터의 상태(예: 텍스트 포맷)만 변경할 수 있습니다. 이는 사용자 경험을 크게 향상시키는 매우 중요한 기법입니다. 

### 3.2. 포커스 이동 없이 상태 업데이트하기

때로는 에디터의 내용은 변경하되, 사용자의 현재 포커스는 그대로 유지하고 싶을 때가 있습니다. 예를 들어, 다른 곳에 있는 버튼을 눌러 특정 텍스트의 스타일을 변경하는 경우입니다. 이 때 `editor.update`나 `editor.setEditorState`를 그대로 사용하면 에디터가 자동으로 포커스를 가져가게 됩니다.

이 문제를 해결하는 방법은 두 가지입니다.

1.  **`editorState.clone(null)` 사용**: `setEditorState`를 사용할 때, `selection` 정보를 `null`로 복제하여 전달하면 포커스가 이동하지 않습니다.
    ```javascript
    editor.setEditorState(someEditorState.clone(null));
    ```
2.  **`SKIP_DOM_SELECTION_TAG` 태그 사용**: `editor.update`를 사용할 때, 이 태그를 추가하면 DOM의 선택 영역(selection)이 업데이트되는 것을 건너뛰어 포커스 이동을 방지할 수 있습니다.
    ```javascript
    import { SKIP_DOM_SELECTION_TAG } from '@lexical/selection';

    editor.update(() => {
        // ... 상태 변경 로직 ...
    }, {
        tag: SKIP_DOM_SELECTION_TAG
    });
    ```
> **자세한 내용**: 업데이트 태그의 다양한 종류와 활용법은 [**업데이트 태그(Update Tags) 심층 분석**](../update_mechanism/04_update_tags.md) 문서를 참고하세요. 