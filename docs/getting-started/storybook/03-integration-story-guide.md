# Integration Story 작성 가이드

## 개요

Integration Story는 Lexical Editor와 통합된 실제 동작을 테스트하기 위한 Storybook 스토리입니다.

## 목적

- UI Event 발생 시 Mock Service 호출 확인
- AST Node 기반 UI 확인

## 위치

- **패키지**: `flexion-storybook`
- **경로**: `src/integration/nodeName/nodeName.stories.tsx`
- **예시**: `flexion-storybook/src/integration/code/code.stories.tsx`

## 기본 구조

```typescript
// 예시: flexion-storybook/src/integration/code/code.stories.tsx
import type {Meta, StoryObj} from '@storybook/react-vite';
import {LexicalEditor} from 'flexion';
import {FlexionCodePlugin} from 'FlexionErp';
import {FlexionCodeNode, FlexionComposer} from 'FlexionNode';
import {createMockServices} from '../../utils/mockServices';

const meta = {
    args: {
        // 테스트용 Node AST 값 주입
        data: {code: '테스트 코드', name: '테스트 이름'},
        data_key: 'test_data_key',
        state: {
            display_name: '테스트 필드',
            writable: {code: true, name: true},
            error: {error_message: ''},
        },
    },
    title: 'Flexion/Integration/Code',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;
```

## AST 생성 함수

```typescript
const createCodeAST = (args: any) => ({
    data: args.data,
    data_key: args.data_key,
    state: {
        display_name: args.state.display_name,
        writable: args.state.writable,
        error: args.state.error,
        // 노드별 필요한 상태 추가
    },
    type: 'code', // 노드 타입
});
```

## Editor State 생성

```typescript
const createEditorState = (args: any) => ({
    root: {
        children: [createCodeAST(args)],
        type: 'root',
        version: 1,
    },
});
```

## Initial Config 생성

```typescript
const createInitialConfig = (args: any) => ({
    editorState: JSON.stringify(createEditorState(args)),
    namespace: 'flexion-contents',
    nodes: [FlexionCodeNode], // 사용할 노드 등록
    plugins: [FlexionCodePlugin], // 사용할 플러그인 등록
    onError: (error: Error, editor: LexicalEditor) => {
        console.error(error);
    },
});
```

## Story 작성

```typescript
const {dataModelService, userActionService} = createMockServices();

export const Code: Story = {
    render: (args) => {
        const initialConfig = createInitialConfig(args);
        
        // Editor State 변경 시 새로운 key 생성
        const editorKey = `code-editor-${JSON.stringify(initialConfig.editorState)}`;
        
        return (
            <FlexionComposer key={editorKey} initialConfig={initialConfig}>
                <ECFlexionContentsComponent />
                <FlexionCodePlugin
                    dataModelService={dataModelService}
                    userActionService={userActionService}
                />
            </FlexionComposer>
        );
    },
};
```

## Mock 서비스 사용

### 1. Mock 서비스 생성

```typescript
// utils/mockServices.ts
// 예시: flexion-storybook/src/utils/mockServices.ts
import {fn} from 'storybook/test';

export const createDataModelService = () => ({
    setValue: fn(),
    subscribeModel: fn(),
    // 기타 필요한 메서드들
});

export const createUserActionService = () => ({
    dispatchAsync: fn(),
    validateValueAsync: fn(),
    formatValueAsync: fn(),
    // 기타 필요한 메서드들
});

export const createMockServices = () => ({
    dataModelService: createDataModelService(),
    userActionService: createUserActionService(),
});
```

### 2. Service 호출 검증

```typescript
// 예시: Service 호출 검증 테스트
export const CodeWithServiceTest: Story = {
    render: (args) => {
        const mockServices = createMockServices();
        const initialConfig = createInitialConfig(args);
        
        return (
            <FlexionComposer initialConfig={initialConfig}>
                <FlexionCodePlugin
                    dataModelService={mockServices.dataModelService}
                    userActionService={mockServices.userActionService}
                />
            </FlexionComposer>
        );
    },
    play: async ({canvasElement}) => {
        const canvas = within(canvasElement);
        
        // 1. 코드 입력 필드 찾기 및 상호작용
        const codeInput = canvas.getByTestId('code-input');
        await userEvent.type(codeInput, 'NEW_CODE');
        
        // 2. 즉시 검증 - Service 호출 확인
        expect(mockServices.dataModelService.setValue).toHaveBeenCalledWith(
            'test_data_key',
            'NEW_CODE'
        );
    },
};
```

## 노드별 Integration Story 예제

### 1. Code Node

```typescript
// flexion-storybook/src/integration/code/code.stories.tsx
export const CodeServiceIntegration: Story = {
    play: async ({canvasElement}) => {
        const canvas = within(canvasElement);
        
        // 1. Mock Service 생성
        const {dataModelService, userActionService} = createMockServices();
        
        // 2. 코드 입력 필드 찾기 및 상호작용
        const codeInput = canvas.getByTestId('code-input');
        await userEvent.type(codeInput, 'NEW_CODE');
        
        // 3. 코드 입력 즉시 검증
        expect(dataModelService.setValue).toHaveBeenCalledWith(
            'code_data_key',
            {code: 'NEW_CODE', name: '테스트 이름'}
        );
        expect(userActionService.validateValueAsync).toHaveBeenCalledWith(
            'code_data_key',
            {code: 'NEW_CODE', name: '테스트 이름'}
        );
        
        // 4. 이름 입력 필드 찾기 및 상호작용
        const nameInput = canvas.getByTestId('name-input');
        await userEvent.type(nameInput, '새로운 이름');
        
        // 5. 이름 입력 즉시 검증
        expect(dataModelService.setValue).toHaveBeenCalledWith(
            'code_data_key',
            {code: 'NEW_CODE', name: '새로운 이름'}
        );
        expect(userActionService.validateValueAsync).toHaveBeenCalledWith(
            'code_data_key',
            {code: 'NEW_CODE', name: '새로운 이름'}
        );
        
        // 6. 최종 호출 횟수 검증
        expect(dataModelService.setValue).toHaveBeenCalledTimes(2); // code, name 각각
        expect(userActionService.validateValueAsync).toHaveBeenCalledTimes(2);
    },
};
```

### 2. Button Node

```typescript
// flexion-storybook/src/integration/button/button.stories.tsx
export const ButtonServiceTest: Story = {
    play: async ({canvasElement}) => {
        const canvas = within(canvasElement);
        
        // 1. Mock Service 생성
        const {userActionService} = createMockServices();
        
        // 2. 버튼 요소 찾기 및 클릭 상호작용
        const buttonElement = canvas.getByTestId('button');
        await userEvent.click(buttonElement);
        
        // 3. 버튼 클릭 즉시 검증
        expect(userActionService.dispatchByUserActionAsync).toHaveBeenCalledWith(
            'BUTTON_CLICK_ACTION',
            {
                dataKey: 'button_data_key',
                event: expect.any(Object)
            }
        );
        expect(userActionService.dispatchByUserActionAsync).toHaveBeenCalledTimes(1);
    },
};
```

### 3. Date Node

```typescript
// flexion-storybook/src/integration/date/date.stories.tsx
export const DateServiceTest: Story = {
    play: async ({canvasElement}) => {
        const canvas = within(canvasElement);
        
        // 1. Mock Service 생성
        const {dataModelService, userActionService} = createMockServices();
        
        // 2. 날짜 입력 필드 찾기 및 상호작용
        const dateInput = canvas.getByTestId('date-input');
        await userEvent.type(dateInput, '2025-08-09');
        
        // 3. 날짜 입력 즉시 검증
        expect(dataModelService.setValue).toHaveBeenCalledWith(
            'date_data_key',
            '2025-08-09'
        );
        expect(userActionService.formatValueAsync).toHaveBeenCalledWith(
            'date_data_key',
            '2025-08-09',
            'date'
        );
        expect(userActionService.validateValueAsync).toHaveBeenCalledWith(
            'date_data_key',
            '2025-08-09'
        );
        
        // 4. Enter 키 상호작용 및 검증
        await userEvent.keyboard('{enter}');
        
        // 5. 호출 순서 검증 (format -> validate 순서)
        expect(userActionService.formatValueAsync).toHaveBeenCalledBefore(
            userActionService.validateValueAsync
        );
    },
};
```

## 베스트 프랙티스

### 1. Mock Service 활용

```typescript
// fn() 함수로 Mock 생성
const mockServices = createMockServices();

// toHaveBeenCalledWith()로 파라미터 검증
expect(mockServices.dataModelService.setValue).toHaveBeenCalledWith(
    'data_key',
    'expected_value'
);

// toHaveBeenCalledTimes()로 호출 횟수 검증
expect(mockServices.dataModelService.setValue).toHaveBeenCalledTimes(1);

// toHaveBeenCalledBefore()로 호출 순서 검증
expect(mockServices.userActionService.formatValueAsync).toHaveBeenCalledBefore(
    mockServices.userActionService.validateValueAsync
);
```

### 2. Editor Key 관리

```typescript
// Editor State 변경 시 새로운 key 생성
const editorKey = `code-editor-${JSON.stringify(initialConfig.editorState)}`;

// React 컴포넌트 재렌더링 보장
<FlexionComposer key={editorKey} initialConfig={initialConfig}>
```

### 3. AAA 패턴 테스트 구조

```typescript
export const ServiceTest: Story = {
    render: (args) => {
        // 1. Mock Service 생성
        const mockServices = createMockServices();
        
        // 2. Initial Config 생성
        const initialConfig = createInitialConfig(args);
        
        // 3. 컴포넌트 렌더링
        return (
            <FlexionComposer initialConfig={initialConfig}>
                <FlexionPlugin
                    dataModelService={mockServices.dataModelService}
                    userActionService={mockServices.userActionService}
                />
            </FlexionComposer>
        );
    },
    play: async ({canvasElement}) => {
        const canvas = within(canvasElement);
        
        // AAA 패턴: Arrange-Act-Assert
        // 1. Arrange: 요소 찾기
        const input = canvas.getByTestId('input');
        
        // 2. Act: 상호작용 수행
        await userEvent.type(input, 'test_value');
        
        // 3. Assert: 즉시 검증
        expect(mockServices.dataModelService.setValue).toHaveBeenCalledWith(
            'data_key',
            'test_value'
        );
    },
};
```

### 4. 복잡한 상호작용 테스트 구조

```typescript
export const ComplexServiceTest: Story = {
    play: async ({canvasElement}) => {
        const canvas = within(canvasElement);
        const {dataModelService, userActionService} = createMockServices();
        
        // 1. 첫 번째 필드 상호작용 및 검증
        const codeInput = canvas.getByTestId('code-input');
        await userEvent.type(codeInput, 'CODE001');
        expect(dataModelService.setValue).toHaveBeenCalledWith('code_key', 'CODE001');
        expect(userActionService.validateValueAsync).toHaveBeenCalledWith('code_key', 'CODE001');
        
        // 2. 두 번째 필드 상호작용 및 검증
        const nameInput = canvas.getByTestId('name-input');
        await userEvent.type(nameInput, '테스트 이름');
        expect(dataModelService.setValue).toHaveBeenCalledWith('name_key', '테스트 이름');
        expect(userActionService.validateValueAsync).toHaveBeenCalledWith('name_key', '테스트 이름');
        
        // 3. 버튼 클릭 상호작용 및 검증
        const submitButton = canvas.getByTestId('submit-button');
        await userEvent.click(submitButton);
        expect(userActionService.dispatchByUserActionAsync).toHaveBeenCalledWith(
            'SUBMIT_ACTION',
            expect.any(Object)
        );
        
        // 4. 최종 상태 검증
        expect(dataModelService.setValue).toHaveBeenCalledTimes(2);
        expect(userActionService.validateValueAsync).toHaveBeenCalledTimes(2);
        expect(userActionService.dispatchByUserActionAsync).toHaveBeenCalledTimes(1);
    },
};
```

## 핵심 포인트

### 1. Integration Story 목표
- UI Event 발생 시 Mock Service 호출 확인
- 올바른 파라미터 전달 검증
- Service 호출 순서와 횟수 확인

### 2. AAA 패턴 테스트 구조
- **Arrange**: 요소 찾기 (`getByTestId`)
- **Act**: 상호작용 수행 (`userEvent`)
- **Assert**: 즉시 검증 (`expect`)

### 3. Mock Service 활용
- `fn()` 함수로 Mock 생성
- `toHaveBeenCalledWith()`로 파라미터 검증
- `toHaveBeenCalledTimes()`로 호출 횟수 검증

### 4. Editor Key 관리
- Editor State 변경 시 새로운 key 생성
- React 컴포넌트 재렌더링 보장

### 보일러 플레이트 코드의 경우 추후 편의성 개선이 이루어질 예정입니다. @TODO csh

이 가이드를 따라 Integration Story를 작성하면 일관성 있고 유지보수하기 쉬운 통합 테스트를 만들 수 있습니다.
