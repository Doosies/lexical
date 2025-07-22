# Yjs를 이용한 협업 기능 구현 (Collaboration with Yjs)

이 문서는 `@lexical/react`와 `@lexical/yjs`를 사용하여 Lexical 에디터에 실시간 협업(Real-time Collaboration) 기능을 구현하는 방법에 대해 심층적으로 분석합니다.

## 1. 핵심 개념 및 의존성

- **Yjs**: CRDT(Conflict-free Replicated Data Type)를 구현한 라이브러리로, 여러 사용자가 동시에 문서를 편집할 때 발생하는 충돌을 자동으로 해결하여 데이터 정합성을 보장합니다. Lexical 협업 기능의 핵심 기반입니다.
- **`@lexical/yjs`**: Lexical의 `EditorState`를 Yjs의 공유 데이터 타입(Shared Data Types)과 바인딩하는 역할을 합니다.
- **`@lexical/react`의 협업 플러그인**:
  - `LexicalCollaborationPlugin`: React 환경에서 Yjs와의 연동을 간소화해주는 핵심 플러그인입니다.
  - `useCollaborationContext`: 협업 관련 컨텍스트(e.g., 사용자 정보, 연결 상태)에 접근할 수 있게 해주는 훅입니다.
- **Connection Provider**: Yjs 문서의 변경 사항을 여러 클라이언트 간에 동기화하기 위한 통신 채널입니다. 공식적으로는 `y-websocket`이 지원되지만, 다른 Provider(e.g., WebRTC)도 사용 가능합니다.

## 2. 설정 과정

### 단계 1: WebSocket 서버 실행

클라이언트들이 서로를 발견하고 Yjs 문서를 동기화할 수 있도록 `y-websocket` 서버를 실행해야 합니다.

```bash
HOST=localhost PORT=1234 npx y-websocket
```

### 단계 2: `LexicalCollaborationPlugin` 설정

`<LexicalComposer>` 내부에 `<LexicalCollaborationPlugin>`을 추가하고 필요한 속성을 설정합니다.

```jsx
import { CollaborationPlugin } from '@lexical/react/LexicalCollaborationPlugin';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

// ...

function Editor() {
  const initialConfig = {
    // 협업 모드에서는 초기 editorState를 반드시 null로 설정해야 합니다.
    // 이는 플러그인이 Yjs 문서로부터 상태를 받아와 초기화하도록 하기 위함입니다.
    editorState: null,
    // ... 기타 설정
  };

  // WebSocket Provider를 생성하는 팩토리 함수
  const providerFactory = useCallback(
    (id, yjsDocMap) => {
      const doc = getDocFromMap(id, yjsDocMap);
      return new WebsocketProvider(
        'ws://localhost:1234', // WebSocket 서버 주소
        id,                     // Room 이름
        doc                     // Y.Doc 인스턴스
      );
    },
    [],
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      {/* ... 다른 플러그인들 ... */}
      <CollaborationPlugin
        id="unique-document-id" // 협업 세션을 식별하는 고유 ID (Room 이름)
        providerFactory={providerFactory}
        shouldBootstrap={true} // Yjs 문서에 데이터가 없을 때 초기 상태를 생성할지 여부
        // initialEditorState={...} // shouldBootstrap이 true일 때 사용될 초기 상태
      />
    </LexicalComposer>
  );
}
```

## 3. 핵심 설정값의 의미

- **`editorState: null`**: `<LexicalComposer>`의 `initialConfig`에서 `editorState`를 `null`로 설정하는 것은 매우 중요합니다. 이는 Lexical이 자체적으로 초기 상태를 생성하는 것을 막고, `CollaborationPlugin`이 Yjs 서버로부터 받아온 공유 문서(`Y.Doc`)를 기반으로 에디터 상태를 설정하도록 강제하는 역할을 합니다.
- **`providerFactory`**: 각 문서 ID(`id`)에 맞는 `WebsocketProvider` 인스턴스를 생성하여 반환하는 함수입니다. 이를 통해 여러 문서를 동시에 협업 편집하는 시나리오를 지원할 수 있습니다.
- **`shouldBootstrap`**: `true`로 설정하면, Yjs 서버에 해당 문서(`id`)에 대한 데이터가 아직 없을 경우, 클라이언트 측에서 `initialEditorState`를 기반으로 초기 문서를 생성하여 서버에 전파합니다.

## 4. 중첩된 에디터에서의 협업

Lexical은 중첩된 에디터(Nested Editor) 구조를 지원하며, 각 중첩된 에디터에 대해 별도의 `CollaborationPlugin`을 사용하여 독립적인 협업 세션을 만들 수 있습니다. 이는 이미지 캡션, 주석(Comment) 등과 같이 문서의 일부 영역을 독립적으로 협업 편집해야 할 때 매우 유용합니다.
- **예시**: `ImageComponent` 내부에 `<LexicalNestedComposer>`와 `<CollaborationPlugin>`을 함께 사용하여 이미지 캡션에 대한 별도의 협업을 구현할 수 있습니다. 