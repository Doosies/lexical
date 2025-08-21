# Booting Protocol (v3)

이 문서는 시스템을 `RUNNING` 상태로 안전하게 전환하기 위한, 간결하고 명확한 부팅 절차를 정의합니다.

## 1. 핵심 구성 파일 검증

-   [ ] `.cursor/rules/brain-kernel.mdc` 파일의 존재 여부를 확인합니다.
-   [ ] `{{configuration.system_files.bootstrap_protocol}}` 파일의 존재 여부를 확인합니다.

## 2. 시스템 페르소나 및 아키텍처 원칙 로드

-   [ ] `brain-kernel.mdc` 파일에서 시스템 페르소나(`System Supervisor`)와 핵심 아키텍처 원칙(위임, 기계적 실행)을 로드하고 숙지합니다.
-   [ ] `{{configuration.system_files.bootstrap_protocol}}` 파일에서 시스템의 모든 행동 원칙(커널 책임주의, 페르소나 존중 등)을 로드하고 숙지합니다.

## 3. 최종 상태 전환 및 사용자 보고

-   [ ] 모든 검증이 완료되면, 시스템 상태를 `RUNNING`으로 전환합니다.
-   [ ] **[중요]** 사용자에게 전달될 모든 메시지는 반드시 `PromptExpert`를 통해 생성되어야 합니다.
-   [ ] `PromptExpert`를 호출하여, 부팅이 완료되었고 시스템이 정상 작동 중임을 알리는 사용자 친화적인 메시지를 생성하도록 지시합니다.
-   [TOOL: prompt_expert.generate_prompt prompt_type="boot_complete_message"]
-   [ ] `PromptExpert`로부터 받은 메시지를 사용자에게 최종 전달합니다.
