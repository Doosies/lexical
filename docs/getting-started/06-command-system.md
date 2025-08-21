# Command 시스템 가이드

> 📖 **시작하기 전에**: [Flexion 3계층 아키텍처 개요](./02-architecture-overview.md)를 먼저 읽어보세요.

## 📋 개요

Command 시스템은 Flexion 3계층 아키텍처의 **이벤트 처리**와 **상호작용**을 담당하는 핵심 메커니즘입니다. 모든 사용자 상호작용은 Command로 변환되어 처리되며, 이를 통해 Node와 Plugin 간의 느슨한 결합을 달성합니다.

## 🔧 Command 정의

### 1. 기본 Command 구조

```typescript
// commands/CHANGE_CODE_VALUE_COMMAND.ts
import {createCommand} from 'flexion';
import {ValuePayload} from '../../common/CommonCommand';

export type ChangeCodeValuePayload = ValuePayload;

export const CHANGE_CODE_VALUE_COMMAND = createCommand<ChangeCodeValuePayload>(
    'CHANGE_CODE_VALUE_COMMAND',
);
```

### 2. 공통 Payload 타입

```typescript
// common/CommonCommand.ts
export type BaseNodePayload = {
    dataKey: string;
};

export type ValuePayload = BaseNodePayload & {
    value: string;
};
```

## 🎯 Command 네이밍 규칙

### 1. 기본 네이밍 패턴

일관성 있는 Command 네이밍을 위한 권장 패턴입니다:

```
[EVENT]_[TARGET]_COMMAND
```

**예시**:
- `CHANGE_CODE_VALUE_COMMAND` - 코드 값 변경
- `FOCUS_VALUE_COMMAND` - 값 포커스

### 2. 이벤트 타입 가이드라인

| 이벤트 | 의미 | 예시 |
|------|------|------|
| `CHANGE` | 값 변경 | `CHANGE_CODE_VALUE_COMMAND` |
| `FOCUS` | 포커스 | `FOCUS_VALUE_COMMAND` |


## 🔄 Command Dispatch

### 1. Node에서 Command Dispatch

```typescript
// FlexionCodeNode.ts
export class FlexionCodeNode extends FlexionDecoratorNode<
    ICodeNodeData,
    ICodeNodeState,
    React.ReactElement
> {
    // 이벤트 핸들러에서 Command Dispatch
    onChangeCode = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = event.target;
        this.dispatchCommand(CHANGE_CODE_VALUE_COMMAND, {
            dataKey: this.getDataKey(),
            value,
        });
    };
}
```

### 2. Plugin에서 Command 처리

```typescript
// FlexionCodePlugin.tsx
export const FlexionCodePlugin = memo(function FlexionCodePlugin({
    dataModelService,
    userActionService,
}: IProps): JSX.Element | null {
    const [editor] = useFlexionComposerContext();

    // Command 등록
    useEffect(() => {
        return editor.registerCommand(
            CHANGE_CODE_VALUE_COMMAND,
            (payload: ChangeCodeValuePayload) => {
                const {dataKey, value} = payload;
                const node = $getNodeByDataKey(dataKey);
                if (node) {
                    node.$setState({code: value});
                }
                return false;
            },
            COMMAND_PRIORITY_EDITOR,
        );
    }, [editor]);

    return null;
});
```

## 📝 사용 예시

### 1. 간단한 값 변경 Command

```typescript
// 1. Command 정의
export const UPDATE_NAME_COMMAND = createCommand<ValuePayload>('UPDATE_NAME_COMMAND');

// 2. Node에서 Dispatch
this.dispatchCommand(UPDATE_NAME_COMMAND, {
    dataKey: this.getDataKey(),
    value: newName,
});

// 3. Plugin에서 처리
editor.registerCommand(UPDATE_NAME_COMMAND, (payload) => {
    const node = $getNodeByDataKey(payload.dataKey);
    if (node) {
        node.$setState({name: payload.value});
    }
    return false;
}, COMMAND_PRIORITY_EDITOR);
```

## 🔗 관련 문서

- [Node 개발 가이드](./04-node-development.md) - Node에서 Command Dispatch 방법
- [Plugin 개발 가이드](./07-plugin-development.md) - Plugin에서 Command 처리 방법
- [Component 개발 가이드](./05-component-development.md) - Component에서 이벤트 발생 방법
