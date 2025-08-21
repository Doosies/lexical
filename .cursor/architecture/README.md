# 아키텍처 결정 기록 (Architecture Decision Records)

**폴더 목적 (Purpose):** 이 폴더는 AI 시스템의 핵심 아키텍처 결정 사항(ADR)을 기록하고 관리합니다. 각 문서는 특정 기술적 문제에 대한 결정 과정과 그 결과를 명시합니다.

---

## 문서 목록 (Documents)

| 파일 경로 (Path)                                                                                                             | 요약 (Summary)                                                                                                                                                 |
| :--------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`./adr-001-adaptive-orchestration-model.md`](./adr-001-adaptive-orchestration-model.md)                                     | 시스템이 동적인 상황에 대응하고, 실행 계획을 유연하게 조정할 수 있도록 하는 "적응형 오케스트레이션 모델"을 정의합니다.                                         |
| [`./adr-002-executable-prompt-architecture.md`](./adr-002-executable-prompt-architecture.md)                                 | 모든 전문가의 역할과 능력을 YAML 형식의 "실행 가능한 프롬프트"로 정의하여, 시스템이 자신의 능력을 동적으로 로드하고 실행할 수 있게 하는 아키텍처를 설명합니다. |
| [`./adr-003-executable-prompt-architecture.md`](./adr-003-executable-prompt-architecture.md)                                 | ADR-002를 보완하여, 실행 가능한 프롬프트의 구체적인 스키마와 전문가 간의 협업 프로토콜을 정의합니다.                                                           |
| [`./adr-004-orchestration-router-and-kernel-responsibility.md`](./adr-004-orchestration-router-and-kernel-responsibility.md) | `OrchestrationRouter` 도입 및 커널 책임주의 원칙을 명시하는 아키텍처 변경을 기록합니다. (adr-005에 의해 대체됨)                                                |
| [`./adr-005-plan-executor-and-master-planner-architecture.md`](./adr-005-plan-executor-and-master-planner-architecture.md)   | PlanExecutor와 Master Planner 역할을 도입하여 OrchestrationRouter의 모호성을 해결하려던 시도. (adr-006에 의해 대체됨)                                          |
| [`./adr-006-direct-kernel-execution-architecture.md`](./adr-006-direct-kernel-execution-architecture.md)                     | PlanExecutor를 제거하고 System Kernel이 직접 계획을 실행하도록 아키텍처를 간소화하여 명확성을 높임. (현재 아키텍처)                                            |
| `README.md`                                                                                                                  | 이 디렉토리의 목적과 ADR 목록을 설명합니다.                                                                                                                    |

---

_이 문서는 `.cursor/architecture/index.yaml` 파일의 내용을 바탕으로 AI에 의해 자동으로 생성 및 업데이트됩니다._
