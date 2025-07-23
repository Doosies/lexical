# 심층 분석: 코어 노드 교체

**문서 상태**: `v1.0`

> (커스텀 노드 제작의 기본은 [노드 개발 마스터 가이드](../../guidelines/node_development_guide.md)를 참고하세요.)

이 문서는 Lexical의 고급 기능인 **노드 교체(Node Replacement)**를 심층적으로 분석합니다. 이 기능은 기존 노드 클래스의 코드를 직접 수정하지 않고도 노드의 동작을 확장할 수 있는 강력한 방법을 제공합니다.

---

## 1. 코어 노드 교체 (Node Replacement)

- **핵심 목적**: `ParagraphNode`와 같은 Lexical의 핵심 노드를, 프로젝트의 특정 요구사항에 맞게 직접 만든 커스텀 노드로 전면 교체하는 기능입니다.
- **사용 시나리오**: 프로젝트 전체에 걸쳐 기본 노드의 동작(e.g., DOM 렌더링 방식, 직렬화 방식)을 일관되게 변경하고 싶을 때 매우 유용합니다.

### 1.1. 사용 방법

에디터 설정 객체(`initialConfig`)의 `nodes` 배열에 교체 규칙을 정의한 객체를 추가합니다.

- **`replace`**: 교체 대상이 될 원본 노드 클래스 (e.g., `ParagraphNode`).
- **`with`**: 원본 노드 인스턴스를 받아 새로운 커스텀 노드 인스턴스를 반환하는 함수.
- **`withKlass`**: `with` 함수에서 반환될 커스텀 노드의 클래스. Lexical이 내부적으로 타입을 확인하는 데 사용합니다.

```typescript
// CustomParagraphNode가 미리 정의되어 있다고 가정
import { ParagraphNode } from 'lexical';
import { CustomParagraphNode, $createCustomParagraphNode } from './CustomParagraphNode';

const editorConfig = {
  // ...
  nodes: [
    CustomParagraphNode, // 교체에 사용할 커스텀 노드는 반드시 등록되어야 합니다.
    {
      replace: ParagraphNode,
      with: (node: ParagraphNode) => {
        // 기존 ParagraphNode의 내용을 기반으로 새로운 CustomParagraphNode를 생성할 수 있습니다.
        const newNode = $createCustomParagraphNode();
        newNode.append(...node.getChildren()); // 자식 노드들을 그대로 옮겨옵니다.
        return newNode;
      },
      withKlass: CustomParagraphNode,
    }
  ]
};
```

이 설정을 통해, 에디터는 `ParagraphNode`가 생성되어야 할 모든 상황(e.g., 엔터 키 입력, 역직렬화)에서 자동으로 `CustomParagraphNode`를 대신 생성하게 됩니다. 