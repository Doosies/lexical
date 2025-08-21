# Plugin 개발 가이드

> 📖 **시작하기 전에**: [Flexion 3계층 아키텍처 개요](./02-architecture-overview.md)를 먼저 읽어보세요.

## 📋 개요

Plugin은 Flexion 3계층 아키텍처의 **비즈니스 로직**과 **서비스 연동**을 담당하는 계층입니다. Node에서 Dispatch된 Command를 수신하고 처리하며, 외부 서비스와의 연동을 통해 실제 비즈니스 로직을 실행합니다.

## 🔧 기본 구조

### 1. Props 타입 정의

```typescript
// plugins/FlexionCodePlugin.tsx
interface IProps {
    dataModelService: IDataModelService;
    userActionService: IUserActionService;
}
```

### 2. Plugin 구현

```typescript
// plugins/FlexionCodePlugin.tsx
import {COMMAND_PRIORITY_EDITOR, createCommand, $getNodeByDataKey} from 'flexion';
import {CHANGE_CODE_VALUE_COMMAND, ChangeCodeValuePayload} from 'FlexionNode';
import {memo, useCallback, useEffect} from 'react';

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

## 🎯 핵심 원칙

### 1. Command 기반 처리
- 모든 비즈니스 로직을 Command로 처리
- Node와의 느슨한 결합 유지

### 2. 서비스 연동
- 외부 서비스와의 연동 담당
- 데이터 검증 및 변환
- 에러 처리 및 로깅

### 3. 상태 관리
- Node 상태 업데이트

## 📝 사용 예시

### 1. 간단한 값 업데이트 Plugin

```typescript
// SimpleUpdatePlugin.tsx
export const SimpleUpdatePlugin = memo(function SimpleUpdatePlugin() {
    const [editor] = useFlexionComposerContext();

    useEffect(() => {
        return editor.registerCommand(
            UPDATE_VALUE_COMMAND,
            (payload: ValuePayload) => {
                const node = $getNodeByDataKey(payload.dataKey);
                if (node) {
                    node.$setState({value: payload.value});
                }
                return false;
            },
            COMMAND_PRIORITY_EDITOR,
        );
    }, [editor]);

    return null;
});
```

## 🔗 관련 문서

- [Command 시스템 가이드](./06-command-system.md) - Command 정의 및 처리 방법
- [Node 개발 가이드](./04-node-development.md) - Node에서 Command Dispatch 방법
