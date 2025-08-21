# Component 개발 가이드

> 📖 **시작하기 전에**: [Flexion 3계층 아키텍처 개요](./02-architecture-overview.md)를 먼저 읽어보세요.

## 📋 개요

Component는 Flexion 3계층 아키텍처의 **UI 렌더링**과 **사용자 상호작용**을 담당하는 계층입니다. Node로부터 Props를 받아 UI를 렌더링하고, 사용자 상호작용을 Node의 이벤트 핸들러로 전달합니다.

## 🔧 기본 구조

### 1. Props 타입 정의

```typescript
// ECCode.tsx
export interface IECCodeProps {
    // 기본 데이터
    hide_code: boolean;
    display_name: string;
    writable?: {
        code: boolean;
        name: boolean;
    };

    // 이벤트 핸들러들
    onChangeCode: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus: (event: React.FocusEvent<HTMLInputElement>) => void;
    onClickSearchButton: () => void;
}
```

### 2. Component 구현

```typescript
// ECCode.tsx
import {memo} from 'react';
import {Button, Input} from 'uikit';

export const ECCode = memo(function ECCode(props: IECCodeProps) {
    const {
        hide_code,
        display_name,
        writable,
        onChangeCode,
        onFocus,
        onClickSearchButton,
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
            <Button onClick={onClickSearchButton}>
                검색
            </Button>
        </div>
    );
});
```

## 🎯 핵심 원칙

### 1. Props 기반 렌더링
- Node로부터 받은 Props만 사용

### 2. 이벤트 위임
- 모든 사용자 상호작용을 Node 핸들러로 전달
- 직접적인 비즈니스 로직 처리 금지

### 3. 재사용성
- 특정 도메인에 종속되지 않도록 설계
- Props를 통한 유연한 설정

## 📝 사용 예시

### 1. 간단한 Input Component

```typescript
// SimpleInput.tsx
interface ISimpleInputProps {
    value: string;
    placeholder: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus: (event: React.FocusEvent<HTMLInputElement>) => void;
}

export const SimpleInput = memo(function SimpleInput(props: ISimpleInputProps) {
    const {value, placeholder, onChange, onFocus} = props;

    return (
        <Input
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            onFocus={onFocus}
        />
    );
});
```

## 🔗 관련 문서

- [Node 개발 가이드](./04-node-development.md) - Node와 Component의 연결 방법
- [Command 시스템 가이드](./06-command-system.md) - 이벤트 처리 방법
