# 히스토리 시스템 분석 (History System Analysis)

**폴더 목적 (Purpose):** 이 폴더는 `HistoryPlugin`의 **실행 취소(Undo)/다시 실행(Redo)** 동작 원리, 특히 연속된 입력을 하나의 단위로 묶는 **Undo Coalescing** 메커니즘을 심층적으로 분석합니다.

---

## 문서 목록 (Documents)

| 파일 경로 (Path)                                 | 요약 (Summary)                                                                                                                  |
| :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| [`01_history_and_undo_coalescing.md`](./01_history_and_undo_coalescing.md) | Lexical의 Undo/Redo 동작 원리, 특히 연속된 입력을 하나로 묶는 "Undo Coalescing" 메커니즘과 그 중단 조건, 관련 태그를 심층 분석합니다. |

---

*이 문서는 `.cursor/memory_bank/analysis/history/index.yaml` 파일의 내용을 바탕으로 AI에 의해 자동으로 생성 및 업데이트됩니다.* 