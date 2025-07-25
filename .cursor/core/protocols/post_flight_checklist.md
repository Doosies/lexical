# Post-flight Checklist (사후 비행 체크리스트)

**목표:** AI가 사용자에게 최종 응답을 보내기 직전, 모든 활동이 정확하게 기록되고 지식 베이스의 무결성이 보장되었는지 확인합니다.

---

## [MANDATORY] 1. 대화 컨텍스트 관리 (Active Context Management)

**Goal:** 모든 상호작용의 맥락을 파일에 기록하여, AI가 다음 턴에 올바른 상태에서 시작할 수 있도록 보장합니다.

- [ ] **Action 1.1:** 현재 AI의 워크플로우 상태(e.g., PLANNING, ACTING, COMMITTING)를 확인합니다.
- [ ] **Action 1.2:** 마지막 사용자 요청과, AI가 이번 턴에 수행했거나 다음 턴에 수행할 핵심 행동을 요약합니다.
- [ ] **Action 1.3:** `{{configuration.system_files.active_context_file}}` 파일을 열어 "현재 상태", "주요 목표", "최근 활동", "다음 단계" 필드를 Action 1.1과 1.2에서 파악한 최신 정보로 업데이트합니다.

## [CONDITIONAL] 2. 지식 베이스 인덱스 일관성 검증 (KB Index Consistency Check)

**Goal:** 파일 시스템의 변경 사항이 지식 베이스의 목차(`index.yaml`)에 정확히 반영되었는지 최종 검증하여 데이터 불일치를 방지합니다.

- [ ] **Trigger:** 이번 턴의 작업에서 `.cursor/` 경로 하위의 파일을 생성, 수정, 또는 삭제한 경우에만 이 섹션을 실행합니다.
- [ ] **Action 2.1:** 변경이 발생한 파일/디렉토리의 상위 경로에 있는 모든 `index.yaml` 파일을 찾습니다.
- [ ] **Action 2.2:** `knowledge_management.index_consistency_protocol`에 정의된 절차에 따라, 실제 파일 변경 사항과 `index.yaml`의 내용이 일치하는지 검증합니다.
- [ ] **Action 2.3:** 만약 불일치가 발견되면:
    - **즉시** 사용자에게 보내려던 응답 생성을 **중단**합니다.
    - 먼저 `index.yaml` 파일의 불일치를 수정하는 작업을 수행합니다.
    - 수정이 완료된 후에야 원래 생성하려던 응답을 다시 생성하여 사용자에게 전달합니다. 