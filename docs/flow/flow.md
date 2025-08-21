# rule

## 1. 커맨드 생성 rule

## 2. 파일명 생성 rule
- 파일명 규칙: PascalCase
   - naming rule: 'Flexion' + NodeType + "Node" 

- ex) NodeType: Code 
    출력: FlexionCodeNode
## 3. Class명 생성 rule
- 노드명 규칙: PascalCase
    - naming rule: 'Flexion' + NodeType + "Node" 

- ex) 
    NodeType: Code 
    출력: FlexionCodeNode

# 구조

## 1. 폴더 구조
┌ 00.flexion-utils <br/>
├ 00.glotbal-types <br/>
├ 01.lexical <br/>
├ 10.flexion-erp <br/>
├ 20.flexion-list <br/>
├ 20.flexion-grid <br/>
├ 20.flexion-toolbar <br/>
├ 30.flextion-node <br/>
├─ src <br/>
├── nodes <br/>
├─── node(대표 객체: button → 폴더명: button) <br/>
├──── @types (Node 에서 사용하는 Props만 정의) <br/>
├──── commands (Node 에서 사용하는 command만 정의) <br/>
├──── plugins (Node 에서 사용하는 plugin만 정의) <br/>
├ 50.flextion-react <br/>
├─ src <br/>
├── @types (React 전역 참조) <br/>
├── components <br/>
├─── item <br/>
├──── EC대표(대표: button → 폴더명: ECButton) <br/>
├───── @types (button 에서 사용하는 속성만 정의) <br/>
├ 70.flextion-uikit <br/>
└ 90.flexion-storybook <br/>




- 00: 타입정의 / 전역참조
- 01: 코어
- 10: Command, Plugin 등록/실행 역할
- 20: Layout 관련 컴포넌트
- 30: FlexionAST 와 컴포넌트를 연결해주는 브릿지
- 50: 컴포넌트 (uikit 을 내포함)
- 70: UI 말단
- 90: 30, 50, 70 개발 확인 페이지

## 2. 컴포넌트 개발 구조
<img src="../resources/flow/20.%20컴포넌트%20개발%20구조.png">

## 3. 노드와 컴포넌트 연동
[![노드와 컴포넌트 연동](../resources/flow/20. node with react 연동.png)](../resources/flow/20. node with react 연동.png)

## 3. 데이터 연동
<img src="../resources/flow/21. 외부 데이터 연동.png">

## 4. 이벤트 연동
<img src="../resources/flow/22. 이벤트 흐름도.png">

