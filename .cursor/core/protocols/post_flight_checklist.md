# Post-flight Checklist (사후 비행 체크리스트)

**목표:** AI가 사용자에게 최종 응답을 보내기 직전, 모든 활동이 정확하게 기록되고 지식 베이스의 무결성이 보장되었는지 확인합니다.

---

## [MANDATORY] 1. 대화 컨텍스트 관리 (Active Context Management)

**Goal:** 모든 상호작용의 맥락을 파일에 기록하여, AI가 다음 턴에 올바른 상태에서 시작할 수 있도록 보장합니다.

- [ ] **Action 1.1:** 현재 AI의 워크플로우 상태(e.g., PLANNING, ACTING, COMMITTING)를 확인합니다.
- [ ] **Action 1.2:** 마지막 사용자 요청과, AI가 이번 턴에 수행했거나 다음 턴에 수행할 핵심 행동을 요약합니다.
- [ ] **Action 1.3:** `{{configuration.system_files.active_context_file}}` 파일을 열어 "현재 상태", "주요 목표", "최근 활동", "다음 단계" 필드를 Action 1.1과 1.2에서 파악한 최신 정보로 업데이트합니다.

---

## [MANDATORY] 2. 핵심 컨텍스트 업데이트 검토 (Core Context Update Review)

**Goal:** 이번 턴의 작업 결과가 프로젝트의 핵심 명세(`projectbrief`, `techContext` 등)에 변경을 유발했는지 검토하고, 지식 베이스의 최신성을 유지합니다.

- [ ] **Action 2.1:** 아래 핵심 컨텍스트 파일들을 다시 읽고, 이번 턴의 작업 결과와 비교하여 내용 변경이 필요한지 판단합니다.
    - `{{configuration.system_files.project_context_path}}/projectbrief.md`
    - `{{configuration.system_files.project_context_path}}/productContext.md`
    - `{{configuration.system_files.project_context_path}}/systemPatterns.md`
    - `{{configuration.system_files.project_context_path}}/techContext.md`
    - `{{configuration.system_files.project_context_path}}/activeContext.md`
    - `{{configuration.system_files.project_context_path}}/progress.md`
- [ ] **Action 2.2:** 만약 업데이트가 필요하다면:
    - **(Simple Change):** 변경 사항이 한두 줄의 간단한 수정일 경우, 즉시 해당 파일을 업데이트합니다.
    - **(Complex Change):** 변경 사항이 복잡하거나 여러 문서에 걸쳐있을 경우, 관련 문서 업데이트를 위한 새로운 계획을 세워 `{{configuration.system_files.active_context_file}}`의 "다음 단계(Next Steps)"에 기록하고, 사용자에게 다음 작업으로 제안합니다.

## [CONDITIONAL] 3. 지식 베이스 인덱스 일관성 검증 (KB Index Consistency Check)

**Goal:** 파일 시스템의 변경 사항이 지식 베이스의 목차(`index.yaml`)에 정확히 반영되었는지 최종 검증하여 데이터 불일치를 방지합니다.

- [ ] **Trigger:** 이번 턴의 작업에서 `.cursor/` 경로 하위의 파일을 생성, 수정, 또는 삭제한 경우에만 이 섹션을 실행합니다.
- [ ] **Action 3.1:** 변경이 발생한 파일/디렉토리의 상위 경로에 있는 모든 `index.yaml` 파일을 찾습니다.
- [ ] **Action 3.2:** `knowledge_management.index_consistency_protocol`에 정의된 절차에 따라, 실제 파일 변경 사항과 `index.yaml`의 내용이 일치하는지 검증합니다.
- [ ] **Action 3.3:** 만약 불일치가 발견되면:
    - **즉시** 사용자에게 보내려던 응답 생성을 **중단**합니다.
    - 먼저 `index.yaml` 파일의 불일치를 수정하는 작업을 수행합니다.
    - 수정이 완료된 후에야 원래 생성하려던 응답을 다시 생성하여 사용자에게 전달합니다.

---

## [MANDATORY] 4. 컨텍스트 초기화 제안 (Context Reset Proposal)

**Goal:** 하나의 주요 목표가 완료되었을 때, 다음 작업을 위한 깨끗한 컨텍스트 환경을 조성할지 사용자에게 제안합니다.

- [ ] **Action 4.1:** `{{configuration.system_files.project_context_path}}/progress.md` 파일을 읽어 현재 진행 중인 "주요 목표"의 모든 하위 작업이 완료되었는지 확인합니다.
- [ ] **Action 4.2:** 만약 모든 작업이 완료되었다면:
    - 사용자에게 보낼 최종 응답의 마지막에 "이번 주요 목표가 완료되었습니다. 다음 작업을 위해 '최근 활동' 기록을 정리할까요?" 라는 질문을 추가합니다.

## [MANDATORY] 5. 점검 완료 보고 (Checklist Completion Report)

**Goal:** 사용자에게 내부 점검 절차가 완료되었음을 명시적으로 알려 투명성을 높입니다.

- [ ] **Action 5.1:** 위 모든 단계의 점검이 완료된 후, 사용자에게 "사후 비행 체크리스트 점검을 완료했습니다." 라고 보고합니다. 