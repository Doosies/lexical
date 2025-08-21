# 업데이트 메커니즘 분석 (Update Mechanism Analysis)

**폴더 목적 (Purpose):** 이 폴더는 Lexical의 핵심 상태 객체인 `EditorState`의 구조부터, 업데이트 트랜잭션의 시작, 처리, 최종 DOM 반영까지의 전체 과정을 심층적으로 분석하는 문서들을 포함합니다.

---

## 문서 목록 (Documents)

| 파일 경로 (Path)                                                               | 요약 (Summary)                                                                                                                            |
| :----------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| [`./01_update_mechanism_overview.md`](./01_update_mechanism_overview.md)       | Lexical의 핵심 상태 객체인 EditorState의 구조부터, 업데이트 트랜잭션의 시작, 처리, 최종 DOM 반영까지의 전체 과정을 심층적으로 분석합니다. |
| [`./02_entrypoints_and_listeners.md`](./02_entrypoints_and_listeners.md)       | 업데이트 트랜잭션이 시작되는 주요 진입점(entrypoint)들과, 업데이트 완료 후 실행되는 리스너(listener)들의 종류와 역할을 분석합니다.        |
| [`./03_begin_update_transaction.md`](./03_begin_update_transaction.md)         | editor.update()의 내부 동작과, 안전한 업데이트 컨텍스트를 제공하는 콜백 함수의 역할을 분석합니다.                                         |
| [`./04_commit_pending_updates.md`](./04_commit_pending_updates.md)             | 업데이트 큐에 쌓인 변경 사항들을 처리하는 \_commitPendingUpdates() 함수의 내부 동작을 분석합니다.                                         |
| [`./05_dirty_node_marking.md`](./05_dirty_node_marking.md)                     | 노드가 변경되었음을 알리는 "dirty" 마킹의 원리와, 이것이 업데이트 성능에 미치는 영향을 분석합니다.                                        |
| [`./06_node_transforms.md`](./06_node_transforms.md)                           | dirty로 표시된 노드들을 찾아, 등록된 변환(Transform) 함수들을 반복적으로 적용하는 $applyAllTransforms 함수의 동작을 분석합니다.           |
| [`./07_nested_updates.md`](./07_nested_updates.md)                             | 하나의 업데이트 트랜잭션 내에서 다른 업데이트가 발생하는 중첩 업데이트(Nested Update)의 처리 방식을 분석합니다.                           |
| [`./08_update_tags.md`](./08_update_tags.md)                                   | 업데이트의 종류를 식별하고, 특정 리스너만 선택적으로 실행되도록 하는 업데이트 태그(Update Tag)의 활용법을 분석합니다.                     |
| [`./09_dom_reconciliation_deep_dive.md`](./09_dom_reconciliation_deep_dive.md) | 업데이트된 EditorState가 실제 DOM에 반영되는 과정(DOM Reconciliation)을 심층적으로 분석합니다.                                            |
| [`./10_elementnode_and_reconcile.md`](./10_elementnode_and_reconcile.md)       | ElementNode의 자식 노드 변경 사항이 실제 DOM에 어떻게 반영(reconcile)되는지 그 상세 로직을 분석합니다.                                    |

---

_이 문서는 `.cursor/memory_bank/flexion/analysis/update_mechanism/index.yaml` 파일의 내용을 바탕으로 AI에 의해 자동으로 생성 및 업데이트됩니다._
