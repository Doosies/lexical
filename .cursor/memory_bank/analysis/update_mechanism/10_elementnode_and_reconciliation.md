# 심층 분석 4.9: ElementNode와 Reconciliation 엔진의 상호작용

**문서 상태**: `v1.0` (신규 작성)

이 문서는 Lexical의 두 가지 핵심 시스템, 즉 **데이터 구조(`ElementNode`)**와 **렌더링 엔진(`Reconciler`)**이 어떻게 유기적으로 상호작용하여 높은 성능을 달성하는지 심층적으로 분석합니다. 이 둘의 관계를 이해하는 것은 Lexical 아키텍처의 핵심 철학을 파악하는 것과 같습니다.

---

## 1. 코드 분석 (The "What")

먼저 각 시스템이 데이터를 어떻게 다루는지 코드 수준에서 살펴보겠습니다.

### 1.1. `ElementNode`: 이중 연결 리스트로 자식 관리

`ElementNode.ts`의 `getChildren` 메서드는 자식 노드 배열을 반환합니다. 이 코드는 `__first`에서 시작하여 `__next` 포인터를 따라 순회하는, 전형적인 연결 리스트 순회 방식임을 보여줍니다.

```typescript
// packages/lexical/src/nodes/LexicalElementNode.ts

getChildren<T extends LexicalNode>(): Array<T> {
  const children: Array<T> = [];
  let child: T | null = this.getFirstChild(); // 1. __first에서 시작
  while (child !== null) {
    children.push(child);
    child = child.getNextSibling(); // 2. __next 포인터를 따라 이동
  }
  return children;
}
```

### 1.2. `Reconciler`: 배열로 자식 비교

반면, `LexicalReconciler.ts`의 `createChildrenArray` 함수는 연결 리스트를 순회하여 **`NodeKey`의 배열**을 만듭니다.

```typescript
// packages/lexical/src/LexicalReconciler.ts

function createChildrenArray(element: ElementNode, nodeMap: NodeMap): Array<NodeKey> {
  const children = [];
  let nodeKey = element.__first; // 1. __first에서 시작
  while (nodeKey !== null) {
    // ...
    children.push(nodeKey);
    const node = nodeMap.get(nodeKey);
    nodeKey = node.__next; // 2. __next 포인터를 따라 이동
  }
  return children;
}
```

이 함수를 통해 생성된 **이전 상태의 Key 배열**과 **새로운 상태의 Key 배열**은 `$reconcileNodeChildren` 함수의 입력으로 사용되어, 두 배열 간의 차이점을 비교하는 Diffing 알고리즘을 수행하게 됩니다.

---

## 2. 논리 분석 (The "Why")

코드 분석을 통해 우리는 "왜 `ElementNode`는 연결 리스트를 사용하면서, `Reconciler`는 배열을 사용하는가?"라는 중요한 질문에 도달하게 됩니다. 그 답은 **성능 최적화**와 **관심사의 분리**에 있습니다.

### 2.1. 자료구조 선택의 이유

-   **`ElementNode`는 왜 이중 연결 리스트를 사용하는가?**
    -   **답**: **쓰기(Write) 작업에 최적화**되어 있기 때문입니다.
    -   텍스트 에디터에서는 노드의 삽입, 삭제, 이동이 매우 빈번하게 일어납니다. 배열에서 중간에 요소를 추가하거나 삭제하면, 그 뒤의 모든 요소들의 인덱스를 재조정해야 하므로 성능 저하가 발생합니다(시간 복잡도 `O(n)`).
    -   반면, 이중 연결 리스트는 특정 노드의 `__next`와 `__prev` 포인터 몇 개만 수정하면 되므로, `O(1)`의 매우 빠른 속도로 구조를 변경할 수 있습니다.

-   **`Reconciler`는 왜 배열을 사용하는가?**
    -   **답**: **읽고 비교하는(Read/Compare) 작업에 최적화**되어 있기 때문입니다.
    -   두 상태 간의 차이를 비교하는 Diffing 알고리즘(예: `Key` 기반 알고리즘)은 인덱스를 통해 각 요소에 직접 접근할 수 있는 배열 구조에서 가장 효율적으로 작동합니다.
    -   `createChildrenArray`는 `Reconciler`가 가장 잘하는 '비교' 작업에 집중할 수 있도록, 연결 리스트를 일시적인 배열 형태로 변환해주는 '번역기' 역할을 합니다.

### 2.2. 관심사의 분리 (Separation of Concerns)

Lexical은 두 시스템의 역할을 명확히 분리하여 각각의 장점을 극대화하는 아키텍처를 채택했습니다.

-   **상태 관리 계층 (`ElementNode`)**: 쓰기 작업(삽입, 삭제, 이동)의 성능을 극대화하기 위해 **이중 연결 리스트**를 책임집니다.
-   **렌더링 계층 (`Reconciler`)**: 읽기 및 비교 작업의 성능을 극대화하기 위해 **배열**을 책임집니다.

---

## 3. 통합 분석 (Unified Analysis)

이제 두 시스템의 상호작용을 사용자의 행동부터 최종 DOM 렌더링까지의 흐름으로 통합하여 분석해 보겠습니다.

1.  **사용자 입력 발생**: 사용자가 키보드로 글자를 입력합니다.

2.  **상태 업데이트 (in `ElementNode`)**: `editor.update()` 스코프 내에서 `TextNode`가 분리되거나 새로운 노드가 삽입되는 등의 상태 변경이 발생합니다. 이때 `ElementNode`의 `splice`와 같은 메서드는 **이중 연결 리스트**의 포인터(`__first`, `__last`, `__next`, `__prev`)를 효율적으로 수정하여 구조를 변경합니다. 이 단계는 매우 빠릅니다.

3.  **변경 사항 커밋**: `editor.update()`가 완료되면, 변경된 `EditorState`가 `Reconciler`에 전달됩니다.

4.  **자료구조 변환 (The "Bridge")**: `Reconciler`는 변경이 발생한 `ElementNode`에 대해 `createChildrenArray` 함수를 호출합니다. 이 함수는 `ElementNode`의 **이중 연결 리스트**를 순회하며, DOM 렌더링에 필요한 **`NodeKey` 배열**을 생성합니다.

5.  **차이점 비교 (Diffing)**: `Reconciler`는 `createChildrenArray`를 통해 얻은 **이전 상태의 Key 배열**과 **새로운 상태의 Key 배열**을 비교합니다. 이전에 분석한 Key 기반 알고리즘을 사용하여, 두 배열의 차이점을 분석하고 최소한의 DOM 조작(생성, 수정, 이동, 삭제) 목록을 계산합니다.

6.  **DOM 렌더링**: 계산된 최소한의 조작 목록만을 실제 DOM에 적용하여 화면을 업데이트합니다.

### 결론

Lexical은 **'가장 적합한 도구를 가장 적합한 작업에 사용한다'**는 원칙을 아키텍처에 아름답게 녹여냈습니다. 상태 변경이 잦은 데이터 관리는 **쓰기 성능이 뛰어난 이중 연결 리스트**에 맡기고, 상태 비교가 중요한 렌더링 과정은 **읽기 및 비교 성능이 뛰어난 배열**에 맡기는 '관심사의 분리'를 통해 전체 시스템의 성능을 극대화하고 있습니다. 