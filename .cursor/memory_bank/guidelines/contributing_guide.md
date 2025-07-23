# Lexical 기여 및 유지보수 가이드

**문서 상태**: `v1.0`

이 문서는 Lexical 모노레포의 구조, 규약, 개발 및 배포 절차 등 프로젝트 기여자 및 메인테이너를 위한 핵심 정보를 정리합니다.

---

## 1. 모노레포 구조 및 규약

-   **워크스페이스 관리**: `npm workspaces`를 사용하여 모노레포를 관리하며, 모든 패키지는 최상위 `package-lock.json`을 공유합니다.
-   **비공개 패키지**: `lexical-devtools`, `lexical-playground`와 같이 npm에 배포되지 않는 내부용 패키지는 `package.json`에 `"private": true` 속성을 반드시 포함해야 합니다.
-   **패키지 명명 규칙**:
    -   **디렉터리**: `packages/lexical-package-name`
    -   **package.json 이름**: `@lexical/package-name`
    -   **엔트리포인트**: `src/index.ts` (단일 모듈) 또는 각 파일(다중 모듈, e.g., `@lexical/react`)

---

## 2. 새 패키지 생성 절차

1.  **워크스페이스 생성**: `npm init -w packages/new-package-name` 명령어로 `package.json`의 기본 골격을 생성합니다.
2.  **초기 소스 파일 작성**: `src/index.ts` 등 초기 소스 파일을 작성합니다.
3.  **설정 자동화 및 문서 생성**: `npm run update-packages` 스크립트를 실행하여 `tsconfig.json`, `README.md` 등 필요한 설정과 문서 초안을 자동으로 생성합니다.
4.  **단위 테스트 작성**: `src/__tests__/unit/` 디렉터리 아래에 초기 단위 테스트를 작성하여 패키지의 기본 동작을 검증합니다.

---

## 3. 주요 개발 스크립트

-   **`npm run update-packages`**: 모든 패키지의 버전과 의존성을 동기화하고, `tsconfig` 및 `flowconfig`의 `paths`를 업데이트하며, 문서 초안을 생성하는 등, 개발 환경 설정을 위한 가장 중요한 스크립트입니다.
-   **`npm run prepare-release`**: npm 배포용 빌드를 실행하고, 각 패키지의 `npm/` 디렉터리에 배포될 최종 결과물을 생성합니다.
-   **`npm run ci-check`**: Flow, TypeScript, Prettier, ESLint 검사를 한 번에 실행하여 코드 품질을 검증합니다.
-   **`npm run test-unit`**: 단위 테스트를 실행합니다.

---

## 4. 릴리스 절차 및 프로토콜

-   **릴리스 절차**:
    1.  GitHub Actions (`version.yml`)을 통해 새 버전의 릴리스 브랜치를 생성합니다.
    2.  해당 브랜치에 대한 PR을 생성하고, 테스트 통과 후 병합합니다.
    3.  main 브랜치에 병합된 후, GitHub Actions (`pre-release.yml`)를 통해 npm에 배포합니다.
    4.  생성된 git 태그를 기반으로 GitHub Release를 작성하고, Discord를 통해 공지합니다.
-   **릴리스 프로토콜**:
    -   **Breaking Change**: 모든 파괴적인 변경이 포함된 PR은 제목에 `[Breaking Change]`를 명시해야 합니다.
    -   **릴리스 주기**: 매월 마지막 주에 마이너(minor) 버전 업데이트를 진행하며, 그 외에는 패치(patch) 업데이트를 원칙으로 합니다.

---

## 5. 테스트 전략 및 실행

-   **단위 테스트 (Unit Tests)**:
    -   **도구**: Jest
    -   **목적**: `lexical` 코어 패키지의 API 안정성 보장
    -   **실행**: `npm run test-unit`
-   **종단 테스트 (E2E Tests)**:
    -   **도구**: Playwright
    -   **목적**: Chromium, Firefox, WebKit 브라우저에서의 실제 동작 검증
    -   **실행**: `npx playwright install` (최초 1회) -> `npm run start &` -> `npm run test-e2e-chromium`
-   **테스트 작성 가이드라인**:
    -   새로운 기능은 반드시 테스트 코드를 포함해야 합니다.
    -   실패하는 테스트가 포함된 PR은 병합할 수 없습니다.
    -   테스트 코드의 추상화는 간단하고 이해하기 쉽게 유지해야 합니다. 

## 개발 도구

Lexical로 빌드된 웹사이트를 디버깅하는 가장 쉬운 방법은 Lexical 개발자 도구 브라우저 확장 프로그램을 설치하는 것입니다. 주요 브라우저에서 사용할 수 있습니다.

- **Chrome:** [Chrome 웹 스토어](https://chromewebstore.google.com/detail/lexical-developer-tools/kgljmdocanfjckcgfpcpdoklodllfdpc)
- **Edge:** [Edge Add-ons 스토어](https://microsoftedge.microsoft.com/addons/detail/lexical-developer-tools/pclbkaofdgafcfhlnimcdhhkkhcabpcb)
- **Firefox:** [Mozilla Add-ons](https://addons.mozilla.org/en-US/firefox/addon/lexical-developer-tools/)
- **Safari:** [Mac 앱 스토어](https://apps.apple.com/us/app/lexical-developer-tools/id6502753400)

이 확장 프로그램을 설치하면, Lexical로 빌드된 웹사이트([https://playground.lexical.dev/](https://playground.lexical.dev/) 등)를 방문했을 때 브라우저 개발자 도구 창에 'Lexical' 패널이 나타나 에디터의 상태를 실시간으로 확인하고 디버깅할 수 있습니다.

## 릴리스 절차

Lexical은 npm을 통해 패키지를 배포하며, 체계적인 버전 관리 및 릴리스 절차를 따릅니다. 