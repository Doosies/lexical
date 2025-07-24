# ===============================================
# `mergeRefs` 유틸리티 사용 가이드
# ===============================================
# 이 문서는 Lexical React 공유 유틸리티인 `mergeRefs`의 목적, 동작 방식, 그리고 활용 사례를 설명하는 가이드입니다.
# 원본: packages/lexical-react/src/shared/mergeRefs.ts
# ===============================================

## 1. `mergeRefs`란 무엇인가?

`mergeRefs`는 여러 개의 React ref를 하나의 단일 ref 콜백으로 병합해주는 유틸리티 함수입니다. 이를 통해 하나의 컴포넌트나 DOM 요소에 여러 ref를 동시에 연결할 수 있습니다.

## 2. 왜 필요한가? (Problem)

React에서 컴포넌트나 DOM 요소의 `ref` 속성에는 단 하나의 ref만 전달할 수 있습니다. 하지만 개발 시 다음과 같이 여러 ref를 하나의 요소에 연결해야 하는 경우가 발생합니다.

-   **`forwardRef` 사용 시:** 부모 컴포넌트로부터 `ref`를 전달받아 내부 DOM 요소에 연결해야 하는 동시에, 컴포넌트 내부에서도 자체적인 로직을 위해 동일한 DOM 요소에 접근해야 할 때.
-   **여러 Hooks의 조합:** 여러 커스텀 훅이 각각 동일한 DOM 요소에 대한 ref를 필요로 할 때.

이러한 상황에서 `mergeRefs`는 여러 ref를 하나로 묶어 `ref` 속성에 전달할 수 있게 해주는 해결책이 됩니다.

## 3. 어떻게 동작하는가? (Solution)

`mergeRefs` 함수의 동작 방식은 간단합니다.

1.  함수는 인자로 여러 개의 ref 객체(또는 함수)를 배열 형태로 받습니다.
2.  새로운 **"Ref 콜백(Ref Callback)"** 함수를 반환합니다.
3.  React가 컴포넌트나 DOM 요소를 마운트할 때, 이 반환된 Ref 콜백을 실제 DOM 노드(`value`)를 인자로 하여 호출합니다.
4.  콜백 함수는 내부적으로 `mergeRefs`에 전달되었던 모든 원본 `ref`들을 순회하며, 각각에 `value`를 할당합니다.
    -   만약 원본 `ref`가 함수 형태(Ref 콜백)라면, `ref(value)`를 호출합니다.
    -   만약 원본 `ref`가 객체 형태(`{ current: ... }`)라면, `ref.current = value`를 실행합니다.

## 4. 사용 예시 (Usage Example)

`forwardRef`를 사용하는 `CustomInput` 컴포넌트 예시입니다. 부모는 이 input에 포커스를 주기 위한 ref(`parentRef`)를 전달하고, `CustomInput` 자체는 마운트 시점에 input 요소의 너비를 측정하기 위한 `internalRef`를 사용합니다.

```jsx
import React, {useRef, useEffect, forwardRef} from 'react';
import { mergeRefs } from './mergeRefs'; // 실제 경로에 맞게 수정

// 자식 컴포넌트
const CustomInput = forwardRef((props, forwardedRef) => {
  // 컴포넌트 내부에서 사용할 ref
  const internalRef = useRef(null);

  useEffect(() => {
    // 마운트 시점에 internalRef를 사용하여 DOM 요소에 접근
    if (internalRef.current) {
      console.log('내부 ref로 측정한 Input 너비:', internalRef.current.offsetWidth);
    }
  }, []);

  return (
    <input
      type="text"
      {...props}
      // 부모로부터 받은 ref와 내부 ref를 하나로 병합하여 전달
      ref={mergeRefs(forwardedRef, internalRef)}
    />
  );
});

// 부모 컴포넌트
function ParentComponent() {
  // 자식 컴포넌트의 input을 제어하기 위한 ref
  const parentRef = useRef(null);

  const handleFocusClick = () => {
    if (parentRef.current) {
      parentRef.current.focus();
    }
  };

  return (
    <div>
      <CustomInput ref={parentRef} />
      <button onClick={handleFocusClick}>
        Input에 포커스 주기
      </button>
    </div>
  );
}
```

위 예시에서 `<input>` 요소의 `ref`에는 `mergeRefs`가 반환한 단일 콜백 함수가 전달됩니다. React가 input 요소를 렌더링하면 이 콜백이 실행되고, 결과적으로 `parentRef.current`와 `internalRef.current` 모두 동일한 input DOM 요소를 가리키게 됩니다. 