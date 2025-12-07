import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, ChefHat, Refrigerator, ChevronLeft, ChevronRight, AlertCircle, 
  Check, X, Search, Clock, ArrowRight, Trash2, RefreshCcw, CheckSquare, Square, 
  BarChart2, TrendingUp, AlertTriangle, ShoppingCart, Edit2, Snowflake, Archive, 
  BookOpen, ArrowLeft, Users, LogOut, Loader, Bell
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query
} from "firebase/firestore";

// ⚠️ 사용자 제공 Firebase 설정값 적용 완료
const firebaseConfig = {
  apiKey: "AIzaSyA8k03QUr1vTjiNLe1EhZpPTy4PVoqM808",
  authDomain: "fresh-calendar-107af.firebaseapp.com",
  projectId: "fresh-calendar-107af",
  storageBucket: "fresh-calendar-107af.firebasestorage.app",
  messagingSenderId: "632775280248",
  appId: "1:632775280248:web:90372fb81e94e252d1cf8d",
  measurementId: "G-Y3J452QS51"
};

// Firebase 초기화
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase Init Error:", e);
}

// --- 유통기한 데이터베이스 ---
const SHELF_LIFE_DB = {
  // 고기류
  '돼지고기': { fridge: 3, freezer: 30, risk: { danger: 1, warning: 2 } }, 
  '소고기': { fridge: 3, freezer: 30, risk: { danger: 1, warning: 2 } },
  '닭고기': { fridge: 2, freezer: 90, risk: { danger: 1, warning: 2 } },
  '오리훈제': { fridge: 14, freezer: 180, risk: { danger: 2, warning: 5 } },
  '양고기': { fridge: 3, freezer: 180, risk: { danger: 1, warning: 2 } },
  '베이컨': { fridge: 7, freezer: 30, risk: { danger: 2, warning: 4 } },
  '햄': { fridge: 7, freezer: 30, risk: { danger: 2, warning: 4 } },
  '소시지': { fridge: 14, freezer: 60, risk: { danger: 3, warning: 7 } },

  // 해산물
  '고등어': { fridge: 2, freezer: 90, risk: { danger: 1, warning: 2 } },
  '연어': { fridge: 2, freezer: 90, risk: { danger: 1, warning: 2 } },
  '새우': { fridge: 2, freezer: 180, risk: { danger: 1, warning: 2 } },
  '오징어': { fridge: 2, freezer: 180, risk: { danger: 1, warning: 2 } },
  '바지락': { fridge: 2, freezer: 90, risk: { danger: 1, warning: 2 } },

  // 유제품 & 계란
  '우유': { fridge: 7, freezer: 30, risk: { danger: 2, warning: 4 } }, 
  '달걀': { fridge: 30, freezer: 0, risk: { danger: 3, warning: 7 } },
  '요거트': { fridge: 10, freezer: 30, risk: { danger: 2, warning: 5 } },
  '치즈': { fridge: 20, freezer: 180, risk: { danger: 3, warning: 7 } },
  '생크림': { fridge: 7, freezer: 30, risk: { danger: 2, warning: 4 } },
  '버터': { fridge: 90, freezer: 365, risk: { danger: 7, warning: 14 } },

  // 채소 & 농산물
  '두부': { fridge: 5, freezer: 90, risk: { danger: 1, warning: 3 } },
  '콩나물': { fridge: 5, freezer: 0, risk: { danger: 1, warning: 3 } },
  '숙주': { fridge: 3, freezer: 0, risk: { danger: 1, warning: 2 } },
  '양파': { fridge: 14, freezer: 180, risk: { danger: 3, warning: 5 } },
  '감자': { fridge: 30, freezer: 365, risk: { danger: 5, warning: 10 } },
  '김치': { fridge: 90, freezer: 0, risk: { danger: 7, warning: 14 } },
  '마늘': { fridge: 30, freezer: 365, risk: { danger: 5, warning: 10 } },
  '대파': { fridge: 14, freezer: 180, risk: { danger: 3, warning: 5 } },
  '오이': { fridge: 7, freezer: 0, risk: { danger: 2, warning: 4 } },
  '양배추': { fridge: 30, freezer: 90, risk: { danger: 5, warning: 10 } },
  '당근': { fridge: 21, freezer: 365, risk: { danger: 3, warning: 7 } },
  '무': { fridge: 14, freezer: 90, risk: { danger: 3, warning: 6 } },
  '애호박': { fridge: 7, freezer: 90, risk: { danger: 2, warning: 4 } },
  '토마토': { fridge: 10, freezer: 90, risk: { danger: 2, warning: 5 } },
  '고수': { fridge: 5, freezer: 30, risk: { danger: 1, warning: 3 } },
  '바질': { fridge: 5, freezer: 90, risk: { danger: 1, warning: 3 } },

  // 과일
  '사과': { fridge: 21, freezer: 0, risk: { danger: 3, warning: 7 } }, 
  '바나나': { fridge: 5, freezer: 90, risk: { danger: 1, warning: 2 } },
  '딸기': { fridge: 3, freezer: 180, risk: { danger: 1, warning: 2 } },
  '귤': { fridge: 14, freezer: 0, risk: { danger: 3, warning: 6 } },

  // 곡류 & 기타
  '밥': { fridge: 3, freezer: 30, risk: { danger: 1, warning: 2 } },
  '식빵': { pantry: 3, freezer: 30, risk: { danger: 1, warning: 2 } },
  
  // 기본값 (DB에 없는 재료용)
  'default': { fridge: 7, risk: { danger: 2, warning: 4 } }
};

// --- 레시피 데이터베이스 (전체 60종) ---
const RECIPE_FULL_DB = [
  // --- 한식 (1-20) ---
  { id: 1, category: 'Korean', name: '김치찌개', ingredients: ['김치', '돼지고기', '두부', '대파'], measure: '김치 150g, 돼지고기 100g, 두부 1/4모, 대파 10cm', steps: ['1. [재료 손질] 돼지고기와 김치는 한입 크기, 두부 1cm, 대파 어슷썰기.', '2. [고기 볶기] 냄비에 식용유 1T 두르고 고기 겉면 하얗게 될 때까지 볶기.', '3. [김치 볶기] 김치와 설탕 0.3T 넣고 투명해질 때까지 볶기.', '4. [끓이기] 물 300ml 붓고 센불 5분 끓이기.', '5. [양념] 다진마늘 0.5T, 고춧가루 0.5T 넣고 중불.', '6. [마무리] 두부, 대파 넣고 3분 더 끓여 완성.'] },
  { id: 2, category: 'Korean', name: '된장찌개', ingredients: ['된장', '애호박', '두부', '양파', '감자'], measure: '된장 1T, 애호박 50g, 두부 1/4모, 감자 1/2개', steps: ['1. [손질] 채소 먹기 좋게 썰기.', '2. [육수] 멸치육수 300ml 끓이기.', '3. [된장] 물 끓으면 된장 1T 풀기.', '4. [채소] 감자 먼저 넣고 3분 뒤 나머지 채소 넣기.', '5. [두부] 채소 익으면 두부 넣기.', '6. [마무리] 청양고추, 대파 넣고 한소끔 끓이기.'] },
  { id: 3, category: 'Korean', name: '순두부찌개', ingredients: ['순두부', '바지락', '계란', '대파', '고기'], measure: '순두부 1/2봉, 바지락 100g, 다진고기 30g, 계란 1개', steps: ['1. [파기름] 식용유+참기름에 파, 고기 볶기.', '2. [고추기름] 고춧가루 1T 넣고 타지 않게 볶기.', '3. [끓이기] 물 200ml, 바지락 넣고 끓이기.', '4. [순두부] 순두부, 국간장, 마늘 넣고 2분.', '5. [마무리] 계란 톡 까서 넣기.'] },
  { id: 4, category: 'Korean', name: '미역국', ingredients: ['미역', '소고기', '참기름', '국간장'], measure: '건미역 10g, 소고기 50g, 국간장 1T', steps: ['1. [불리기] 미역 20분 불리고 씻기.', '2. [볶기] 참기름에 고기 볶다가 미역, 국간장 넣고 볶기.', '3. [끓이기] 물 600ml 붓고 푹 끓이기.', '4. [간] 다진마늘 넣고 소금으로 간 맞추기.'] },
  { id: 5, category: 'Korean', name: '삼계탕', ingredients: ['닭고기', '마늘', '인삼', '대추'], measure: '생닭 1마리, 통마늘 5알, 대추 3알', steps: ['1. [손질] 닭 꽁지, 날개 끝 제거 및 세척.', '2. [속채우기] 불린 찹쌀, 마늘 뱃속에 넣기.', '3. [삶기] 물 1.2L, 재료 다 넣고 센불 10분, 중불 40분.', '4. [완성] 소금 후추 곁들이기.'] },
  { id: 6, category: 'Korean', name: '불고기', ingredients: ['소고기', '양파', '당근', '간장', '마늘'], measure: '소고기 200g, 양파 1/2개, 당근 20g', steps: ['1. [재우기] 고기에 간장4T, 설탕2T, 마늘1T, 참기름1T 넣고 20분.', '2. [볶기] 팬에 고기 볶기.', '3. [채소] 고기 익으면 채소 넣고 볶기.', '4. [마무리] 통깨 뿌리기.'] },
  { id: 7, category: 'Korean', name: '제육볶음', ingredients: ['돼지고기', '양파', '고추장', '고춧가루'], measure: '돼지고기 200g, 양파 1/2개', steps: ['1. [밑간] 고기에 설탕 1T 버무리기.', '2. [양념] 고추장2, 고춧가루2, 간장1, 마늘1 넣고 재우기.', '3. [볶기] 고기 먼저 볶다가 채소 넣고 센불에 볶기.'] },
  { id: 8, category: 'Korean', name: '갈비찜', ingredients: ['소고기', '무', '당근', '간장'], measure: '찜갈비 300g, 무 50g, 당근 1/4개', steps: ['1. [핏물] 갈비 찬물에 1시간 핏물 빼기.', '2. [데치기] 끓는 물에 5분 데치기.', '3. [졸이기] 간장양념, 물, 고기 넣고 40분 푹 끓이기.', '4. [채소] 무, 당근 넣고 20분 더 졸이기.'] },
  { id: 9, category: 'Korean', name: '닭갈비', ingredients: ['닭고기', '양배추', '고구마', '떡'], measure: '닭다리살 200g, 양배추 100g, 고구마 1/2개', steps: ['1. [양념] 고추장3, 고춧가루3, 간장2, 설탕2, 카레가루1.', '2. [재우기] 닭고기 양념에 재우기.', '3. [볶기] 식용유 두르고 고기, 고구마 먼저 볶기.', '4. [채소] 양배추, 떡 넣고 볶기.'] },
  { id: 10, category: 'Korean', name: '보쌈', ingredients: ['돼지고기', '된장', '대파', '마늘'], measure: '통삼겹 200g, 된장 1T, 대파, 마늘', steps: ['1. [육수] 물에 된장, 파, 마늘, 커피가루 넣고 끓이기.', '2. [삶기] 물 끓으면 고기 넣고 50분 삶기.', '3. [썰기] 한 김 식혀서 얇게 썰기.'] },
  { id: 11, category: 'Korean', name: '비빔밥', ingredients: ['콩나물', '시금치', '계란', '고추장'], measure: '밥 1공기, 나물류, 계란 1개', steps: ['1. [나물] 각 나물 데쳐서 무치기.', '2. [계란] 후라이 만들기.', '3. [담기] 밥 위에 나물, 계란, 고추장, 참기름 올리기.'] },
  { id: 12, category: 'Korean', name: '김치볶음밥', ingredients: ['김치', '햄', '밥', '계란'], measure: '김치 100g, 밥 1공기, 햄 30g', steps: ['1. [파기름] 파 볶다가 햄, 김치 볶기.', '2. [밥] 불 끄고 밥 섞기.', '3. [볶기] 다시 센불에 볶고 굴소스 0.5T.', '4. [마무리] 계란후라이 올리기.'] },
  { id: 13, category: 'Korean', name: '김밥', ingredients: ['김', '밥', '햄', '단무지', '계란'], measure: '김 2장, 밥 1.5공기, 속재료', steps: ['1. [밥] 소금, 참기름 밑간.', '2. [재료] 햄, 계란 지단 등 준비.', '3. [말기] 김에 밥 얇게 펴고 재료 넣어 말기.'] },
  { id: 14, category: 'Korean', name: '잡채', ingredients: ['당면', '시금치', '당근', '양파', '돼지고기'], measure: '당면 50g, 각종 채소, 고기', steps: ['1. [삶기] 당면 6분 삶기.', '2. [볶기] 채소, 고기 각각 볶기.', '3. [버무리기] 팬에 당면, 간장설탕 양념 넣고 볶다가 재료 다 섞기.'] },
  { id: 15, category: 'Korean', name: '떡볶이', ingredients: ['떡', '어묵', '대파', '고추장'], measure: '떡 150g, 어묵 1장, 대파', steps: ['1. [육수] 물 300ml에 고추장2, 설탕2, 고춧가루1 풀기.', '2. [끓이기] 떡, 어묵 넣고 졸이기.', '3. [마무리] 대파 넣고 좀 더 끓이기.'] },
  { id: 16, category: 'Korean', name: '해물파전', ingredients: ['쪽파', '오징어', '새우', '밀가루'], measure: '쪽파 50g, 해물믹스, 부침가루', steps: ['1. [반죽] 부침가루:물 1:1 섞기.', '2. [굽기] 반죽 묻힌 쪽파 팬에 올리기.', '3. [토핑] 해물 올리고 계란물 붓기.', '4. [뒤집기] 노릇하게 굽기.'] },
  { id: 17, category: 'Korean', name: '냉면', ingredients: ['냉면', '오이', '계란', '무'], measure: '냉면사리, 시판육수, 오이, 계란', steps: ['1. [삶기] 면 40초 삶고 찬물 빡빡 씻기.', '2. [담기] 그릇에 면, 살얼음 육수 붓기.', '3. [고명] 오이, 계란 올리기.'] },
  { id: 18, category: 'Korean', name: '칼국수', ingredients: ['칼국수면', '애호박', '바지락', '감자'], measure: '칼국수면, 육수, 채소, 바지락', steps: ['1. [육수] 멸치육수 끓으면 바지락 넣기.', '2. [면] 면 넣고 5분 끓이기.', '3. [채소] 호박, 파 넣고 익히기.'] },
  { id: 19, category: 'Korean', name: '안동찜닭', ingredients: ['닭고기', '당면', '감자', '간장'], measure: '닭 300g, 당면, 채소, 간장소스', steps: ['1. [데치기] 닭 데쳐내기.', '2. [끓이기] 닭, 감자, 소스, 물 넣고 끓이기.', '3. [졸이기] 당면 넣고 국물 자작해질 때까지 졸이기.'] },
  { id: 20, category: 'Korean', name: '콩국수', ingredients: ['소면', '콩', '오이'], measure: '소면, 콩국물, 오이', steps: ['1. [삶기] 소면 삶아 찬물 헹구기.', '2. [담기] 그릇에 면 담고 콩국물 붓기.', '3. [고명] 오이채, 깨 뿌리기.'] },

  // --- JAPANESE (21-30) ---
  { id: 21, category: 'Japanese', name: '초밥', ingredients: ['밥', '식초', '회'], measure: '밥 150g, 회 8점, 와사비, [단촛물: 식초 1T, 설탕 0.5T, 소금 한꼬집]', steps: ['1. [단촛물 섞기] 갓 지은 고슬고슬한 밥에 단촛물 재료를 섞어 넣습니다.', '2. [밥 식히기] 주걱을 세워 밥알이 으깨지지 않게 자르듯이 섞으며 부채질로 체온 정도로 식힙니다.', '3. [손 준비] 손에 밥알이 붙지 않게 물(또는 식초물)을 살짝 묻힙니다.', '4. [밥 쥐기] 오른손으로 밥을 15~20g 정도 쥐어 둥글게 모양을 잡습니다.', '5. [와사비 바르기] 왼손에 회를 올리고 검지로 와사비를 콩알만큼 찍어 회 중앙에 바릅니다.', '6. [합치기] 밥을 회 위에 올리고 가볍게 두 손가락으로 눌러 모양을 잡아 완성합니다.'] },
  { id: 22, category: 'Japanese', name: '라멘', ingredients: ['라면사리', '숙주', '대파', '계란'], measure: '라멘 생면 1개, 시판 돈코츠 육수 300ml, 차슈 1장, 숙주 30g, 대파 10cm, 반숙란 1/2개', steps: ['1. [육수 끓이기] 냄비에 시판 돈코츠 육수를 붓고 끓입니다.', '2. [면 삶기] 다른 냄비에 물을 넉넉히 끓여 생면을 넣고 2분~3분 (원하는 익힘 정도) 삶습니다.', '3. [물기 제거] 다 삶은 면은 체에 받쳐 물기를 탁탁 털어냅니다.', '4. [담기] 예열한 그릇에 면을 담고 뜨거운 육수를 붓습니다.', '5. [토핑 올리기] 차슈, 데친 숙주, 대파, 반숙 계란, 김 등을 보기 좋게 올립니다.', '6. [마무리] 후추나 깨, 마늘기름 등을 취향껏 뿌립니다.'] },
  { id: 23, category: 'Japanese', name: '우동', ingredients: ['우동면', '어묵', '대파'], measure: '우동면 1개, 물 300ml, [국물: 쯔유 30ml], 어묵 1장, 대파 10cm, 쑥갓', steps: ['1. [육수 끓이기] 냄비에 물과 쯔유를 비율에 맞춰 붓고 끓입니다.', '2. [재료 넣기] 육수가 끓으면 어묵, 유부 등 건더기를 넣습니다.', '3. [면 넣기] 냉동 우동면을 넣고 젓가락으로 억지로 풀지 말고 1분간 그대로 둡니다.', '4. [면 풀기] 면이 자연스럽게 풀리면 살살 저어가며 1분 더 끓입니다.', '5. [담기] 그릇에 면과 국물을 담습니다.', '6. [토핑] 송송 썬 대파, 쑥갓, 튀김 부스러기(텐카스), 시치미 등을 올려 냅니다.'] },
  { id: 24, category: 'Japanese', name: '규동', ingredients: ['소고기', '양파', '계란', '밥'], measure: '얇은 소고기 100g, 밥 1공기, 양파 1/2개, 계란 1개, [소스: 쯔유 4T, 물 4T, 설탕 1T]', steps: ['1. [소스 끓이기] 작은 팬에 소스 재료를 넣고 채썬 양파를 넣어 중불에서 끓입니다.', '2. [양파 익히기] 양파가 투명해질 때까지 3분간 충분히 익혀 단맛을 냅니다.', '3. [고기 넣기] 얇은 소고기(우삼겹 등)를 넣고 젓가락으로 뭉치지 않게 풀어가며 익힙니다.', '4. [계란 준비] 계란 1개를 그릇에 까서 흰자와 노른자가 대충 섞이게 두세 번만 저어줍니다.', '5. [계란 붓기] 고기가 익으면 계란물을 원을 그리며 붓고 뚜껑을 덮어 30초간 반숙으로 익힙니다.', '6. [담기] 따뜻한 밥 위에 국물과 건더기를 덮밥처럼 부어 완성합니다.'] },
  { id: 25, category: 'Japanese', name: '오코노미야키', ingredients: ['양배추', '계란', '밀가루', '베이컨'], measure: '양배추 100g, 계란 1개, [반죽: 부침가루 50g, 물 50ml], 베이컨 2줄, 오코노미야키 소스, 마요네즈, 가쓰오부시', steps: ['1. [반죽 만들기] 볼에 부침가루, 물, 계란을 넣고 섞은 뒤 채썬 양배추를 넣고 가볍게 버무립니다.', '2. [굽기 시작] 달군 팬에 기름을 넉넉히 두르고 반죽을 2cm 두께로 둥글고 도톰하게 폅니다.', '3. [토핑 올리기] 반죽 위에 베이컨을 덮듯이 올립니다.', '4. [익히기] 바닥이 노릇해지면 뒤집어서 뚜껑을 덮고 약불에서 4~5분 속까지 익힙니다.', '5. [마무리 굽기] 다시 뒤집어 베이컨이 위로 오게 한 뒤 강불로 살짝 수분을 날립니다.', '6. [소스 뿌리기] 접시에 담고 오코노미야키 소스, 마요네즈, 가쓰오부시, 파슬리를 뿌립니다.'] },
  { id: 26, category: 'Japanese', name: '타코야키', ingredients: ['밀가루', '문어', '대파'], measure: '타코야키 믹스 100g, 물 300ml, 문어 50g, 대파, 텐카스, 타코야키 소스, 마요네즈', steps: ['1. [반죽 준비] 타코야키 믹스와 물, 계란을 섞어 묽은 반죽을 만듭니다.', '2. [예열] 타코야키 팬을 달구고 붓으로 기름을 넉넉히 바릅니다.', '3. [반죽 붓기] 반죽을 구멍의 80% 정도 채우고 큼직한 문어 조각을 하나씩 넣습니다.', '4. [추가 재료] 텐카스, 파 등을 뿌리고 남은 반죽을 구멍이 넘치도록 가득 붓습니다.', '5. [굴리기] 바닥이 익으면 꼬치로 구획을 나누고 90도씩 돌려가며 동그란 모양을 잡습니다.', '6. [완성] 겉이 갈색으로 바삭해질 때까지 5~7분간 굴려 익힌 뒤 접시에 담아 소스와 가쓰오부시를 뿌립니다.'] },
  { id: 27, category: 'Japanese', name: '튀김 (덴푸라)', ingredients: ['새우', '채소', '튀김가루'], measure: '새우 3마리, 채소 약간, 튀김가루 1컵, 차가운 얼음물 1컵, 식용유', steps: ['1. [재료 손질] 새우는 껍질을 벗기고 물기를 제거하며, 채소는 얇게 썹니다.', '2. [반죽 만들기] 볼에 튀김가루와 차가운 얼음물을 넣고 젓가락으로 툭툭 치듯 대충 섞습니다 (날가루가 보여도 됩니다).', '3. [덧가루 묻히기] 재료 표면에 마른 튀김가루를 얇게 묻혀 튀김옷이 잘 붙게 합니다.', '4. [옷 입히기] 반죽물에 재료를 담갔다 뺍니다.', '5. [튀기기] 170~180도 기름에 넣고 재료가 떠오를 때까지 1분 30초~2분간 튀깁니다.', '6. [기름 빼기] 튀김 망에 올려 기름을 털고 눅눅해지지 않게 식힙니다.'] },
  { id: 28, category: 'Japanese', name: '야키소바', ingredients: ['면', '양배추', '숙주', '돼지고기'], measure: '중화면 1개, 양배추 50g, 숙주 50g, 돼지고기 50g, [소스: 굴소스 2T, 케찹 1T, 간장 0.5T, 설탕 0.5T]', steps: ['1. [재료 볶기] 달군 팬에 기름을 두르고 돼지고기, 양파, 당근을 넣어 센불에서 볶습니다.', '2. [면 넣기] 고기가 익으면 삶은 면(또는 중화면)을 넣고 기름 코팅이 되도록 1분간 볶습니다.', '3. [소스 넣기] 준비한 소스를 붓고 면에 색이 배어들도록 골고루 섞습니다.', '4. [숙주 넣기] 마지막에 숙주를 넣고 30초간 센불에서 빠르게 볶아 아삭함을 살립니다.', '5. [담기] 접시에 담고 계란 프라이, 초생강, 마요네즈 등을 곁들입니다.'] },
  { id: 29, category: 'Japanese', name: '카레라이스', ingredients: ['카레', '양파', '감자', '당근'], measure: '고형카레 1조각, 밥 1공기, 양파 1/2개, 감자 1/2개, 당근 1/4개, 고기 50g, 물 300ml', steps: ['1. [양파 볶기] 냄비에 기름을 두르고 채썬 양파를 중약불에서 10분 이상 갈색이 되도록 볶아 단맛을 냅니다 (캬라멜라이징).', '2. [재료 볶기] 한입 크기로 썬 고기, 감자, 당근을 넣고 고기 겉면이 익을 때까지 볶습니다.', '3. [물 붓기] 물을 재료가 잠길 만큼 붓고 재료가 완전히 익을 때까지 15분간 끓입니다.', '4. [카레 풀기] 불을 잠시 끄고 고형 카레를 넣어 잘 풀어줍니다.', '5. [끓이기] 다시 불을 켜고 약불에서 바닥이 눌어붙지 않게 저어가며 5분간 걸쭉하게 끓입니다.', '6. [완성] 밥 위에 카레를 듬뿍 얹어 냅니다.'] },
  { id: 30, category: 'Japanese', name: '소바', ingredients: ['메밀면', '무', '와사비', '쪽파'], measure: '메밀면 100g, [소스: 쯔유 원액 50ml, 물 150ml], 간 무 1T, 쪽파 1대, 와사비', steps: ['1. [면 삶기] 끓는 물에 메밀면을 넣고 봉지에 적힌 시간대로 (약 4~5분) 삶습니다.', '2. [씻기] 삶은 면을 찬물(얼음물)에 담가 빨래하듯 빡빡 문질러 씻어 전분기를 완전히 제거합니다.', '3. [물기 제거] 체에 받쳐 물기를 털어내고 채반(자루)에 예쁘게 담습니다.', '4. [소스 준비] 쯔유 원액을 물과 희석하여 소스를 만듭니다.', '5. [고명 준비] 무는 강판에 갈아 물기를 살짝 짜고, 쪽파는 송송 썰고, 와사비를 준비합니다.', '6. [먹기] 소스에 무, 파, 와사비를 풀고 면을 조금씩 적셔 먹습니다.'] },

  // --- CHINESE (31-40) ---
  { id: 31, category: 'Chinese', name: '짜장면', ingredients: ['춘장', '돼지고기', '양파', '면'], measure: '중화면 1개, 춘장 1T, 다짐육 50g, 양파 1/2개, 설탕 0.5T, 식용유 2T, 전분물', steps: ['1. [춘장 볶기] 팬에 식용유를 넉넉히 두르고 춘장을 넣어 약불에서 3분간 튀기듯 볶은 뒤 기름과 춘장을 따로 덜어둡니다.', '2. [재료 볶기] 춘장 볶은 기름을 팬에 두르고 파, 고기, 양파, 양배추를 센불에서 볶습니다.', '3. [춘장 섞기] 채소가 익으면 볶아둔 춘장과 설탕을 넣고 재료와 잘 어우러지게 볶습니다.', '4. [끓이기] 물을 자작하게 붓고 끓이다가 전분물을 조금씩 넣어 걸쭉한 농도를 맞춥니다.', '5. [면 삶기] 끓는 물에 중화면을 삶아 찬물에 헹군 뒤 따뜻한 물에 토렴하여 그릇에 담습니다.', '6. [완성] 면 위에 짜장 소스를 붓고 오이채 등을 올립니다.'] },
  { id: 32, category: 'Chinese', name: '짬뽕', ingredients: ['오징어', '새우', '양파', '고춧가루'], measure: '중화면 1개, 해물믹스 100g, 양파 1/2개, 배추 1장, 육수 400ml, [양념: 고춧가루 2T, 간장 1T, 굴소스 1T, 다진마늘 1T]', steps: ['1. [고추기름 내기] 웍에 식용유를 두르고 대파, 마늘, 돼지고기, 고춧가루를 넣어 중약불에서 타지 않게 볶습니다.', '2. [센불 볶기] 향이 올라오면 센불로 키우고 해물(오징어, 홍합 등)과 채소(양파, 배추)를 넣어 빠르게 볶아 불맛을 입힙니다.', '3. [간 하기] 간장과 굴소스를 팬 가장자리에 둘러 태우듯이 볶아 풍미를 더합니다.', '4. [육수 붓기] 뜨거운 물이나 육수를 붓고 5분간 팔팔 끓여 맛을 우려냅니다.', '5. [면 삶기] 중화면을 삶아 물기를 빼고 그릇에 담습니다.', '6. [담기] 면 위에 국물과 건더기를 넉넉히 부어 완성합니다.'] },
  { id: 33, category: 'Chinese', name: '탕수육', ingredients: ['돼지고기', '전분', '설탕', '식초'], measure: '돼지 등심 150g, 전분 1/2컵, [소스: 물 1컵, 설탕 6T, 식초 4T, 간장 2T, 전분물]', steps: ['1. [반죽 준비] 감자전분을 물에 불려 층을 분리한 뒤, 윗물은 버리고 가라앉은 앙금에 식용유와 계란흰자를 섞어 반죽을 만듭니다.', '2. [1차 튀김] 고기에 반죽을 입혀 170도 기름에서 3분간 속까지 익도록 튀겨 건져냅니다.', '3. [수분 날리기] 튀김을 체에 받쳐 탁탁 쳐서 수분을 날립니다.', '4. [2차 튀김] 기름 온도를 180도로 높여 1분간 노릇하고 바삭하게 한 번 더 튀깁니다.', '5. [소스 만들기] 냄비에 소스 재료를 넣고 끓이다가 전분물을 조금씩 넣어 농도를 맞춥니다.', '6. [완성] 튀김과 소스를 따로 내거나(찍먹), 소스에 버무려(부먹) 냅니다.'] },
  { id: 34, category: 'Chinese', name: '마파두부', ingredients: ['두부', '다진고기', '두반장'], measure: '두부 1/2모, 다짐육 50g, 물 150ml, [양념: 두반장 1.5T, 굴소스 1T, 고춧가루 1T, 설탕 1t], 전분물', steps: ['1. [향 내기] 달군 팬에 고추기름을 두르고 대파, 마늘을 볶아 향을 냅니다.', '2. [고기 볶기] 다진 돼지고기를 넣고 뭉치지 않게 풀어가며 센불에서 볶습니다.', '3. [양념 볶기] 양념 재료를 넣고 기름에 볶아 향을 돋웁니다.', '4. [끓이기] 물을 붓고 끓어오르면 깍둑 썬 두부를 넣고 3분간 중불에서 조립니다.', '5. [농도 조절] 물전분을 조금씩 넣어 걸쭉하게 만들고 불을 끕니다.', '6. [마무리] 참기름이나 산초가루(화자오)를 뿌려 풍미를 더합니다.'] },
  { id: 35, category: 'Chinese', name: '볶음밥', ingredients: ['밥', '계란', '대파', '당근'], measure: '밥 1공기, 계란 2개, 대파 10cm, 당근 10g, [양념: 간장 1T, 굴소스 0.5T, 소금 약간]', steps: ['1. [파기름] 팬에 식용유를 넉넉히 두르고 대파를 볶아 파기름을 냅니다.', '2. [스크램블] 파를 한쪽으로 밀고 계란을 깨 넣어 스크램블을 만든 뒤 파와 섞습니다.', '3. [밥 넣기] 식은 밥을 넣고 국자나 주걱을 세워 밥알을 으깨지 말고 자르듯이 센불에서 볶습니다.', '4. [간 하기] 밥이 고슬고슬해지면 간장 1T를 팬 가장자리에 둘러 태우듯 눌려 불맛을 입히고 섞습니다.', '5. [볶기] 굴소스나 소금으로 부족한 간을 하고 수분이 날아갈 때까지 2분간 더 볶습니다.', '6. [완성] 그릇에 담아 완성합니다.'] },
  { id: 36, category: 'Chinese', name: '딤섬(만두)', ingredients: ['만두피', '돼지고기', '부추'], measure: '만두피 10장, 다짐육 100g, 부추 30g, [소 양념: 간장 1T, 굴소스 1T, 참기름 1T, 다진생강 약간]', steps: ['1. [소 만들기] 다진 고기, 부추, 대파, 생강, 소 양념을 볼에 넣고 끈기가 생길 때까지 치댑니다.', '2. [빚기] 만두피 가장자리에 물을 바르고 소를 한 숟가락 넣은 뒤 주름을 잡아 빚습니다.', '3. [찜기 준비] 찜기에 물을 끓이고 젖은 면보나 종이 호일을 깝니다.', '4. [찌기] 만두가 서로 붙지 않게 올리고 뚜껑을 덮어 10분~12분간 찝니다.', '5. [군만두 옵션] 팬에 기름을 두르고 굽다가 바닥이 익으면 물을 소주잔 반 컵 붓고 뚜껑 덮어 3분간 증기로 윗면을 익힙니다.', '6. [완성] 초간장을 곁들여 냅니다.'] },
  { id: 37, category: 'Chinese', name: '양꼬치', ingredients: ['양고기', '쯔란'], measure: '양고기 150g, 쯔란 시즈닝 1T', steps: ['1. [고기 손질] 양고기(어깨살 등)를 2cm 크기 큐브 모양으로 깍둑썰기 합니다.', '2. [시즈닝] 볼에 고기와 쯔란 시즈닝 가루, 오일 약간을 넣고 골고루 버무려 잠시 둡니다.', '3. [꿰기] 꼬치에 고기를 너무 빽빽하지 않게 꽂습니다.', '4. [굽기 - 에어프라이어] 200도로 예열한 에어프라이어에 넣고 5분 굽습니다.', '5. [뒤집기] 꺼내서 뒤집은 뒤 5분 더 구워 노릇하게 만듭니다. (팬 조리시 중불에서 굴려가며 굽기)', '6. [완성] 익은 고기에 쯔란을 추가로 찍어 먹습니다.'] },
  { id: 38, category: 'Chinese', name: '마라탕', ingredients: ['마라소스', '소고기', '청경채', '당면'], measure: '시판 마라소스 50g, 사골육수 300ml, 소고기 100g, 청경채, 당면 50g, 땅콩소스(즈마장)', steps: ['1. [육수 만들기] 냄비에 사골육수와 시판 마라소스를 넣고 잘 풀어 끓입니다.', '2. [재료 손질] 채소는 씻어 자르고, 당면과 푸주 등은 미리 물에 불려둡니다.', '3. [단단한 재료] 육수가 끓으면 감자, 연근, 완자 등 익는 데 오래 걸리는 재료를 먼저 넣고 3분간 끓입니다.', '4. [부드러운 재료] 소고기, 청경채, 버섯, 불린 당면을 넣습니다.', '5. [끓이기] 재료가 다 익을 때까지 2~3분간 더 끓입니다.', '6. [마무리] 땅콩소스(즈마장)를 곁들여 냅니다.'] },
  { id: 39, category: 'Chinese', name: '토마토 달걀 볶음', ingredients: ['토마토', '계란', '대파'], measure: '토마토 1개, 계란 2개, 대파 10cm, [양념: 굴소스 0.5T, 소금, 설탕 약간]', steps: ['1. [재료 준비] 토마토는 웨지 모양으로 썰고 대파는 송송 썹니다. 계란은 소금 간 하여 풉니다.', '2. [스크램블] 달군 팬에 기름을 두르고 계란을 부어 몽글몽글하게 80%만 익힌 뒤 접시에 덜어둡니다.', '3. [향 내기] 팬에 다시 기름을 두르고 대파를 볶아 파기름을 냅니다.', '4. [토마토 볶기] 토마토을 넣고 중불에서 볶아 즙이 나오고 흐물해질 때까지 익힙니다.', '5. [합치기] 덜어둔 계란을 넣고 굴소스와 설탕으로 간을 한 뒤 30초간 빠르게 섞습니다.', '6. [마무리] 참기름을 살짝 두르고 그릇에 담습니다.'] },
  { id: 40, category: 'Chinese', name: '쿵파오 치킨', ingredients: ['닭고기', '땅콩', '건고추'], measure: '닭가슴살 150g, 땅콩 2T, 건고추 3개, 대파 10cm, [소스: 간장 2T, 식초 1T, 설탕 1T, 굴소스 1T, 맛술 1T]', steps: ['1. [닭 밑간] 닭고기는 깍둑썰어 소금, 후추, 전분가루로 버무려 둡니다.', '2. [닭 익히기] 팬에 기름을 넉넉히 두르고 닭고기를 넣어 튀기듯이 볶아 익힌 뒤 덜어냅니다.', '3. [향신료 볶기] 팬에 식용유를 두르고 건고추, 대파, 마늘, 생강을 볶아 매운 향을 냅니다.', '4. [합치기] 익혀둔 닭고기와 소스를 넣고 센불에서 빠르게 볶습니다.', '5. [땅콩 넣기] 소스가 졸아들면 볶은 땅콩을 넣고 가볍게 섞습니다.', '6. [완성] 윤기 나게 볶아 접시에 담습니다.'] },

  // --- ITALIAN (41-50) ---
  { id: 41, category: 'Italian', name: '알리오 올리오', ingredients: ['파스타면', '마늘', '올리브오일'], measure: '파스타면 100g, 통마늘 5개, 올리브오일 30ml, 페페론치노 2개, 소금', steps: ['1. [물 끓이기] 냄비에 물 1L와 소금 10g을 넣고 끓입니다.', '2. [면 삶기] 물이 끓으면 파스타면을 넣고 포장지 시간보다 1~2분 덜 삶습니다 (면수는 버리지 마세요).', '3. [마늘 볶기] 팬에 올리브오일을 넉넉히 두르고 편마늘과 페페론치노를 넣어 약불에서 3분간 천천히 볶아 향을 냅니다.', '4. [면수 넣기] 마늘이 노릇해지면 면수 1~2국자를 팬에 부어 기름과 섞이게 끓입니다.', '5. [에멀전] 삶은 면을 팬에 넣고 센불에서 볶으며 팬을 흔들어 물과 기름이 유화되어 소스가 걸쭉해지게 만듭니다.', '6. [마무리] 불을 끄고 엑스트라 버진 올리브오일을 살짝 두르고 파슬리를 뿌려 냅니다.'] },
  { id: 42, category: 'Italian', name: '까르보나라', ingredients: ['파스타면', '베이컨', '계란', '치즈'], measure: '파스타면 100g, 베이컨 2줄, [소스: 계란 노른자 1개, 파마산 치즈 2T, 후추]', steps: ['1. [재료 준비] 베이컨(관찰레)은 도톰하게 썰고, 볼에 소스 재료를 섞어 둡니다.', '2. [면 삶기] 소금물에 면을 삶습니다.', '3. [베이컨 볶기] 팬에 베이컨을 넣고 약불에서 천천히 볶아 기름을 충분히 냅니다.', '4. [면 섞기] 삶은 면을 팬에 넣고 베이컨 기름과 면수 약간을 넣어 잘 섞어준 뒤 반드시 불을 끕니다.', '5. [소스 섞기] 팬의 열기가 한 김 식으면(약 65도) 준비한 계란 소스를 붓고 빠르게 비벼 익힙니다 (너무 뜨거우면 스크램블이 됨).', '6. [완성] 꾸덕해지면 접시에 담고 후추와 치즈를 더 뿌립니다.'] },
  { id: 43, category: 'Italian', name: '토마토 파스타', ingredients: ['파스타면', '토마토', '마늘', '바질'], measure: '파스타면 100g, 토마토소스 150g, 마늘 2알, 양파 1/4개, 올리브오일', steps: ['1. [면 삶기] 끓는 소금물에 면을 삶아 건져둡니다 (오일 코팅).', '2. [채소 볶기] 팬에 올리브오일을 두르고 다진 마늘과 다진 양파를 중불에서 향이 나게 볶습니다.', '3. [소스 끓이기] 시판 토마토소스와 면수 1국자를 넣고 3분간 끓여 신맛을 날리고 풍미를 더합니다.', '4. [면 넣기] 삶은 면을 소스에 넣고 1~2분간 볶아 소스가 면에 잘 배어들게 합니다.', '5. [옵션] 기호에 따라 버터 한 조각을 넣으면 풍미가 좋아집니다.', '6. [마무리] 접시에 담고 바질이나 파슬리 가루를 뿌립니다.'] },
  { id: 44, category: 'Italian', name: '피자 마르게리타', ingredients: ['도우', '토마토', '모짜렐라', '바질'], measure: '또띠아 1장, 토마토소스 2T, 모짜렐라 50g, 바질 3장, 올리브오일', steps: ['1. [도우 준비] 또띠아나 피자 도우를 오븐 팬이나 에어프라이어 바스켓에 올립니다.', '2. [소스 바르기] 토마토소스를 도우 위에 얇고 고르게 펴 바릅니다 (가장자리는 남김).', '3. [치즈 올리기] 생모짜렐라 치즈를 손으로 찢어 듬성듬성 올립니다.', '4. [오일 뿌리기] 올리브오일을 피자 위에 살짝 둘러줍니다.', '5. [굽기] 200~230도로 예열된 오븐이나 에어프라이어에서 5~7분간 치즈가 녹고 도우가 노릇해질 때까지 굽습니다.', '6. [바질 올리기] 꺼낸 뒤 신선한 생바질 잎을 올려 향을 더하고 먹습니다.'] },
  { id: 45, category: 'Italian', name: '리조또', ingredients: ['쌀', '버터', '치즈', '육수'], measure: '쌀 100g, 양파 1/4개, 버터 10g, 치즈 1T, 육수 300ml, 화이트와인 약간', steps: ['1. [재료 볶기] 냄비에 버터를 녹이고 다진 양파를 볶다가 불린 쌀을 넣고 쌀알이 투명해질 때까지 중불 2분 볶습니다.', '2. [육수 준비] 옆 화구에 치킨스톡 육수를 따뜻하게 데워둡니다.', '3. [육수 붓기 1] 화이트와인을 조금 넣어 잡내를 날린 뒤, 뜨거운 육수를 한 국자 붓고 쌀이 흡수할 때까지 저어줍니다.', '4. [육수 붓기 2] 육수가 졸아들면 다시 한 국자 붓고 젓는 과정을 15~18분간 반복합니다.', '5. [익힘 확인] 쌀알 심지가 살짝 씹히는 알덴테 상태가 되면 불을 끕니다.', '6. [만테까레] 차가운 버터 한 조각과 파마산 치즈를 넣고 힘차게 섞어 크리미하게 완성합니다.'] },
  { id: 46, category: 'Italian', name: '라자냐', ingredients: ['라자냐면', '다진고기', '토마토소스', '치즈'], measure: '라자냐 면 2장, 라구소스 100g, 베샤멜소스 50g, 치즈 50g', steps: ['1. [재료 준비] 라구 소스(미트소스)와 베샤멜 소스(크림소스), 모짜렐라 치즈를 준비합니다. 면은 삶거나 불려둡니다.', '2. [바닥 깔기] 오븐 용기 바닥에 라구 소스를 얇게 펴 바르고 라자냐 면을 한 장 깝니다.', '3. [층 쌓기] 면 위에 라구 소스 -> 베샤멜 소스 -> 치즈 순으로 올립니다.', '4. [반복] 이 과정을 3~4층 반복하여 용기를 채우고 마지막은 치즈를 듬뿍 올립니다.', '5. [굽기] 호일을 덮고 180도 오븐에서 20분 굽다가, 호일을 벗기고 10분 더 구워 윗면을 노릇하게 만듭니다.', '6. [식히기] 오븐에서 꺼내 10분간 식힌 뒤 썰어야 모양이 흐트러지지 않습니다.'] },
  { id: 47, category: 'Italian', name: '뇨끼', ingredients: ['감자', '밀가루', '크림'], measure: '감자 1개, 밀가루 50g, 노른자 0.5개, 크림소스 100ml', steps: ['1. [감자 삶기] 감자를 껍질째 푹 삶아 뜨거울 때 껍질을 벗기고 곱게 으깹니다.', '2. [반죽] 식힌 감자에 밀가루, 계란 노른자, 소금을 넣고 한 덩어리가 되도록 가볍게 반죽합니다 (너무 치대면 질겨짐).', '3. [모양 만들기] 반죽을 길게 밀어 한입 크기로 자르고 포크로 눌러 모양을 냅니다.', '4. [삶기] 끓는 소금물에 뇨끼를 넣고 물 위로 떠오르면 건져냅니다 (약 2~3분).', '5. [소스 버무리기] 팬에 크림소스나 토마토소스를 끓이다가 익힌 뇨끼를 넣고 1분간 버무립니다.', '6. [완성] 그릇에 담고 치즈가루를 뿌려 냅니다.'] },
  { id: 48, category: 'Italian', name: '카프레제 샐러드', ingredients: ['토마토', '모짜렐라', '바질', '발사믹'], measure: '토마토 1개, 모짜렐라 60g, 바질, 발사믹글레이즈 1T, 올리브오일 1T', steps: ['1. [재료 준비] 완숙 토마토와 생모짜렐라 치즈를 준비하여 물기를 닦습니다.', '2. [썰기] 토마토와 치즈를 0.5~1cm 두께로 동그란 모양을 살려 슬라이스합니다.', '3. [담기] 접시에 토마토, 치즈, 생바질 잎 순서로 비스듬히 겹쳐서 원형이나 줄지어 담습니다.', '4. [간 하기] 먹기 직전에 소금과 후추를 전체적으로 솔솔 뿌립니다.', '5. [오일 뿌리기] 엑스트라 버진 올리브오일을 넉넉하게 뿌립니다.', '6. [마무리] 발사믹 글레이즈를 지그재그로 뿌려 장식하고 맛을 더합니다.'] },
  { id: 49, category: 'Italian', name: '티라미수', ingredients: ['마스카포네', '커피', '설탕', '코코아파우더'], measure: '마스카포네 100g, 생크림 50ml, 설탕 15g, 에스프레소 50ml, 쿠키 5개, 코코아파우더', steps: ['1. [커피 준비] 진한 에스프레소를 추출해 식히고 설탕이나 깔루아를 약간 섞습니다.', '2. [크림 만들기] 볼에 마스카포네 치즈를 풀고, 다른 볼에 생크림과 설탕을 넣어 휘핑한 뒤 두 가지를 섞어 부드러운 크림을 만듭니다.', '3. [쿠키 적시기] 레이디핑거 쿠키를 커피에 1초만 빠르게 담갔다 뺍니다 (오래 담그면 눅눅해짐).', '4. [층 쌓기] 용기 바닥에 쿠키를 깔고 그 위에 크림을 평평하게 펴 바릅니다. 이를 한 번 더 반복합니다.', '5. [굳히기] 냉장고에 넣어 3시간 이상 차갑게 굳혀 맛이 어우러지게 합니다.', '6. [마무리] 먹기 직전에 코코아 파우더를 체에 쳐서 듬뿍 뿌립니다.'] },
  { id: 50, category: 'Italian', name: '스테이크', ingredients: ['소고기', '올리브오일', '로즈마리'], measure: '소고기 200g, 오일 2T, 버터 10g, 소금, 후추', steps: ['1. [상온 두기] 고기는 굽기 30분 전에 냉장고에서 꺼내 찬기를 없앱니다.', '2. [시즈닝] 키친타월로 표면 수분을 완벽히 제거하고 소금, 후추, 올리브오일을 듬뿍 바릅니다.', '3. [굽기] 팬에서 연기가 날 정도로 달군 뒤 고기를 올리고 센불에서 면당 1분씩 구워 갈색 마이야르 반응을 냅니다.', '4. [아로제] 불을 중불로 줄이고 버터, 마늘, 로즈마리를 넣은 뒤 녹은 버터를 숟가락으로 고기에 계속 끼얹으며 3분간 더 굽습니다.', '5. [레스팅] 고기를 꺼내 도마나 망 위에 올리고 호일을 덮어 5분간 둡니다 (육즙 가두기).', '6. [썰기] 먹기 좋은 크기로 썰어 냅니다.'] },

  // --- OTHER (51-60) ---
  { id: 51, category: 'Other', name: '햄버거', ingredients: ['빵', '소고기', '토마토', '양상추'], measure: '번 1개, 패티 1장, 치즈 1장, 토마토 1쪽, 양상추, 마요네즈/소스', steps: ['1. [패티 만들기] 다진 소고기에 소금, 후추로 간을 하고 둥글납작하게 빚습니다 (가운데를 살짝 눌러줌).', '2. [패티 굽기] 달군 팬에 패티를 올리고 센불에서 한 면당 3분씩 바삭하게 굽습니다.', '3. [치즈 녹이기] 패티를 뒤집은 뒤 치즈를 올리고 뚜껑을 덮어 1분간 잔열로 녹입니다.', '4. [번 굽기] 햄버거 빵의 안쪽 면을 팬이나 토스터에 노릇하게 굽습니다.', '5. [소스 바르기] 빵 안쪽에 마요네즈나 버거 소스를 바릅니다.', '6. [조립] 빵 -> 양상추 -> 토마토 -> 양파 -> 패티 -> 빵 순서로 쌓아 완성합니다.'] },
  { id: 52, category: 'Other', name: '감바스 알 아히요', ingredients: ['새우', '마늘', '올리브오일', '페페론치노'], measure: '새우 8마리, 마늘 5개, 오일 100ml, 페페론치노 3개, 바게트 빵, 소금/후추', steps: ['1. [재료 손질] 새우는 물기를 제거하고 소금, 후추로 밑간합니다. 마늘은 도톰하게 편 썹니다.', '2. [오일 끓이기] 작은 팬에 올리브오일을 넉넉히 붓고 마늘과 페페론치노를 넣어 약불에서 끓입니다.', '3. [향 내기] 마늘이 노릇해지고 기름에 향이 배어들 때까지 5분간 천천히 익힙니다.', '4. [새우 넣기] 불을 중불로 올리고 새우를 넣습니다.', '5. [익히기] 새우가 붉게 변하고 익을 때까지 3분간 끓입니다.', '6. [마무리] 간을 보고 소금으로 맞춘 뒤 파슬리를 뿌리고 바게트 빵과 함께 냅니다.'] },
  { id: 53, category: 'Other', name: '쌀국수', ingredients: ['쌀국수', '소고기', '숙주', '양파'], measure: '쌀국수 1인분, 육수 300ml, 고기 50g, 숙주 50g, 양파', steps: ['1. [면 불리기] 쌀국수 건면은 찬물에 30분 이상 미리 불려둡니다.', '2. [육수 준비] 시판 쌀국수 육수나 사골 육수에 향신료(팔각 등)를 넣고 팔팔 끓입니다.', '3. [고명 준비] 양파는 얇게 썰어 식초 설탕 물에 절이고, 쪽파와 고수를 준비합니다.', '4. [면 데치기] 끓는 물에 불린 면을 넣고 10~30초간 살짝 데쳐 그릇에 담습니다.', '5. [고기 익히기] 샤브샤브용 얇은 생고기를 면 위에 올리고 아주 뜨거운 육수를 부어 익히거나, 육수에 살짝 데쳐 올립니다.', '6. [마무리] 숙주를 면 아래에 깔고 양파절임, 고수, 라임, 소스를 곁들입니다.'] },
  { id: 54, category: 'Other', name: '팟타이', ingredients: ['쌀국수', '새우', '숙주', '계란'], measure: '쌀국수 80g, 새우 3마리, 숙주 50g, 계란 1개, [소스: 피시소스 2T, 굴소스 1T, 설탕 1T, 식초 1T]', steps: ['1. [면 불리기] 쌀국수 면을 찬물에 1시간 정도 불려 부드럽게 만듭니다.', '2. [소스 만들기] 피시소스, 굴소스, 설탕, 타마린드(또는 식초)를 섞어 소스를 준비합니다.', '3. [재료 볶기] 팬에 기름을 두르고 새우와 으깬 두부를 볶다가 한쪽으로 밀고 계란 스크램블을 만듭니다.', '4. [면 볶기] 불린 면과 소스, 물 약간을 넣고 면이 부드러워질 때까지 센불에서 볶습니다.', '5. [채소 넣기] 면이 익으면 부추와 숙주를 넣고 30초간 숨이 죽지 않게 휘리릭 볶습니다.', '6. [마무리] 그릇에 담고 다진 땅콩과 라임 조각을 곁들입니다.'] },
  { id: 55, category: 'Other', name: '치킨 커리', ingredients: ['닭고기', '카레', '요거트', '토마토'], measure: '닭고기 150g, 요거트 1/2통, 양파 1/2개, 토마토소스 100ml, 카레가루 1.5T', steps: ['1. [닭 재우기] 한입 크기 닭고기에 요거트, 카레가루, 후추를 넣고 버무려 30분간 재웁니다.', '2. [양파 볶기] 냄비에 버터를 녹이고 다진 양파를 갈색이 될 때까지 충분히 볶습니다.', '3. [닭 볶기] 재워둔 닭고기를 넣고 중불에서 5분간 겉면이 익을 때까지 볶습니다.', '4. [끓이기] 토마토소스(또는 홀토마토)와 물/코코넛밀크를 붓고 끓입니다.', '5. [졸이기] 뚜껑을 덮고 약불에서 15분간 저어가며 걸쭉하게 끓입니다.', '6. [마무리] 소금으로 간을 하고 밥이나 난과 함께 냅니다.'] },
  { id: 56, category: 'Other', name: '타코', ingredients: ['또띠아', '고기', '양파', '고수'], measure: '또띠아 2장, 고기 100g, 양파 2T, 고수, 살사소스', steps: ['1. [재료 준비] 양파와 고수는 잘게 다지고, 라임은 웨지 모양으로 썹니다.', '2. [고기 굽기] 돼지고기나 소고기를 소금, 후추, 큐민 등으로 양념하여 바삭하게 구운 뒤 잘게 썹니다.', '3. [또띠아 굽기] 마른 팬에 또띠아를 올려 앞뒤로 30초씩 따뜻하고 부드럽게 굽습니다.', '4. [담기] 따뜻한 또띠아 위에 고기를 듬뿍 올립니다.', '5. [토핑] 다진 양파와 고수를 올리고 살사 소스를 얹습니다.', '6. [먹기] 먹기 직전에 라임즙을 뿌리고 반으로 접어 손으로 먹습니다.'] },
  { id: 57, category: 'Other', name: '피시 앤 칩스', ingredients: ['생선', '감자', '튀김가루'], measure: '생선살 150g, 감자 1개, 튀김가루, 맥주(탄산수)', steps: ['1. [감자 준비] 감자를 두툼한 막대 모양으로 썰어 물에 담가 전분을 빼고 물기를 닦습니다.', '2. [감자 튀기기] 160도 기름에 감자를 넣고 5분간 익힌 뒤 건져 식힙니다 (1차 튀김).', '3. [반죽 만들기] 튀김가루에 차가운 맥주(또는 탄산수)를 섞어 묽은 반죽을 만듭니다.', '4. [생선 튀기기] 흰살 생선에 덧가루를 묻히고 반죽을 입혀 180도 기름에 4~5분간 노릇하게 튀깁니다.', '5. [감자 재튀기기] 식혀둔 감자를 180도 기름에 2분간 다시 튀겨 바삭하게 만듭니다.', '6. [마무리] 기름을 빼고 소금을 뿌린 뒤 타르타르 소스, 레몬, 식초를 곁들입니다.'] },
  { id: 58, category: 'Other', name: '빠에야', ingredients: ['쌀', '해산물', '샤프란', '닭고기'], measure: '쌀 100g, 해물 100g, 닭고기 50g, 육수 200ml, 샤프란(또는 카레가루)', steps: ['1. [재료 볶기] 넓은 팬에 올리브오일을 두르고 마늘, 양파, 닭고기, 오징어 등을 볶습니다.', '2. [쌀 볶기] 불린 쌀과 토마토소스, 샤프란(또는 파프리카 가루)을 넣고 쌀이 투명해질 때까지 2분간 볶습니다.', '3. [육수 붓기] 치킨스톡 육수를 붓고 재료를 평평하게 펴줍니다. 이때부터는 절대 젓지 않습니다.', '4. [끓이기] 센불 5분, 중불 10분으로 끓여 쌀을 익히고 국물을 졸입니다.', '5. [새우 올리기] 국물이 자작해지면 새우와 조개를 위에 예쁘게 올리고 익힙니다.', '6. [뜸들이기] 국물이 거의 없어지면 약불 1분으로 바닥을 눌리고(누룽지), 불 끄고 호일을 덮어 5분간 뜸을 들입니다.'] },
  { id: 59, category: 'Other', name: '어니언 수프', ingredients: ['양파', '바게트', '치즈', '육수'], measure: '양파 1개, 버터 10g, 육수 200ml, 바게트 1쪽, 치즈 30g', steps: ['1. [양파 썰기] 양파 3개를 얇게 채 썹니다.', '2. [볶기 - 핵심] 냄비에 버터와 양파를 넣고 약불에서 40분 이상 계속 저어가며 짙은 갈색이 될 때까지 볶습니다 (카라멜라이징).', '3. [육수 붓기] 양파가 잼처럼 되면 치킨스톡 육수와 화이트와인 약간을 붓습니다.', '4. [끓이기] 10분간 끓여 맛을 어우러지게 하고 소금, 후추로 간을 합니다.', '5. [담기] 오븐 사용 가능한 그릇에 수프를 담고 구운 바게트를 올립니다.', '6. [치즈 굽기] 그 위에 모짜렐라나 그뤼에르 치즈를 듬뿍 올리고 200도 오븐에서 치즈가 녹고 노릇해질 때까지 굽습니다.'] },
  { id: 60, category: 'Other', name: '슈니첼', ingredients: ['돼지고기', '빵가루', '밀가루', '계란'], measure: '돼지고기 150g, 밀가루, 계란 1개, 빵가루, 레몬', steps: ['1. [고기 펴기] 돼지고기 등심을 비닐 사이에 넣고 고기 망치나 밀대로 두드려 0.3~0.5cm 두께로 아주 얇게 폅니다.', '2. [밑간] 얇게 편 고기 앞뒤에 소금과 후추를 뿌립니다.', '3. [옷 입히기] 밀가루 -> 계란물 -> 고운 빵가루 순서로 튀김옷을 꼼꼼히 입히고 가볍게 눌러줍니다.', '4. [굽기] 팬에 식용유와 버터를 넉넉히(고기가 잠길 정도) 두르고 예열합니다.', '5. [튀기기] 고기를 넣고 팬을 흔들어 기름을 끼얹어가며 앞뒤로 각 2~3분간 황금색이 나게 튀기듯 굽습니다.', '6. [마무리] 기름을 빼고 접시에 담은 뒤 레몬 조각을 곁들여 즙을 뿌려 먹습니다.'] },
];

const MOCK_USAGE_HISTORY = [
  { name: '우유', count: 5, avgDays: 4 }, 
  { name: '달걀', count: 3, avgDays: 10 },
  { name: '요거트', count: 4, avgDays: 5 },
  { name: '두부', count: 3, avgDays: 3 }
];

// --- 메인 앱 컴포넌트 ---
export default function FreshCalendar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) { setLoading(false); return; }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (!auth) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <AlertTriangle className="text-red-500 w-16 h-16 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Firebase 오류</h1>
        <p className="text-gray-600">설정값을 확인해주세요.</p>
      </div>
    );
  }

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader className="animate-spin text-green-600" /></div>;

  return user ? <AppContent user={user} /> : <AuthScreen />;
}

// --- 로그인 화면 ---
function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (isLogin) await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-green-50 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm">
        <div className="flex justify-center mb-6"><div className="bg-green-100 p-4 rounded-full"><Refrigerator className="w-10 h-10 text-green-600" /></div></div>
        <h1 className="text-2xl font-bold text-center mb-2">Fresh Calendar</h1>
        <p className="text-center text-gray-500 mb-8 text-sm">가족과 함께 쓰는 스마트 냉장고</p>
        <form onSubmit={handleAuth} className="space-y-4">
          <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-green-500 outline-none" placeholder="이메일" />
          <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-green-500 outline-none" placeholder="비밀번호 (6자 이상)" />
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-green-700 transition-all">
            {loading ? '로딩 중...' : (isLogin ? '로그인' : '회원가입')}
          </button>
        </form>
        <button onClick={()=>setIsLogin(!isLogin)} className="w-full mt-4 text-sm text-gray-500 underline">{isLogin ? '회원가입 하기' : '로그인 하러가기'}</button>
      </div>
    </div>
  );
}

// --- 실제 앱 콘텐츠 ---
function AppContent({ user }) {
  const [activeTab, setActiveTab] = useState('calendar');
  const [ingredients, setIngredients] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedDateForAdd, setSelectedDateForAdd] = useState(null);

  useEffect(() => {
    const qIng = query(collection(db, `users/${user.uid}/ingredients`));
    const unsubIng = onSnapshot(qIng, (snap) => {
      const items = snap.docs.map(d => {
        const data = d.data();
        return { ...data, id: d.id, expiry: data.expiry.toDate(), addedDate: data.addedDate.toDate() };
      });
      setIngredients(items);
    });

    const qCart = query(collection(db, `users/${user.uid}/cart`));
    const unsubCart = onSnapshot(qCart, (snap) => setCart(snap.docs.map(d => ({...d.data(), id: d.id}))));

    return () => { unsubIng(); unsubCart(); };
  }, [user]);

  const requestNotiPermission = () => { if ("Notification" in window) Notification.requestPermission(); };

  const addItem = async (item) => {
    try { await addDoc(collection(db, `users/${user.uid}/ingredients`), { ...item, addedDate: new Date(), expiry: item.expiry }); } catch (e) { alert("저장 실패: " + e.message); }
  };
  
  const deleteItems = async (ids) => { for (const id of ids) await deleteDoc(doc(db, `users/${user.uid}/ingredients`, id)); };

  const updateItemExpiry = async (id, newDate) => {
    try { await updateDoc(doc(db, `users/${user.uid}/ingredients`, id), { expiry: newDate }); } catch (e) { alert("수정 실패: " + e.message); }
  };

  const updateCartCount = async (name, delta) => { 
    const existing = cart.find(c => c.name === name);
    if (!existing) return;
    const newCount = existing.count + delta;
    if (newCount <= 0) await deleteDoc(doc(db, `users/${user.uid}/cart`, existing.id));
    else await updateDoc(doc(db, `users/${user.uid}/cart`, existing.id), { count: newCount });
  };

  const removeItemsFromCart = async (names) => { 
    const itemsToRemove = cart.filter(c => names.includes(c.name));
    for (const item of itemsToRemove) await deleteDoc(doc(db, `users/${user.uid}/cart`, item.id));
  };

  const addToCart = async (name) => {
    const existing = cart.find(c => c.name === name);
    if (existing) await updateDoc(doc(db, `users/${user.uid}/cart`, existing.id), { count: existing.count + 1 });
    else await addDoc(collection(db, `users/${user.uid}/cart`), { name, count: 1 });
  };

  const checkoutCartItems = async (selectedNames) => { 
    const itemsToCheckout = cart.filter(item => selectedNames.includes(item.name));
    for (const item of itemsToCheckout) {
      let dbEntry = SHELF_LIFE_DB[item.name] || SHELF_LIFE_DB[item.name.toLowerCase()] || SHELF_LIFE_DB['default'];
      let shelfLife = dbEntry.fridge || 7;
      let storage = 'fridge';
      if (!dbEntry.fridge && dbEntry.freezer) storage = 'freezer';
      
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + shelfLife);

      for(let i=0; i<item.count; i++) {
        await addDoc(collection(db, `users/${user.uid}/ingredients`), {
          name: item.name, category: storage, expiry: expiry, addedDate: new Date()
        });
      }
      await deleteDoc(doc(db, `users/${user.uid}/cart`, item.id));
    }
    setActiveTab('list');
  };

  const getRiskLevel = (expiryDate, itemName = '') => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0,0,0,0);
    
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    const settings = SHELF_LIFE_DB[itemName] || SHELF_LIFE_DB[itemName.replace(/\s+/g, '')] || SHELF_LIFE_DB['default'];
    const { danger, warning } = settings.risk || { danger: 3, warning: 7 };

    if (diffDays < 0) return 'expired';
    if (diffDays <= danger) return 'danger'; 
    if (diffDays <= warning) return 'warning'; 
    return 'safe';
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans max-w-md mx-auto shadow-2xl border-x overflow-hidden">
      <header className="bg-green-600 text-white p-4 pt-6 shadow-md z-10 flex justify-between items-center">
        <div><h1 className="text-xl font-bold flex items-center gap-2"><Refrigerator /> Fresh Calendar</h1><p className="text-green-100 text-xs mt-1 truncate max-w-[150px]">{user.email}</p></div>
        <div className="flex gap-2">
          <button onClick={requestNotiPermission} className="p-2 bg-green-700 rounded-full hover:bg-green-800"><Bell size={18} /></button>
          <button onClick={() => signOut(auth)} className="p-2 bg-green-700 rounded-full hover:bg-green-800"><LogOut size={18} /></button>
          <button onClick={() => { setSelectedDateForAdd(new Date()); setActiveTab('add'); }} className="bg-white text-green-600 p-2 rounded-full hover:bg-green-50"><Plus size={18} /></button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-gray-50 relative">
        {activeTab === 'calendar' && <CalendarView ingredients={ingredients} getRiskLevel={getRiskLevel} onDateSelect={(date) => { setSelectedDateForAdd(date); }} onAddRequest={(date) => { setSelectedDateForAdd(date); setActiveTab('add'); }} />}
        {activeTab === 'list' && <FridgeListView ingredients={ingredients} getRiskLevel={getRiskLevel} deleteItems={deleteItems} updateItemExpiry={updateItemExpiry} />}
        {activeTab === 'recipes' && <RecipeView ingredients={ingredients} onAddToCart={addToCart} recipes={RECIPE_FULL_DB} />}
        {activeTab === 'cart' && <ShoppingCartView cart={cart} onUpdateCount={updateCartCount} onRemove={removeItemsFromCart} onCheckout={checkoutCartItems} />}
        {activeTab === 'stats' && <InsightsView ingredients={ingredients} onAddToCart={addToCart} />}
        {activeTab === 'add' && <AddItemModal onClose={() => setActiveTab('calendar')} onAdd={addItem} initialDate={selectedDateForAdd} />}
      </main>

      <nav className="bg-white border-t flex justify-between px-6 py-3 pb-5 shadow-inner">
        <NavBtn active={activeTab==='calendar'} onClick={()=>setActiveTab('calendar')} icon={<Calendar />} label="달력" />
        <NavBtn active={activeTab==='list'} onClick={()=>setActiveTab('list')} icon={<Refrigerator />} label="냉장고" />
        <NavBtn active={activeTab==='cart'} onClick={()=>setActiveTab('cart')} icon={<ShoppingCart />} label="카트" count={cart.reduce((sum, item) => sum + item.count, 0)} />
        <NavBtn active={activeTab==='recipes'} onClick={()=>setActiveTab('recipes')} icon={<ChefHat />} label="레시피" />
        <NavBtn active={activeTab==='stats'} onClick={()=>setActiveTab('stats')} icon={<BarChart2 />} label="통계" />
      </nav>
    </div>
  );
}

// --- 캘린더 뷰 ---
function CalendarView({ ingredients, getRiskLevel, onAddRequest }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayInfo, setSelectedDayInfo] = useState(null);

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const getItemsForDate = (day) => ingredients.filter(i => {
    const d = new Date(i.expiry);
    return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <button onClick={()=>setCurrentDate(new Date(year, month-1, 1))} className="p-2"><ChevronLeft /></button>
        <h2 className="font-bold text-lg">{year}년 {month+1}월</h2>
        <button onClick={()=>setCurrentDate(new Date(year, month+1, 1))} className="p-2"><ChevronRight /></button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-gray-400 font-bold mb-2">
        {['일','월','화','수','목','금','토'].map(d=><div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({length: firstDay}).map((_, i) => <div key={`empty-${i}`} className="h-16" />)}
        {Array.from({length: daysInMonth}).map((_, i) => {
          const day = i + 1;
          const dayItems = getItemsForDate(day);
          const isToday = day === new Date().getDate() && month === new Date().getMonth();
          return (
            <div key={day} onClick={() => setSelectedDayInfo({ day, items: dayItems, dateObj: new Date(year, month, day) })} className={`h-16 border rounded-xl p-1 relative flex flex-col items-center justify-between cursor-pointer transition-colors hover:bg-green-50 ${isToday ? 'bg-green-50 border-green-400' : 'bg-white border-gray-100'}`}>
              <span className={`text-xs font-bold ${isToday ? 'text-green-700' : 'text-gray-600'}`}>{day}</span>
              <div className="flex flex-wrap justify-center gap-1 w-full px-0.5 mb-1">
                {dayItems.slice(0, 4).map((item, idx) => {
                  const risk = getRiskLevel(item.expiry, item.name);
                  return <div key={idx} className={`w-1.5 h-1.5 rounded-full ${risk === 'danger' || risk === 'expired' ? 'bg-red-500 animate-pulse' : risk === 'warning' ? 'bg-yellow-400' : 'bg-green-400'}`} style={{ animationDuration: risk === 'danger' ? '1s' : '0s' }} />;
                })}
                {dayItems.length > 4 && <span className="text-[8px] leading-none text-gray-400">+</span>}
              </div>
            </div>
          );
        })}
      </div>
      {selectedDayInfo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in" onClick={() => setSelectedDayInfo(null)}>
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg">{month+1}월 {selectedDayInfo.day}일 만료 목록</h3><button onClick={() => setSelectedDayInfo(null)}><X className="text-gray-400" /></button></div>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {selectedDayInfo.items.length === 0 ? <p className="text-gray-400 text-center py-4 text-sm">만료되는 상품이 없습니다.</p> : selectedDayInfo.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${getRiskLevel(item.expiry, item.name) === 'danger' ? 'bg-red-500' : 'bg-green-400'}`} /><span className="font-bold text-gray-700">{item.name}</span></div><span className="text-xs text-gray-500 capitalize">{item.category}</span>
                  </div>
              ))}
            </div>
            <button onClick={() => { onAddRequest(selectedDayInfo.dateObj); setSelectedDayInfo(null); }} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Plus size={18} /> 이 날짜에 추가하기</button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- 목록 뷰 (수정 기능 추가됨) ---
function FridgeListView({ ingredients, getRiskLevel, deleteItems, updateItemExpiry }) {
  const sorted = [...ingredients].sort((a,b) => a.expiry - b.expiry);
  const [editingItem, setEditingItem] = useState(null);

  const EditModal = () => {
    if (!editingItem) return null;
    const [date, setDate] = useState(new Date(editingItem.expiry).toISOString().split('T')[0]);
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={() => setEditingItem(null)}>
            <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">유통기한 수정</h3>
                <div className="mb-4"><span className="text-gray-500 text-xs">제품명</span><div className="font-bold text-xl">{editingItem.name}</div></div>
                <div className="mb-6"><label className="block text-sm text-gray-600 mb-2">새로운 날짜</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 border rounded-xl text-lg bg-gray-50" /></div>
                <button onClick={() => { updateItemExpiry(editingItem.id, new Date(date)); setEditingItem(null); }} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">수정 완료</button>
            </div>
        </div>
    );
  };

  return (
    <div className="p-4 pb-20">
      <EditModal />
      <h2 className="text-lg font-bold mb-4">내 냉장고 ({ingredients.length})</h2>
      <div className="space-y-3">
        {sorted.map(item => {
          const risk = getRiskLevel(item.expiry, item.name);
          const diff = Math.ceil((item.expiry - new Date().setHours(0,0,0,0)) / (86400000));
          return (
            <div key={item.id} className="bg-white p-4 rounded-xl border flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-10 rounded-full ${risk === 'danger' ? 'bg-red-500' : risk === 'warning' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                <div>
                  <h3 className="font-bold text-gray-800">{item.name}</h3>
                  <p className={`text-xs ${risk === 'danger' ? 'text-red-500 font-bold' : 'text-gray-500'}`}>{diff < 0 ? '만료됨' : diff === 0 ? '오늘 만료' : `${diff}일 남음`} ({item.expiry.toLocaleDateString()})</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingItem(item)} className="text-gray-300 hover:text-green-600 p-2"><Edit2 size={18} /></button>
                <button onClick={() => deleteItems([item.id])} className="text-gray-300 hover:text-red-500 p-2"><Trash2 size={18} /></button>
              </div>
            </div>
          );
        })}
        {ingredients.length === 0 && <div className="text-center py-10 text-gray-400">냉장고가 비었습니다.</div>}
      </div>
    </div>
  );
}

// --- 추가 모달 ---
function AddItemModal({ onClose, onAdd, initialDate }) {
  const [name, setName] = useState('');
  const getInitialExpiry = () => { try { if (initialDate && !isNaN(initialDate.getTime())) return initialDate.toISOString().split('T')[0]; } catch(e){} return new Date().toISOString().split('T')[0]; };
  const [expiry, setExpiry] = useState(getInitialExpiry());
  const [category, setCategory] = useState('fridge');

  const setExpiryByCategory = (days, catName) => {
    const today = new Date(); today.setDate(today.getDate() + days);
    setExpiry(today.toISOString().split('T')[0]);
    if (catName === '냉동') setCategory('freezer'); else setCategory('fridge');
  };
  
  const handleSubmit = (e) => { e.preventDefault(); onAdd({ name, expiry: new Date(expiry), category }); onClose(); };

  return (
    <div className="absolute inset-0 bg-white z-20 flex flex-col p-6 animate-in slide-in-from-bottom-10">
      <div className="flex items-center gap-2 mb-6"><button onClick={onClose}><ArrowLeft /></button><h2 className="text-lg font-bold">새 식재료 추가</h2></div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div><label className="block text-sm font-bold text-gray-700 mb-2">이름</label><input value={name} onChange={e=>setName(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-green-500" placeholder="예: 삼겹살, 시금치" autoFocus required /></div>
        <div><label className="block text-sm font-bold text-gray-700 mb-2">빠른 설정</label><div className="flex gap-2 overflow-x-auto pb-1"><button type="button" onClick={() => setExpiryByCategory(3, '고기')} className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100 whitespace-nowrap">🥩 고기 (3일)</button><button type="button" onClick={() => setExpiryByCategory(7, '채소')} className="px-3 py-2 bg-green-50 text-green-600 rounded-lg text-xs font-bold border border-green-100 whitespace-nowrap">🥬 채소 (7일)</button><button type="button" onClick={() => setExpiryByCategory(14, '유제품')} className="px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg text-xs font-bold border border-yellow-100 whitespace-nowrap">🥛 유제품 (14일)</button><button type="button" onClick={() => setExpiryByCategory(30, '냉동')} className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100 whitespace-nowrap">❄️ 냉동 (30일)</button></div></div>
        <div><label className="block text-sm font-bold text-gray-700 mb-2">유통기한</label><input type="date" value={expiry} onChange={e=>setExpiry(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-green-500" required /></div>
        <div><label className="block text-sm font-bold text-gray-700 mb-2">보관 장소</label><div className="flex gap-3">{['fridge', 'freezer', 'pantry'].map(c => (<button type="button" key={c} onClick={() => setCategory(c)} className={`flex-1 py-3 rounded-xl capitalize font-bold transition-all ${category === c ? 'bg-green-100 text-green-700 ring-2 ring-green-500' : 'bg-gray-100 text-gray-400'}`}>{c}</button>))}</div></div>
        <button className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg mt-auto">저장하기</button>
      </form>
    </div>
  );
}

// --- 장바구니 뷰 ---
function ShoppingCartView({ cart, onUpdateCount, onRemove, onCheckout }) {
  const [selectedNames, setSelectedNames] = useState([]);
  const toggleSelection = (name) => { if (selectedNames.includes(name)) setSelectedNames(selectedNames.filter(n => n !== name)); else setSelectedNames([...selectedNames, name]); };
  const toggleSelectAll = () => { if (selectedNames.length === cart.length) setSelectedNames([]); else setSelectedNames(cart.map(i => i.name)); };

  return (
    <div className="p-4 pb-20">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><ShoppingCart className="text-green-600" /> 장바구니</h2>
      {cart.length === 0 ? <div className="text-center py-20 text-gray-400">장바구니가 비었습니다.</div> : (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2"><button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm text-gray-600"><CheckSquare size={18} /> 전체 선택</button>{selectedNames.length > 0 && <button onClick={()=>onRemove(selectedNames)} className="text-xs text-red-500">선택 삭제</button>}</div>
          {cart.map(item => (<div key={item.name} className="bg-white p-4 rounded-xl border flex justify-between items-center shadow-sm"><div className="flex items-center gap-3"><button onClick={()=>toggleSelection(item.name)}>{selectedNames.includes(item.name) ? <CheckSquare className="text-green-600"/> : <Square className="text-gray-300"/>}</button><span className="font-bold">{item.name}</span></div><div className="flex items-center bg-gray-100 rounded-lg"><button onClick={() => onUpdateCount(item.name, -1)} className="p-1 px-2">-</button><span className="px-2 text-sm font-bold">{item.count}</span><button onClick={() => onUpdateCount(item.name, 1)} className="p-1 px-2">+</button></div></div>))}
          <button onClick={()=>onCheckout(selectedNames)} disabled={selectedNames.length===0} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold mt-4 disabled:bg-gray-300">냉장고로 이동</button>
        </div>
      )}
    </div>
  );
}

// --- 레시피 뷰 ---
function RecipeView({ ingredients, onAddToCart, recipes }) { 
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [servings, setServings] = useState(1); 
  const categories = ['All', 'Korean', 'Japanese', 'Chinese', 'Italian', 'Other'];

  const toggleSelection = (name) => { if (selectedIngredients.includes(name)) setSelectedIngredients(selectedIngredients.filter(i => i !== name)); else setSelectedIngredients([...selectedIngredients, name]); };
  const scaleText = (text, multiplier) => { if (multiplier === 1) return text; return text.replace(/(\d+\/\d+|\d+(?:\.\d+)?)(\s*[a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣%도]*)/g, (match, number, unit) => { let val = number.includes('/') ? parseInt(number.split('/')[0]) / parseInt(number.split('/')[1]) : parseFloat(number); if (!val) return match; let scaled = val * multiplier; return `${Number.isInteger(scaled) ? scaled : parseFloat(scaled.toFixed(1))}${unit}`; }); };
  const getMatchedRecipes = () => { let filtered = recipes; if (filterCategory !== 'All') filtered = filtered.filter(r => r.category === filterCategory); return filtered.map(recipe => { const existing = recipe.ingredients.filter(req => selectedIngredients.some(sel => req.includes(sel) || sel.includes(req))); const missing = recipe.ingredients.filter(req => !selectedIngredients.some(sel => req.includes(sel) || sel.includes(req))); return { ...recipe, existing, missing, score: existing.length }; }).sort((a, b) => b.score - a.score); };
  const matchedRecipes = getMatchedRecipes();

  if (selectedRecipe) {
      const scaledMeasure = scaleText(selectedRecipe.measure, servings);
      const scaledSteps = selectedRecipe.steps.map(step => scaleText(step, servings));
      return (
          <div className="p-4 pb-20 h-full flex flex-col bg-white">
              <div className="flex justify-between items-center mb-4"><button onClick={() => { setSelectedRecipe(null); setServings(1); }} className="flex items-center gap-2 text-gray-500 hover:text-green-600"><ArrowLeft size={20} /> Back</button><div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1"><Users size={14} className="text-gray-400 ml-1 mr-1"/>{[1, 2, 3, 4, 5, 6].map(num => (<button key={num} onClick={() => setServings(num)} className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-all ${servings === num ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>{num}</button>))}</div></div>
              <div className="flex-1 overflow-y-auto"><div className="mb-6"><span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded mb-2 uppercase">{selectedRecipe.category}</span><h2 className="text-2xl font-bold text-gray-800 mb-1">{selectedRecipe.name}</h2><p className="text-xs text-gray-400 mb-4">Amounts calculated for {servings} person(s)</p><div className="bg-green-50 p-5 rounded-2xl border border-green-100 mb-6 shadow-sm"><h3 className="font-bold text-green-800 mb-3 flex items-center gap-2"><BookOpen size={18} /> Ingredients</h3><p className="text-sm text-gray-700 leading-loose font-medium">{scaledMeasure}</p><div className="mt-4 pt-4 border-t border-green-200"><p className="text-xs font-bold text-green-800 mb-2 flex items-center gap-1"><ShoppingCart size={14} /> Add to Cart</p><div className="flex flex-wrap gap-2">{selectedRecipe.ingredients.map(ing => (<button key={ing} onClick={() => { onAddToCart(ing); alert(`Added ${ing} to cart!`); }} className="text-xs bg-white border border-green-200 text-green-700 px-2 py-1 rounded-md shadow-sm hover:bg-green-100 flex items-center gap-1 active:scale-95 transition-transform"><Plus size={10} /> {ing}</button>))}</div></div></div><div><h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><ChefHat size={18} /> Instructions</h3><div className="space-y-4">{scaledSteps.map((step, idx) => (<div key={idx} className="flex gap-3"><div className="w-6 h-6 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{idx + 1}</div><p className="text-sm text-gray-700 leading-relaxed pt-0.5">{step.replace(/^\d+\.\s*/, '')}</p></div>))}</div></div></div></div>
          </div>
      );
  }

  return (
    <div className="p-4 pb-20 h-full flex flex-col">
      <div className="mb-6"><h2 className="text-lg font-bold mb-2">1. Select Leftovers</h2><div className="flex flex-wrap gap-2">{ingredients.map(item => (<button key={item.id} onClick={() => toggleSelection(item.name)} className={`px-3 py-1.5 rounded-full text-sm border transition-all ${selectedIngredients.includes(item.name) ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'}`}>{item.name}</button>))}</div></div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">{categories.map(cat => (<button key={cat} onClick={() => setFilterCategory(cat)} className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filterCategory === cat ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'}`}>{cat}</button>))}</div>
      <div className="flex-1 overflow-y-auto space-y-3">{matchedRecipes.map(recipe => (<div key={recipe.id} onClick={() => setSelectedRecipe(recipe)} className={`bg-white p-4 rounded-xl border shadow-sm cursor-pointer transition-all hover:border-green-300 ${recipe.score > 0 ? 'border-green-200 bg-green-50' : 'border-gray-100'}`}><div className="flex justify-between items-start mb-1"><h3 className="font-bold text-gray-800">{recipe.name}</h3>{recipe.score > 0 && <span className="text-[10px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded font-bold">Match</span>}</div>{recipe.score > 0 ? (<div className="text-xs text-gray-600"><span className="text-green-600 font-medium">Have: {recipe.existing.join(', ')}</span>{recipe.missing.length > 0 && <span className="text-gray-400 ml-2">Missing: {recipe.missing.slice(0, 3).join(', ')}...</span>}</div>) : (<p className="text-xs text-gray-400 line-clamp-1">{recipe.measure}</p>)}</div>))}</div>
    </div>
  );
}

function InsightsView() { return <div className="p-4 text-center text-gray-500">통계 기능 준비중</div>; }

function NavBtn({ active, onClick, icon, label, count }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 relative ${active ? 'text-green-600' : 'text-gray-400'}`}>
      <div className="relative">{React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 2 })}{count > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-1 ring-white">{count}</span>}</div><span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}