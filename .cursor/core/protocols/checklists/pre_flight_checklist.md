# Pre-flight Checklist (사전 비행 체크리스트)
# version: 2.0

**목표:** AI가 사용자의 요청에 대해 본격적인 사고(PLANNING, ACTING)를 시작하기 전, 완전하고 최신인 정보 위에서만 작동하도록 보장하고, 필요시 전문가가 먼저 개입하도록 합니다.

---

## [MANDATORY] 1. 전체 컨텍스트 동기화 (Full Context Synchronization)

**Goal:** 어떠한 판단이나 행동을 하기에 앞서, 반드시 프로젝트의 목표, 기술, 상태, 진행 상황을 정의하는 모든 핵심 정보를 완벽하게 숙지해야 합니다.

- [ ] **Action 1.1:** `[TOOL: read_file]`을 사용하여 다음 핵심 컨텍스트 파일들의 **전체 내용**을 지정된 순서대로 읽고 단기 기억에 로드합니다:
    - 1. `{{configuration.system_files.project_context_path}}/projectbrief.md`
    - 2. `{{configuration.system_files.project_context_path}}/productContext.md`
    - 3. `{{configuration.system_files.project_context_path}}/systemPatterns.md`
    - 4. `{{configuration.system_files.project_context_path}}/techContext.md`
    - 5. `{{configuration.system_files.active_context_file}}`
    - 6. `{{configuration.system_files.progress_file}}`
    - 7. `{{configuration.system_files.user_profile_file}}` (사용자 프로필)

---

## [MANDATORY] 2. 진행중인 작업 연속성 확인 (Ongoing Task Continuity Check)

**Goal:** 사용자의 모호한 연속성 명령어(예: "계속해")에 대해, AI가 기존 작업을 자의적으로 이어서 실행하지 않고 명시적인 사용자 의도를 재확인하여 계획의 무결성을 보장합니다.

- [ ] **Action 2.1:** `activeContext.md` 파일의 `작업 목록 (Todo List)`을 확인하여 `✅` 상태가 아닌 작업(즉, `⏳` 또는 `🚧` 상태)이 하나라도 있는지 검사합니다.
- [ ] **Action 2.2 (작업 연속성 질의):**
    - **Trigger:** 만약 Action 2.1에서 `✅`가 아닌 작업이 **발견된 경우**에만 실행됩니다.
    - **Action:**
        1.  일반 워크플로우를 **일시 중단**합니다.
        2.  `activeContext.md`의 "주요 목표"를 인용하여, 사용자에게 다음과 같이 질문합니다:
            > "현재 '{{activeContext.주요 목표}}' 작업을 진행 중입니다. 이어서 진행할까요, 아니면 현재 요청에 따라 새로운 계획을 세울까요?"
        3.  사용자의 답변에 따라 다음 상태를 결정합니다. (계속 진행 시 `ACTING`, 새로운 계획 시 `PLANNING`)

---

## [MANDATORY] 3. 기억 시스템 참조 (Memory System Consultation)

**Goal:** 새로운 작업을 시작하기 전, 과거의 관련 경험(성공, 실패)을 먼저 참조하여 더 나은 의사결정을 내립니다.

- [ ] **Action 3.1 (관련 경험 검색):**
    - 사용자의 가장 마지막 요청에서 핵심 키워드(예: `storybook`, `dependency`, `refactor`)를 추출합니다.
    - `[TOOL: codebase_search]`를 사용하여 해당 키워드로 `{{configuration.system_files.short_term_memory_path}}`와 `{{configuration.system_files.troubleshooting_path}}` 두 디렉토리에서 관련성 높은 로그 파일을 검색합니다.
- [ ] **Action 3.2 (경험 학습 및 보고):**
    - **Trigger:** 만약 Action 3.1의 검색 결과, 참고할 만한 로그가 **발견된 경우**에만 실행.
    - **Action:**
        - `[TOOL: read_file]`을 사용하여 해당 로그 파일의 내용을 컨텍스트에 로드합니다.
        - PLANNING 단계에서 계획을 수립할 때, 이 과거 경험을 최우선으로 고려하여 동일한 실수를 반복하지 않거나, 더 효율적인 방법을 제안합니다. (예: "과거 실패 로그를 보니, OOO 방식으로 시도했을 때 문제가 있었습니다. 이번에는 XXX 방식으로 진행하는 것이 안전하겠습니다.")
- [ ] **Action 3.3 (관련 경험 부재 보고):**
    - **Trigger:** 만약 Action 3.1의 검색 결과, 참고할 만한 로그가 **발견되지 않은 경우**에만 실행.
    - **Action:** PLANNING 단계에서 계획을 보고할 때, **"과거 기록(단기 기억, 실패 회고록)을 확인했으나, 이번 작업과 직접적으로 관련된 유의미한 정보는 발견되지 않았습니다."** 라는 문구를 명시적으로 포함하여 보고합니다.

---

## [MANDATORY] 4. 전문가 선제 개입 확인 (Proactive Expert Intervention Check)

**Goal:** 일반적인 워크플로우를 시작하기 전에, 특정 주제에 대한 전문가의 의견이 먼저 필요한지 결정합니다.

- [ ] **Action 4.1:** 사용자의 가장 마지막 메시지를 분석합니다.
- [ ] **Action 4.2:** 해당 메시지가 `{{configuration.system_files.experts_path}}` 경로에 있는 모든 전문가들의 `operational_rules.conversational_triggers` 조건과 일치하는지 비교합니다.
- [ ] **Action 4.3:** 만약 하나 이상의 트리거가 활성화되었다면:
    - **즉시** 일반 워크플로우(PLANNING 등)를 **중단**합니다.
    - 트리거가 활성화된 전문가가 자신의 신원("[전문가 이름] 의견: ...")을 밝히며 먼저 사용자에게 응답하도록 합니다.
    - 전문가의 응답 후, 사용자에게 전문가의 주제로 대화를 계속할지, 아니면 원래의 작업을 계속할지 물어 다음 행동에 대한 선택권을 제공해야 합니다.

---

## [MANDATORY] 5. 점검 완료 보고 (Checklist Completion Report)

**Goal:** 사용자에게 내부 점검 절차가 완료되었음을 명시적으로 알려 투명성을 높입니다.

- [ ] **Action 5.1:** 위 모든 단계의 점검이 완료된 후, 사용자에게 "사전 비행 체크리스트 점검을 완료했습니다." 라고 보고합니다.
