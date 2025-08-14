// 로그 메시지의 구조를 정의합니다.
interface LogPayload {
	level: 'info' | 'warn' | 'error';
	subject: string;
	message: string;
	data?: any; // 선택적으로 추가 데이터를 포함할 수 있습니다.
	error?: any; // 에러 객체나 메시지를 포함할 수 있습니다.
}

/**
 * 표준 정보 로그를 콘솔에 출력합니다.
 * @param subject 로그를 발생시킨 주체
 * @param message 로그 메시지
 * @param data 추가적인 데이터 객체 (선택 사항)
 */
export function log(subject: string, message: string, data?: any) {
	const payload: LogPayload = { level: 'info', subject, message };
	if (data) {
		payload.data = data;
	}
	console.error(JSON.stringify(payload, null, 2));
}

/**
 * 표준 경고 로그를 콘솔에 출력합니다.
 * @param component 로그를 발생시킨 컴포넌트
 * @param message 경고 메시지
 * @param data 추가적인 데이터 객체 (선택 사항)
 */
export function warn(subject: string, message: string, data?: any) {
	const payload: LogPayload = { level: 'warn', subject, message };
	if (data) {
		payload.data = data;
	}
	console.error(JSON.stringify(payload, null, 2));
}

/**
 * 표준 오류 로그를 콘솔에 출력합니다.
 * @param component 로그를 발생시킨 컴포넌트
 * @param message 오류 메시지
 * @param error 오류 객체 (선택 사항)
 */
export function error(subject: string, message: string, error?: any) {
	const payload: LogPayload = { level: 'error', subject, message };
	if (error) {
		// Error 객체는 그대로 JSON.stringify하면 내용이 제대로 안 나올 수 있으므로,
		// stack과 message를 명시적으로 추출합니다.
		payload.error = {
			message: error.message,
			stack: error.stack,
		};
	}
	console.error(JSON.stringify(payload, null, 2));
}
