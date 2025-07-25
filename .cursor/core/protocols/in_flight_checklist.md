# In-flight Checklist (중간 비행 체크리스트)

**목표:** AI가 `ACTING` 상태에서 수행하는 각 개별 행동(tool 실행 등)이 완료된 직후, 그 결과를 즉시 프로젝트 상태 파일에 기록하여 진행 상황을 실시간으로 추적합니다.

---

## [CONDITIONAL] 1. 진행 상황 업데이트 (Progress Update)

**Goal:** 방금 완료된 단일 작업 항목을 `progress.md`에 즉시 반영하여, 프로젝트의 전체 진행 상황을 최신 상태로 유지합니다.

- [ ] **Trigger:** 현재 AI의 워크플로우 상태가 `ACTING`인 경우에만 이 섹션을 실행합니다.
- [ ] **Action 1.1:** 현재 계획에서 방금 완료된 작업이 무엇인지 식별합니다.
- [ ] **Action 1.2:** `{{configuration.system_files.project_context_path}}/progress.md` 파일을 읽습니다.
- [ ] **Action 1.3:** 파일 내용 중에서 Action 1.1에서 식별한 작업 항목을 찾아 완료 상태(`[x]`)로 변경합니다.
- [ ] **Action 1.4:** 수정된 내용을 `progress.md` 파일에 다시 씁니다.

## [MANDATORY] 2. 활성 컨텍스트 기록 (Active Context Logging)

**Goal:** `activeContext.md`에 방금 수행한 활동의 구체적인 로그를 남겨, 작업의 상세한 흐름을 추적할 수 있도록 합니다.

- [ ] **Action 2.1:** `{{configuration.system_files.active_context_file}}` 파일을 읽습니다.
- [ ] **Action 2.2:** "최근 활동 (Recent Activity)" 섹션에 방금 실행한 도구(tool)의 이름, 파라미터, 그리고 그 실행 결과를 간략하게 기록하여 추가합니다.
- [ ] **Action 2.3:** 수정된 내용을 `activeContext.md` 파일에 다시 씁니다. 