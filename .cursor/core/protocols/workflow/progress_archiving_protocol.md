# Progress Archiving Protocol (진행 상황 아카이빙 프로토콜)

## Description
[MAINTENANCE-PROTOCOL] `progress.md` 파일이 과도하게 길어지는 것을 방지하고, 장기적인 가독성과 유지보수성을 확보하기 위해 완료된 마일스톤을 주기적으로 아카이빙하는 절차입니다.

---

## Trigger (실행 조건)
- **주기적 실행**: `post_flight_checklist`의 일부로, 매 작업 사이클이 끝날 때마다 실행을 고려합니다.
- **조건부 실행**: `progress.md` 파일의 "최근 완료된 마일스톤" 섹션의 라인 수가 20개를 초과할 경우, 또는 가장 오래된 마일스톤의 날짜가 현재 날짜와 다를 경우 실행을 권장합니다.

## Steps (실행 단계)

### **Step 1: 로그 디렉토리 확인 (Verify Log Directory)**
- **Action:** `{{configuration.system_files.user_context_path}}/progress_logs/` 디렉토리가 존재하는지 확인합니다.
- **On-Failure:** 디렉토리가 없으면 `New-Item -ItemType Directory` 명령어를 사용하여 생성합니다.

### **Step 2: 마일스톤 추출 및 그룹화 (Extract & Group Milestones)**
- **Action:** `read_file` 도구로 `progress.md`의 전체 내용을 읽습니다.
- **Action:** "최근 완료된 마일스톤" 섹션의 각 항목을 파싱하여 날짜별로 그룹화합니다. `(YYYY-MM-DD)` 형식을 기준으로 합니다.

### **Step 3: 일일 로그 파일에 아카이빙 (Archive to Daily Logs)**
- **Action:** 그룹화된 각 날짜에 대해, `progress_logs/YYYY-MM-DD.md` 형식의 파일에 해당 날짜의 마일스톤을 기록합니다.
- **Details:**
    - 해당 날짜의 로그 파일이 이미 존재하면, 새로운 내용을 파일 **상단**에 추가합니다.
    - 파일이 없다면, `# YYYY년 MM월 DD일 마일스톤` 제목과 함께 새 파일을 생성하고 내용을 기록합니다.

### **Step 4: `progress.md` 재구성 (Reconstruct `progress.md`)**
- **Action:** `progress.md`에서 아카이빙된 마일스톤 항목들을 모두 삭제합니다.
- **Action:** "완료된 마일스톤 로그" 섹션에 아카이빙된 로그 파일로의 상대 경로 링크가 존재하는지 확인하고, 없다면 추가합니다. (e.g., `- [YYYY-MM-DD](./progress_logs/YYYY-MM-DD.md)`)
- **Action:** `write` 도구를 사용하여 변경된 내용으로 `progress.md` 파일을 덮어씁니다.

## Rationale (프로토콜의 근거)
`progress.md` 파일을 핵심 목표와 로그 파일에 대한 인덱스만 남겨 간결하게 유지함으로써, 시스템의 핵심 진행 상황을 빠르게 파악할 수 있도록 돕습니다. 동시에 과거 기록을 날짜별로 구조화하여 체계적인 이력 관리를 가능하게 합니다.
