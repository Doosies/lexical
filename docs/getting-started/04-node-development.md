# Node 개발 가이드

> 📖 **시작하기 전에**: [Flexion 3계층 아키텍처 개요](./02-architecture-overview.md)를 먼저 읽어보세요.

## 📋 개요

Flexion Node는 `FlexionDecoratorNode`를 상속받아 상태 관리, 이벤트 처리, UI 렌더링을 담당하는 핵심 클래스입니다. 이 가이드에서는 Node 클래스의 구현 방법과 주요 패턴을 설명합니다.

## 🔧 기본 구조

```typescript
import {FlexionDecoratorNode} from 'flexion';
import React from 'react';

import {ICodeNodeData, ICodeNodeState} from '../../abstraction/state/code';
import {CHANGE_CODE_VALUE_COMMAND} from './commands';
import {ECCode} from 'FlexionReact';

export class FlexionCodeNode extends FlexionDecoratorNode<
    ICodeNodeData,        // 데이터 타입
    ICodeNodeState,       // 상태 타입
    React.ReactElement    // 렌더링 타입
> {
    // 구현...
}
```

## 🎯 필수 메서드 구현

### 1. `$getConfig()` - Node 설정

```typescript
protected $getConfig(): IFlexionDecoratorNodeConfig | null {
    return {
        type: 'code',  // Node 타입 식별자
    };
}
```

### 2. `createDOM()` - DOM 요소 생성

```typescript
createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement('span');
    return element;
}
```

### 3. `decorate()` - UI 렌더링

```typescript
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
```

## 🔄 이벤트 핸들러 구현

### 1. 값 변경 이벤트

```typescript
onChangeCode = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const {value} = event.target;
    
    this.dispatchCommand(CHANGE_CODE_VALUE_COMMAND, {
        dataKey: this.getDataKey(),
        value,
    });
};
```

### 2. 포커스 이벤트

```typescript
onFocus = (event: React.FocusEvent<HTMLInputElement>): void => {
    this.dispatchCommand(FOCUS_VALUE_COMMAND, {
        dataKey: this.getDataKey(),
    });
};
```

## 🎯 핵심 원칙

### 1. 상태 관리
- `$getState()`로 현재 상태 조회
- `$setState()`로 상태 업데이트
- 상태 변경 시 자동 리렌더링

### 2. 이벤트 처리
- 모든 사용자 상호작용을 Command로 변환
- Node에서 직접 비즈니스 로직 처리 금지
- Plugin으로 이벤트 위임

### 3. UI 렌더링
- Component에 Props 전달
- 상태 기반 조건부 렌더링
- 이벤트 핸들러 연결

## 📝 사용 예시

### 1. 간단한 Node 구현

```typescript
export class SimpleNode extends FlexionDecoratorNode<
    SimpleData,
    SimpleState,
    React.ReactElement
> {
    protected $getConfig() {
        return {type: 'simple'};
    }

    createDOM() {
        return document.createElement('div');
    }

    decorate() {
        const data = this.$getData();
        return <SimpleComponent value={data} onChange={this.onChange} />;
    }

    onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.dispatchCommand(CHANGE_VALUE_COMMAND, {
            dataKey: this.getDataKey(),
            value: event.target.value,
        });
    };
}
```

## 🔗 관련 문서

- [Component 개발 가이드](./05-component-development.md) - Component와 Node 연결 방법
- [Command 시스템 가이드](./06-command-system.md) - Command Dispatch 방법
