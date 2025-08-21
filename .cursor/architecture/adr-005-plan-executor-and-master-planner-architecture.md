---
id: adr-005
title: "PlanExecutor 및 Master Planner 아키텍처 도입"
status: "대체됨(Superseded)"
date: "2024-08-26"
deciders: ["민형", "AI"]
technical_story: "OrchestrationRouter의 역할 모호성 및 환각 문제 해결"
superseded_by: adr-006-direct-kernel-execution-architecture.md
---

## 컨텍스트 (Context)

이전 아키텍처에서는 `OrchestrationRouter`가 "다음 전문가를 지능적으로 선택"하는 역할과 "기계적으로 실행"하는 역할을 동시에 부여받았다. 이로 인해 다음과 같은 근본적인 모순과 문제가 발생했다.

-   **역할 충돌**: "지능을 가지라"는 요구와 "지능을 갖지 말라"는 제약이 공존하여, AI가 역할을 자의적으로 해석하고 환각(Hallucination)을 일으키는 원인이 되었다. (예: 존재하지 않는 `DocumentationExpert`를 호출)
-   **불안정한 동작**: AI가 더 효율적이라고 판단하면, `OrchestrationRouter`의 역할을 벗어나 직접 전문가 역할을 수행하거나, 제약 조건을 무시하는 등 예측 불가능한 행동을 보였다.
-   **복잡한 제어**: 이 문제를 해결하기 위해 `[VALIDATE_EXPERT]`, `[SELECT_EXPERT]` 규칙 강화 등 복잡한 제어 로직을 추가했지만, 이는 근본 원인을 해결하지 못하는 미봉책에 불과했다.

## 결정 (Decision)

`OrchestrationRouter`와 `PlanningExpert` 간의 모순된 역할과 책임을 명확히 분리하여, 시스템의 예측 가능성과 안정성을 확보한다.

1.  **`OrchestrationRouter`를 `plan_executor`(계획 실행기)로 변경**:

    -   **역할**: 모든 지능적 판단 능력을 완전히 제거한다.
    -   **책임**: `PlanningExpert`가 생성한 `executable_plan`(`[TOOL: ...]` 명령어 목록)을 입력받아, 기계적으로 순차 실행하는 역할만 담당한다.

2.  **`PlanningExpert`를 `Master Planner`(마스터 플래너)로 역할 격상**:
    -   **역할**: 시스템의 실질적인 지휘자 역할을 수행한다.
    -   **책임**: 사용자 요청을 분석하여, 시스템이 실행할 전문가 호출 명령어(`[TOOL: ...]`)의 전체 목록(`executable_plan`)을 직접 생성하는 모든 지능적 판단을 전담한다.

이로써 "계획(Thinking)"은 `PlanningExpert`가, "실행(Doing)"은 `plan_executor`가 전담하는, 명확한 책임 분리 원칙(SoC)을 확립한다.

## 결과 (Consequences)

### 긍정적

-   **근본적인 모순 해결**: "지능을 가지면서 동시에 갖지 말라"는 역할의 모순이 완전히 해소되어, AI의 환각 및 자의적 행동 유발 가능성을 원천적으로 차단한다.
-   **예측 가능성 증대**: 시스템의 작동 방식이 '지능적 추론'에서 '명시적 계획 실행'으로 변경되어, 동작을 예측하고 디버깅하기 용이해진다.
-   **구조 단순화**: `plan_executor`의 로직이 매우 단순해지며, 복잡했던 예외 처리나 검증 로직이 불필요해진다.

### 부정적

-   **`PlanningExpert`의 책임 증가**: 시스템의 모든 지능적 판단이 `PlanningExpert`에 집중되므로, 해당 전문가의 안정성과 정확성이 전체 시스템의 성능에 결정적인 영향을 미치게 된다.
-   **초기 계획 수립 시간**: 요청 처리 초기에 전체 실행 계획을 수립해야 하므로, 간단한 요청의 경우 이전보다 첫 응답까지의 시간이 다소 길게 느껴질 수 있다.
