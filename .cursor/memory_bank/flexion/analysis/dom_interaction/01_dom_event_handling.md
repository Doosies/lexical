# ===============================================
# Lexical DOM 이벤트 처리 심층 분석
# ===============================================
# 이 문서는 Lexical이 제어하는 실제 DOM 요소에 이벤트 리스너를 연결하여
# 커스텀 상호작용을 구현하는 세 가지 주요 방법을 심층적으로 분석합니다.
# 원본: packages/lexical-website/docs/concepts/dom-events.md
# ===============================================

## 1. DOM 이벤트 처리 개요

Lexical은 가상 상태 모델(`EditorState`)을 중심으로 동작하지만, 때로는 특정 노드에 연결된 실제 DOM 요소에 직접 이벤트 리스너(예: `click`, `mouseover`)를 추가해야 할 때가 있습니다. 예를 들어, 특정 노드를 클릭했을 때 팝업을 띄우거나, 마우스를 올렸을 때 툴팁을 보여주는 등의 풍부한 상호작용을 구현하는 경우가 해당됩니다.

Lexical은 이를 위해 3가지 주요 방법을 제공합니다.

---

## 2. 방법 1: 이벤트 위임 (Event Delegation)

가장 간단하고 효율적인 방법은, 에디터의 최상위 루트 요소(`contentEditable` div)에 단일 리스너를 설정하고, 이벤트 버블링을 통해 하위 요소들의 이벤트를 처리하는 **이벤트 위임** 패턴을 사용하는 것입니다.

`editor.registerRootListener`를 사용하여 구현할 수 있습니다.

-   **장점**: 각 노드마다 리스너를 붙일 필요가 없어 성능상 효율적입니다.
-   **단점**: 리스너 내부에서 `event.target`을 확인하여 어떤 종류의 DOM 노드에서 이벤트가 발생했는지 직접 필터링해야 하는 번거로움이 있을 수 있습니다.

```javascript
function myListener(event) {
    // 특정 클래스 이름을 가진 노드에서 발생한 클릭만 처리하고 싶을 경우
    if (event.target.className === 'my-custom-node-class') {
        alert('Custom Node Clicked!');
    }
}

const removeRootListener = editor.registerRootListener((rootElement, prevRootElement) => {
    // 이전 루트 요소에서는 리스너를 제거합니다.
    if (prevRootElement) {
        prevRootElement.removeEventListener('click', myListener);
    }
    // 현재 루트 요소에 리스너를 추가합니다.
    if (rootElement) {
        rootElement.addEventListener('click', myListener);
    }
});

// 컴포넌트 언마운트 시 리스너 정리
// removeRootListener();
```

---

## 3. 방법 2: 직접 핸들러 연결

특정 종류의 노드에만 리스너를 직접 연결하고 싶을 때 사용하는 방법입니다. `editor.registerMutationListener`를 사용하여, 특정 노드 타입(`nodeType`)이 생성(`created`)되거나 업데이트(`updated`)될 때마다 해당 DOM 요소에 직접 이벤트 핸들러를 붙입니다.

-   **장점**: 이벤트 핸들러 내부에서 대상을 필터링할 필요가 없어 코드가 간결해집니다.
-   **단점**: 많은 수의 노드에 리스너를 붙여야 할 경우, 이벤트 위임 방식보다 성능상 비효율적일 수 있습니다.

```javascript
// 이미 리스너가 등록된 요소를 추적하기 위한 WeakSet
const registeredElements = new WeakSet();

const removeMutationListener = editor.registerMutationListener(MyCustomNode, (mutations) => {
    editor.getEditorState().read(() => {
        for (const [key, mutation] of mutations) {
            const element = editor.getElementByKey(key);
            if (
                (mutation === 'created' || mutation === 'updated') &&
                element !== null &&
                !registeredElements.has(element)
            ) {
                registeredElements.add(element);
                element.addEventListener('click', (event) => {
                    alert('Custom Node Clicked!');
                });
            }
        }
    });
});

// 리스너 정리
// removeMutationListener();
```
> 이 방식에서는 Lexical이 노드를 제거할 때 DOM 요소도 함께 가비지 컬렉션되므로, 개별 리스너를 수동으로 제거하는 것에 대해 크게 걱정할 필요가 없습니다.

---

## 4. 방법 3: `NodeEventPlugin` 사용 (React 환경)

React 환경에서 개발하고 있다면, `@lexical/react` 패키지의 `NodeEventPlugin`을 사용하여 2번 방법을 훨씬 더 쉽게 구현할 수 있습니다.

이 플러그인은 내부적으로 `MutationListener` 로직을 캡슐화하여, 특정 노드 타입과 이벤트 타입에 대한 리스너를 선언적으로 연결할 수 있게 해줍니다.

```jsx
import { NodeEventPlugin } from '@lexical/react/LexicalNodeEventPlugin';

// ...

<LexicalComposer>
    {/* ... 다른 플러그인들 ... */}
    <NodeEventPlugin
        nodeType={LinkNode} // LinkNode에 대해서만
        eventType={'click'}   // 'click' 이벤트를
        eventListener={(event) => { // 이 리스너로 처리
            alert('Link Clicked!');
        }}
    />
</LexicalComposer>
```
이 방법은 React 개발자에게 가장 권장되는 방식입니다. 