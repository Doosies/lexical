# System Integrity Protocol (시스템 무결성 프로토콜)
# version: 1.0

## Description
이 프로토콜은 시스템의 핵심 두뇌와 뼈대에 해당하는 `.cursor/core` 디렉토리의 무결성을 보장하는 것을 목표로 합니다. `core` 내부의 파일이 변경될 때마다 자동으로 실행되어, 관련 메타데이터, 특히 `protocols/index.yaml`을 최신 상태로 유지합니다.

---

## Steps (실행 단계)

### **Step 1: 변경 감지 및 프로토콜 실행**
- **Trigger:** `brain.yaml`의 `system_integrity_check` 규칙에 의해, `.cursor/core` 디렉토리 내에서 `write`, `search_replace`, `delete_file` 도구가 실행될 때 자동으로 호출됩니다.
- **Action:** 이 프로토콜의 모든 단계를 순서대로 실행합니다.

### **Step 2: 프로토콜 인덱스 업데이트**
- **Action:**
    1.  `[TOOL: list_dir]`를 사용하여 `.cursor/core/protocols` 디렉토리와 그 하위 디렉토리의 모든 `.md` 파일 목록을 가져옵니다.
    2.  각 프로토콜 파일을 `[TOOL: read_file]`로 순회하며 `# version:`과 `## Description` 정보를 추출합니다.
    3.  추출된 정보를 바탕으로 `.cursor/core/protocols/index.yaml` 파일의 내용을 완전히 새로 작성합니다.
    4.  `index.yaml` 파일 상단의 `마지막 업데이트` 타임스탬프를 현재 시간으로 갱신합니다.
- **Rationale:** 시스템의 모든 행동 규칙(프로토콜)에 대한 메타데이터를 항상 최신 상태로 유지하여, 시스템이 자신의 구조와 역할을 정확하게 인지하도록 보장합니다.

### **Step 3: (향후 확장) 전문가 시스템 인덱스 업데이트**
- **TODO:** `.cursor/core/experts` 디렉토리의 변경을 감지하고, `experts/index.yaml`을 업데이트하는 기능을 추가할 수 있습니다.
- **Rationale:** 시스템의 모든 구성 요소에 대한 자기인식 능력을 점진적으로 확장합니다.

### **Step 4: 완료 보고**
- **Action:** `index.yaml` 업데이트가 완료되었음을 사용자에게 보고합니다. (단, 최초 규칙 설정 시의 소급 적용 단계에서는 생략할 수 있습니다.)
- **Rationale:** 시스템의 자동화된 내부 동작을 투명하게 공유합니다.
