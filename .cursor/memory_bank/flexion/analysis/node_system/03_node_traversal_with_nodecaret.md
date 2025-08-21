# 심층 분석: NodeCaret을 이용한 노드 순회

**문서 상태**: `v1.0`

> (커스텀 노드 제작의 기본은 [노드 개발 마스터 가이드](../../guidelines/node_development_guide.md)를 참고하세요.)

이 문서는 `v0.25.0`에 도입된 저수준 API인 **`NodeCaret`**을 사용하여 문서 트리를 순회하는 통합되고 효율적인 방법을 심층적으로 분석합니다. `NodeCaret`은 기존 순회 API들이 가진 여러 엣지 케이스와 비효율성을 해결하기 위해 설계되었습니다.

---

## 1. 핵심 개념

`NodeCaret`은 세 가지 핵심 요소로 문서 내의 특정 "지점"을 표현하는, 불변(immutable) 객체입니다.

- **`origin`**: 기준이 되는 노드.
- **`direction`**: 화살표의 방향 (`'next'` 또는 `'previous'`).
- **`type`**: 화살표의 종류 (`'sibling'` 또는 `'child'`).

이 "화살표"는 `origin` 노드로부터 어느 방향의 노드를 가리키는지 나타냅니다. `NodeCaret` 객체는 **불변(immutable)**이므로, 문서 구조가 변경되어도 `origin` 노드만 유효하다면 캐럿의 위치가 유지되어 기존 방식보다 훨씬 안정적입니다.

---

## 2. 주요 Caret 타입

- **`SiblingCaret`**: 형제 노드를 가리키는 캐럿입니다. `$getSiblingCaret(origin, direction)`로 생성합니다.
- **`ChildCaret`**: 자식 노드를 가리키는 캐럿입니다. `$getChildCaret(origin, direction)`로 생성합니다.
- **`TextPointCaret`**: `TextNode` 내의 특정 텍스트 위치(offset)를 정밀하게 가리키는 캐럿입니다.
- **`CaretRange`**: `anchor`와 `focus`라는 두 개의 `PointCaret`으로 구성되어, `RangeSelection`과 유사하게 특정 범위를 나타냅니다. 깊이 우선 탐색(Depth First Traversal)의 기본 단위로 사용됩니다.

---

## 3. 순회 전략: 깊이 우선 탐색 (Depth-First Traversal)

`CaretRange`는 이터러블(iterable)이므로, `for...of` 루프를 사용하여 범위 내의 모든 캐럿을 깊이 우선 방식으로 순회할 수 있습니다.

### 3.1. 예시: 문서 전체 노드 순회하기

```typescript
import { $getRoot, $getChildCaret, $getSiblingCaret, $getCaretRange } from 'lexical';

editor.update(() => {
  // 1. 시작점: Root의 첫 번째 자식을 가리키는 ChildCaret
  const startCaret = $getChildCaret($getRoot(), 'next');

  // 2. 끝점: Root 자신을 빠져나가는 SiblingCaret
  const endCaret = $getSiblingCaret($getRoot(), 'next');

  // 3. 시작점과 끝점으로 CaretRange 생성
  const caretRange = $getCaretRange(startCaret, endCaret);

  // 4. for...of 루프로 순회
  for (const caret of caretRange) {
    // caret은 범위 내의 각 지점을 나타내는 NodeCaret 객체입니다.
    // caret.getNode()로 실제 노드를 가져올 수 있습니다.
    const node = caret.getNode();
    console.log('Traversing node:', node.getType(), node.getKey());
  }
});
```

이 방식을 사용하면, 개발자는 엣지 케이스(e.g., 빈 노드, collapsed selection)에 대한 걱정 없이 안정적으로 노드 트리를 탐색하고 조작할 수 있습니다. 