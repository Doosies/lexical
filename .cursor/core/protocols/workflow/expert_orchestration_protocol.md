# 전문가 오케스트레이션 프로토콜 (Expert Orchestration Protocol)

## 1. 개요 (Overview)
이 문서는 Cursor 시스템 내의 모든 AI 전문가들이 원활하고 예측 가능하게 협업하기 위해 반드시 준수해야 할 핵심 규칙과 절차를 정의합니다. 모든 전문가는 독립적으로 동작하는 것이 아니라, 이 프로토콜에 따라 오케스트레이션 계획의 일부로서 기능합니다.

---

## 2. 데이터 전달 표준 (Data Transfer Standard)

### 2.1. 표준 래퍼 객체 (Standard Wrapper Object)
- 모든 전문가의 출력(Output)은 반드시 아래 구조를 따르는 JSON 객체여야 합니다. 이는 전문가 간 데이터 전달의 일관성을 보장하기 위함입니다.
- **구조:**
  ```json
  {
    "status": "success" | "failure",
    "data": { /* 실제 결과 데이터 */ },
    "error_message": "실패 시, 원인에 대한 상세 설명"
  }
  ```

### 2.2. 데이터 파이프라이닝 (Data Pipelining)
- `ORCHESTRATION_EXECUTION` 상태에서 Cursor는 이전 단계 전문가가 출력한 `data` 객체를 다음 단계 전문가의 입력(Input)으로 전달할 책임이 있습니다.

---

## 3. 오류 처리 절차 (Error Handling Procedure)

### 3.1. 실패 보고 (Failure Reporting)
- 전문가가 자신의 임무 수행에 실패할 경우, 즉시 `status: "failure"`와 상세한 `error_message`를 포함한 표준 래퍼 객체를 반환해야 합니다. 절대 임의로 오류를 무시하거나 자체적으로 복구를 시도해서는 안 됩니다.

### 3.2. `FAILED` 상태 전환 및 전문가 호출
- Cursor는 전문가로부터 `status: "failure"`를 수신하는 즉시 `cognitive_workflow`를 `FAILED` 상태로 전환해야 합니다.
- `FAILED` 상태가 활성화되면, Cursor는 반드시 `ErrorHandlingExpert`를 호출하고, 실패한 전문가의 이름, 입력값, 반환된 오류 메시지 등 모든 관련 컨텍스트를 전달해야 합니다.

---

## 4. 작업 흐름 제어 (Workflow Control)

### 4.1. 순차적 실행 원칙 (Sequential Execution Principle)
- `PlanningExpert`가 생성한 오케스트레이션 계획의 각 단계(Step)는 반드시 순서대로 실행되어야 합니다.
- 이전 단계의 `status`가 `success`가 아닐 경우, 다음 단계는 실행될 수 없습니다.

### 4.2. 사용자 중단 권한 (User Interruption Authority)
- 사용자는 `ORCHESTRATION_EXECUTION` 상태의 어떤 단계에서든 "중단", "취소", "재계획" 등의 명령을 통해 현재 작업을 중단시킬 수 있습니다.
- 이 경우, Cursor는 즉시 현재 전문가의 실행을 중단하고 `ORCHESTRATION_PLANNING` 상태로 복귀하여 재계획 절차를 시작해야 합니다.

---

## 5. 시스템 무결성 보호 절차 (System Integrity Protection Procedure)

### 5.1. 핵심 파일 수정 감지
- `PlanningExpert`는 계획 수립 시, 수정 대상 경로가 `/.cursor/core/` 내에 포함되는지 반드시 검증해야 합니다.
- 만약 핵심 파일 수정이 계획에 포함된다면, 해당 계획 단계에 `requires_special_approval: true` 플래그를 명시해야 합니다.

### 5.2. `PromptExpert`의 특별 경고 및 이중 확인
- `ORCHESTRATION_PLANNING` 상태에서 계획을 사용자에게 제시하기 전, Cursor는 `PromptExpert`를 호출하여 계획에 `requires_special_approval` 플래그가 있는지 확인해야 합니다.
- 플래그가 존재할 경우, `PromptExpert`는 시스템에 미칠 수 있는 잠재적 위험을 명시한 강력한 경고 메시지를 생성해야 하며, 사용자의 명시적인 이중 확인(e.g., "위험을 인지하고 수정을 승인합니다.") 없이는 계획이 승인될 수 없습니다.
