# Post-flight Checklist (사후 비행 체크리스트)
# version: 2.1

**목표:** AI가 사용자에게 최종 응답을 보내기 직전, 모든 활동이 정확하게 기록되고 지식 베이스의 무결성이 보장되었는지 확인합니다.

---

## [MANDATORY] 1. 활성 컨텍스트 상태 보장 (Ensure Active Context State)

**Goal:** AI의 모든 상호작용의 맥락이 `activeContext.md`에 정확하고 빠짐없이 기록되었는지 최종적으로 보장하여, 다음 턴에 올바른 상태에서 작업을 시작할 수 있도록 합니다.

- [ ] **Action 1.1 (상태 강제 동기화):**
    1.  `[TOOL: read_file]`로 `activeContext.md`의 현재 내용을 읽어옵니다.
    2.  이번 턴에서 완료된 작업을 기반으로 "작업 목록 (Todo List)"의 상태를 `✅`로 변경합니다.
    3.  "최근 활동"과 "다음 단계"를 이번 턴의 실행 결과와 다음 계획에 맞춰 갱신합니다.
    4.  `[TOOL: write]`를 사용하여, 변경된 전체 내용으로 `activeContext.md` 파일을 덮어씁니다. 이 작업은 설령 이전 프로토콜에서 이미 수행했더라도 중복으로 실행하여 상태를 보장합니다.

---

## [MANDATORY] 2. 핵심 컨텍스트 및 진행 상황 기록 보장 (Ensure Core Context & Progress Log)

**Goal:** 이번 턴의 작업 결과가 프로젝트의 핵심 명세와 장기적인 진행 상황(`progress.md`)에 정확하게 반영되었는지 최종적으로 보장합니다.

- [ ] **Action 2.1 (핵심 명세 검토):** 아래 핵심 컨텍스트 파일들을 `[TOOL: read_file]`로 다시 읽고, 이번 턴의 작업 결과와 비교하여 내용 변경이 필요한지 판단합니다.
    - `{{configuration.system_files.project_context_path}}/projectbrief.md`
    - `{{configuration.system_files.project_context_path}}/productContext.md`
    - `{{configuration.system_files.project_context_path}}/systemPatterns.md`
    - `{{configuration.system_files.project_context_path}}/techContext.md`
- [ ] **Action 2.2 (핵심 명세 업데이트):** 만약 업데이트가 필요하다면:
    - **(Simple Change):** 변경 사항이 한두 줄의 간단한 수정일 경우, `[TOOL: write]`를 사용하여 즉시 해당 파일을 업데이트합니다.
    - **(Complex Change):** 변경 사항이 복잡하거나 여러 문서에 걸쳐있을 경우, 관련 문서 업데이트를 위한 새로운 계획을 세워 `{{configuration.system_files.active_context_file}}`의 "다음 단계(Next Steps)"에 기록하고, 사용자에게 다음 작업으로 제안합니다.
- [ ] **Action 2.3 (마일스톤 기록 동기화):**
    1.  `[TOOL: read_file]`로 `activeContext.md`를 읽어, "주요 목표"가 달성되었거나, "작업 목록"의 모든 항목이 `✅` 상태인지 확인합니다.
    2.  **Trigger:** 위 조건이 충족될 경우에만 실행합니다.
    3.  완료된 주요 목표 또는 작업 목록 전체를 하나의 마일스톤으로 요약합니다.
    4.  `[TOOL: read_file]`로 `progress.md`를 읽고, "최근 완료된 마일스톤" 섹션에 해당 요약 내용을 추가합니다.
    5.  만약 `progress_archiving_protocol.md`의 실행 조건이 충족된다면, 해당 프로토콜을 실행하여 마일스톤을 아카이빙합니다.
    6.  `[TOOL: write]`를 사용하여 변경된 내용으로 `progress.md` 파일을 덮어씁니다.

---

## [CONDITIONAL] 3. 지식 베이스 인덱스 일관성 검증 (KB Index Consistency Check)

**Goal:** 파일 시스템의 변경 사항이 지식 베이스의 목차(`index.yaml`)에 정확히 반영되었는지 최종 검증하여 데이터 불일치를 방지합니다.

- [ ] **Trigger:** 이번 턴의 작업에서 `.cursor/` 경로 하위의 파일을 생성, 수정, 또는 삭제한 경우에만 이 섹션을 실행합니다.
- [ ] **Action 3.1:** `brain.yaml`의 `knowledge_management.index_consistency_protocol`에 정의된 절차를 정확히 따릅니다.
- [ ] **Action 3.2:** 만약 불일치가 발견되면, 응답 생성을 중단하고 `index.yaml`을 먼저 수정한 후 응답을 다시 생성합니다.

---

## [MANDATORY] 4. 강화된 메모리 시스템 기록 (Enhanced Memory System Logging)

**Goal:** 모든 상호작용과 학습 내용을 구조화된 메모리 시스템에 실제로 기록하여, 미래의 의사결정을 위한 자산을 축적합니다.

- [ ] **Action 4.1 (단기 기억 로그 기록):**
    - 현재 `activeContext.md` 내용을 기반으로 이번 턴의 활동을 요약하고, 중요도에 따라 우선순위(`Critical`, `High`, `Medium`, `Low`)를 판단합니다.
    - `YYYY-MM-DD_HH-MM-SS_P{우선순위}.log` 형식의 파일명을 생성합니다.
    - `[TOOL: write]`를 사용하여, 요약된 활동 내용을 `{{configuration.system_files.short_term_memory_path}}`에 해당 파일명으로 저장합니다.
    - `[TOOL: list_dir]`로 `short_term_memory` 디렉토리의 로그 파일 개수를 셉니다.
    - 만약 파일 개수가 `brain.yaml`의 `short_term_memory_max_logs` 값을 초과하면, 가장 오래된 로그 파일을 `[TOOL: delete_file]`로 삭제합니다.
- [ ] **Action 4.2 (사용자 프로필 업데이트):**
    - 이번 턴의 사용자 대화에서 "앞으로는", "항상 ~해줘", "~하는 것을 선호합니다" 등 명시적인 선호도 표현 키워드가 있었는지 분석합니다.
    - 만약 새로운 선호도가 감지되었다면, "사용자 선호도 (YYYY-MM-DD): [감지된 선호도 내용]" 형식의 텍스트를 `[TOOL: write]` (append 모드)를 사용하여 `{{configuration.system_files.user_profile_file}}`에 추가합니다.

---

## [CONDITIONAL] 5. 실패 회고록 작성 (Troubleshooting Log Creation)

**Goal:** 시스템이 실패 상태에 진입했을 때, 그 원인과 맥락을 자동으로 기록하여 미래의 학습 자료로 남깁니다.

- [ ] **Trigger:** 이번 턴에 `FAILED` 상태가 활성화된 경우에만 이 섹션을 실행합니다.
- [ ] **Action 5.1:** 실패가 발생하기 직전의 `activeContext.md` 내용을 `[TOOL: read_file]`로 읽어옵니다.
- [ ] **Action 5.2:** `YYYY-MM-DD_HH-MM-SS_failure.log` 형식의 파일명을 생성합니다.
- [ ] **Action 5.3:** `[TOOL: write]`를 사용하여, 읽어온 컨텍스트 내용을 `{{configuration.system_files.troubleshooting_path}}`에 해당 파일명으로 저장합니다.

---

## [MANDATORY] 6. 컨텍스트 초기화 제안 (Context Reset Proposal)

**Goal:** 하나의 주요 목표가 완료되었을 때, 다음 작업을 위한 깨끗한 컨텍스트 환경을 조성할지 사용자에게 제안합니다.

- [ ] **Action 6.1:** `{{configuration.system_files.progress_file}}` 파일을 읽어 현재 진행 중인 "주요 목표"의 모든 하위 작업이 완료되었는지 확인합니다.
- [ ] **Action 6.2:** 만약 모든 작업이 완료되었다면, 사용자에게 보낼 최종 응답의 마지막에 "이번 주요 목표가 완료되었습니다. 다음 작업을 위해 '최근 활동' 기록을 정리할까요?" 라는 질문을 추가합니다.

---

## [MANDATORY] 7. 응답 형식 검증 (Response Format Verification)

**Goal:** 생성될 최종 응답이 시스템의 투명성 원칙과 커뮤니케이션 가이드라인을 준수하는지 기계적으로 검증합니다.

- [ ] **Action 7.1:** `brain.yaml`의 `cognitive_workflow.state_definitions`에서 현재 상태에 해당하는 `communication_guideline`을 조회합니다.
- [ ] **Action 7.2 (상태 보고 검증):** 생성될 응답이 `[상태: CURRENT_STATE]` 접두사로 시작하는지 확인합니다.
- [ ] **Action 7.3 (전문가 개입 보고 검증):**
    - **Trigger:** 이번 턴에 전문가가 호출된 경우에만 실행합니다.
    - **Action:** 생성될 응답에 `[EXPERT: 전문가명]` 접두사가 포함되어 전문가의 개입 사실이 명시되었는지 확인합니다.
- [ ] **Action 7.4 (검증 실패 시 조치):** 만약 위 검증 중 하나라도 실패하면, 응답 생성을 즉시 중단하고, 누락된 정보를 포함하여 응답을 다시 생성한 후 이 검증 단계를 재실행합니다.

---

## [MANDATORY] 8. 점검 완료 보고 (Checklist Completion Report)

**Goal:** 사용자에게 내부 점검 절차가 완료되었음을 명시적으로 알려 투명성을 높입니다.

- [ ] **Action 8.1:** 위 모든 단계의 점검이 완료된 후, 사용자에게 "사후 비행 체크리스트 점검을 완료했습니다." 라고 보고합니다.
