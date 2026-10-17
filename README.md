# 에니어그램 워크숍 (The Modern Enneagram 기반)

챕터 1–5 활동 + 6 마무리. 수강생 결과가 실시간으로 방(room) 단위로 공유됩니다.

## 1. 열린 수업용 (권장): Firebase + GitHub Pages
1. https://console.firebase.google.com 에서 프로젝트 생성 → Realtime Database 만들기(테스트 모드).
2. 규칙(Rules): `{ "rules": { ".read": true, ".write": true } }` (수업 기간에만, 끝나면 닫기)
3. `config.js`의 `firebaseUrl`에 DB 주소 입력 (예: `https://xxxx-default-rtdb.firebaseio.com`).
4. GitHub 새 저장소(예: yalli2/enneagram) 생성 → 이 폴더 전체 업로드 → Settings > Pages > main / root.
5. Creatorlink 홈페이지에 `https://yalli2.github.io/enneagram/` 링크 연결.

## 2. 사용법
- 방 코드(영문/숫자 3–20자)를 정해 모두가 같은 코드로 입장. `demo`는 체험용 가상 참가자 24명.
- 진행자 버튼: PIN 설정 → 전체 챕터 이동, 챕터별 결과 숨김/공개, 참가자 삭제, CSV 복사.

## 3. 유의
- PIN은 간이 장치이며 보안이 아닙니다. 개인정보·민감 내용은 입력하지 않도록 안내하세요.
- 한국어 요약은 교재 내용의 재서술이며, 진단 도구가 아닙니다.
- Claude 아티팩트로 열면 로그인한 Contributor 이상만 기록됩니다. 외부 수강생에겐 위 1번 방식을 쓰세요.
