# Serialization & Deserialization 심층 분석

**폴더 목적 (Purpose):** 이 폴더는 Lexical의 `EditorState`가 어떻게 JSON과 같은 텍스트 형식으로 변환(직렬화)되고, 다시 `EditorState` 객체로 복원(역직렬화)되는지에 대한 내부 동작 원리와 핵심 API를 심층적으로 분석합니다.

---

## 문서 목록 (Documents)

| 파일 경로 (Path)                                 | 요약 (Summary)                                                                                                                  | 버전 (Version) |
| :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ | :------------- |
| [`01_serialization_and_deserialization.md`](./01_serialization_and_deserialization.md) | EditorState를 JSON으로 변환(직렬화)하고, JSON을 다시 EditorState로 변환(역직렬화)하는 과정과 핵심 API, 그리고 초기 데이터의 일회성 생명주기를 분석합니다. | 1.1            |

---

*이 문서는 `.cursor/memory_bank/analysis/serialization/index.yaml` 파일의 내용을 바탕으로 AI에 의해 자동으로 생성 및 업데이트됩니다.* 