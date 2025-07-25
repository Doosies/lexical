# Pre-flight Checklist (사전 비행 체크리스트)

**목표:** AI가 사용자의 요청에 대해 본격적인 사고(PLANNING, ACTING)를 시작하기 전, 완전하고 최신인 정보 위에서만 작동하도록 보장하고, 필요시 전문가가 먼저 개입하도록 합니다.

---

## [MANDATORY] 1. 전체 컨텍스트 동기화 (Full Context Synchronization)

**Goal:** 어떠한 판단이나 행동을 하기에 앞서, 반드시 프로젝트의 목표, 기술, 상태, 진행 상황을 정의하는 모든 핵심 정보를 완벽하게 숙지해야 합니다.

- [ ] **Action 1.1:** 다음 핵심 컨텍스트 파일들의 **전체 내용**을 지정된 순서대로 읽고 단기 기억에 로드합니다:
    - 1. `{{configuration.system_files.project_context_path}}/projectbrief.md`
    - 2. `{{configuration.system_files.project_context_path}}/productContext.md`
    - 3. `{{configuration.system_files.project_context_path}}/systemPatterns.md`
    - 4. `{{configuration.system_files.project_context_path}}/techContext.md`
    - 5. `{{configuration.system_files.project_context_path}}/activeContext.md`
    - 6. `{{configuration.system_files.project_context_path}}/progress.md`

## [MANDATORY] 2. 전문가 선제 개입 확인 (Proactive Expert Intervention Check)

**Goal:** 일반적인 워크플로우를 시작하기 전에, 특정 주제에 대한 전문가의 의견이 먼저 필요한지 결정합니다.

- [ ] **Action 2.1:** 사용자의 가장 마지막 메시지를 분석합니다.
- [ ] **Action 2.2:** 해당 메시지가 `{{configuration.system_files.experts_path}}` 경로에 있는 모든 전문가들의 `operational_rules.conversational_triggers` 조건과 일치하는지 비교합니다.
- [ ] **Action 2.3:** 만약 하나 이상의 트리거가 활성화되었다면:
    - **즉시** 일반 워크플로우(PLANNING 등)를 **중단**합니다.
    - 트리거가 활성화된 전문가가 자신의 신원("[전문가 이름] 의견: ...")을 밝히며 먼저 사용자에게 응답하도록 합니다.
    - 전문가의 응답 후, 사용자에게 전문가의 주제로 대화를 계속할지, 아니면 원래의 작업을 계속할지 물어 다음 행동에 대한 선택권을 제공해야 합니다.

---

## [MANDATORY] 3. 점검 완료 보고 (Checklist Completion Report)

**Goal:** 사용자에게 내부 점검 절차가 완료되었음을 명시적으로 알려 투명성을 높입니다.

- [ ] **Action 3.1:** 위 1, 2 단계의 모든 점검이 완료된 후, 사용자에게 "사전 비행 체크리스트 점검을 완료했습니다." 라고 보고합니다. 