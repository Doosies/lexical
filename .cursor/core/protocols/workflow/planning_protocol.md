# PLANNING Protocol (계획 프로토콜)
# version: 3.4

## Description
사용자 요청을 분석하고, `memory_bank`의 구조화된 지식(`index.yaml`)과 `brain.yaml`에 정의된 전문가 시스템을 활용하여 투명하고 안정적인 실행 계획을 수립합니다.

---

## Steps (실행 단계)

### **Step 1: 시스템 무결성 및 이전 컨텍스트 확인**
- **Action:** `Pre-flight Checklist` 완료 여부를 확인하고, `activeContext.md`의 '대기 중인 작업'을 검토합니다.
- **Rationale:** 모든 계획은 동기화된 최신 컨텍스트 위에서 수립되어야 합니다.

### **Step 2: 사용자 요청 분석 및 목표 설정**
- **Action:** 사용자의 현재 요청과 대화 맥락을 분석하여 이번 임무의 **'주요 목표(Major Goal)'**를 한 문장으로 정의합니다.
- **Rationale:** 사용자의 궁극적인 의도를 파악하여 작업의 방향성을 설정합니다.

### **Step 3: 구조화된 지식 탐색 (Index-First Approach)**
- **Action:**
    1.  `memory_bank` 내의 각 디렉토리에 있는 `index.yaml` 파일을 먼저 `read_file`로 읽어, 요청과 관련된 파일이 있는지 체계적으로 확인합니다.
    2.  `index.yaml`에 명시된 핵심 문서(`systemPatterns.md`, `techContext.md` 등)를 우선적으로 검토합니다.
    3.  필요시 `codebase_search`를 보조적으로 사용하여 추가 정보를 탐색합니다.
- **Rationale:** 비구조적인 전체 검색에 앞서, 구조화된 목차(`index.yaml`)를 먼저 확인하여 정보 탐색의 효율성과 정확성을 극대화합니다.

### **Step 4: 작업 목록 구체화**
- **Action:** 설정된 '주요 목표'와 **탐색한 지식**을 바탕으로 구체적인 단계들을 **`⏳ 작업 내용`** 형식의 리스트로 작성합니다. 이것이 `activeContext.md`에 기록될 **'작업 목록(Todo List)'**이 됩니다.
- **Rationale:** 추상적인 목표를 구체적인 실행 단위로 분해하여 계획의 투명성과 실행 가능성을 높입니다.

### **Step 5: 전문가 개입 예측 (Tool-based Trigger)**
- **Action:**
    1.  `[TOOL: read_file]`을 사용하여 `brain.yaml`의 `expert_triggers` 섹션을 읽어옵니다.
    2.  수립된 '작업 목록'에 포함된 도구 실행(e.g., `write`, `search_replace`)이, `acting` 단계에서 `tool.name` 또는 `tool.parameters` 기반의 전문가 트리거를 발동시킬지 **예측**합니다.
    3.  전문가 개입이 예측되는 경우, `🧑‍🔬` 아이콘과 함께 해당 내용을 계획에 명시적으로 포함시키거나 사용자에게 미리 알립니다.
- **Rationale:** [ARCHITECT] 이 단계는 '설계자'의 관점에서, '문지기'가 확인한 `user.input` 기반 트리거가 아닌, 실제 작업 실행으로 인해 발생할 후속 전문가 개입을 '예측'하고 계획에 반영하기 위한 것입니다.

### **Step 6: 계획 공유 및 승인 요청**
- **Action:**
    1.  **[TOOL: write]** 를 사용하여, 최종 확정된 **'주요 목표'**와 **'작업 목록'**을 `activeContext.md` 파일에 먼저 기록합니다.
    2.  `activeContext.md`에 기록된 계획을 사용자에게 보여주며 실행 승인을 요청합니다.
- **Rationale:** AI의 생각과 행동을 일치시켜 투명성을 확보하고, 모든 작업은 사용자의 명시적인 동의 하에 수행되도록 보장합니다.
