# Vanilla JS 설정 예시 (Vanilla JS Setup Example)

이 문서는 React와 같은 외부 프레임워크 없이, 순수 JavaScript 환경에서 Lexical을 설정하고 사용하는 핵심적인 단계를 정리합니다.

## 1. 에디터 인스턴스 생성

`lexical` 패키지의 `createEditor` 함수를 사용하여 에디터 인스턴스를 생성합니다. `namespace`, `theme`, `onError` 핸들러 등을 포함하는 설정 객체를 전달할 수 있습니다.

```javascript
import { createEditor } from 'lexical';

const config = {
  namespace: 'MyEditor',
  theme: {
    // ... 테마 설정 ...
  },
  onError: console.error,
};

const editor = createEditor(config);
```

## 2. DOM 요소와 연결

생성된 에디터 인스턴스를 실제 웹 페이지의 `contenteditable` 속성을 가진 DOM 요소와 연결합니다.

```javascript
const contentEditableElement = document.getElementById('editor');
editor.setRootElement(contentEditableElement);
```

`setRootElement(null)`을 호출하여 연결을 해제할 수도 있습니다.

## 3. 상태 업데이트

Lexical의 상태 변경은 반드시 `editor.update()` 메서드 내에서 이루어져야 합니다. 이 메서드는 클로저(closure)를 인자로 받으며, 이 클로저 내에서만 `$getRoot`, `$getSelection`과 같이 `$` 접두사가 붙은 특별한 헬퍼 함수들을 사용할 수 있습니다.

```javascript
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';

editor.update(() => {
  // 에디터의 최상위 노드를 가져옵니다.
  const root = $getRoot();

  // 새로운 ParagraphNode와 TextNode를 생성합니다.
  const paragraphNode = $createParagraphNode();
  const textNode = $createTextNode('Hello, Vanilla JS!');

  // 노드를 서로 연결하고, 최종적으로 root에 추가합니다.
  paragraphNode.append(textNode);
  root.append(paragraphNode);
});
```

## 4. 상태 변경 감지

`editor.registerUpdateListener`를 사용하여 `EditorState`가 변경될 때마다 특정 로직을 실행할 수 있습니다. 이 리스너는 변경된 `editorState`를 인자로 받습니다.

```javascript
editor.registerUpdateListener(({ editorState }) => {
  // 최신 EditorState에 접근할 수 있습니다.
  editorState.read(() => {
    // .read() 클로저 내에서 $ 헬퍼 함수를 사용하여
    // 상태를 안전하게 읽을 수 있습니다.
    console.log('Editor state has been updated.');
  });
});
```

## 5. 사용자 입력 처리 (중요)

**Lexical 코어(`lexical` 패키지)는 사용자 입력(키보드, 마우스 등)을 직접 감지하고 처리하지 않습니다.** 이는 의도된 설계로, Lexical을 특정 플랫폼이나 프레임워크로부터 독립적으로 만듭니다.

따라서 텍스트 입력, 포맷팅, 단축키 등의 기능을 구현하려면, 개발자가 직접 `registerCommand` 등을 사용하여 각 이벤트에 대한 커맨드 리스너를 등록하고, 그 콜백 함수 내에서 `editor.update()`를 호출하여 상태를 변경해야 합니다.

`@lexical/plain-text`나 `@lexical/rich-text`와 같은 헬퍼 패키지들은 이러한 기본적인 커맨드 리스너들을 미리 구현하여 제공함으로써 개발 편의성을 높여줍니다. 