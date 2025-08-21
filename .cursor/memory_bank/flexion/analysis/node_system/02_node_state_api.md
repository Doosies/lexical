# 심층 분석: NodeState API

**문서 상태**: `v1.0`

> (커스텀 노드 제작의 기본은 [노드 개발 마스터 가이드](../../guidelines/node_development_guide.md)를 참고하세요.)

이 문서는 Lexical의 고급 기능인 **NodeState API**를 심층적으로 분석합니다. 이 기능은 기존 노드 클래스의 코드를 직접 수정하지 않고도 노드의 동작을 확장하거나 동적 데이터를 주입할 수 있는 강력한 방법을 제공합니다.

---

## 1. 동적 데이터 주입: `NodeState` API

- **핵심 목적**: 노드 클래스를 직접 수정하지 않고, **어떤 노드에든 동적으로 데이터를 추가**할 수 있게 해주는 매우 강력한 API입니다.
- **주요 장점**:
  - 추가된 데이터는 **히스토리(undo/redo), 직렬화(serialization), 노드 변환(transforms)** 등 Lexical의 모든 핵심 기능에 자동으로 통합됩니다.
  - 플러그인이나 외부 로직이 노드에 메타데이터를 '붙이는' 형태로 기능을 확장할 때 매우 유용합니다.

### 1.1. 사용 방법

`NodeState` API는 세 가지 핵심 함수로 구성됩니다.

1.  **`createState(key, options)`**:
    - 새로운 데이터 상태를 정의합니다.
    - `key`: 상태를 식별하는 고유한 문자열.
    - `options.parse`: 역직렬화 시 JSON 값을 올바른 타입으로 변환하는 함수. **반드시 구현해야 합니다.**

2.  **`$setState(node, state, value)`**:
    - 특정 노드에 `state`로 정의된 값을 저장합니다.

3.  **`$getState(node, state)`**:
    - 특정 노드에서 `state`로 정의된 값을 가져옵니다.

### 1.2. 활용 예시: 문서 레벨의 메타데이터 관리

문서의 버전이나 마지막 수정일 같은 메타데이터를 `RootNode`에 저장하는 예시입니다.

```typescript
import { $getRoot, $getNodeByKey } from 'lexical';
import { createState, $getState, $setState } from 'lexical/NodeState';

// 1. 상태 정의 (역직렬화 로직 포함)
const docVersionState = createState('docVersion', { 
  parse: (v) => (typeof v === 'number' ? v : 1) 
});
const lastModifiedState = createState('lastModified', { 
  parse: (v) => (typeof v === 'string' ? v : new Date().toISOString())
});


// 2. 에디터 업데이트 시 데이터 저장
editor.update(() => {
  const root = $getRoot();
  
  // RootNode에 버전과 마지막 수정 날짜 데이터 저장
  $setState(root, docVersionState, 2);
  $setState(root, lastModifiedState, new Date().toISOString());
});


// 3. 데이터 조회 및 활용
editor.getEditorState().read(() => {
  const root = $getRoot();

  const version = $getState(root, docVersionState); // 2
  const modified = $getState(root, lastModifiedState); // "2023-..."

  console.log(`Document Version: ${version}, Last Modified: ${modified}`);
});
```

`NodeState` API를 사용하면, `RootNode` 클래스를 직접 확장하지 않고도 이러한 메타데이터를 안전하고 효율적으로 관리할 수 있으며, 이 데이터는 `editor.toJSON()` 호출 시 자동으로 직렬화 결과에 포함됩니다. 