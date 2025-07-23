# Lexical과 React 연동 심층 분석

이 문서는 `@lexical/react` 패키지를 사용하여 Lexical을 React 애플리케케이션에 통합하는 방법과 주요 패턴, 그리고 고급 활용법에 대해 심층적으로 분석합니다.

## 1. 핵심 컴포넌트와 훅

(이 섹션은 향후 관련 문서를 분석하며 채워나갈 예정입니다.)

## 2. 주요 사용 패턴 및 FAQ

(이 섹션은 향후 관련 문서를 분석하며 채워나갈 예정입니다.)

## 3. 고급 훅 활용

### 3.1. HistoryPlugin과 Undo/Redo

`@lexical/react`의 `useHistory` 훅과 `@lexical/history` 패키지는 단순한 Undo/Redo 스택 관리를 넘어, 사용자 경험(UX)을 향상시키기 위한 정교한 **Undo 병합(Coalescing)** 정책을 구현하고 있습니다.

> **[심층 분석]** Undo 병합의 상세한 규칙(병합 대상, 중단 조건)과 관련 API에 대한 자세한 내용은 아래 문서를 참고하세요.
>
> -   **[Lexical History 및 Undo 병합(Coalescing) 심층 분석](../analysis/history/01_history_and_undo_coalescing.md)** 