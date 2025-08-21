---
id: adr-006
title: '커널 직접 실행 (Direct Kernel Execution) 아키텍처'
status: '채택됨(Accepted)'
date: '2024-08-26'
deciders: ['민형', 'AI']
technical_story: 'PlanExecutor 제거를 통한 아키텍처 간소화 및 역할 명확화'
supersedes: adr-005-plan-executor-and-master-planner-architecture.md
---

## 컨텍스트 (Context)

기존의 `PlanningExpert` -> `PlanExecutor` -> `System Kernel`로 이어지는 실행 흐름은 역할 분리를 의도했으나, `PlanExecutor`의 역할이 '단순 실행'으로 축소되면서 `System Kernel`의 '기계적 실행' 역할과 중복되는 문제가 발생했습니다.

이러한 중복은 불필요한 복잡성을 야기하고, 시스템의 전체적인 흐름을 이해하는 데 혼선을 주었습니다. `PlanExecutor`라는 중간 계층을 거치는 것이 아키텍처의 명확성을 해치고 있다고 판단되었습니다.

## 결정 (Decision)

`PlanExecutor` 전문가를 시스템에서 완전히 제거하기로 결정했습니다.

이제부터 `System Kernel`은 `PlanningExpert`로부터 `executable_plan`을 직접 수신하여, 계획에 포함된 `[TOOL: ...]` 명령어들을 직접, 순차적으로, 기계적으로 실행합니다.

새로운 실행 흐름은 다음과 같습니다.

1.  **`System Kernel`**은 사용자 요청을 **`PlanningExpert`**에게 위임합니다.
2.  **`PlanningExpert`**는 사용자 요청을 분석하여 `executable_plan` (Tool Call 명령어 목록)을 생성하여 **`System Kernel`**에게 반환합니다.
3.  **`System Kernel`**은 `executable_plan`을 받아, 루프를 돌며 각 Tool Call을 순서대로 직접 실행합니다.
4.  모든 실행이 완료되면, **`System Kernel`**은 결과를 종합하여 사용자에게 최종 보고합니다.

## 결과 (Consequences)

### 긍정적인 점

-   **아키텍처 간소화**: 중간 실행 계층이 제거되어 시스템 구조가 더 단순하고 직관적으로 변경되었습니다.
-   **역할 명확화**: `System Kernel`의 '기계적 실행' 역할이 더욱 명확해졌으며, `PlanningExpert`는 '계획 수립'이라는 핵심 책임에만 집중할 수 있게 되었습니다.
-   **유지보수성 향상**: 코드의 흐름을 추적하기 쉬워져 디버깅 및 향후 기능 확장이 용이해졌습니다.

### 부정적인 점

-   `System Kernel`의 책임이 소폭 증가했지만, '기계적 실행'이라는 원래의 역할 정의에 부합하므로 허용 가능한 수준입니다.

### 트레이드오프

-   실행 로직의 유연성이 다소 감소할 수 있으나, 현재 시스템의 목표인 '예측 가능하고 안정적인 기계적 실행'을 위해서는 명확성이 더 중요하다고 판단했습니다.
