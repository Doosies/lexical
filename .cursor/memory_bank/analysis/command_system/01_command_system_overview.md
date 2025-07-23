# ===============================================
# Lexical 커맨드 시스템 심층 분석
# ===============================================
# 이 문서는 Lexical의 커맨드 시스템의 핵심 개념, API, 그리고 모범 사례를 분석합니다.
# 원본: packages/lexical-website/docs/concepts/commands.md
# ===============================================

## 1. 커맨드(Command) 시스템 개요

커맨드는 Lexical의 매우 강력한 기능으로, `KEY_ENTER_COMMAND`나 `KEY_TAB_COMMAND`와 같은 특정 이벤트에 대한 리스너를 등록하고, 플러그인이나 노드의 종류와 같은 **문맥에 따라** 원하는 방식으로 반응할 수 있게 해줍니다.

이 패턴은 복잡한 플러그인(예: 툴바, 테이블 플러그인)을 개발할 때 특히 유용합니다. 테이블 플러그인은 키보드 이벤트나 선택(selection) 상태에 따라 특별한 처리가 필요한데, 커맨드 시스템을 통해 이러한 로직을 효과적으로 분리하고 관리할 수 있습니다.

커맨드 시스템의 핵심적인 특징은 **우선순위(Priority)**와 **전파 제어(Propagation Control)**입니다. 리스너를 등록할 때 우선순위를 지정할 수 있으며, 리스너 함수가 `true`를 반환하면 해당 커맨드가 "처리되었음(handled)"으로 표시되어 다른 리스너로의 이벤트 전파가 중단됩니다. 만약 특정 커맨드를 직접 처리하지 않으면, 일반적으로 `RichTextPlugin`이나 `PlainTextPlugin`에 의해 기본 동작이 수행됩니다.

---

## 2. 핵심 API

### 2.1. `createCommand()`

Lexical은 다양한 기본 커맨드를 제공하지만(`LexicalCommands.ts` 참조), 자신만의 커스텀 커맨드가 필요할 경우 `createCommand()` 함수를 사용하여 타입이 지정된 새로운 커맨드를 만들 수 있습니다.

```javascript
import { createCommand, LexicalCommand } from 'lexical';

// payload가 string 타입인 커맨드 생성
const HELLO_WORLD_COMMAND: LexicalCommand<string> = createCommand();
```

### 2.2. `editor.dispatchCommand()`

커맨드는 `editor` 객체에 접근할 수 있는 곳이라면 어디서든 발생(dispatch)시킬 수 있습니다. (예: 툴바 버튼, 이벤트 리스너, 다른 플러그인 내부)

`dispatchCommand`가 `editor.update()` 외부에서 호출되면, 내부적으로 `editor.update()`를 호출하여 등록된 커맨드 리스너들을 트리거합니다. 따라서 커맨드를 디스패치하기 위해 별도로 `update`로 감싸줄 필요가 없습니다.

```javascript
// 'Hello World!'라는 payload와 함께 커맨드를 발생시킴
editor.dispatchCommand(HELLO_WORLD_COMMAND, 'Hello World!');

// 다른 예시 (core)
editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
```

### 2.3. `editor.registerCommand()`

`registerCommand`를 사용하여 특정 커맨드가 발생했을 때 실행될 리스너 함수를 등록합니다. 이 함수는 항상 `editor.update` 컨텍스트 내에서 호출되므로, `$getNodeByKey`와 같은 달러(`$`) 함수들을 자유롭게 사용할 수 있습니다.

**주의**: 커맨드 리스너 내에서 동기적으로 `editor.update()`나 `editor.read()`를 호출해서는 안 됩니다.

```javascript
const removeListener = editor.registerCommand(
  HELLO_WORLD_COMMAND,
  (payload: string) => {
    // payload는 dispatch 시 전달된 값입니다.
    console.log(payload); // "Hello World!"

    // `true`를 반환하면 이벤트 전파가 여기서 중단됩니다.
    // `false`를 반환하면 더 낮은 우선순위의 다른 리스너로 전파됩니다.
    return false;
  },
  COMMAND_PRIORITY_LOW, // 우선순위 설정
);

// 리스너가 더 이상 필요 없을 때 반드시 정리해야 합니다.
removeListener();
```

---

## 3. 우선순위(Priority)와 전파 제어(Propagation Control)

커맨드 시스템의 가장 강력한 특징 중 하나는 리스너의 실행 순서를 제어할 수 있다는 점입니다. `registerCommand`의 세 번째 인자로 우선순위를 전달하며, 우선순위가 높은 리스너가 먼저 실행됩니다.

- `COMMAND_PRIORITY_CRITICAL` (0): 가장 높음
- `COMMAND_PRIORITY_HIGH` (1)
- `COMMAND_PRIORITY_NORMAL` (2)
- `COMMAND_PRIORITY_LOW` (3)
- `COMMAND_PRIORITY_EDITOR` (4): 가장 낮음. Lexical 내부 핵심 로직에 사용됨.

어떤 리스너가 `true`를 반환하면, 해당 커맨드는 '처리된(handled)' 것으로 간주되고, 그보다 낮은 우선순위를 가진 리스너들은 더 이상 호출되지 않습니다.

#### 예시: Tab 키 처리

`KEY_TAB_COMMAND`는 여러 플러그인에서 사용되는 좋은 예시입니다.

1.  **TablePlugin (`PRIORITY_CRITICAL`)**: 만약 현재 선택 영역이 테이블 내부에 있다면, Tab 키는 다음 셀로 포커스를 이동시켜야 합니다. 이 동작은 다른 어떤 Tab 동작보다 우선되어야 하므로 가장 높은 우선순위로 등록됩니다. 이 리스너는 테이블 내에서 Tab이 눌렸을 때 `true`를 반환하여, 다른 리스너(들여쓰기 등)가 실행되는 것을 막습니다.
2.  **TabIndentationPlugin (`PRIORITY_EDITOR`)**: 테이블 내부가 아니라면, Tab 키는 보통 들여쓰기(indent) 또는 내어쓰기(outdent)를 수행합니다. 이 플러그인은 낮은 우선순위로 등록되어, 테이블과 같은 특수한 컨텍스트가 아닐 때만 동작합니다.

```javascript
// TabIndentationPlugin의 예시
editor.registerCommand(
  KEY_TAB_COMMAND,
  (event: KeyboardEvent) => {
    // 기본 동작(포커스 이동 등)을 막고,
    event.preventDefault();
    // 다른 커맨드를 발생시킴
    const command = event.shiftKey ? OUTDENT_CONTENT_COMMAND : INDENT_CONTENT_COMMAND;
    editor.dispatchCommand(command, undefined);
    // 이 리스너가 Tab 이벤트를 처리했으므로 true를 반환하여 전파를 중단
    return true;
  },
  COMMAND_PRIORITY_EDITOR,
);
```

이러한 우선순위 기반의 전파 제어 메커니즘 덕분에, 각 플러그인은 자신의 컨텍스트에만 집중하여 로직을 구현할 수 있으며, 전체 시스템은 예측 가능하게 동작합니다.

---

## 4. 모범 사례: React `useEffect` 활용

React 환경에서는 `useEffect`를 사용하여 컴포넌트가 마운트될 때 커맨드 리스너를 등록하고, 언마운트될 때 정리(clean up)하는 것이 일반적인 패턴입니다. 이렇게 하면 메모리 누수를 방지하고 컴포넌트의 생명주기와 리스너의 생명주기를 일치시킬 수 있습니다.

```jsx
import { useEffect } from 'react';

// ... 컴포넌트 내부

useEffect(() => {
  // 컴포넌트 마운트 시 리스너 등록
  const removeListener = editor.registerCommand(
    MY_CUSTOM_COMMAND,
    (payload) => {
      // 로직 처리...
      return true; // 처리 완료
    },
    COMMAND_PRIORITY_NORMAL,
  );

  // 컴포넌트 언마운트 시 리스너 자동 해제
  return () => {
    removeListener();
  };
}, [editor]); // editor 객체가 변경될 때마다 이 effect를 다시 실행
``` 