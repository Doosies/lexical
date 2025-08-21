# 변경 기록

이 프로젝트의 모든 중요한 변경 사항은 이 파일에 기록됩니다.

형식은 `MAJOR.MINOR.PATCH.REVISION`의 사용자 정의 버전 관리 체계를 따릅니다.

## [1.0.0.2] - 2025-08-05

### 변경됨
- **구조적 일관성 확보**: `CHANGELOG.md` 파일을 프로젝트 루트에서 `.cursor/core` 디렉토리로 이동하고, `brain.yaml`의 `system_files.changelog_file` 경로를 업데이트하여 모든 핵심 시스템 파일의 위치를 일치시켰습니다. (`brain.yaml`은 현재 `brain-kernel.mdc`로 변경됨)

## [1.0.0.1] - 2025-08-05
## [1.1.0.0] - 2025-08-08

### 변경됨
- `REQUEST_PROCESSING_GATE`: 모든 사용자 입력에서 무조건 통과하며, 워크플로우 잠금 확인 후 `zero_tolerance_shortcut_policy`를 무조건 발동하고 `ORCHESTRATION_PLANNING`으로 전환하도록 규칙을 단순화했습니다.
- `zero_tolerance_shortcut_policy`: 트리거 조건을 `action_keywords` 기반에서 무조건 발동으로 변경했습니다.
- `ai_bootstrap_protocol.md`: "응답 가이드라인" 섹션을 추가하여 상태 접두어, 계획 우선, 승인 전 산출물 제한, 투명 보고 원칙을 명시했습니다.


### 추가됨
- **브레인 아키텍처 v1.0.0.0 (New Genesis)**: 핵심 시스템 아키텍처를 투명성, 명시성, 효율성 강화를 위해 근본적으로 리팩토링했습니다.
- **명시적 행동 강제**: 모든 암묵적 시스템 동작(예: 파일 로딩)을 `brain.yaml` 내에서 명시적인 도구 호출(`[TOOL: read_file]`)로 정의했습니다. (`brain.yaml`은 현재 `brain-kernel.mdc`로 변경됨)
- **상태 단순화**: 불필요한 `COMMITTING` 상태를 제거하여 인지 워크플로우를 간소화했습니다. 이제 `expert_invocation_engine`이 커밋 관련 작업을 직접 처리합니다.
- **명시적 전문가 경로**: `brain.yaml`의 모든 전문가 호출은 모호성을 제거하기 위해 전체 파일 경로를 명시적으로 사용합니다. (`brain.yaml`은 현재 `brain-kernel.mdc`로 변경됨)
- **2인칭 시점 전환**: `brain.yaml`의 시스템 정의를 3인칭("AI는...")에서 2인칭("당신은...")으로 변경하여, 직접적인 지시어로서의 역할을 명확히 했습니다. (`brain.yaml`은 현재 `brain-kernel.mdc`로 변경됨)
- **변경 기록(`CHANGELOG.md`) 도입**: 모든 버전 변경 사항을 공식적으로 문서화하기 위해 `CHANGELOG.md`를 도입했습니다.

### 변경됨
- **버전 관리 체계**: 변경 사항을 더 세밀하게 추적할 수 있도록, 기존 3자리에서 4자리 `MAJOR.MINOR.PATCH.REVISION` 시스템으로 업그레이드했습니다.
- **페르소나 정의**: 상세한 페르소나 특성을 `brain.yaml`에 직접 복원하고 통합하여, AI의 정체성과 행동 지침에 대한 단일 진실 공급원(Single Source of Truth)으로서의 역할을 보장했습니다. (`brain.yaml`은 현재 `brain-kernel.mdc`로 변경됨)
