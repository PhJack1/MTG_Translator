# MTG Cards Translator

🇬🇧 [English](README.md) | 🇫🇷 [Français](README.fr.md) | 🇪🇸 [Español](README.es.md) | 🇩🇪 [Deutsch](README.de.md) | 🇮🇹 [Italiano](README.it.md) | 🇵🇹 [Português](README.pt.md) | 🇯🇵 [日本語](README.ja.md) | 🇷🇺 [Русский](README.ru.md) | 🇨🇳 [简体中文](README.zh.md) | 🇹🇼 [繁體中文](README.zh-TW.md)

---

인기 있는 덱리스트 웹사이트에서 Magic: The Gathering 카드 이름을 자동으로 번역하는 Firefox 브라우저 확장 프로그램입니다.

## 🎯 기능

- **실시간 번역**: MTG 카드 이름을 선택한 언어로 즉시 번역
- **다국어 지원**: 10개 언어 지원 (FR, ES, DE, IT, PT, JA, KO, RU, ZH, ZH-TW)
- **지원 사이트**:
  - MTGTop8
  - MTGGoldfish
  - Moxfield
  - MTGDecks.net
- **스마트 로컬 캐시**: IndexedDB를 사용하여 번역을 저장하고 API 호출 감소
- **호버 모드**: 번역된 카드에 마우스를 올리면 영어 원본 이름 표시
- **가져오기/내보내기**: 맞춤 번역 데이터베이스 저장 및 공유

## 📦 설치

### Firefox Add-ons에서 (출시 예정)
*(게시 대기 중)*

### 수동 설치 (개발자용)

1. 저장소 복제:
```bash
git clone https://github.com/PhJack1/MTG_Translator.git
cd MTG_Translator
```

2. Firefox에서:
   - 주소 표시줄에 `about:debugging` 입력
   - 왼쪽 메뉴에서 "Firefox" 클릭
   - "임시 부가 기능 로드" 클릭
   - 프로젝트 폴더의 `manifest.json` 파일 선택

## 🚀 사용법

1. **언어 선택**: 확장 프로그램 아이콘을 클릭하고 사용 가능한 국기에서 대상 언어 선택

2. **페이지 번역**: 
   - 지원되는 사이트 방문 (예: mtgtop8.com)
   - "페이지의 카드 번역" 버튼 클릭
   - 카드 이름이 즉시 번역됩니다!

3. **원본 이름 보기**: 번역된 카드에 마우스를 올려 영어 이름을 일시적으로 표시

4. **수동 번역 추가**:
   - 첫 번째 필드에 영어 이름 입력
   - 두 번째 필드에 번역 입력
   - "저장" 클릭

5. **데이터베이스 내보내기/가져오기**:
   - **내보내기**: 번역 데이터베이스를 JSON 형식으로 다운로드
   - **가져오기**: JSON 파일을 드래그 앤 드롭하여 번역 병합

## 🔧 기술 아키텍처

### 스택
- **Manifest V2** (Firefox)
- **JavaScript 모듈 (ES6)**
- **IndexedDB** (로컬 캐싱용)
- **Scryfall API** (번역용)

### 프로젝트 구조
```
MTG_Translator/
├── manifest.json           # 확장 프로그램 구성
├── popup/
│   ├── popup.html         # 사용자 인터페이스
│   ├── popup.js           # 팝업 로직
│   └── popup.css          # 스타일
├── content/
│   └── content.js         # 웹 페이지에 삽입되는 스크립트
├── background/
│   ├── background.js      # 서비스 워커
│   ├── translations.js    # 번역 API
│   ├── scryfall.js        # Scryfall API 호출
│   ├── db.js              # IndexedDB 관리
│   ├── import.html        # 가져오기 인터페이스
│   ├── import.js          # 가져오기 로직
│   └── import.css         # 가져오기 스타일
└── assets/
    └── selectors.json     # 사이트별 CSS 선택자
```

### 작동 방식

1. **탐지**: 콘텐츠 스크립트가 사이트별 CSS 선택자를 통해 카드 이름이 포함된 요소 식별
2. **로컬 캐시**: IndexedDB에 번역이 있는지 확인
3. **Scryfall API**: 없으면 Scryfall 조회 (초당 약 10개 요청으로 제한)
4. **캐싱**: 새 번역을 로컬에 저장
5. **표시**: 호버 관리로 DOM의 텍스트 교체

## 🛠️ 새 사이트 추가

`assets/selectors.json`을 편집하고 적절한 CSS 선택자 추가:

```json
{
  "new-site.com": [
    {
      "selector": "카드용-css-선택자",
      "childIndex": 0
    }
  ]
}
```

복합 구조의 사이트(Moxfield 등)의 경우 복합 모드 사용:

```json
{
  "selector": "부모-선택자",
  "mode": "composite",
  "childSelector": "자식-선택자"
}
```

## 🤝 기여

기여를 환영합니다!

### 기여 아이디어
- 새 사이트 지원 추가
- 번역 성능 개선
- 새 언어 추가
- 버그 수정
- 사용자 인터페이스 개선

## 🐛 알려진 버그

- 양면 카드가 때때로 첫 번째 면만 표시할 수 있습니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스에 따라 라이선스가 부여됩니다 - 자세한 내용은 `LICENSE` 파일을 참조하세요.

## ⚖️ 법적 고지 및 면책 조항

**이 프로젝트는 Wizards of the Coast와 제휴, 후원, 승인 또는 인증되지 않았습니다.**

Magic: The Gathering, Magic, 마나 기호, 카드 이름, 카드 일러스트 및 기타 모든 관련 그래픽 및 텍스트 요소는 Hasbro, Inc.의 자회사인 **Wizards of the Coast LLC**의 **등록 상표**이자 독점 재산입니다.

© Wizards of the Coast LLC. 모든 권리 보유.

### 데이터 사용

이 확장 프로그램은 공식 카드 번역을 검색하기 위해 **Scryfall 공개 API**를 사용합니다. Scryfall은 Wizards of the Coast와 제휴하지 않습니다.

카드 데이터(이름, 번역)는 Wizards of the Coast의 재산으로 유지되며 개인 및 교육 목적으로만 사용됩니다.

### 이용 약관

- 이 도구는 **무료**로 제공되며 어떠한 종류의 **보증도 없습니다**
- 사용은 **본인 책임**입니다
- [Wizards of the Coast 이용 약관](https://company.wizards.com/en/legal/terms)을 준수하세요
- [Scryfall 이용 약관](https://scryfall.com/docs/api)을 준수하세요
- 데이터 또는 이 도구의 **상업적 사용은 허용되지 않습니다**

### 콘텐츠 정책

이 확장 프로그램은 **카드 이미지를 저장, 재배포 또는 표시하지 않습니다**. 카드 이름(사실 데이터)만 번역됩니다.

---

**MTG 커뮤니티를 위해 ❤️로 만들었습니다**