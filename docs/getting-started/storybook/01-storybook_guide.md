# Storybook 개발자 가이드

## 개요

Flexion 프로젝트에서 Storybook을 사용하여 컴포넌트와 통합 테스트를 작성하는 방법을 설명합니다.

## Story 유형

### 1. Component Story
- **목적**: 개별 컴포넌트의 UI와 props 테스트
- **위치**: `flexion-react/src/components/item/ComponentName/ComponentName.stories.tsx`
- **내용**: 컴포넌트 props만 다루며 UI 상호작용 테스트
- **예시**: `flexion-react/src/components/item/ECCode/ECCode.stories.tsx`
- **가이드**: [Component Story 작성 가이드](./component_story_guide.md)

### 2. Integration Story
- **목적**: Lexical Editor와 통합된 실제 동작 테스트
- **위치**: `flexion-storybook/src/integration/nodeName/nodeName.stories.tsx`
- **내용**: Mock 서비스를 통한 Service 호출 검증
- **예시**: `flexion-storybook/src/integration/code/code.stories.tsx`
- **가이드**: [Integration Story 작성 가이드](./integration_story_guide.md)

### 3. Node Story
- **목적**: Node의 UI테스트로 각 pkg별 테스트 (아래는 `flexion-grid` 예시)
- **위치**: `flexion-grid/src/nodes/__tests__/nodeName.stories.tsx`
- **내용**: 각 pkg별로 Component가 아닌 Node형의 테스트 검증을 위함
- **예시**: `flexion-grid/src/nodes/__tests__/flexion-grid-node.stories.tsx`
- **특징**: `flexion-storybook/.storybook/main.ts`에 특정 pkg 경로 추가 필요

## 파일 구조

```
packages/
├── flexion-react/
│   └── src/components/item/ComponentName/
│       └── ECCode/
│           └── ECCode.stories.tsx     # 예시: ECCode Component Story
├── flexion-grid/
│   └── src/nodes/__tests__/
│       └── flexion-grid-node.stories.tsx  # Grid Node 테스트
├── flexion-storybook/
│   └── src/
│       ├── integration/
│       │   ├── code/
│       │   │   └── code.stories.tsx   # Code Node 통합 테스트
│       │   ├── button/
│       │   │   └── button.stories.tsx # Button Node 통합 테스트
│       │   └── date/
│       │       └── date.stories.tsx   # Date Node 통합 테스트
│       └── utils/
│           └── mockServices.ts        # Mock 서비스
```

## 패키지별 역할

- **flexion-react**: 개별 컴포넌트의 Story 파일 관리
- **flexion-storybook**: 통합 테스트를 위한 Integration Story만 관리

## 상세 가이드

- [Component Story 작성 가이드](./component_story_guide.md) - 개별 컴포넌트 테스트 작성 방법
- [Integration Story 작성 가이드](./integration_story_guide.md) - 통합 테스트 작성 방법

