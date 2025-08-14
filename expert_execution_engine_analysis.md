# ExpertExecutionEngine 아키텍처 분석 및 멀티페르소나 개선 방안

## 📋 문서 개요

이 문서는 `.mcp-server/src/core/expert_execution_engine.ts`의 현재 아키텍처를 분석하고, 멀티페르소나 지원을 위한 개선 방안을 제시합니다.

## 🔍 현재 아키텍처 분석

### 핵심 구성 요소

#### 1. 상태 머신 (EngineState)

```typescript
export const enum EngineState {
	BOOTING = 'BOOTING',
	IDLE = 'IDLE',
	PLANNING = 'PLANNING',
	WAITING_FOR_APPROVAL = 'WAITING_FOR_APPROVAL',
	EXECUTING = 'EXECUTING',
	AWATING_HOST_LLM_RESPONSE = 'AWATING_HOST_LLM_RESPONSE',
	FAILED = 'FAILED',
}
```

#### 2. 단일 엔진 구조

-   **단일 상태**: `private state: EngineState`
-   **단일 컨텍스트**: `private expertContext: ExpertContext`
-   **공유 전문가 레지스트리**: `private expertRegistry: Map<ExpertName, any>`

#### 3. 작업 흐름

1. **요청 접수** → `processRequest()`
2. **계획 수립** → PlanningExpert 실행
3. **승인 대기** → WAITING_FOR_APPROVAL 상태
4. **단계별 실행** → `executeNextPlan()`
5. **완료/초기화** → IDLE 상태 복귀

### 설계 특징

-   ✅ **상태 머신 패턴**: 명확한 상태 전이로 안전한 작업 흐름
-   ✅ **전문가 시스템**: 도메인별 전문가 분리
-   ✅ **비동기 처리**: LLM 상호작용 지원
-   ❌ **단일 세션**: 한 번에 하나의 요청만 처리
-   ❌ **컨텍스트 격리 없음**: 모든 요청이 같은 컨텍스트 공유

## 🎭 멀티페르소나 필요성 분석

### 현재 한계점

#### 1. 상태 관리 제약

```typescript
// 🚨 단일 상태만 존재
private state: EngineState = EngineState.BOOTING;

// 🚨 단일 컨텍스트 공유
private expertContext: ExpertContext = {
    available_host_tools: [],
    user_request: '',
};
```

#### 2. 페르소나별 특화 부재

-   **ExpertName**은 기능별 분류일 뿐, 페르소나가 아님
-   모든 전문가가 동일한 방식으로 동작
-   사용자 역할이나 전문성에 따른 차별화 없음

#### 3. 동시 처리 불가

-   IDLE 상태에서만 새 요청 수락
-   여러 사용자/페르소나 동시 처리 불가
-   페르소나 간 독립적 상태 유지 불가

### 멀티페르소나 요구사항

#### 페르소나 유형 정의

```typescript
export enum PersonaType {
	DEVELOPER = 'Developer', // 코드 분석, 버그 수정, 구현
	BUSINESS_ANALYST = 'BusinessAnalyst', // 요구사항, 프로세스 설계
	QA_ENGINEER = 'QAEngineer', // 테스팅, 품질 관리
	DEVOPS_ENGINEER = 'DevOpsEngineer', // 인프라, 배포, 모니터링
	DATA_SCIENTIST = 'DataScientist', // 데이터 분석, ML
	SECURITY_EXPERT = 'SecurityExpert', // 보안 분석, 취약점 검토
}
```

#### 페르소나별 컨텍스트

```typescript
export interface PersonaContext extends ExpertContext {
	persona: PersonaType;
	sessionId: string;
	userId: string;
	expertise: string[];
	personalizedTools: string[];
	memory: Map<string, any>;
	preferences: PersonaPreferences;
	createdAt: Date;
	lastActivity: Date;
}
```

## 🚫 MCP 프로토콜 제약사항

### 근본적 한계

1. **단일 서버 인스턴스**: 하나의 MCP 서버만 실행 가능
2. **순차 요청 처리**: 동시 다중 요청 불가
3. **샘플링 제한**: Host 클라이언트에 동시 다중 LLM 요청 불가
4. **상태 공유**: 모든 요청이 같은 엔진 인스턴스 공유

### MCP 도구 구조의 한계

```typescript
// 현재 MCP 도구들 - 페르소나 정보 없음
server.registerTool('process_request', {...});
server.registerTool('execute_next_plan', {...});
server.registerTool('replan_request', {...});
server.registerTool('reset_engine', {...});
```

## 💡 해결책: MCP 제약 하에서의 멀티페르소나

### 1. 가상 멀티페르소나 구현

#### PersonaSessionManager 도입

```typescript
class PersonaSessionManager {
	private personaSessions: Map<string, PersonaState> = new Map();

	switchToPersona(persona: PersonaType, sessionId: string): void {
		const personaKey = `${persona}_${sessionId}`;
		const personaState = this.personaSessions.get(personaKey);

		if (personaState) {
			// 기존 세션 복원
			this.restorePersonaContext(personaState);
		} else {
			// 새 페르소나 세션 생성
			this.createNewPersonaSession(persona, sessionId);
		}
	}
}
```

#### 컨텍스트 스위칭 메커니즘

```typescript
class StatefulExpertExecutionEngine extends ExpertExecutionEngine {
	private personaManager: PersonaSessionManager;

	async processRequestWithPersona(
		persona: PersonaType,
		sessionId: string,
		userRequest: string,
		availableHostTools: string[]
	): Promise<EngineResponse> {
		// 1. 페르소나 컨텍스트로 전환
		this.personaManager.switchToPersona(persona, sessionId);

		// 2. 페르소나 특화 전문가 로드
		const specializedExperts = this.getPersonaExperts(persona);

		// 3. 기존 로직 실행 (페르소나 컨텍스트 적용)
		const result = await this.executeWithPersonaContext(userRequest, availableHostTools, specializedExperts);

		// 4. 페르소나 상태 저장
		this.personaManager.savePersonaState(persona, sessionId);

		return result;
	}
}
```

### 2. 개선된 MCP 도구 구조

#### 하이브리드 접근법

```typescript
// 즉시 응답용 (간단한 요청)
server.registerTool('quick_persona_request', {
	inputSchema: {
		persona: z.nativeEnum(PersonaType),
		session_id: z.string().optional(),
		user_request: z.string(),
		available_host_tools: z.array(z.string()),
	},
});

// 계획 수립용 (복잡한 요청)
server.registerTool('complex_persona_planning', {
	inputSchema: {
		persona: z.nativeEnum(PersonaType),
		session_id: z.string().optional(),
		user_request: z.string(),
		available_host_tools: z.array(z.string()),
	},
});

// 페르소나 계획 실행용
server.registerTool('execute_persona_plan', {
	inputSchema: {
		persona: z.nativeEnum(PersonaType),
		session_id: z.string(),
		expert_plans: z.array(/* ... */),
		plan_indices: z.object(/* ... */),
	},
});
```

#### 스마트 페르소나 감지

```typescript
private detectPersonaFromRequest(userRequest: string): PersonaType {
    const keywords = {
        [PersonaType.DEVELOPER]: ['debug', 'refactor', 'implement', 'code', 'bug'],
        [PersonaType.BUSINESS_ANALYST]: ['requirement', 'process', 'strategy', 'roi'],
        [PersonaType.QA_ENGINEER]: ['test', 'quality', 'validate', 'coverage'],
        [PersonaType.DEVOPS_ENGINEER]: ['deploy', 'infrastructure', 'docker', 'k8s'],
    };

    for (const [persona, keywordList] of Object.entries(keywords)) {
        if (keywordList.some(kw => userRequest.toLowerCase().includes(kw))) {
            return PersonaType[persona as keyof typeof PersonaType];
        }
    }

    return PersonaType.DEVELOPER; // 기본값
}
```

### 3. 페르소나별 전문가 특화

#### ExpertFactory 패턴

```typescript
export class ExpertFactory {
	private personaExpertConfigs: Map<PersonaType, ExpertConfig[]>;

	createExpertsForPersona(persona: PersonaType): Map<ExpertName, Expert> {
		const configs = this.personaExpertConfigs.get(persona) || [];
		return new Map(configs.map((config) => [config.name, this.createExpert(config)]));
	}

	private initializePersonaConfigs(): void {
		this.personaExpertConfigs.set(PersonaType.DEVELOPER, [
			{ name: ExpertName.Planning, class: DeveloperPlanningExpert },
			{ name: ExpertName.Analysis, class: CodeAnalysisExpert },
			{ name: ExpertName.Implementation, class: ImplementationExpert },
		]);

		this.personaExpertConfigs.set(PersonaType.QA_ENGINEER, [
			{ name: ExpertName.Planning, class: QAPlanningExpert },
			{ name: ExpertName.Testing, class: TestPlanningExpert },
			{ name: ExpertName.Quality, class: QualityAssuranceExpert },
		]);
	}
}
```

## 📊 비교 분석

### 현재 vs 개선된 아키텍처

| 항목              | 현재 아키텍처    | 개선된 아키텍처             |
| ----------------- | ---------------- | --------------------------- |
| **동시 처리**     | ❌ 단일 요청만   | ✅ 페르소나별 세션 관리     |
| **컨텍스트 격리** | ❌ 공유 컨텍스트 | ✅ 페르소나별 독립 컨텍스트 |
| **전문성 특화**   | ❌ 범용 전문가   | ✅ 페르소나별 특화 전문가   |
| **사용자 경험**   | ⚠️ 일반적 응답   | ✅ 역할별 맞춤 응답         |
| **상태 관리**     | ❌ 단일 상태     | ✅ 페르소나별 상태          |
| **메모리 지속성** | ❌ 요청간 리셋   | ✅ 페르소나별 메모리        |

### 성능 영향

#### 장점

-   **컨텍스트 특화**: 페르소나별 최적화된 응답
-   **메모리 지속성**: 대화 맥락 유지
-   **전문성 향상**: 역할별 깊이 있는 분석

#### 단점

-   **메모리 사용 증가**: 여러 페르소나 상태 유지
-   **컨텍스트 스위칭 오버헤드**: 세션 전환 비용
-   **복잡성 증가**: 관리해야 할 상태 증가

## 🚀 구현 계획

### Phase 1: 기반 구조 (1-2주)

1. PersonaType enum 정의
2. PersonaContext 타입 확장
3. PersonaSessionManager 클래스 생성
4. 기존 엔진을 StatefulExpertExecutionEngine으로 확장

### Phase 2: 도구 통합 (2-3주)

1. quick_persona_request 도구 추가
2. complex_persona_planning 도구 추가
3. execute_persona_plan 도구 추가
4. 기존 도구와의 호환성 유지

### Phase 3: 전문가 특화 (3-4주)

1. ExpertFactory 패턴 구현
2. 페르소나별 전문가 클래스 개발
3. 스마트 페르소나 감지 로직 구현
4. 응답 스타일 차별화

### Phase 4: 최적화 (4-5주)

1. 메모리 관리 최적화
2. 세션 정리 및 가비지 컬렉션
3. 성능 모니터링 추가
4. 에러 처리 강화

## 🎯 결론

### 핵심 제약사항

-   **MCP 프로토콜 한계**: 진정한 동시 멀티페르소나는 불가능
-   **Host 클라이언트 제약**: 동시 다중 샘플링 요청 불가
-   **단일 서버 인스턴스**: 모든 요청이 같은 엔진 공유

### 현실적 해결책

-   **가상 멀티페르소나**: 단일 엔진 내에서 페르소나 시뮬레이션
-   **컨텍스트 스위칭**: 세션별 상태 저장/복원
-   **하이브리드 도구**: 간단/복잡 요청 구분 처리
-   **전문가 특화**: 페르소나별 최적화된 전문가 팀

### 기대 효과

-   ✅ **사용자 경험 향상**: 역할별 맞춤 응답
-   ✅ **전문성 강화**: 도메인별 깊이 있는 분석
-   ✅ **대화 연속성**: 페르소나별 메모리 유지
-   ✅ **유연성 증대**: 상황에 맞는 도구 선택

이 개선안은 **MCP 프로토콜의 제약 내에서 가능한 최선의 멀티페르소나 지원**을 제공하며, 향후 프로토콜 개선 시 진정한 멀티페르소나로 확장할 수 있는 기반을 마련합니다.

---

_작성일: 2024년_  
_작성자: AI Assistant_  
_버전: 1.0_
