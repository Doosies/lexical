# 25.08.08 회의 내용

## 5.0 컴포넌트 Props, State Type 위치 정하기

## flexion react package 정하기
- flexion-react?
- flexion-ui?

## ui-kit 위치를 어떻게 할지 정하기
- flexion 내부에 존재?
- flexion 외부에 존재? 
  - ERPService 에 주입 받기?

## DefinitionNormalization 작업 확인하기
- 스펙 확인

# 컴포넌트 개발 환경
npm install <br/>
npm run dev (플레이 그라운드 실행)

# Plugin 개발 가이드
## 컴포넌트 개발 가이드
1. play-ground
   - 데이터 정의
   - **참고** 
D:\ECXSolution\flexion\packages\flexion-playground\src\__test__\items
2. flextion-ui: node
   - 노드 정의
   - **참고** D:\ECXSolution\flexion\packages\flexion-ui\src\nodes\date\FlexionDateNode
3. flexion-erp: 컴포넌트 (분리 필요)
   - 컴포넌트 개발
   - **참고** D:\ECXSolution\flexion\packages\flexion-erp\src\components\item\ECDate.tsx
4. uikit: 말단
   - 말단 컴포넌트 개발
   - **참고** D:\ECXSolution\flexion\packages\uikit\src

- FlexionAST Node 정의
- Command 정의
- flexion-erp 의 ECXX 컴포넌트 > flexion-ui 통합
- uikit > flexion-ui 통합


## Node 별 생성해야 하는 정보

### ESLint 명명 규칙 검사
ElementNode나 DecoratorNode를 상속받는 모든 클래스는 다음 명명 규칙을 따라야 합니다:

1. **Node 파일명**
   - 파일명 규칙: PascalCase
   - naming rule: 'Flexion' + NodeType + "Node" <br/>
		- ex) <br/>
		NodeType: Code <br/> <br/>
		출력: FlexionCodeNode

2. **노드명**
    - 노드명 규칙: PascalCase
	- naming rule: 'Flexion' + NodeType + "Node" <br/>
		- ex) <br/>
		NodeType: Code <br/> <br/>
		출력: FlexionCodeNode

	❗ **ESLint 규칙**: `flexion/node-naming-convention`이 자동으로 이 규칙들을 검사합니다.


3. 상태명
    - 상태명 규칙: PascalCase
	- naming rule: data_type
     - ex)  <br/>
		DataType: Code <br/>
		출력: $$code

	- ex)  <br/>
		DataType: Code <br/>
		속성명: State <br/> <br/>
		출력: CodeState

5. 외부상태명
    - 외부상태명 규칙: PascalCase
   - naming rule: 'Flexion' + NodeType + "ExternalState"
	- ex)  <br/>
	NodeType: Code <br/> <br/>
	출력: FlexionCodeExternalState <br/> <br/>
	
     - 노드 공용
     - IFlexionDecoratorNodeConfig 을 상속받은 Config
     - naming rule: "I" + PlatformType + NodeType + "Config"
       - ex) <br/>
		PlatformType: React <br/>
		NodeType: Button <br/> <br/>
		출력: IReactButtonConfig

--

# 신규 노드 추가 Template 작업하기
# 신규 컴포넌트 추가 Template 작업하기
# 신규 Plugin 추가 Template 작업하기
# 신규 Command 추가 Template 작업하기


# package 추가하기
npm run create-package

## fleaction-react

### 신규 Node 추가하기
- 경로
  - D:\ECXSolution\flexion\packages\flexion-react
- 명령어
  - npm run create-node