# Flexion Node 개발 가이드

## 📚 개요

이 가이드는 Flexion 시스템에서 새로운 Node를 개발하기 위한 포괄적인 개발 문서입니다. Flexion은 **3계층 아키텍처**를 기반으로 설계되어 있으며, 각 계층이 명확한 역할을 분담하여 개발합니다.

### 🏗️ 3계층 아키텍처

```
┌─────────────────┐
│     Node        │ ← 상태 관리, 이벤트 핸들링, Command Dispatch
├─────────────────┤
│   Component     │ ← UI 렌더링, 사용자 상호작용, Props 기반 동작
├─────────────────┤
│     Plugin      │ ← Command 처리, 비즈니스 로직, 서비스 연동
└─────────────────┘
```

### 📖 가이드 문서 구성

1. **[폴더 구조 가이드](./03-folder-structure.md)** - 프로젝트 구조와 각 폴더의 의미
2. **[Node 개발 가이드](./04-node-development.md)** - Node 클래스 구현 방법
3. **[Component 개발 가이드](./05-component-development.md)** - UI Component 구현 방법
4. **[Plugin 개발 가이드](./07-plugin-development.md)** - 비즈니스 로직 Plugin 구현 방법
5. **[Command 시스템 가이드](./06-command-system.md)** - Command 패턴과 이벤트 처리
6. **[실제 구현 예시](./08-implementation-example.md)** - ECCode를 통한 완전한 구현 예시

## 🚀 빠른 시작

새로운 Node를 개발하려면 다음 순서로 진행하세요:

1. **폴더 구조 생성** → [폴더 구조 가이드](./03-folder-structure.md)
2. **Node 구현** → [Node 개발 가이드](./04-node-development.md)
3. **Component 구현** → [Component 개발 가이드](./05-component-development.md)
4. **Plugin 구현** → [Plugin 개발 가이드](./07-plugin-development.md)
5. **Command 정의** → [Command 시스템 가이드](./06-command-system.md)

## 🎯 핵심 원칙

### 1. 단일 책임 원칙
- **Node**: 상태 관리와 이벤트 핸들링만 담당
- **Component**: UI 렌더링만 담당
- **Plugin**: 비즈니스 로직만 담당

### 2. 의존성 역전
- Component는 Node에 직접 의존하지 않음
- Plugin은 서비스에 의존하지만 Node에는 의존하지 않음
- 모든 상호작용은 Command를 통해 처리

### 3. 타입 안전성
- TypeScript를 활용한 컴파일 타임 검증
- 모든 Props, Command, 상태에 대한 타입 정의

## 📁 프로젝트 구조

```
flexion-node/src/nodes/
├── common/           # 공통
│   └── CommonCommand.ts
├── code/            # 코드 관련 노드 (예시)
│   ├── commands/    # Command 정의
│   ├── types/       # 타입 정의
│   ├── plugins/     # Plugin 구현
│   ├── FlexionCodeNode.tsx
│   └── index.ts
└── [domain]/        # 새로운 도메인별 노드
    ├── commands/
    ├── types/
    ├── plugins/
    ├── [NodeName].tsx
    └── index.ts
```
