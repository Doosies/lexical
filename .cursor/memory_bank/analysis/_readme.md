# Lexical 심층 분석: 목차 (Table of Contents)

이 문서는 `.cursor/memory_bank/analysis/` 폴더에 있는 모든 심층 분석 주제들의 중앙 목차 역할을 합니다. Lexical의 특정 내부 동작 원리를 이해하고 싶을 때, 이 문서를 시작점으로 활용하세요.

각 주제는 독립된 폴더로 구성되어 있으며, 관련된 여러 분석 문서를 포함하고 있습니다.

---

## 분석 주제 목록

| 주제 | 설명 | 바로가기 |
| :--- | :--- | :--- |
| **초기화 (Initialization)** | Lexical 에디터의 생성, 초기 설정 및 플러그인을 통한 기능 확장 과정을 분석합니다. | [./initialization/](./initialization/) |
| **데이터 흐름 (Data Flow)** | Lexical의 단방향 데이터 흐름과 상태 업데이트의 핵심 원리를 분석합니다. | [./data_flow/](./data_flow/) |
| **플러그인 (Plugins)** | Lexical의 플러그인 아키텍처와 핵심 상호작용 메커니즘(커맨드, 리스너)을 분석합니다. | [./plugins/](./plugins/) |
| **커맨드 시스템 (Command System)** | 플러그인 간의 상호작용 및 이벤트 처리를 담당하는 커맨드 시스템의 동작 원리를 분석합니다. | [./command_system/](./command_system/) |
| **DOM 상호작용 (DOM Interaction)** | Lexical이 제어하는 실제 DOM 요소에 이벤트 리스너를 연결하여 커스텀 상호작용을 구현하는 방법을 분석합니다. | [./dom_interaction/](./dom_interaction/) |
| **히스토리 (History)** | HistoryPlugin의 Undo/Redo 동작, 특히 연속된 입력을 하나의 단위로 묶는 Undo Coalescing의 원리를 심층 분석합니다. | [./history/](./history/) |
| **키 관리 (Key Management)** | 모든 노드를 고유하게 식별하는 NodeKey의 역할, 생명주기, 올바른 사용법 및 흔한 오용 사례를 심층 분석합니다. | [./key_management/](./key_management/) |
| **노드 시스템 (Node System)** | Lexical의 핵심 구성 요소인 노드(Node) 시스템의 고급 기능들(교체, 상태 API, 순회)을 심층적으로 분석합니다. | [./node_system/](./node_system/) |
| **선택 (Selection)** | Lexical의 Selection 시스템의 종류, 조작 API, 그리고 Focus Stealing 문제와 해결책을 심층적으로 분석합니다. | [./selection/](./selection/) |
| **직렬화 (Serialization)** | Lexical의 상태를 JSON 및 HTML 형식으로 변환(직렬화)하고, 다시 Lexical 상태로 복원(역직렬화)하는 메커니즘을 분석합니다. | [./serialization/](./serialization/) |
| **업데이트 메커니즘 (Update Mechanism)** | Lexical의 핵심 상태 객체인 EditorState의 구조부터, 업데이트 트랜잭션의 시작, 처리, 최종 DOM 반영까지의 전체 과정을 심층적으로 분석합니다. | [./update_mechanism/](./update_mechanism/) | 