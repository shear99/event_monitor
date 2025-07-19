# 🏢 Church Billboard System (Next.js)

교회 층별 행사 안내를 위한 디지털 빌보드 시스템 - Next.js 버전

## 🚀 실행 방법

```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 `http://localhost:3000` 접속

## 📋 주요 기능

### 🎬 비디오 재생
- `public/video/` 폴더의 영상 파일을 순차 재생
- 무한 반복 재생 (intro1.mp4 → intro2.mp4 → intro3.mp4 → 반복)
- 자동 재생 및 오류 시 다음 영상으로 자동 넘어감

### 🏗️ 층별 행사 안내
- **4층**: 유초등부 (09:00-11:00)
- **3층**: 중고등부 (09:00-11:00), 대학청년부 (14:00-16:00)
- **2층**: 오전예배 (11:00-13:00), 오후예배 (14:00-16:00)
- **1층**: 행사 없음 (고정 어두운 색상)

## 🎨 색상 시스템

| 색상 | 코드 | 의미 | 설명 |
|------|------|------|------|
| 🟡 **금색** | `#FFD700` | **행사 임박** | 행사 시작 10분 전 |
| 🔴 **버건디** | `#DC143C` | **행사 진행 중** | 행사가 현재 진행 중 |
| 🔘 **회색** | `#757575` | **대기 중** | 다음 행사 대기 |
| ⚫ **어두운 회색** | `#2F2F2F` | **행사 종료** | 당일 마지막 행사 종료 후 |

## 🛠️ 개발자 도구

브라우저 콘솔에서 사용 가능:

```javascript
setTestTime('09:00')    // 시간 테스트
resetTime()             // 실제 시간으로 복원
setFontSize(48)         // 글자 크기 조정
showEvents()            // 행사 일정 확인
```

## 📁 파일 구조

```
church-billboard/
├── app/
│   ├── page.js                 # 메인 페이지
│   ├── globals.css             # 전역 스타일
│   └── api/
│       ├── events/route.js     # 행사 데이터 API
│       └── time/route.js       # 시간 API
├── components/
│   ├── VideoPlayer.js          # 비디오 플레이어
│   ├── ChurchBuilding.js       # 교회 건물 SVG
│   └── Clock.js                # 실시간 시계
├── lib/
│   └── eventUtils.js           # 행사 로직
└── public/
    ├── video/                  # 비디오 파일
    ├── image/                  # 이미지 파일
    └── data/                   # 데이터 파일
```

## 🎯 사용법

1. **비디오 추가**: `public/video/` 폴더에 mp4 파일 추가
2. **행사 정보 수정**: `lib/eventUtils.js`에서 eventData 배열 수정
3. **전체화면 모드**: F11 키
4. **개발 서버**: `npm run dev`로 실행

## 🔧 기술 스택

- **Next.js 14**: React 프레임워크
- **Tailwind CSS**: 스타일링
- **SVG**: 벡터 그래픽
- **React Hooks**: 상태 관리

## 📱 반응형 지원

- 전체화면 모드 최적화
- SVG viewBox를 통한 스케일링
- 다양한 해상도 지원