# 폴더 구조 가이드

## 📁 전체 구조

```
nodes/
├── common/                    # 공통
│   └── CommonCommand.ts      # 공통 Command 타입
├── base/                     # 기본 타입 정의
│   └── types/
│       ├── FlexionNodeProps.ts
│       ├── FlexionNodeState.ts
│       └── FlexionNodeEventHandler.ts
├── [domain]/                 # 도메인별 Node (예: code, date, button)
│   ├── commands/             # Command 정의
│   │   ├── index.ts
│   │   ├── CHANGE_VALUE_COMMAND.ts
│   │   └── FOCUS_COMMAND.ts
│   ├── types/                # 타입 정의
│   │   ├── index.ts
│   │   ├── Flexion[Domain]NodeProps.ts
│   │   └── Flexion[Domain]NodeState.ts
│   ├── plugins/              # Plugin 구현
│   │   ├── index.ts
│   │   └── Flexion[Domain]Plugin.tsx
│   ├── Flexion[Domain]Node.tsx  # Node 클래스
│   └── index.ts              # 모듈 export
```

## 🎯 각 폴더의 역할

### `common/` - 공통 유틸리티
모든 Node에서 공통으로 사용되는 타입과 유틸리티를 정의합니다.

```typescript
// common/CommonCommand.ts
export type BaseNodePayload = {
    dataKey: string;
};

export type ValuePayload = BaseNodePayload & {
    value: string;
};
```

### `base/` - 기본 타입 정의
모든 Node의 기본이 되는 타입들을 정의합니다.

```typescript
// base/types/FlexionNodeProps.ts
export interface FlexionNodeProps<TDataType, TState extends FlexionNodeState> {
    value: TDataType;
    readonly state: TState;
}

// base/types/FlexionNodeState.ts
export interface FlexionNodeState {}

// base/types/FlexionNodeEventHandler.ts
export interface FlexionNodeEventHandler {
    onClick: (event: React.MouseEvent<HTMLElement>) => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
}
```

### `[domain]/` - 도메인별 Node 구현

#### `commands/` - Command 정의
각 Command를 개별 파일로 분리하여 관리합니다.

```typescript
// commands/CHANGE_VALUE_COMMAND.ts
import {createCommand} from 'flexion';
import {ValuePayload} from '../../common/CommonCommand';

export type ChangeValuePayload = ValuePayload;

export const CHANGE_VALUE_COMMAND = createCommand<ChangeValuePayload>(
    'CHANGE_VALUE_COMMAND',
);

// commands/index.ts
export * from './CHANGE_VALUE_COMMAND';
export * from './FOCUS_COMMAND';
```

#### `types/` - 타입 정의
도메인별 Node 타입을 정의합니다. 

```typescript
// types/FlexionCodeNodeProps.ts
export interface IFlexionCodeNodeProps {
    hide_code?: boolean;
    fn?: any;
    display_name?: string;
    data?: any;
    // ... 이벤트 핸들러들
    onChangeCode: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlurCode: (event: React.FocusEvent<HTMLInputElement>) => void;
    // ...
}

// types/FlexionCodeNodeState.ts
export interface IFlexionCodeNodeState {
    hide_code?: boolean;
    fn?: any;
    display_name?: string;
    // ...
}
```

#### `plugins/` - Plugin 구현
비즈니스 로직을 처리하는 Plugin을 구현합니다.

```typescript
// plugins/FlexionCodePlugin.tsx
export const FlexionCodePlugin = memo(function FlexionCodePlugin({
    dataModelService,
    userActionService,
}: IProps): JSX.Element | null {
    // Command 등록 및 비즈니스 로직 처리
});
```

## 🔄 실제 예시: Code Node

```typescript
// code/FlexionCodeNode.tsx
import {ICodeNodeData, ICodeNodeState} from '../../abstraction/state/code';
import {CHANGE_CODE_VALUE_COMMAND} from './commands';
import {ECCode} from 'FlexionReact';

export class FlexionCodeNode extends FlexionDecoratorNode<
    ICodeNodeData,
    ICodeNodeState,
    React.ReactElement
> {
    onChangeCode = (event: React.ChangeEvent<HTMLInputElement>): void => {
        this.dispatchCommand(CHANGE_CODE_VALUE_COMMAND, {
            dataKey: this.getDataKey(),
            value: event.target.value,
        });
    };
}
```

## 📋 폴더 생성 규칙

1. **도메인 폴더명**: 소문자, 의미있는 이름 (예: `code`, `date`, `button`)
2. **파일명**: PascalCase (예: `FlexionCodeNode.tsx`)
3. **Command 파일명**: UPPER_SNAKE_CASE (예: `CHANGE_VALUE_COMMAND.ts`)
4. **타입 파일명**: PascalCase (예: `FlexionCodeNodeProps.ts`)
5. **Plugin 파일명**: PascalCase + Plugin (예: `FlexionCodePlugin.tsx`)
