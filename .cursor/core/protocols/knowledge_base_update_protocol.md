# 지식 베이스 업데이트 프로토콜 상세 가이드

**목적:** 이 문서는 `brain.yaml`에 정의된 `knowledge_base.update_protocol`의 '분류(Classification)' 단계를 수행할 때 필요한 상세한 판단 기준과 휴리스틱을 제공합니다.

---

### **0. 메모리 뱅크 전체 구조도 (Memory Bank Architecture)**

-   메모리 뱅크의 전체 구조와 파일 간의 의존 관계에 대한 **모든 구조적 정의(핵심 파일, 폴더 목록 등)는 `.cursor/core/brain.yaml`의 `knowledge_base` 섹션을 유일한 원본(Single Source of Truth)으로 삼습니다.**
-   **[ACTION]:** 문서를 업데이트하기 전, 반드시 해당 `brain.yaml`의 정의를 먼저 확인하여 전체 구조를 파악해야 합니다. 시각적 참조가 필요할 경우, 보조적으로 `.cursor/memory_bank/guidelines/ai_bootstrap_protocol.md`의 다이어그램을 참고할 수 있습니다.

### **1. 영향도 분석 (Impact Analysis)**

-   **목표:** 하나의 문서 변경이 다른 문서에 미칠 수 있는 연쇄적인 파급 효과를 사전에 파악하여 지식 베이스의 일관성을 유지합니다.
-   **실행 방법:**
    1.  먼저, **`.cursor/core/brain.yaml`** 의 `knowledge_base` 섹션을 참조하여 수정할 문서의 위치와 핵심 파일 여부를 파악합니다.
    2.  `ai_bootstrap_protocol.md`의 구조도를 보조적으로 참조하여, 해당 문서와 직/간접적으로 연결된 모든 문서를 식별합니다.
    3.  식별된 모든 문서를 '업데이트 대상 목록'에 포함시키고, 변경 사항이 각 문서에 어떤 영향을 미치는지 최종 검토합니다.

### **2. 분류(Classification) 상세 기준**

#### **2.1. 판단 기준 (Judgement Criteria)**

-   새로운 지식을 분류할 때, 가장 먼저 정보의 성격에 따라 **`.cursor/core/brain.yaml`의 `knowledge_base.topical_directories`** 에 정의된 카테고리 중 어디에 속하는지 판단해야 합니다.

#### **2.2. 폴더 생성 휴리스틱 (Folder Creation Heuristics)**

-   새로운 폴더 생성은 지식 베이스의 복잡성을 증가시킬 수 있으므로, 다음의 휴리스틱에 따라 신중하게 결정해야 합니다.

    -   **규칙 1: '3의 법칙 (Rule of Three)'**

        -   설명: 동일한 소주제(e.g., 'authentication')에 대한 문서가 3개 이상 축적되었을 때, 해당 주제의 이름을 딴 하위 폴더 생성을 고려합니다.
        -   실행 방법: 관련 `index.yaml` 파일이나 `list_dir` 도구를 사용하여 특정 주제의 문서가 임계값(3)을 넘는지 확인합니다.

    -   **규칙 2: '기능 단위 (Feature Unit)'**
        -   설명: 여러 문서가 하나의 독립적인 기능(e.g., '검색', '결제')과 명확하게 관련될 경우, 해당 기능의 이름을 딴 폴더를 생성할 수 있습니다.

#### **2.3. 필수 준수 사항 (Required Action)**

-   **중요:** 새로운 폴더를 생성하는 경우, 그 안에는 반드시 해당 폴더의 목차 역할을 하는 `index.yaml` 파일을 함께 생성해야 합니다. 이 파일이 누락되면 AI가 해당 폴더의 내용을 인지할 수 없습니다.
