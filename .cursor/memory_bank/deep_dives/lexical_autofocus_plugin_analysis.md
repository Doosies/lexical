# LexicalAutoFocusPlugin.ts 상세 분석

**파일 위치:** `packages/lexical-react/src/LexicalAutoFocusPlugin.ts`

## 1. 핵심 목적 (Purpose)

이 플러그인의 유일하고 명확한 목적은 **Lexical 에디터가 처음 렌더링될 때 자동으로 포커스를 맞춰주는 것**입니다. 사용자가 페이지에 진입했을 때 별도의 클릭 없이 바로 텍스트를 입력할 수 있도록 만들어 사용자 경험(UX)을 향상시킵니다.

## 2. 동작 원리 (Mechanism)

플러그인은 React의 `useEffect` 훅과 Lexical의 `editor.focus()` API를 조합하여 매우 효율적으로 동작합니다.

1.  **에디터 인스턴스 접근:** `useLexicalComposerContext()` 훅을 사용하여 현재 React 컴포넌트 트리에 있는 Lexical 에디터 인스턴스를 가져옵니다.

2.  **자동 포커스 실행:** `useEffect` 훅을 사용하여 컴포넌트가 마운트될 때, 그리고 `editor` 인스턴스나 `defaultSelection` prop이 변경될 때 내부 로직을 단 한 번 실행합니다.

3.  **`editor.focus()` API 호출:** `editor.focus()` API를 호출하여 에디터에 포커스를 맞춥니다. 이때, `defaultSelection` prop (`'rootStart'` 또는 `'rootEnd'`)을 전달하여 커서의 초기 위치를 지정할 수 있습니다.

## 3. 핵심적인 예외 처리 (Critical Edge-Case Handling)

이 플러그인의 가장 중요한 부분은 `editor.focus()`의 첫 번째 인자로 전달되는 콜백 함수에 구현된 예외 처리 로직입니다.

```typescript
editor.focus(() => {
    const activeElement = document.activeElement;
    const rootElement = editor.getRootElement() as HTMLDivElement;
    if (
        rootElement !== null &&
        (activeElement === null || !rootElement.contains(activeElement))
    ) {
        rootElement.focus({preventScroll: true});
    }
}, {defaultSelection});
```

### 문제 상황

Lexical의 `editor.focus()`는 내부적으로 selection(커서)을 설정하지만, 이 selection이 이미 원하는 위치에 있는 경우 등 특정 조건에서는 **실제 DOM 엘리먼트에 포커스를 다시 트리거하지 않을 수 있습니다.** 이로 인해 에디터 내부에 커서는 보이더라도 브라우저의 실제 포커스는 다른 곳에 있는 불일치 상태가 발생할 수 있습니다.

### 해결 방법

1.  `editor.focus()`가 실행된 직후, 콜백 함수 안에서 `document.activeElement`를 통해 현재 브라우저에서 **실제로 포커스된 DOM 엘리먼트**를 가져옵니다.
2.  `editor.getRootElement()`로 에디터의 최상위 `div`를 가져옵니다.
3.  현재 포커스된 엘리먼트가 에디터의 `div` 내부에 포함되어 있는지 확인합니다.
4.  만약 포커스가 에디터 외부에 있다면, `rootElement.focus({preventScroll: true});`를 호출하여 **네이티브 DOM API로 직접, 그리고 강제로 포커스를 한 번 더 실행**합니다. 이를 통해 포커스가 확실하게 에디터로 오도록 보장합니다.
5.  `{preventScroll: true}` 옵션은 포커스가 이동할 때 페이지가 해당 엘리먼트 위치로 스크롤되는 현상을 방지하여 부드러운 사용자 경험을 제공합니다.

## 4. Props

-   `defaultSelection?: 'rootStart' | 'rootEnd'`: (선택적) 플러그인이 처음 포커스를 줄 때, 텍스트 커서를 문서의 맨 앞에 둘지(`rootStart`), 맨 뒤에 둘지(`rootEnd`) 결정합니다.

## 5. 결론

`LexicalAutoFocusPlugin`은 단순한 자동 포커스 기능을 제공하는 것을 넘어, Lexical의 내부 동작과 실제 브라우저 DOM의 포커스 상태 사이의 불일치가 발생할 수 있는 엣지 케이스까지 고려하여 안정성을 높인 매우 잘 만들어진 플러그인입니다. 네이티브 DOM API를 적절히 활용하여 Lexical API만으로는 부족할 수 있는 부분을 보완하고, `preventScroll` 옵션으로 사용자 경험까지 세심하게 신경 쓴 점이 돋보입니다.
