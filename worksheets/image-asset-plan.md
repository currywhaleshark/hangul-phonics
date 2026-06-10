# 한글 파닉스 파일럿 이미지팩 계획

## 목적

첫 A4 인쇄용 파일럿 5장에 들어갈 작은 단어 카드용 이미지 목록이다. 고고 고양이와 나나 나비 메인 이미지는 기존 자산을 재사용한다. 신규 이미지는 큰 장면 일러스트가 아니라, 학습지 안의 작은 카드에 들어갈 단일 사물/동물 spot image로 만든다.

## 스타일 기준

- 기존 `고고 고양이.png`, `나나 나비.png`와 어울리는 밝은 유아용 수채화 일러스트
- 흰색 또는 제거하기 쉬운 단색 배경
- 한 이미지에 한 대상만 크게
- 글자, 로고, 워터마크 없음
- A4에 작게 들어가도 알아볼 수 있게 단순한 실루엣
- 너무 사실적이지 않고 둥글고 친근한 형태

## 기존 재사용

| 용도 | 파일 |
| --- | --- |
| 고고 메인 캐릭터 | `public/고고 고양이.png` |
| 나나 메인 캐릭터 | `public/나나 나비.png` |

## 신규 이미지

| 파일명 | 단어 | 쓰임 | 생성 우선순위 |
| --- | --- | --- | --- |
| `dog.png` | 강아지 | ㄱ 첫소리 카드, 분류 활동 | 필수 |
| `bear.png` | 곰 | ㄱ 첫소리 카드, 분류 활동, ㄴ 함정 | 필수 |
| `meat.png` | 고기 | ㄱ 첫소리 카드, 분류 활동 | 필수 |
| `snack.png` | 과자 | ㄱ 첫소리 카드, 분류 활동 | 필수 |
| `noodles.png` | 국수 | ㄱ 첫소리 카드 | 필수 |
| `raccoon-dog.png` | 너구리 | ㄴ 첫소리 카드, 분류 활동 | 필수 |
| `nieun-tree.png` | 나무 / ㄴ 길이 있는 나무 | 나나 문구와 ㄴ 첫소리 카드, ㄱ 페이지 함정 카드 | 필수 |
| `butterfly.png` | 나비 | ㄴ 첫소리 카드, 분류 활동 | 선택 필수 |
| `nap.png` | 낮잠 | ㄴ 첫소리 카드 | 선택 필수 |

도형/폰트로 처리할 것:

- `ㄱ`, `ㄴ`
- 노란색
- 집
- 따라쓰기 선
- 동그라미/오려 붙이기 안내선

## 공통 프롬프트 뼈대

```text
Use case: scientific-educational
Asset type: small vocabulary card illustration for a Korean phonics worksheet for a 3-year-old child
Primary request: [대상] only
Style/medium: cute watercolor children's educational illustration, matching a bright Korean preschool flashcard style
Composition/framing: single centered subject, large and clear, generous padding
Scene/backdrop: plain white background
Lighting/mood: bright, friendly, soft
Constraints: no text, no letters, no watermark, no extra objects, no background scene
Avoid: realism, clutter, shadows that make background removal difficult
```

## 대상별 프롬프트 메모

### dog.png

작고 귀여운 강아지 한 마리. 앉아 있거나 서 있는 단순 포즈. 갈색/크림색 계열.

### bear.png

귀여운 곰 한 마리. 둥근 몸, 친근한 얼굴. 너무 무섭지 않게.

### meat.png

접시에 놓인 고기 한 조각. 피가 보이지 않게, 유아용 그림처럼 단순하고 맛있어 보이게.

### snack.png

작은 과자 몇 개 또는 접시 위 과자. 포장지 글자 없음.

### noodles.png

그릇에 담긴 국수. 젓가락이나 김은 있어도 되지만 글자 없음. 국수 형태가 분명해야 한다.

### raccoon-dog.png

너구리 한 마리. 한국어 단어 `너구리`에 맞는 귀여운 raccoon dog 느낌. 미국 raccoon처럼 눈가 무늬가 과해도 되지만 친근하게.

### nieun-tree.png

ㄴ자처럼 꺾인 나무 또는 낮은 나무줄기. 나나가 앉는 나무와 연결될 수 있게 둥글고 튼튼한 나무 형태. 글자 `ㄴ` 자체를 직접 쓰지 말고, 나무 모양이 자연스럽게 ㄴ 길처럼 보이게.

### butterfly.png

귀여운 나비 한 마리. 기존 나나 나비와 충돌하지 않도록 더 단순한 작은 단어 카드용 나비.

### nap.png

낮잠을 나타내는 그림. 작은 베개와 이불, 또는 잠자는 아이/동물. 글자 `Z`는 넣지 않는다.

## 저장 위치

생성 후 최종 이미지는 다음 위치에 저장한다.

```text
worksheets/assets/
```

HTML 시안의 자리표시자 `data-asset` 값과 파일명을 맞추면 된다. 현재 별도 `tree.png`는 만들지 않고, 나무 카드는 모두 `nieun-tree.png`로 통일한다.
