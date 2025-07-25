# 업데이트 메커니즘 분석 (Update Mechanism Analysis)

**폴더 목적 (Purpose):** 이 폴더는 Lexical의 핵심 상태 객체인 `EditorState`의 구조부터, 업데이트 트랜잭션의 시작, 처리, 최종 DOM 반영까지의 **전체 과정**을 심층적으로 분석합니다.

---

## 문서 목록 (Documents)

| 파일 경로 (Path)                                 | 요약 (Summary)                                                                                                                  |
| :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| [`01_update_mechanism_overview.md`](./01_update_mechanism_overview.md) | AST 변경이 시작되고 DOM에 반영되기까지의 전체 생명주기 개요                                                                |
| [`02_entrypoints_and_listeners.md`](./02_entrypoints_and_listeners.md) | 업데이트를 시작하는 진입점(`updateEditor`, `updateEditorSync`)과, 업데이트 완료 후 실행되는 각종 리스너(`UpdateListener`, `onUpdate` 등)를 분석합니다. |
| [`03_begin_update_transaction.md`](./03_begin_update_transaction.md) | 업데이트 트랜잭션의 컨트롤 타워인 `$beginUpdate` 함수의 역할과 내부 동작을 단계별로 상세히 분석합니다.                         |
| [`04_commit_pending_updates.md`](./04_commit_pending_updates.md) | 트랜잭션의 결과를 실제 DOM에 반영하고 변경을 전파하는 최종 단계인 `$commitPendingUpdates` 함수를 분석합니다.                 |
| [`05_dirty_node_marking.md`](./05_dirty_node_marking.md) | 노드가 어떻게 'dirty'로 표시되는지, `getWritable()`과 `_cloneNotNeeded`를 중심으로 변경 감지의 시작점을 분석합니다.              |
| [`06_node_transforms.md`](./06_node_transforms.md) | 'dirty' 노드에 변환 함수를 재귀적으로 적용하여 상태를 안정화시키는 `$applyAllTransforms` 엔진을 분석합니다.                       |
| [`07_nested_updates.md`](./07_nested_updates.md) | `$beginUpdate` 트랜잭션 중에 발생하는 중첩 업데이트를 처리하는 `processNestedUpdates` 함수의 동작을 분석합니다.                       |
| [`08_update_tags.md`](./08_update_tags.md) | 업데이트에 컨텍스트를 부여하는 `UpdateTag`의 역할과, 히스토리 병합(coalescing) 등 실제 활용 사례를 설명합니다.                 |
| [`09_dom_reconciliation_deep_dive.md`](./09_dom_reconciliation_deep_dive.md) | Lexical 렌더링 엔진의 핵심인 `$reconcileRoot`와 `$reconcileNode`의 동작 원리를 총괄 PM/실행 팀장 모델로 심층 분석합니다.     |
| [`10_elementnode_and_reconciliation.md`](./10_elementnode_and_reconciliation.md) | `ElementNode`의 이중 연결 리스트와 `Reconciler`의 배열 기반 렌더링 엔진이 어떻게 상호작용하여 성능을 최적화하는지 분석합니다. |

---

*이 문서는 `.cursor/memory_bank/analysis/update_mechanism/index.yaml` 파일의 내용을 바탕으로 AI에 의해 자동으로 생성 및 업데이트됩니다.* 