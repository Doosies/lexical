# 심층 분석: ECDecimal - 순수한 View 컴포넌트

**파일 경로:** `packages/lexical-react/src/ECDecimal/ECDecimal.tsx`
**분석 일자:** 2025년 7월 25일
**버전:** 2.1 (분리)

---

## 1. 컴포넌트 개요

`ECDecimal`은 단순한 `<input>`이 아니라, **복잡한 숫자/금액 입력을 안정적이고 유연하게 처리하기 위한 정교한 제어 장치**입니다. 모든 비즈니스 로직을 외부로부터 `props`로 주입받아 동작하는 **제어 컴포넌트(Controlled Component)**로 설계되었습니다.

이러한 설계는 UI 렌더링과 비즈니스 로직(유효성 검사, 상태 변경 등)을 완벽하게 분리하여, 컴포넌트의 재사용성과 유지보수성을 극대화합니다.

> **Note:** 이 컴포넌트가 Lexical 에디터 내에서 어떻게 동작하는지에 대한 전체 아키텍처는 `02_LexicalDecimalNode_analysis.md` 문서를 참조하십시오.

---

## 2. 핵심 로직: 이벤트 처리 위임과 라이프사이클

사용자가 값을 입력하면, `onChange` 이벤트는 `['onValidator', 'onChange']` 순서로 정의된 콜백 체인(Chain)을 실행합니다.

- **1단계 (검증 `onValidator`):** 문지기(Gatekeeper)처럼 동작합니다. 유효하지 않은 값의 전파를 조기에 차단하는 책임을 집니다. 만약 `onValidator`가 `true`를 반환하면, 이후의 `onChange` 콜백은 실행되지 않고 프로세스가 중단됩니다.
- **2단계 (변경 전파 `onChange`):** 검증을 통과한 값만이 이 콜백을 통해 부모 컴포넌트(여기서는 `LexicalDecimalNode`)로 전달됩니다.
- **에러 처리 (`onError`):** 위 과정 중 어느 단계에서든 에러가 발생하면 `onError` 콜백이 실행됩니다.

---

## 3. 코드 레벨 상세 분석

`React.memo`, `useCallback`, `useMemo`를 적절히 사용하여 최적화를 꾀하고, `try...catch`와 라이프사이클 배열을 통해 매우 안정적이고 예측 가능한 방식으로 상태를 관리합니다.

```typescript
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { LexicalEditor } from 'lexical';
import React, { memo, useCallback, useMemo, useState } from 'react'

import { useLexicalComposerContext } from '../LexicalComposerContext';

// 컴포넌트가 받을 전체 props 정의. 핸들러 props를 확장합니다.
export interface IECDeciamlProps extends IECDecimalHandleProps {
    // 외부에서 주입되는 초기값 또는 제어되는 값
    value?: string;
}

// 부모 컴포넌트로부터 제어 로직을 주입받기 위한 콜백 함수들 정의
export interface IECDecimalHandleProps {
    // 값의 유효성을 검사하는 함수. true를 반환하면 이후 로직을 중단시킵니다.
    onValidator: (editor: LexicalEditor, payload: {value: string}) => boolean;
    // 값이 변경될 때 호출되는 함수.
    onChange: (editor: LexicalEditor, payload: {value: string}) => void;
    // 유효성 검사나 변경 과정에서 에러 발생 시 호출되는 함수.
    onError: (editor: LexicalEditor, payload: {value: string}) => void;
    // 외부에서 값이 변경되었을 때, 화면에 표시될 값을 포맷팅하는 함수.
    onValueFormatter: (editor: LexicalEditor, payload: {value: string}) => string;
}

// onChange 이벤트가 발생했을 때, 실행될 콜백 함수의 순서를 정의한 배열.
// 'onValidator'가 먼저 실행되고, 그 후에 'onChange'가 실행됩니다.
const onChangeLifecycle: string[] = [
    'onValidator',
    'onChange'
]

// React.memo를 사용하여 props가 변경되지 않으면 리렌더링을 방지하는 최적화된 컴포넌트
export const ECDecimal = memo(function ECDecimal(props: IECDeciamlProps) {
    // Lexical 에디터의 핵심 인스턴스를 컨텍스트로부터 가져옵니다.
    const [editor] = useLexicalComposerContext();

    // input 요소의 내부 상태(value)를 관리합니다.
    const [value, setValue] = useState(props.value);

    // 외부에서 props.value가 변경될 때마다 실행되는 로직.
    useMemo(() => {
        // 부모로부터 받은 onValueFormatter 함수를 사용해 props.value를 포맷팅합니다.
        const newValue = props.onValueFormatter(editor, {value: props.value ?? ''});
        // 포맷팅된 값이 현재 내부 상태와 다를 경우에만 내부 상태를 업데이트하여 리렌더링을 최소화합니다.
        if (newValue !== value) {
            setValue(newValue);
        }
    }, [props.value, props.onValueFormatter]); // props.value나 포맷터 함수가 바뀔 때만 실행

    // 사용자가 input에 직접 값을 입력할 때마다 호출되는 콜백 함수.
    // useCallback을 사용하여 의존성(props의 콜백 함수들)이 변경될 때만 함수를 재생성합니다.
    const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const payload = {value: e.target.value};
        try {
            // 미리 정의된 라이프사이클(onValidator -> onChange) 순서대로 props 함수를 실행합니다.
            for (const lifecycle of onChangeLifecycle) {
                if (props[lifecycle as keyof IECDecimalHandleProps]) {
                    // props에 해당 콜백 함수가 존재하면 실행합니다.
                    const result = props[lifecycle as keyof IECDecimalHandleProps](editor, payload);
                    // 만약 콜백 함수(주로 onValidator)가 true를 반환하면, 체인을 중단하고 루프를 빠져나갑니다.
                    if (result) {
                        break;
                    }
                }
            }
        } catch (error) {
            // 라이프사이클 실행 중 어떤 에러라도 발생하면 onError 콜백을 호출합니다.
            props.onError(editor, payload);
        }
    }, [props.onChange, props.onError, props.onValidator, props.onValueFormatter]);

    // 최종적으로 렌더링될 input 엘리먼트.
    // value는 내부 상태에 바인딩되고, onChange 이벤트는 위에서 정의한 콜백 함수에 연결됩니다.
    return <input type="text" onChange={onChange} value={value} />
})
``` 