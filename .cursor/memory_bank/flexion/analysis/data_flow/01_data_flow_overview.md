# 심층 분석: 데이터 흐름과 상태 업데이트

**문서 상태**: `v1.2` (상세 분석 문서 분리에 따른 리팩터링)

**주제**: Lexical의 단방향 데이터 흐름(Unidirectional Data Flow)이 `OnChangePlugin`과 `editor.registerUpdateListener`를 통해 어떻게 구현되는지, 그 핵심 원리를 분석합니다.

이 문서는 Lexical이 React의 핵심 원칙인 단방향 데이터 흐름을 어떻게 채택하여, 예측 가능하고 안정적인 상태 관리를 구현하는지 설명합니다.

---

## 1. 단방향 데이터 흐름의 원칙

Lexical의 모든 상태 변경은 다음과 같은 예측 가능한 단방향 흐름을 따릅니다.

1.  **시작점 (Input)**: 사용자 입력이나 [`dispatchCommand`](../command_system/01_command_system_overview.md)와 같은 명시적인 API 호출로 업데이트가 시작됩니다.
2.  **상태 변경 (State Mutation)**: `editor.update()` 내부에서 새로운 [`EditorState`](../update_mechanism/01_editor_state.md) 불변 객체가 생성됩니다.
3.  **렌더링 (Rendering)**: Lexical의 조정자(Reconciler)가 이전 `EditorState`와 새로운 `EditorState`를 비교하여, 변경이 필요한 최소한의 부분만 실제 DOM에 반영합니다.
4.  **전파 (Propagation)**: 모든 변경이 완료된 후, `registerUpdateListener`와 같은 리스너들을 통해 상태 변경 사실이 외부(e.g., React 컴포넌트)로 전파됩니다.

```mermaid
graph TD
    classDef event fill:#8E44AD,stroke:#6C3483,color:#fff;
    classDef core fill:#2E6E9E,stroke:#1C4E7A,color:#fff;
    classDef external fill:#16A085,stroke:#117A65,color:#fff;

    subgraph "입력 계층"
        A[사용자 입력 /<br/>`editor.dispatchCommand()`]:::event
    end

    subgraph "Lexical 코어"
        B["`editor.update()` 실행"]:::core
        C["새로운 `EditorState` 생성<br/>(불변 객체)"]:::core
        D["Reconciliation<br/>(DOM 변경 사항 계산 및 적용)"]:::core
        E["다양한 리스너들에게<br/>상태 변경 전파"]:::core
    end

    subgraph "외부 애플리케이션 (React 등)"
        F["`updateListener` 호출<br/>(e.g., OnChangePlugin)"]:::external
    end
    
    A --> B --> C --> D --> E --> F
```

---

## 2. 핵심 브릿지: `OnChangePlugin`과 `registerUpdateListener`

-   **`registerUpdateListener`**: DOM에 모든 변경 사항이 반영된 **후**에 실행되는 콜백을 등록하는 가장 기본적인 메커니즘입니다.
-   **[`OnChangePlugin`](../plugins/01_plugin_architecture_overview.md)**: `@lexical/react`에서 제공하는 이 플러그인은, 내부적으로 `registerUpdateListener`를 사용하여 Lexical의 내부 상태 변경을 외부 React 환경으로 전파하는 핵심적인 '다리' 역할을 수행합니다.

이 메커니즘을 통해 Lexical의 내부 상태와 외부 UI가 항상 동기화될 수 있습니다.

---

## 3. 심층 분석으로 연결

Lexical의 업데이트 흐름 각 단계는 매우 정교하게 설계되어 있습니다. 각 단계의 상세한 내부 동작 원리는 아래의 전문 분석 문서들을 참고하세요.

-   **업데이트의 시작**: [**EditorState 심층 분석**](../update_mechanism/01_editor_state.md)
-   **상태 변경의 핵심 로직**: [**`beginUpdate` 트랜잭션 심층 분석**](../update_mechanism/03_begin_update_transaction.md)
-   **Node Transform의 역할**: [**`beginUpdate` 트랜잭션 심층 분석**](../update_mechanism/03_begin_update_transaction.md#2-단계-상태-안정화-stabilization)
-   **DOM 렌더링**: [**최종 커밋 및 DOM 반영 심층 분석**](../update_mechanism/04_commit_pending_updates.md)
-   **리스너 종류 및 실행 순서**: [**업데이트 흐름 및 진입점 분석**](../update_mechanism/02_update_flow_and_entrypoints.md#12-콜백-실행-순서)
