# ===============================================
# Lexical 업데이트 태그(Update Tags) 심층 분석
# ===============================================
# 이 문서는 Lexical의 업데이트 동작을 세밀하게 제어하는 핵심 메커니즘인
# '업데이트 태그'의 개념, 종류, 그리고 활용 방법을 심층적으로 분석합니다.
# 원본: packages/lexical-website/docs/concepts/updates.md
# ===============================================

## 1. 업데이트 태그란?

업데이트 태그(Update Tag)는 `editor.update()`로 발생하는 각 업데이트에 **목적이나 유형을 명시하는 문자열 식별자**입니다. 이 태그를 통해 특정 업데이트를 어떻게 처리할지(예: 히스토리에 기록할지, 협업 세션에 전송할지) 세밀하게 제어할 수 있습니다. 하나의 업데이트에는 여러 개의 태그를 동시에 추가할 수 있습니다.

## 2. 태그 추가 및 확인 방법

### 2.1. 태그 추가

두 가지 방법으로 태그를 추가할 수 있습니다.

**1. `editor.update()`의 `tag` 옵션 사용**

```javascript
// 단일 태그 추가
editor.update(() => { /* ... */ }, {
  tag: HISTORY_PUSH_TAG
});

// 여러 태그 추가
editor.update(() => { /* ... */ }, {
  tag: [HISTORY_PUSH_TAG, PASTE_TAG]
});
```

**2. `update` 클로저 내에서 `$addUpdateTag()` 사용**

```javascript
editor.update(() => {
  $addUpdateTag(HISTORY_PUSH_TAG);
  // ...
});
```

### 2.2. 태그 확인 및 사용

추가된 태그는 주로 리스너(Listener)에서 확인하여 사용합니다.

-   **`registerUpdateListener`**: 콜백 함수의 `tags` 객체(`Set<string>`)를 통해 현재 업데이트에 포함된 모든 태그에 접근할 수 있습니다.
-   **`registerMutationListener`**: 콜백 함수의 `updateTags` 속성을 통해 태그에 접근할 수 있습니다.

```javascript
editor.registerUpdateListener(({tags}) => {
  if (tags.has(HISTORIC_TAG)) {
    // 히스토리 관련 업데이트일 경우의 로직 처리
  }
});
```

## 3. 주요 내장 태그 (Built-in Tags)

Lexical은 자주 사용되는 기능들을 위해 여러 태그를 상수로 제공합니다. **오타 방지와 타입 안전성을 위해, 문자열 리터럴 대신 반드시 이 상수들을 사용해야 합니다.**

-   **`HISTORY_PUSH_TAG`**: 강제로 새로운 히스토리(undo) 기록을 생성합니다.
-   **`HISTORY_MERGE_TAG`**: 현재 업데이트를 이전 히스토리 기록과 병합합니다.
-   **`HISTORIC_TAG`**: 해당 업데이트가 Undo/Redo에 의해 발생했음을 나타냅니다.
-   **`PASTE_TAG`**: 붙여넣기 작업으로 인한 업데이트임을 나타냅니다.
-   **`COLLABORATION_TAG`**: 협업 환경에서 발생한 업데이트임을 나타냅니다.
-   **`SKIP_COLLAB_TAG`**: 협업 파트너에게 해당 업데이트를 전송하지 않도록 합니다.
-   **`SKIP_DOM_SELECTION_TAG`**: DOM의 선택 영역을 업데이트하지 않습니다. (포커스 이동 방지에 매우 유용)
-   **`SKIP_SCROLL_INTO_VIEW_TAG`**: 선택 영역으로 화면이 자동 스크롤되는 것을 방지합니다.

## 4. 커스텀 태그 정의 및 활용

내장 태그 외에도, 애플리케이션의 특정 기능을 위한 자신만의 커스텀 태그를 정의하여 사용할 수 있습니다.

```javascript
// 1. 커스텀 태그를 상수로 정의
const MY_FEATURE_TAG = 'my-custom-feature';

// 2. 업데이트 시 태그 추가
editor.update(() => {
  $addUpdateTag(MY_FEATURE_TAG);
  // ... 내 기능 관련 로직 ...
});

// 3. 리스너에서 해당 태그를 감지하여 처리
editor.registerUpdateListener(({tags}) => {
  if (tags.has(MY_FEATURE_TAG)) {
    // 내 기능으로 인한 업데이트일 경우 특별한 처리
  }
});
``` 