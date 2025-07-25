# 노드 시스템 분석 (Node System Analysis)

**폴더 목적 (Purpose):** 이 폴더는 Lexical의 핵심 구성 요소인 **노드(Node) 시스템**의 고급 기능들(교체, 상태 API, 순회)을 심층적으로 분석합니다.

---

## 문서 목록 (Documents)

| 파일 경로 (Path)                                 | 요약 (Summary)                                                                                                                  |
| :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| [`01_node_replacement.md`](./01_node_replacement.md) | 특정 노드를 다른 종류의 노드로 교체하는 $replaceWith<T>() 메서드의 동작 방식, 제약 조건, 그리고 실제 활용 사례를 분석합니다. |
| [`02_node_state_api.md`](./02_node_state_api.md)       | 노드에 동적으로 추가 상태(state)를 부여하고 관리하는 NodeState API의 개념, 사용법, 그리고 직렬화 과정에서의 동작을 분석합니다.  |
| [`03_node_traversal_with_nodecaret.md`](./03_node_traversal_with_nodecaret.md) | 복잡한 노드 구조 내에서 효율적이고 안전하게 위치를 탐색하고 이동하는 NodeCaret API의 개념, 주요 메서드, 그리고 활용 사례를 분석합니다. |

---

*이 문서는 `.cursor/memory_bank/analysis/node_system/index.yaml` 파일의 내용을 바탕으로 AI에 의해 자동으로 생성 및 업데이트됩니다.* 