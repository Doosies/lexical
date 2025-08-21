# Component Story 작성 가이드

## 개요

Component Story는 개별 컴포넌트의 UI와 props를 테스트하기 위한 Storybook 스토리입니다.

## 목적

- 컴포넌트의 props만 다루며 UI 상호작용 테스트
- 컴포넌트의 다양한 상태와 동작 확인
- UI 컴포넌트의 독립적인 테스트

## 위치

- **패키지**: `flexion-react`
- **경로**: `flexion-react/src/components/item/ComponentName/ComponentName.stories.tsx`
- **예시**: `flexion-react/src/components/item/ECCode/ECCode.stories.tsx`

## 기본 구조

```typescript
// 예시: flexion-react/src/components/item/ECCode/ECCode.stories.tsx
import type {Meta, StoryObj} from '@storybook/react-vite';
import {fn} from 'storybook/test';
import {ECCode} from './ECCode';

const meta = {
    argTypes: {},
    args: {},
    component: ECCode,
    decorators: [
        (Story) => (
            <div className="control-set">
                <div className="control">
                    <Story />
                </div>
            </div>
        ),
    ],
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    title: 'Flexion/Components/ECCode',
} satisfies Meta<typeof ECCode>;

export default meta;
type Story = StoryObj<typeof meta>;
```

## Args 정의

```typescript
// 컴포넌트의 props만 정의
const defaultArgs = {
    data: {code: 'CODE001', name: '테스트 코드명'},
    display_name: '코드 입력',
    error: {error_message: ''},
    onChange: fn(),
    onBlur: fn(),
    // ... 기타 props
};
```

## Story 작성

### 1. 기본 Story

```typescript
export const Default: Story = {
    args: defaultArgs,
};
```

### 2. 다양한 상태의 Story

```typescript
export const WithError: Story = {
    args: {
        ...defaultArgs,
        error: {
            error_message: '에러 메시지입니다.',
        },
    },
};

export const Disabled: Story = {
    args: {
        ...defaultArgs,
        writable: {
            code: false,
            name: false,
        },
    },
};

```

## Play 메서드를 통한 테스트

### 1. 기본 UI 상호작용 테스트

```typescript
export const InteractiveTest: Story = {
    args: defaultArgs,
    play: async ({args, canvasElement}) => {
        const canvas = within(canvasElement);
        
        // 1. 요소 찾기
        const codeInput = canvas.getByTestId('code-input');
        const nameInput = canvas.getByTestId('name-input');
        
        // 2. 코드 입력 상호작용 및 검증
        await userEvent.type(codeInput, 'NEW_CODE');
        expect(codeInput).toHaveValue('NEW_CODE');
        expect(args.onChange).toHaveBeenCalledWith('NEW_CODE');
        
        // 3. 이름 입력 상호작용 및 검증
        await userEvent.type(nameInput, '새로운 이름');
        expect(nameInput).toHaveValue('새로운 이름');
        expect(args.onChangeName).toHaveBeenCalledWith('새로운 이름');
    },
};
```

### 2. 복잡한 상호작용 테스트

```typescript
export const CodeInteraction: Story = {
    args: defaultArgs,
    play: async ({args, canvasElement}) => {
        const canvas = within(canvasElement);
        
        // 1. 요소 찾기
        const codeInput = canvas.getByTestId('code-input');
        const nameInput = canvas.getByTestId('name-input');
        const searchButton = canvas.getByTestId('search-button');
        
        // 2. 코드 입력 상호작용 및 검증
        await userEvent.type(codeInput, 'NEW_CODE');
        expect(codeInput).toHaveValue('NEW_CODE');
        expect(args.onChangeCode).toHaveBeenCalledWith('NEW_CODE');
        
        // 3. 이름 입력 상호작용 및 검증
        await userEvent.type(nameInput, '새로운 이름');
        expect(nameInput).toHaveValue('새로운 이름');
        expect(args.onChangeName).toHaveBeenCalledWith('새로운 이름');
        
        // 4. 검색 버튼 클릭 상호작용 및 검증
        await userEvent.click(searchButton);
        expect(searchButton).toBeInTheDocument();
        expect(args.onClickSearchButton).toHaveBeenCalled();
    },
};
```

### 3. 키보드 이벤트 테스트

```typescript
export const KeyboardEvents: Story = {
    args: defaultArgs,
    play: async ({args, canvasElement}) => {
        const canvas = within(canvasElement);
        const input = canvas.getByTestId('input');
        
        // 1. Enter 키 상호작용 및 검증
        await userEvent.keyboard('{enter}');
        expect(input).toBeInTheDocument();
        expect(args.onKeyDown).toHaveBeenCalled();
        
        // 2. Tab 키 상호작용 및 검증
        await userEvent.tab();
        expect(input).not.toHaveFocus();
        expect(args.onBlur).toHaveBeenCalled();
    },
};
```

## 베스트 프랙티스

### 1. Args 관리

```typescript
// 공통 args를 상수로 분리
const defaultArgs = {
    data: {code: 'CODE001', name: '테스트 코드명'},
    display_name: '코드 입력',
    error: {error_message: ''},
    onChange: fn(),
    onBlur: fn(),
    // ... 기타 props
};

// Story별로 args 확장
export const WithCustomData: Story = {
    args: {
        ...defaultArgs,
        data: {code: 'CUSTOM_CODE', name: '커스텀 이름'},
    },
};
```

### 2. 테스트 작성 가이드

```typescript
export const InteractiveTest: Story = {
    play: async ({args, canvasElement}) => {
        const canvas = within(canvasElement);
        
        // 1. 요소 찾기
        const element = canvas.getByTestId('test-id');
        
        // 2. 클릭 상호작용 및 검증
        await userEvent.click(element);
        expect(args.onClick).toHaveBeenCalled();
        
        // 3. 텍스트 입력 상호작용 및 검증
        await userEvent.type(element, 'text');
        expect(element).toHaveValue('text');
        expect(args.onChange).toHaveBeenCalledWith('text');
        
        // 4. 키보드 상호작용 및 검증
        await userEvent.keyboard('{enter}');
        expect(args.onKeyDown).toHaveBeenCalled();
    },
};
```

### 3. UI 테스트 우선순위

```typescript
// ✅ 좋은 예: 상호작용과 검증을 한 묶음으로 구성
export const GoodTest: Story = {
    play: async ({args, canvasElement}) => {
        const canvas = within(canvasElement);
        const input = canvas.getByTestId('input');
        
        // 텍스트 입력 상호작용 및 즉시 검증
        await userEvent.type(input, 'test');
        expect(input).toHaveValue('test');
        expect(input).toHaveAttribute('aria-invalid', 'false');
        expect(args.onChange).toHaveBeenCalledWith('test');
    },
};

// ❌ 나쁜 예: 상호작용과 검증이 분리됨
export const BadTest: Story = {
    play: async ({args, canvasElement}) => {
        const canvas = within(canvasElement);
        const input = canvas.getByTestId('input');
        
        // 모든 상호작용을 먼저 수행
        await userEvent.type(input, 'test');
        await userEvent.click(input);
        await userEvent.keyboard('{enter}');
        
        // 나중에 한번에 검증 (가독성이 떨어짐)
        expect(input).toHaveValue('test');
        expect(args.onChange).toHaveBeenCalledWith('test');
        expect(args.onClick).toHaveBeenCalled();
        expect(args.onKeyDown).toHaveBeenCalled();
    },
};
```

## 핵심 포인트

### 1. Component Story 목표
- 컴포넌트의 props만 다루며 UI 테스트에 집중
- 다양한 상태와 동작 확인
- 컴포넌트의 독립적인 테스트

### 2. Play 메서드 활용
- `within()` 함수로 캔버스 접근
- `userEvent`로 사용자 상호작용 시뮬레이션
- `expect()`로 결과 검증

### 3. Args 관리
- `fn()` 함수로 Mock 함수 생성
- 공통 args를 상수로 분리
- Story별로 args 확장

이 가이드를 따라 Component Story를 작성하면 일관성 있고 유지보수하기 쉬운 컴포넌트 테스트를 만들 수 있습니다.
