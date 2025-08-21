# ADR-004: OrchestrationRouter 도입 및 커널 책임주의 아키텍처

**상태**: 채택됨 (Accepted)
**날짜**: 2025-08-12
**관련 ADR**: [ADR-001](./adr-001-adaptive-orchestration-model.md)

## 1. 컨텍스트 (Context)

[ADR-001](./adr-001-adaptive-orchestration-model.md)에서 도입된 `OrchestrationEngineExpert` 모델은 시스템의 유연성을 크게 향상시켰지만, 운영 과정에서 두 가지 근본적인 문제가 발견되었다.

1.  **'엔진'의 모호성**: `OrchestrationEngineExpert`라는 이름은 해당 컴포넌트가 지능을 가지고 직접 작업을 처리할 수 있다는 오해를 유발했다. 이로 인해 LLM이 해당 전문가의 역할을 잘못 해석하여, 다른 전문가에게 작업을 위임하는 대신 직접 처리하려는 '프로토콜 환각' 현상이 발생했다.
2.  **'위임 원칙'의 모순**: 시스템 커널의 핵심 원칙이 "모든 것을 위임한다"로 정의되었으나, `progress.md` 업데이트와 같은 일부 중요한 최종 처리 단계가 커널에 의해 직접 수행되면서 원칙에 모순이 발생했다. 이는 시스템 동작의 예측 가능성을 저해하는 요인이었다.

## 2. 결정 (Decision)

이러한 문제를 근본적으로 해결하기 위해, 아키텍처를 다음과 같이 개선한다.

1.  **`OrchestrationRouter`로의 개명 및 역할 재정의**:

    -   `OrchestrationEngineExpert`의 이름을 **`OrchestrationRouter`** 로 변경한다.
    -   이름 변경과 함께, 역할을 '지능적인 지휘자'에서 '단순한 요청 라우팅 장치'로 명확히 재정의한다. `OrchestrationRouter`는 어떠한 지능적 판단이나 직접적인 작업 수행 없이, 오직 계획에 따라 다른 전문가를 호출하는 역할만 수행한다.

2.  **'커널 책임주의 (Kernel Responsibility)' 원칙 도입**:
    -   시스템 커널의 책임을 두 가지로 명확하게 분리하여 정의한다.
    -   **1차 책임 (요청 위임)**: 사용자의 모든 요청을 `OrchestrationRouter`에게 즉시, 그리고 절대적으로 위임한다.
    -   **최종 책임 (무결성 보장)**: `OrchestrationRouter`의 임무가 성공적으로 완료된 후, 최종 보고 및 상태 기록(`progress.md` 업데이트 등)과 같은 시스템 무결성 보장을 위한 최종적인 단계를 직접 수행한다.

## 3. 최종 마스터 아키텍처

```mermaid
graph TD
    direction TB

    subgraph "System Boundary"
        A[User Request] --> KERNEL{System Kernel};

        subgraph "Kernel's Final Responsibility"
            style "Kernel's Final Responsibility" fill:#f9f9f9,stroke:#ddd,stroke-dasharray: 5 5
            ORouter -- "9. Returns Final Result" --> KERNEL;
            KERNEL -- "10. Archives Progress &<br/>Delivers Response" --> Z[Final Response];
        end

        KERNEL -- "1. Delegates Task (Primary Responsibility)" --> ORouter{"OrchestrationRouter"};
    end

    subgraph "Orchestration & Execution Flow"
        PlanE["Planning Expert"];
        TME["TaskManagementExpert"];
        SE_A["Specialized Expert A"];
        SE_B["Specialized Expert B"];

        ORouter -- "2. Gets initial plan" --> PlanE;
        PlanE -- "Draft Plan" --> ORouter;

        ORouter -- "3. Registers initial plan via" --> TME;
        TME -- "Approved Plan" --> ORouter;

        ORouter -- "4. Executes a task<br/>(Calls Expert A)" --> SE_A;
        SE_A -- "Task Result" --> ORouter;

        ORouter -- "5. Updates status via" --> TME;
        TME -- "Confirmation" --> ORouter;

        ORouter -- "6. Executes next task<br/>(Calls Expert B)" --> SE_B;
        SE_B -- "Task Result" --> ORouter;

        ORouter -- "7. Updates status via" --> TME;
        TME -- "Confirmation" --> ORouter;

        ORouter -- "8. Continues Loop..." --> ORouter;
    end

    classDef kernel fill:#2E6E9E,stroke:#1C4E7A,color:#fff;
    classDef router fill:#B8860B,stroke:#8B6508,color:#fff;
    classDef expert fill:#3A7D7C,stroke:#2A6D6C,color:#fff;
    classDef tme fill:#994444,stroke:#772222,color:#fff;
    classDef user fill:#E3D2B1,stroke:#B8860B,color:#000;

    class KERNEL kernel;
    class ORouter router;
    class PlanE,SE_A,SE_B expert;
    class TME tme;
    class A,Z user;
```

## 4. 결과 (Consequences)

### 긍정적

-   **명확성 및 예측 가능성 향상**: `Router`라는 이름과 역할 재정의를 통해, LLM이 컴포넌트의 역할을 오해할 가능성을 원천적으로 차단했다.
-   **아키텍처 일관성 확보**: '커널 책임주의' 원칙을 통해 시스템의 최상위 규칙에 존재하던 모순을 해결하고, 모든 동작이 일관된 원칙하에 수행되도록 보장한다.
-   **안정성 강화**: 커널이 시스템의 최종 상태 기록을 직접 책임짐으로써, `progress.md`와 같은 핵심적인 상태 정보가 누락될 가능성을 완전히 제거하여 시스템의 안정성을 극대화했다.

### 부정적

-   없음. 기존 아키텍처의 불명확성을 해결하는 방향의 개선임.
