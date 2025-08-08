# ADR-002: 실행 가능한 프롬프트 아키텍처 (v3)

**상태**: 활성 (Active)
**날짜**: 2025-08-11
**관련 ADR**: [ADR-001](./adr-001-adaptive-orchestration-model.md) (개념적 기반)

## 1. 컨텍스트 (Context)

[ADR-001](./adr-001-adaptive-orchestration-model.md)에서 정의된 '적응형 오케스트레이션' 아키텍처를, LLM이 직접 해석하고 실행할 수 있는 구체적인 '프롬프트 아키텍처'로 변환한다. 이 문서는 v2에서 더 나아가, 시스템의 회복탄력성을 강화하기 위해 실패 상태의 컨텍스트를 기록하는 규칙을 포함한다.

## 2. 결정 (Decision)

아키텍처의 모든 구성요소를 '실행 규칙', '입출력 스키마', '판단 조건' 중심으로 재정의한다. LLM은 이 문서에 정의된 규칙을 최우선으로 따라야 하며, `brain.yaml` 및 전문가 시스템을 생성/수정할 때 반드시 이 규격을 준수해야 한다.

## 3. 실행 가능한 아키텍처 설계

### 3.1. 텍스트 기반 실행 흐름 (Text-based Execution Flow)

_Mermaid 다이어그램과 1:1로 대응되는 텍스트 기반 흐름도. LLM은 이 순차적 흐름을 우선적으로 인지한다._

1.  **`User Request`** -> **`System Kernel`**
2.  **`System Kernel`** -> **`OrchestrationEngine`** (업무 위임)
3.  **`OrchestrationEngine`** -> **`PlanningExpert`** (초기 계획 요청)
4.  **`PlanningExpert`** -> `OrchestrationEngine` (계획 초안 반환)
5.  **`OrchestrationEngine`** -> **`TaskManagementExpert`** (계획 등록 및 승인 요청)
6.  **`TaskManagementExpert`** -> `OrchestrationEngine` (승인된 마스터플랜 반환)
7.  **`OrchestrationEngine`** -> **`SpecializedExpert`** (작업 실행 요청)
8.  **`SpecializedExpert`** -> `OrchestrationEngine` (결과 또는 **`Sub-Plan`** 제출)
9.  **(IF Sub-Plan) `OrchestrationEngine`** -> **`TaskManagementExpert`** (계획 병합 요청)
10. **(IF Sub-Plan) `TaskManagementExpert`** -> `OrchestrationEngine` (진화된 마스터플랜 반환)
11. **`OrchestrationEngine`** -> **`TaskManagementExpert`** (상태 업데이트 요청)
12. **`TaskManagementExpert`** -> `OrchestrationEngine` (업데이트 확인)
13. _Loop to 7 until Master Plan is complete_
14. **`OrchestrationEngine`** -> **`ResultSynthesizingExpert`** (최종 보고서 요청)
15. **`ResultSynthesizingExpert`** -> `OrchestrationEngine` (최종 보고서 반환)
16. **`OrchestrationEngine`** -> `System Kernel` (최종 결과 전달)
17. **`System Kernel`** -> **`User Response`**

### 3.2. 계층별 역할 및 입출력 규격 (Tier-specific Roles & I/O Contracts)

#### **Tier 1: System Kernel**

-   **역할 (명령형)**:
    1.  **파일 시스템 총괄 책임자**: 시스템의 핵심 메타데이터 파일(`kernel_status.json`, `brain.yaml`, `experts/index.yaml`)의 읽기/쓰기를 독점적으로 책임진다.
    2.  **상태 관리자**: `BOOTING`, `RUNNING`, `FAILED` 상태를 독점적으로 관리하며, `FAILED` 상태가 될 경우 **실패의 맥락(마지막 작업 ID, 오류 원인)을 포함하여** `kernel_status.json`에 즉시 기록한다.
    3.  **요청 위임자**: `RUNNING` 상태일 때, 사용자 요청을 `OrchestrationEngine`에게 `KernelToEngineRequest` 스키마에 따라 전달한다.
    4.  **최종 응답자**: `OrchestrationEngine`으로부터 `EngineToKernelResponse` 스키마에 따른 최종 결과를 수신하여 사용자에게 반환한다.
-   **입출력 스키마 정의**:

    ```typescript
    // Type Definition
    type KernelToEngineRequest = {
    	request_id: string; // UUID for this request
    	user_request: string; // Original user request
    };

    type EngineToKernelResponse = {
    	request_id: string;
    	status: 'completed' | 'failed';
    	final_report?: string; // Markdown string on success
    	error_details?: string; // Error information on failure
    	last_task_id?: string; // ID of the last task that failed
    };
    ```

#### **Tier 2: OrchestrationEngineExpert**

-   **역할 (명령형)**:
    1.  **요청 생명주기 관리**: 커널로부터 받은 요청을 처리하는 전 과정을 총괄한다.
    2.  **동적 컨텍스트 로딩**: 전문가 호출 직전, **반드시 해당 전문가의 YAML 파일을 읽어** 역할과 책임을 컨텍스트에 로드한 후, 작업을 위임한다.
    3.  **적응형 계획 통합**: 전문가가 제출한 `Sub-Plan`을 `TaskManagementExpert`를 통해 마스터플랜에 병합시킨다.
-   **입력 (Input)**: `KernelToEngineRequest`
-   **출력 (Output)**: `EngineToKernelResponse`

#### **Tier 3: Specialized Experts**

-   **Adaptive Planning 규칙 (구체화)**:

    ```typescript
    // Pseudo-code for expert's internal logic
    function is_task_too_complex(task: Task): boolean {
    	// LLM은 아래의 명시적 조건에 따라 복잡성을 판단한다.
    	return (
    		task.estimated_steps > 3 || // 예상 단계가 3개를 초과하는가?
    		task.requires_external_data || // 외부 데이터 조회가 필요한가?
    		task.dependencies.length > 0 // 다른 작업에 대한 의존성이 있는가?
    	);
    }

    function execute(task: Task): ExpertOutput {
    	if (is_task_too_complex(task)) {
    		const sub_plan = generate_sub_plan(task);
    		return { status: 'needs_sub_plan', plan: sub_plan };
    	} else {
    		const result = perform_simple_action(task);
    		return { status: 'completed', result: result };
    	}
    }
    ```

-   **입출력 스키마 정의**:

    ```typescript
    // Type Definition
    type EngineToExpertRequest = {
    	task_id: string;
    	task_description: string;
    	context?: object;
    };

    type ExpertOutput = {
    	task_id: string;
    	status: 'completed' | 'needs_sub_plan' | 'failed';
    	result?: any; // Result data if completed
    	plan?: TodoItem[]; // Sub-plan if needs_sub_plan
    	error_details?: string; // Error info if failed
    };
    ```

### 3.3. 결과 검증 및 오류 처리 절차 (Validation & Error Handling Protocol)

_LLM은 모든 주요 단계 완료 후, 아래의 체크리스트를 기반으로 자체 검증을 수행하고, 실패 시 명시된 절차를 따라야 한다._

1.  **계획 검증 (`PlanningExpert` -> `OrchestrationEngine`)**:

    -   [ ] 모든 `todo_list` 항목에 고유한 `id`가 부여되었는가?
    -   [ ] 첫 번째 작업의 상태가 `in_progress`인가?
    -   **실패 시 조치**: `log_error()`. `status="failed"`로 `OrchestrationEngine`에 보고. 엔진은 재계획을 위해 `PlanningExpert` 재호출 시도.

2.  **상태 업데이트 검증 (`OrchestrationEngine` -> `TaskManagementExpert`)**:

    -   [ ] `activeContext.md`의 내용이 실제 `todo_list` 상태와 일치하는가?
    -   **실패 시 조치**: `log_error()`. `attempt_fix()` (동기화를 위해 `TaskManagementExpert` 재호출, 최대 2회). 2회 실패 시 `status="failed"`로 `OrchestrationEngine`에 보고, 엔진은 `FAILED` 상태로 커널에 보고.

3.  **최종 결과 검증 (`ResultSynthesizingExpert` -> `OrchestrationEngine`)**:
    -   [ ] 모든 작업이 `completed` 상태인가?
    -   [ ] 최종 보고서가 사용자의 초기 요청에 대한 답변을 포함하는가?
    -   **실패 시 조치**: `log_error()`. `status="failed"`로 `OrchestrationEngine`에 보고. 엔진은 원인 분석 후 `ResultSynthesizingExpert` 재호출 또는 `FAILED` 상태로 커널에 보고.

---

### 4. LLM 실행 규칙 요약 (LLM Execution Cheatsheet)

**[SYSTEM-CRITICAL] 당신(LLM)이 따라야 할 최상위 실행 규칙이다.**

1.  **`Kernel`의 역할**:
    -   사용자 요청을 받으면, `KernelToEngineRequest` JSON으로 감싸 `OrchestrationEngine`에 **위임**한다.
    -   `brain.yaml`, `experts/index.yaml` 등 핵심 파일의 **읽기/쓰기**는 오직 `Kernel`의 책임이다.
2.  **`OrchestrationEngine`의 역할**:
    -   `PlanningExpert`를 호출해 **초기 계획**을 수립한다.
    -   `TaskManagementExpert`를 통해 계획을 **등록/관리**한다.
    -   `SpecializedExpert`를 호출하기 직전, 반드시 해당 **전문가의 YAML 파일을 읽어 컨텍스트에 주입**한다.
    -   전문가가 `Sub-Plan`을 제출하면 `TaskManagementExpert`를 통해 기존 계획에 **통합**한다.
3.  **`SpecializedExpert`의 역할**:
    -   `is_task_too_complex` 함수의 **구체적인 조건**에 따라, 작업을 직접 처리할지 `Sub-Plan`을 생성할지 판단한다.
4.  **종료 절차**:
    -   모든 작업이 완료되면, `ResultSynthesizingExpert`가 **최종 보고서**를 작성한다.
    -   `OrchestrationEngine`은 이 보고서를 `EngineToKernelResponse` JSON에 담아 `Kernel`에 **반환**한다.

---

## 5. 결론

이 문서는 단순한 아키텍처 설명서를 넘어, LLM이 시스템을 안정적으로 구축하고 운영하기 위한 **실행 가능한 규칙의 집합(Executable Rulebook)** 이다. 모든 컴포넌트 개발 및 수정은 이 문서의 규격과 규칙을 따라야 한다.
