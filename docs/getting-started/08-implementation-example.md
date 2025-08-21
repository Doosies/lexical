# 실제 구현 예시: ECCode

> 📖 **시작하기 전에**: [Flexion 3계층 아키텍처 개요](./02-architecture-overview.md)를 먼저 읽어보세요.

## 📋 개요

이 문서는 ECCode를 예시로 사용하여 Flexion Node의 완전한 구현 과정을 단계별로 보여줍니다. 실제 프로젝트에서 사용되는 패턴과 구조를 반영하여 작성되었습니다.

## 🔧 1단계: 타입 정의

### 1.1 데이터 타입 정의

```typescript
// types/FlexionCodeNodeState.ts
export type ICodeNodeData = {
    code: string;
    name: string;
    sid: string;
};

// types/FlexionCodeNodeState.ts
export interface ICodeNodeState extends INodeState {
    display_name: string;
    hide_code: boolean;
    writable: {
        code: boolean;
        name: boolean;
    };
    search_keyword: ICodeNodeData;
}
```

### 1.2 Props 타입 정의

```typescript
// types/FlexionCodeNodeProps.ts
export interface IFlexionCodeNodeProps {
    hide_code?: boolean;
    display_name?: string;
    writable?: {
        code: boolean;
        name: boolean;
    };
    
    // 이벤트 핸들러들
    onChangeCode: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus: (event: React.FocusEvent<HTMLInputElement>) => void;
}
```

## 🔧 2단계: Command 정의

### 2.1 Command 생성

```typescript
// commands/CHANGE_CODE_VALUE_COMMAND.ts
import {createCommand} from 'flexion';
import {ValuePayload} from '../../common/CommonCommand';

export type ChangeCodeValuePayload = ValuePayload;

export const CHANGE_CODE_VALUE_COMMAND = createCommand<ChangeCodeValuePayload>(
    'CHANGE_CODE_VALUE_COMMAND',
);
```

## 🔧 3단계: Node 구현

### 3.1 Node 클래스

```typescript
// FlexionCodeNode.tsx
import {FlexionDecoratorNode} from 'flexion';
import React from 'react';

import {ICodeNodeData} from './types/ICodeNodeData';
import {ICodeNodeState} from './types/FlexionCodeNodeState';
import {CHANGE_CODE_VALUE_COMMAND} from './commands';
import {ECCode} from 'FlexionReact';

export class FlexionCodeNode extends FlexionDecoratorNode<
    ICodeNodeData,
    ICodeNodeState,
    React.ReactElement
> {
    protected $getConfig() {
        return {type: 'code'};
    }

    createDOM() {
        return document.createElement('span');
    }

    decorate(): JSX.Element {
        const state = this.$getState();
        const data = this.$getData();

        return (
            <ECCode
                hide_code={state?.hide_code ?? false}
                display_name={state?.display_name ?? ''}
                data={data}
                onChangeCode={this.onChangeCode}
                onFocus={this.onFocus}
            />
        );
    }

    onChangeCode = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = event.target;
        this.dispatchCommand(CHANGE_CODE_VALUE_COMMAND, {
            dataKey: this.getDataKey(),
            value,
        });
    };

    onFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        this.dispatchCommand(FOCUS_VALUE_COMMAND, {
            dataKey: this.getDataKey(),
        });
    };
}
```

## 🔧 4단계: Component 구현


```typescript
// ECCode.tsx
import {memo} from 'react';
import {Button, Input} from 'uikit';
import {IFlexionCodeNodeProps} from '../code/types/FlexionCodeNodeProps';


export const ECCode = memo(function ECCode(props: IFlexionCodeNodeProps) {
    const {
        hide_code,
        display_name,
        writable,
        onChangeCode,
        onFocus,
    } = props;

    return (
        <div>
            {!hide_code && (
                <Input
                    placeholder={display_name}
                    disabled={!writable?.code}
                    onChange={onChangeCode}
                    onFocus={onFocus}
                />
            )}
        </div>
    );
});
```

## 🔧 5단계: Plugin 구현


```typescript
// FlexionCodePlugin.tsx
import {COMMAND_PRIORITY_EDITOR, $getNodeByDataKey} from 'flexion';
import {CHANGE_CODE_VALUE_COMMAND, ChangeCodeValuePayload} from 'FlexionNode';
import {memo, useEffect} from 'react';

interface IProps {
    dataModelService: IDataModelService;
    userActionService: IUserActionService;
}

export const FlexionCodePlugin = memo(function FlexionCodePlugin({
    dataModelService,
    userActionService,
}: IProps): JSX.Element | null {
    const [editor] = useFlexionComposerContext();

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

## 🎯 핵심 원칙

### 1. 계층 분리
- Node: 상태 관리 및 이벤트 처리
- Component: UI 렌더링
- Plugin: 비즈니스 로직

### 2. Command 기반 통신
- 모든 상호작용을 Command로 변환
- 느슨한 결합 유지
- 확장 가능한 아키텍처

### 3. 타입 안전성
- 모든 데이터 구조에 명시적 타입
- 컴파일 타임 에러 방지
- 개발자 경험 향상

## 🔗 관련 문서

- [Node 개발 가이드](./04-node-development.md) - Node 클래스 구현 방법
- [Component 개발 가이드](./05-component-development.md) - Component 구현 방법
- [Plugin 개발 가이드](./07-plugin-development.md) - Plugin 구현 방법
- [Command 시스템 가이드](./06-command-system.md) - Command 시스템 이해
