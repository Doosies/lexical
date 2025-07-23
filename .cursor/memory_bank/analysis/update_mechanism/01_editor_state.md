
# ===============================================
# Lexical EditorState 심층 분석
# ===============================================
# 이 문서는 Lexical의 핵심 상태 객체인 EditorState의 필요성, 구조,
# 그리고 다양한 상태 업데이트 방법을 심층적으로 분석합니다.
# 원본: packages/lexical-website/docs/concepts/editor-state.md
# ===============================================

## 1. EditorState의 필요성: 왜 DOM이 아닌가?

Lexical에서 **신뢰성의 원천(Source of Truth)은 DOM이 아니라, Lexical이 내부적으로 관리하는 `EditorState` 모델**입니다.

HTML은 리치 텍스트를 표현하는 데 뛰어나지만, 에디터의 상태를 관리하기엔 "지나치게 유연"합니다. 예를 들어, 아래 세 가지 HTML은 시각적으로는 동일한 결과를 만들지만 내부 구조는 완전히 다릅니다.

```html
<i><b>Lexical</b></i>
<i><b>Lex<b><b>ical</b></i>
<b><i>Lexical</i></b>
```

이러한 비일관성은 상태를 예측하고 관리하기 어렵게 만듭니다. 반면, Lexical의 `EditorState`는 구조와 서식을 분리하여 항상 일관된(canonical) 트리 구조를 유지합니다. 이를 통해 어떤 순서로 스타일이 적용되든 예측 가능한 상태를 보장합니다.

---

## 2. EditorState의 구조와 생명주기

`EditorState`는 특정 시점의 에디터 상태를 담고 있는 **불변(immutable) 스냅샷**입니다. `editor.getEditorState()`를 통해 최신 상태를 얻을 수 있으며, 주로 두 가지 핵심 요소를 포함합니다.

1.  **노드 트리(\_nodeMap)**: `RootNode`부터 시작하는 모든 노드의 계층 구조입니다.
2.  **선택 영역(\_selection)**: 사용자의 현재 커서 위치나 선택된 범위를 나타냅니다.
    -   **자세한 내용**: [Selection 및 포커스 관리 심층 분석](../../analysis/selection/01_selection_and_focus_management.md) 문서를 참고하세요.

### 2.1. 이중 버퍼링 (Double Buffering)

Lexical은 상태 업데이트 시 '이중 버퍼링' 기법을 사용합니다.

-   **Current EditorState**: 현재 DOM에 렌더링된, 변경 불가능한(immutable) 상태입니다.
-   **Pending EditorState**: `editor.update()`가 실행되는 동안, `Current EditorState`가 복제되어 생성되는 '작업 중인' 상태입니다. 이 상태는 변경이 가능하며(mutable), 모든 변경 작업이 완료된 후 새로운 `Current EditorState`가 되어 DOM에 반영됩니다.

이러한 방식은 여러 개의 동기적인 업데이트를 하나의 DOM 업데이트로 묶어(batching) 처리하므로 성능을 향상시킵니다.

---

## 3. 상태(State) 업데이트 방법

### 3.1. `editor.update(fn, options?)`

상태를 변경하는 가장 일반적인 방법입니다. `update` 클로저 내에서만 `$`로 시작하는 헬퍼 함수들을 사용하여 상태를 안전하게 변경할 수 있습니다.

```javascript
editor.update(() => {
  const root = $getRoot();
  const paragraphNode = $createParagraphNode();
  paragraphNode.append($createTextNode('Hello world'));
  root.append(paragraphNode);
});
```

#### `discrete: true` 옵션

일반적으로 `update`는 비동기적으로 처리되어 다른 업데이트와 함께 묶입니다. 하지만 서버에 상태를 즉시 저장하는 등, 업데이트를 동기적으로 실행하고 싶을 때가 있습니다. 이 경우 `discrete: true` 옵션을 사용하면 업데이트가 즉시 반영됩니다.

```javascript
editor.update(() => {
  // ... 상태 변경 ...
}, { discrete: true });

// 이 시점에는 위 업데이트가 항상 반영되어 있음을 보장합니다.
saveToDatabase(editor.getEditorState().toJSON());
```

### 3.2. `editor.setEditorState(editorState)`

기존의 `EditorState`를 완전히 새로운 `EditorState` 객체로 교체합니다. 주로 저장된 JSON으로부터 상태를 복원할 때 사용됩니다.

```javascript
const editorState = editor.parseEditorState(jsonString);
editor.setEditorState(editorState);
```

### 3.3. `editorState.clone(selection?)`

기존 `EditorState`를 복제하여 새로운 인스턴스를 만듭니다. 선택적으로 새로운 `selection` 상태를 주입할 수 있습니다. 예를 들어, 상태는 업데이트하되 에디터에 포커스를 주지 않고 싶을 때 유용합니다.

```javascript
// selection을 null로 전달하여, 상태는 적용하되 포커스는 이동시키지 않음
editor.setEditorState(someEditorState.clone(null));
```

## 4. 상태 변경 감지: `registerUpdateListener`

에디터 상태가 변경될 때마다 특정 로직을 실행하고 싶다면, 업데이트 리스너를 등록합니다. 리스너는 모든 변경 작업이 완료되고 새로운 `EditorState`가 확정된 **후에** 호출됩니다.

```javascript
editor.registerUpdateListener(({editorState, prevEditorState, tags}) => {
  // 최신 EditorState는 editorState 인자로 전달됩니다.
  // tags Set<string>을 통해 해당 업데이트에 포함된 태그들을 확인할 수 있습니다.

  // 리스너 내부에서 상태를 읽을 때는 반드시 .read()를 사용해야 합니다.
  editorState.read(() => {
    const json = editorState.toJSON();
    // ...
  });
});
```

## 5. 핵심 속성(Properties)

`EditorState` 객체는 내부적으로 다음과 같은 주요 속성들을 가집니다.

-   `_nodeMap`: 에디터에 존재하는 모든 `LexicalNode` 객체를 `NodeKey`(문자열)를 키로 하여 저장하는 `Map`입니다. 노드에 대한 빠른 조회를 가능하게 합니다.
-   `_selection`: 에디터의 현재 선택(selection) 상태를 나타내는 `RangeSelection`, `NodeSelection` 또는 `null` 객체입니다. 사용자의 커서 위치, 블록 지정 범위 등의 정보를 담고 있습니다.
    -   **자세한 내용**: [Selection 및 포커스 관리 심층 분석](../../selection/01_selection_and_focus_management.md) 문서를 참고하세요.
-   `_pendingEditorState`: 다음 업데이트에서 적용될 `EditorState`입니다. `editor.update()`가 호출되면 이 객체가 생성되고, 업데이트가 완료되면 현재 `EditorState`가 됩니다.
-   `_flushSync`: 동기적인 DOM 업데이트를 강제할지 여부를 나타내는 플래그입니다.
-   `_readOnly`: 에디터가 읽기 전용 모드인지 여부를 나타냅니다.
-   `_tags`: 현재 업데이트에 포함된 태그들을 담고 있는 `Set<string>`입니다.
    -   **자세한 내용**: [업데이트 태그(Update Tags) 심층 분석](./04_update_tags.md) 문서를 참고하세요. 