# ACTING Protocol (실행 프로토콜)
# version: 4.6

## Description
`activeContext.md`의 '작업 목록'을 중심으로, 승인된 계획을 실행하고 진행 상황을 투명하게 기록하며 임무를 완수합니다. 이 프로토콜은 작업의 투명성을 극대화하기 위해 이모지 기반 상태 업데이트(⏳ → 🚧 → ✅)를 따릅니다.

---

## The Acting Loop (실행 루프)

### **Step 1: 다음 작업 식별 및 루프 제어**
- **Action:** `activeContext.md`를 읽어 '작업 목록(Todo List)'에서 `⏳` (대기) 상태인 첫 번째 작업을 식별합니다.
- **Branch:**
    - **If (남은 작업이 있다면):** [Step 2]로 진행합니다.
    - **If (모든 작업이 `✅`로 완료되었다면):** [Step 8]로 이동하여 루프를 종료하고 임무 완료 절차를 시작합니다.

### **Step 2: 작업 진행 상태로 변경 (Mark as DOING)**
- **Action:** 식별된 작업 항목의 맨 앞에 있는 `⏳` 이모지를 `🚧` (진행중)으로 변경하여 `activeContext.md`를 즉시 업데이트합니다.
- **Communication Rule:** 내부 상태 관리이므로 별도 보고하지 않습니다.

### **Step 3: 실제 작업 실행 (Execute Task)**
- **Action:** 식별된 단일 작업을 실행합니다. (`read_file`, `write` 등)

### **Step 4: 실행 결과 분석 및 예외 처리 (매우 중요)**
- **Action:** 작업 실행 결과를 분석합니다.
- **Branch:**
    - **If (실행 성공):** [Step 5]로 진행합니다.
    - **If (실행 실패 또는 예기치 않은 결과):** 즉시 루프를 중단하고, `🧑‍🔬` 아이콘과 함께 오류의 성격에 가장 적합한 전문가(기본값: `critical_reviewer.yaml`)를 호출하여 사용자에게 상황을 보고하고 해결책을 제안합니다.
- **Rationale:** 실시간 오류에 대응하기 위한 핵심 안전장치입니다.

### **Step 5: 전문가 트리거 확인 (매우 중요)**
- **Action:**
    1. `[TOOL: read_file]`을 사용하여 `brain.yaml`의 `expert_triggers` 섹션을 읽어옵니다.
    2. 방금 완료한 작업이 `expert_triggers`의 조건과 일치하는지 검사합니다.
    3. 조건이 일치하면, `🧑‍🔬` 아이콘과 함께 해당 전문가를 즉시 호출하여 후속 조치를 실행합니다.
- **Rationale:** [SUPERVISOR] 실행 루프 내에서 발생하는 트리거를 실시간으로 감지하여 시스템 규칙의 일관성을 보장합니다.

### **Step 6: 작업 완료 상태로 변경 (Mark as DONE)**
- **Action:** 실행이 완료된 작업 항목의 `🚧` 이모지를 `✅` (완료)로 변경하고, '최근 활동'과 '다음 단계' 필드를 갱신하여 `activeContext.md`를 즉시 업데이트합니다.
- **Communication Rule:** 내부 상태 관리이므로 별도 보고하지 않습니다.

### **Step 7: 루프 계속 (Continue Loop)**
- **Action:** 다시 [Step 1]로 돌아가 다음 작업을 처리합니다.

---

## Mission Completion (임무 완료)

### **Step 8: 완료된 마일스톤 기록**
- **Trigger:** 실행 루프의 모든 '작업 목록'이 완료되었을 때 실행됩니다.
- **Action:** `activeContext.md`의 '주요 목표'를 요약하여 `progress.md`에 기록합니다.
- **Communication Rule:** `progress.md`는 중요한 이정표이므로, 업데이트 전후에 명시적으로 보고해야 합니다.

### **Step 9: 활성 컨텍스트 초기화**
- **Action:** `activeContext.md`를 다음 임무를 위해 초기화합니다.
- **Communication Rule:** 내부 정리 작업이므로 별도 보고하지 않습니다.

### **Step 10: 사후 비행 체크리스트 실행 및 최종 보고**
- **Action:** `post_flight_checklist.md`의 모든 단계를 수행한 후, 임무 완료 사실을 종합적으로 보고하고 다음 지시를 요청합니다.
