# 플러그인 제작 실전 가이드

**문서 상태**: `v1.0`

> (플러그인의 기본 동작 원리는 [분석 - 플러그인 아키텍처와 상호작용 메커니즘](../analysis/plugin_and_command_system_analysis.md) 문서를 참고하세요.)

이 문서는 Lexical의 강력한 플러그인 시스템을 활용하여 실제 커스텀 플러그인을 만드는 방법을 단계별로 안내하는 실용적인 가이드입니다. Vanilla JS와 React 환경 각각의 제작 방법과 모범 사례를 다룹니다.

---

## 1. 플러그인 기본 구조

모든 플러그인은 `LexicalEditor` 인스턴스를 받아 특정 기능을 등록하고, 필요 시 리스너를 해제하는 함수를 반환하는 형태를 가집니다.

- **Vanilla JS (프레임워크 비의존적)**: 플러그인은 editor를 인자로 받는 함수입니다. 리스너 해제 함수를 반환하여 메모리 누수를 방지합니다.
- **React**: `useEffect` 훅을 사용하여 컴포넌트 생명주기에 맞춰 플러그인을 등록하고 해제하는 것이 일반적입니다.

---

## 2. 핵심 상호작용: 커맨드와 이벤트 리스너

플러그인은 주로 **커맨드(Commands)**와 **이벤트 리스너(Event Listeners)**를 통해 에디터 및 다른 플러그인과 상호작용합니다.

-   **커맨드 시스템**: `dispatchCommand`와 `registerCommand`를 사용하여 플러그인 간의 명시적인 통신 채널을 만듭니다. 이는 특정 동작(예: '굵게' 토글)을 요청하고, 다른 플러그인이 이를 처리하도록 하는 표준적인 방법입니다. 특히 **커맨드 우선순위**와 **전파 제어**는 복잡한 상호작용을 관리하는 핵심 기능입니다.
    -   **자세한 내용**: [커맨드 시스템 심층 분석](../analysis/command_system/01_command_system_overview.md) 문서를 참고하세요.
-   **업데이트 태그 (`Update Tags`)**: 모든 업데이트는 '태그'를 가질 수 있습니다. 이 태그를 통해 `HistoryPlugin`이나 `CollaborationPlugin` 같은 다른 플러그인들에게 해당 업데이트의 의도(예: "이것은 붙여넣기 작업임")를 알리거나, 특정 동작(예: "히스토리에 기록하지 말 것")을 지시할 수 있습니다. 이는 플러그인 간의 상호작용을 더욱 정교하게 만드는 강력한 메커니즘입니다.
    -   **자세한 내용**: [업데이트 태그(Update Tags) 심층 분석](../analysis/update_mechanism/04_update_tags.md) 문서를 참고하세요.
-   **업데이트 리스너 (`registerUpdateListener`)**: 모든 상태 변경이 DOM에 반영된 **후에** 호출됩니다. 최종 상태를 외부 UI(예: 툴바 버튼 활성화)에 반영하거나, 변경 로그를 서버로 전송하는 등의 후속 처리에 이상적입니다.
    -   **자세한 내용**: [EditorState 심층 분석](../analysis/update_mechanism/01_editor_state.md#4-상태-변경-감지-registerupdatelistener) 문서를 참고하세요.
-   **DOM 이벤트 처리**: `registerRootListener`나 `registerMutationListener`를 사용하여 Lexical이 제어하는 실제 DOM 요소에 직접 이벤트 리스너를 추가할 수 있습니다. 이를 통해 노드 클릭 시 팝업을 띄우는 등 풍부한 상호작용을 구현할 수 있습니다.
    -   **자세한 내용**: [DOM 이벤트 처리 심층 분석](../analysis/dom_interaction/01_dom_event_handling.md) 문서를 참고하세요.
-   **노드 변환 (`registerNodeTransform`)**: 특정 `LexicalNode`가 변경되었을 때 실행되는 가장 효율적인 변환 로직입니다. 자동 링크 변환, 이모지 변환 등 특정 노드의 상태나 내용에 따라 다른 노드로 교체하는 등의 작업에 사용됩니다.
-   **선택 관리**: 사용자의 선택(Caret, 범위 선택 등)은 플러그인 로직의 핵심적인 부분입니다. `$getSelection`으로 현재 선택 정보를 가져오고, 필요 시 프로그래밍 방식으로 선택을 조작할 수 있습니다. 특히, 의도치 않은 포커스 이동을 방지하는 기법은 반드시 숙지해야 합니다.
    -   **자세한 내용**: [Selection 및 포커스 관리 심층 분석](../analysis/selection/01_selection_and_focus_management.md) 문서를 참고하세요.
-   **히스토리 관리 (`HistoryPlugin`)**: Lexical의 Undo/Redo 기능은 `HistoryPlugin`을 통해 제공됩니다. 이 플러그인은 연속된 타이핑을 하나의 단위로 묶는 등(Undo Coalescing) 복잡한 로직을 내부적으로 처리합니다.
    -   **자세한 내용**: [History 및 Undo 병합(Coalescing) 심층 분석](../analysis/history/01_history_and_undo_coalescing.md) 문서를 참고하세요.

---

## 1. Vanilla JS 기반 플러그인

Vanilla JS 환경에서 플러그인은 `LexicalEditor` 인스턴스를 인자로 받아 `cleanup` 함수를 반환하는 단순한 함수입니다. 제작 과정은 크게 3단계로 나눌 수 있습니다.

**1단계: 커스텀 노드 정의하기**
- 플러그인이 새로운 종류의 콘텐츠를 다룬다면, 먼저 그에 맞는 커스텀 노드를 정의합니다. (`TextNode`, `ElementNode` 등 상속)
- `getType()`, `clone()`, `createDOM()`, `exportJSON()`, `importJSON()` 등 필수 메서드를 구현합니다.

**2단계: 핵심 로직 구현하기 (e.g., Node Transform)**
- 플러그인의 실제 기능을 `editor.registerNodeTransform()` 이나 `editor.registerCommand()` 등을 사용하여 구현합니다.
- 예를 들어, 이모지 자동 변환 플러그인은 `registerNodeTransform`을 사용해 `TextNode`를 감지하고, 특정 텍스트를 `EmojiNode`로 교체합니다.

**3단계: 에디터에 등록하고 통합하기**
1.  **노드 등록**: `createEditor`의 `initialConfig` 객체 안 `nodes` 배열에 커스텀 노드 클래스를 추가합니다.
2.  **플러그인 활성화**: 플러그인 부트스트랩 함수(e.g., `registerEmoji(editor)`)를 에디터 초기화 후에 호출합니다. 여러 플러그인을 등록할 때는 `@lexical/utils`의 `mergeRegister`를 사용하여 `cleanup` 함수들을 관리합니다.

---

## 2. React 기반 플러그인

React 환경에서 플러그인은 **`<LexicalComposer>`의 자식으로 렌더링되는 React 컴포넌트**입니다. `useEffect`와 훅을 사용하여 더 선언적으로 플러그인을 관리할 수 있습니다.

**1단계: 커스텀 노드 정의하기**
- Vanilla JS와 동일하게, 필요한 커스텀 노드를 먼저 정의합니다.

**2단계: React 컴포넌트로 플러그인 구현하기**
- **에디터 접근**: `const [editor] = useLexicalComposerContext()` 훅을 사용하여 컨텍스트로부터 에디터 인스턴스를 가져옵니다.
- **로직 등록 및 클린업**: `useEffect` 훅 내부에서 에디터 인스턴스를 사용하여 커맨드나 리스너를 등록하고, `useEffect`의 반환(cleanup) 함수에서 등록 해제 로직을 실행하여 메모리 누수를 방지합니다.

```tsx
// 예시: TwitterPlugin.tsx
import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/useLexicalComposerContext';
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
// ...

export default function TwitterPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // 커스텀 노드가 등록되었는지 확인하는 방어 코드
    if (!editor.hasNodes([TweetNode])) {
      throw new Error('TwitterPlugin: TweetNode not registered on editor');
    }

    // INSERT_TWEET_COMMAND 커맨드 리스너 등록
    const unregister = editor.registerCommand<string>(
      INSERT_TWEET_COMMAND,
      (payload) => {
        const tweetNode = $createTweetNode(payload);
        $insertNodeToNearestRoot(tweetNode);
        return true; // 이벤트 전파 중단
      },
      COMMAND_PRIORITY_EDITOR,
    );
    
    // 컴포넌트 언마운트 시 자동 클린업
    return () => {
      unregister();
    };
  }, [editor]);

  return null; // 이 플러그인은 UI를 렌더링하지 않음
}
```

**3단계: 에디터에 등록하고 통합하기**
1.  **노드 등록**: `LexicalComposer`의 `initialConfig` prop 안 `nodes` 배열에 커스텀 노드 클래스를 추가합니다.
2.  **플러그인 활성화**: 생성한 플러그인 컴포넌트(e.g., `<TwitterPlugin />`)를 `<LexicalComposer>`의 자식으로 렌더링합니다.

```tsx
<LexicalComposer initialConfig={{ nodes: [TweetNode, ...] }}>
  {/* ... 다른 플러그인들 */}
  <TwitterPlugin />
</LexicalComposer>
``` 

---

## 3. 상태 저장 예시 (`LexicalOnChangePlugin`)

React 환경에서는 에디터의 상태가 변경될 때마다 이를 감지하여 데이터베이스에 저장하거나 다른 UI와 동기화해야 하는 경우가 많습니다. 이때 `LexicalOnChangePlugin`을 사용하면 매우 편리합니다.

이 플러그인은 에디터 상태가 변경될 때마다 `onChange` 콜백 함수를 실행하여 최신 `editorState`를 인자로 전달합니다.

```jsx
import { useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';

function Editor() {
  const [editorState, setEditorState] = useState();

  function onChange(editorState) {
    // editorState를 직렬화하여 저장할 수 있습니다.
    const editorStateJSON = editorState.toJSON();
    setEditorState(JSON.stringify(editorStateJSON));
  }
  
  const initialConfig = { /* ... */ };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      {/* ... 다른 플러그인들 ... */}
      <RichTextPlugin
        contentEditable={<ContentEditable />}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <OnChangePlugin onChange={onChange} />
    </LexicalComposer>
  );
}
```

위 예제처럼 `OnChangePlugin`을 사용하면, 에디터의 상태를 React의 `state`로 쉽게 가져올 수 있으며, 이를 서버로 전송하거나 다른 컴포넌트에 전달하는 등의 후속 작업을 수행할 수 있습니다. 중요한 점은, **Lexical은 일반적으로 제어되지 않는(uncontrolled) 컴포넌트로 사용하도록 설계되었다는 것**입니다. 따라서 `editorState`를 다시 에디터에 주입하려 시도하는 것은 피해야 합니다.

---

## 4. 노드 변환(Node Transform) 모범 사례

`editor.registerNodeTransform`은 플러그인의 핵심 로직을 구현하는 강력한 도구이지만, 잘못 사용하면 무한 루프나 예기치 않은 동작을 유발할 수 있습니다. 아래는 Transform을 올바르게 사용하기 위한 몇 가지 핵심 원칙입니다.

### 4.1. 무한 루프 방지를 위한 전제조건 (Preconditions)

Transform은 대상 노드가 'dirty' 상태일 때마다 실행됩니다. 따라서 Transform 함수 내부에서 상태를 변경한 후, 다음 실행에서는 더 이상 변경이 일어나지 않도록 막는 '전제조건' 검사가 반드시 필요합니다.

```javascript
// 나쁜 예: 조건 없이 실행하면 무한 루프 발생 가능
editor.registerNodeTransform(TextNode, textNode => {
  // 'dirty' 상태일 때마다 계속 'bold'를 토글하려고 시도
  textNode.toggleFormat('bold'); 
});

// 좋은 예: 현재 상태를 확인하는 전제조건 추가
editor.registerNodeTransform(TextNode, textNode => {
  // 'bold' 포맷이 없을 때만 실행
  if (!textNode.hasFormat('bold')) {
    textNode.toggleFormat('bold');
  }
});
```

### 4.2. 부모 노드의 변환 트리거

일반적으로 Transform은 해당 타입의 노드가 직접 'dirty' 상태가 되었을 때 실행됩니다. 하지만 아래와 같은 경우, 자식 노드의 변경으로 인해 부모 `ElementNode`가 'dirty' 상태가 되어 부모 노드의 Transform이 실행될 수 있습니다.

-   `elementNode.append(newNode)`: 자식 노드를 추가할 때
-   자식 노드를 삭제할 때
-   `node.replace(newNode)`: 노드를 교체할 때

```javascript
editor.registerNodeTransform(ParagraphNode, paragraphNode => {
 // 이 Transform은 아래 update 코드에 의해 실행됩니다.
});

editor.update(() => {
  const paragraph = $getRoot().getFirstChild();
  // ParagraphNode에 자식을 추가하면, 해당 ParagraphNode가 'dirty' 상태가 됩니다.
  paragraph.append($createTextNode('foo'));
});
```

### 4.3. 텍스트 기반 노드 생성을 위한 유틸리티

해시태그(` #lexical`)나 멘션(`@유저`)처럼, 특정 텍스트 패턴을 감지하여 노드로 변환하는 로직은 매우 흔합니다. 이를 위해 직접 `TextNode`에 대한 Transform을 작성할 수도 있지만, Lexical은 이 패턴을 위해 특별히 설계된 `registerLexicalTextEntity`라는 유용한 유틸리티 함수를 제공합니다.

이 함수는 매치(match) 로직, 타겟 노드 타입, 생성 함수를 인자로 받아 내부적으로 최적화된 Transform을 등록해주므로, 보일러플레이트 코드를 줄이고 가독성을 높일 수 있습니다. 