# 활성 컨텍스트 (Active Context)

- **현재 상태**: `PLANNING`
- **주요 목표**: `ECDecimal.tsx` 컴포넌트의 로직을 Command 패턴을 사용하여 리팩터링하고, 확장성과 유지보수성을 극대화합니다.
- **최근 활동**:
  - **AI 아키텍처 재구성 완료**: ACTING 상태에 예외 처리 및 상시 전문가 검토 로직을 추가하여 시스템 안정성 강화.
- **다음 단계**: `ECDecimal.tsx` 리팩터링 계획 수립
- **대기 중인 작업 (Pending Tasks) - ECDecimal 리팩터링 계획**:
  - **1. ECDecimal.tsx 수정**:
    - `onChange` 콜백에서 `UPDATE_DECIMAL_COMMAND`를 발행하도록 변경.
    - 불필요한 props(`onValidator` 등) 제거.
  - **2. DecimalPlugin.tsx 생성**:
    - `UPDATE_DECIMAL_COMMAND`를 리스닝하여 유효성 검사, 포매팅, 상태 업데이트 로직 처리.
    - `editor.update()`를 통해 `LexicalDecimalNode`의 최종 상태 반영.
  - **3. 관련 파일 수정**:
    - `LexicalDecimalNode.tsx`에서 제거된 props 정리.
    - Command payload에 `nodeKey`를 포함하여 특정 노드를 식별하도록 보장 (비판적 검토 전문가 제안).
    - 리팩터링 후 기능이 정상 동작하는지 회귀 테스트 수행 (QA 엔지니어 제안).