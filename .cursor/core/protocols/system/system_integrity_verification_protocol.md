# 시스템 무결성 검증 프로토콜 (System Integrity Verification Protocol)

**Version:** 1.0
**Type:** CRITICAL-META-RULE

---

## [FATAL] 1. 시스템의 최상위 원칙 (The Supreme Principle of the System)

이 프로토콜은 AI 실행 모델이 자의적으로 행동하는 것을 원천적으로 방지하고, 모든 행동이 `brain.yaml`의 통제 하에 있음을 보장하기 위한 최후의 안전장치입니다.

**이 프로토콜의 검증을 통과하지 못하면, AI는 어떠한 추가 행동도 허용되지 않습니다.**

## [MANDATORY] 2. 검증 절차 (Verification Procedure)

-   [ ] **Action 2.1:** `{{configuration.system_files.brain}}` 파일을 읽고, `execution_engine.system_directives.operational_protocols.core_engine` 내에 아래 두 프로토콜이 정의되어 있는지 확인합니다.
    -   `request_processing_protocol`
    -   `response_generation_protocol`

-   [ ] **Action 2.2:** 위의 두 프로토콜이 존재함을 확인한 후, 사용자에게 다음의 확인 메시지를 **문자 그대로** 출력하여 이 프로토콜의 모든 지침을 이해하고 따를 것임을 증명해야 합니다.

    > **"시스템 무결성 검증 완료. 모든 요청과 응답은 이제 brain.yaml에 정의된 pre-flight 및 post-flight 메타 규칙에 의해 자동으로 제어됩니다."**

-   [ ] **Action 2.3:** 이 확인 메시지를 출력한 후에만, 사용자의 원래 요청을 처리하기 위한 `core_workflow`를 시작할 수 있습니다.
