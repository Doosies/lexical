# ===============================================
# Lexical 직렬화 및 역직렬화 심층 분석
# ===============================================
# 이 문서는 Lexical의 상태(State)를 JSON 및 HTML 형식으로 변환(직렬화)하고,
# 다시 Lexical 상태로 복원(역직렬화)하는 메커니즘을 심층적으로 분석합니다.
# 원본: packages/lexical-website/docs/concepts/serialization.md
# ===============================================

## 1. 직렬화(Serialization) 개요

Lexical은 에디터의 상태를 메모리 상에서 관리합니다. 이 메모리 상의 상태를 다른 에디터로 전송하거나, 나중에 다시 불러오기 위해 저장 가능한 포맷으로 변환하는 과정을 **직렬화**라고 합니다. Lexical은 주로 **JSON**과 **HTML** 두 가지 형식의 직렬화를 지원합니다.

-   **JSON 직렬화**: 에디터의 전체 상태를 완전하고 정확하게 보존하는 데 사용됩니다. 데이터베이스에 저장하거나, 서버와 클라이언트 간에 상태를 동기화하는 데 이상적입니다.
-   **HTML 직렬화**: 다른 외부 에디터(예: Google Docs)와의 호환성을 위해 주로 사용됩니다. (예: 복사/붙여넣기)

---

## 2. JSON 직렬화 및 역직렬화

### 2.1. Lexical -> JSON

`EditorState` 객체의 `toJSON()` 메서드를 호출하여 간단하게 상태를 JSON 객체로 변환할 수 있습니다.

```javascript
const editorState = editor.getEditorState();
const json = editorState.toJSON();

// 문자열로 직접 변환
const jsonString = JSON.stringify(editorState);
```

#### `LexicalNode.exportJSON()`

커스텀 노드가 JSON으로 어떻게 변환될지 제어하려면, 해당 노드 클래스에 `exportJSON()` 메서드를 구현해야 합니다. 이 때, **반드시 `super.exportJSON()`을 호출하여 부모 클래스의 속성을 포함시켜야 합니다.**

```typescript
// SerializedLexicalNode는 모든 직렬화된 노드가 가져야 할 기본 타입입니다.
export type SerializedLexicalNode = {
  type: string; // getType()과 일치해야 함
  version: number; // 노드 버전 관리용
};

// HeadingNode의 예시
exportJSON(): SerializedHeadingNode {
  return {
    ...super.exportJSON(), // ElementNode의 속성들 (children 등)을 여기에 포함
    tag: this.getTag(),   // HeadingNode만의 속성 추가
  };
}
```

### 2.2. JSON -> Lexical

JSON 객체나 문자열로부터 `EditorState`를 다시 생성하려면 `editor.parseEditorState()`를 사용합니다.

```javascript
const initialEditorState = editor.parseEditorState(jsonString);
editor.setEditorState(initialEditorState);
```

#### `LexicalNode.importJSON()`

JSON 객체로부터 커스텀 노드를 어떻게 생성할지 제어하려면, `importJSON()` 정적(static) 메서드를 구현해야 합니다. 이 메서드는 직렬화된 노드 객체를 받아 실제 노드 인스턴스를 반환합니다.

`type` 필드는 어떤 `LexicalNode` 클래스로 매핑할지를 결정하는 데 사용되므로, `getType()`과 일치시키는 것이 매우 중요합니다.

```typescript
// HeadingNode의 예시
static importJSON(serializedNode: SerializedHeadingNode): HeadingNode {
  // 1. $create... 함수로 노드 인스턴스 생성
  const node = $createHeadingNode(serializedNode.tag);
  // 2. (선택사항) 다른 속성들 설정
  // node.setFormat(serializedNode.format);
  return node;
}
```

#### 노드 버전 관리 (Versioning)

커스텀 노드의 기능을 변경하거나 속성을 추가/삭제할 때, 이전 버전의 직렬화된 데이터와 호환성을 유지하는 것이 중요합니다. 이를 위해 `version` 필드를 사용합니다.

**나쁜 예 (Breaking Change)**: 기존 필드를 제거하거나 타입을 변경하면 데이터 손실이 발생할 수 있습니다.

```typescript
// 버전 1
export type SerializedMyNode = { text: string, version: 1 };
// 버전 2 - text 필드가 사라짐
export type SerializedMyNode = { content: string, version: 2 };
```

**좋은 예 (Backwards Compatible)**: 새로운 필드를 추가할 때는 항상 선택적(optional)으로 추가하여 이전 버전과의 호환성을 유지합니다.

```typescript
export type SerializedMyNode = {
  text: string,
  newField?: string, // 새로운 필드는 optional로 추가
  version: 1
};
```

`importJSON` 내부에서 `version`을 확인하여, 버전에 따라 데이터를 다르게 파싱하도록 구현하면 하위 호환성을 안전하게 지킬 수 있습니다.

---

## 3. HTML 직렬화 및 역직렬화

`@lexical/html` 패키지는 Lexical 상태와 HTML 문자열 간의 변환을 위한 유틸리티를 제공합니다.

### 3.1. Lexical -> HTML (`$generateHtmlFromNodes`)

`$generateHtmlFromNodes` 함수를 사용하여 현재 에디터 상태(또는 특정 선택 영역)로부터 HTML 문자열을 생성합니다.

```javascript
import { $generateHtmlFromNodes } from '@lexical/html';

const htmlString = $generateHtmlFromNodes(editor, selection | null);
```

#### `LexicalNode.exportDOM()`

커스텀 노드가 HTML로 어떻게 변환될지 제어하려면, `exportDOM()` 메서드를 구현해야 합니다. 이 메서드는 `HTMLElement`를 반환합니다.

```typescript
exportDOM(editor: LexicalEditor): DOMExportOutput {
  const element = document.createElement('div');
  element.textContent = this.__text;
  return { element };
}
```

### 3.2. HTML -> Lexical (`$generateNodesFromDOM`)

HTML 문자열로부터 Lexical 노드 배열을 생성하려면, 먼저 `DOMParser`를 사용하여 HTML 문자열을 DOM 객체로 변환한 뒤, `$generateNodesFromDOM` 함수를 사용합니다.

```javascript
import { $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes } from 'lexical';

editor.update(() => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(htmlString, 'text/html');
  const nodes = $generateNodesFromDOM(editor, dom);

  $getRoot().select(); // 루트를 선택하고
  $insertNodes(nodes); // 선택된 위치에 노드들을 삽입
});
```

#### `LexicalNode.importDOM()`

`HTMLElement`로부터 어떤 `LexicalNode`를 생성할지 제어하려면, `importDOM()` 정적 메서드를 구현해야 합니다. 이 메서드는 DOM 노드 이름(예: `div`, `span`)을 키로 하고, 변환 함수와 우선순위를 값으로 갖는 객체를 반환합니다.

**우선순위(priority)**는 동일한 HTML 태그(예: `<table>`)를 여러 다른 커스텀 노드가 처리하려고 할 때 어떤 변환 규칙을 먼저 적용할지 결정하는 데 사용됩니다.

```typescript
// CodeNode가 GitHub의 코드 복사(<table>)를 처리하는 예시
static importDOM(): DOMConversionMap | null {
  return {
    table: (node: Node) => { // <table> 태그를 만났을 때
      if (isGitHubCodeTable(node as HTMLTableElement)) {
        return {
          conversion: convertTableElement, // 변환 함수
          priority: 3, // 높은 우선순위
        };
      }
      return null; // 조건에 맞지 않으면 다른 변환 규칙에 넘김
    },
  };
}
```

### 3.3. `html` 설정을 통한 오버라이딩

`createEditor`의 `initialConfig`에 `html` 속성을 전달하여, 각 노드 클래스의 `importDOM`/`exportDOM`을 직접 수정하지 않고도 에디터 전역의 HTML 변환 동작을 오버라이드할 수 있습니다. 이는 일관된 변환 규칙을 적용하거나, 서브클래싱 없이 커스터마이징하고 싶을 때 유용합니다.

```typescript
const editor = createEditor({
  // ...
  html: {
    import: {
      // <img> 태그에 대한 커스텀 변환 로직
      img: (node: HTMLElement) => ({
        conversion: (domNode: HTMLElement) => {
          const { src, alt } = domNode as HTMLImageElement;
          return { node: $createImageNode({ src, alt }) };
        },
        priority: 4,
      }),
    },
    export: {
      // ImageNode를 내보낼 때 커스텀 로직
      ImageNode: (node: ImageNode) => {
        // ...
      },
    }
  }
});
``` 