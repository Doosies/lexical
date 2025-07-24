# 04. DOM 및 노드 상호작용 레퍼런스

**문서 상태**: `v1.0` (apiReference.md에서 분리)

이 문서는 Lexical이 네이티브 DOM과 상호작용하는 방식과, `EditorState`가 변경될 때 특정 노드를 자동으로 변환하는 `Node Transform` 기능에 대해 설명합니다.

## 1. DOM 이벤트 처리

Lexical은 네이티브 DOM 이벤트(e.g., `mouseover`, `click`)에 직접 접근하기 위한 세 가지 주요 패턴을 제공합니다.

1.  **이벤트 위임 (Event Delegation)**: `editor.registerRootListener` 사용.
2.  **직접 핸들러 붙이기 (Directly Attach Handlers)**: `editor.registerMutationListener` 사용.
3.  **`NodeEventPlugin` 사용 (React 한정)**: `<NodeEventPlugin>` 컴포넌트 사용.

> **[심층 분석]** 세 가지 이벤트 처리 패턴에 대한 자세한 설명과 사용 예시는 아래 문서를 참고하세요.
>
> -   **[DOM 이벤트 처리 심층 분석](../analysis/dom_interaction/01_dom_event_handling.md)**

## 2. 노드 변환 (Node Transforms)

`Node Transform`은 `EditorState`가 변경될 때, DOM에 렌더링되기 전에 특정 노드를 자동으로 변환하는 가장 효율적인 방법입니다.

- **`editor.registerNodeTransform<T>(nodeType, transformFn)`**: 특정 노드 타입에 대한 변환 함수를 등록합니다.

> **[심층 분석]** `registerNodeTransform`의 동작 원리와 활용법은 아래 문서를 참고하세요.
>
> -   **[`beginUpdate` 트랜잭션 심층 분석](../analysis/update_mechanism/03_begin_update_transaction.md#2-applyalltransforms)** 