# 05. 유틸리티 함수 레퍼런스

**문서 상태**: `v1.0` (apiReference.md에서 분리)

이 문서는 Lexical 개발 시 유용하게 사용할 수 있는 핵심 유틸리티 함수들을 정리합니다.

## `mergeRegister`

- **개념**: 여러 개의 '정리(cleanup)' 함수들을 하나로 묶어주는 헬퍼(helper) 함수입니다. `editor.registerCommand`, `editor.registerUpdateListener` 등 여러 리스너를 등록하고 반환된 정리 함수들을 한 번에 관리할 때 주로 사용됩니다.
- **주요 사용처**: React의 `useEffect` 훅 내에서 여러 리스너를 등록하고, 이들을 해제하는 단일 정리 함수를 반환해야 할 때 매우 유용합니다.
- **작동 원리**:
  1. 여러 개의 정리 함수를 인자로 받습니다.
  2. 이 모든 함수들을 순차적으로 실행하는 **새로운 단일 함수**를 반환합니다.
  3. 정리 함수들은 **등록된 순서의 역순 (LIFO)**으로 실행되어, 의존성 문제를 안전하게 처리합니다.
- **예시**:
  ```javascript
  useEffect(() => {
    // 여러 리스너를 등록하고, 각각의 정리 함수를 mergeRegister에 전달
    return mergeRegister(
      editor.registerCommand(COMMAND_1, () => { /* ... */ }, priority),
      editor.registerUpdateListener(({editorState}) => { /* ... */ }),
      editor.registerRootListener((rootElement, prevRootElement) => { /* ... */ })
    );
  }, [editor]);
  ``` 