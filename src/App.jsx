import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, ChefHat, Refrigerator, ChevronLeft, ChevronRight, AlertCircle, 
  Check, X, Search, Clock, ArrowRight, Trash2, RefreshCcw, CheckSquare, Square, 
  BarChart2, TrendingUp, AlertTriangle, ShoppingCart, Edit2, Snowflake, Archive, 
  BookOpen, ArrowLeft, Users, LogOut, Loader, Bell, PieChart, DollarSign, Undo2
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
  query,
  writeBatch
} from "firebase/firestore";

// ⚠️ 사용자 제공 Firebase 설정값
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

// ------------------------------------------------------------------
// ✂️✂️✂️ [DATA PLACEHOLDER] ✂️✂️✂️
// 아래의 세 변수(SHELF_LIFE_DB, RECIPE_FULL_DB, MOCK_USAGE_HISTORY)에 
// 기존에 가지고 계신 긴 데이터를 덮어씌워주세요.
// ------------------------------------------------------------------

// --- 유통기한 데이터베이스 (대폭 확장: 소스, 가루, 면류 포함) ---
const SHELF_LIFE_DB = {
  // 김치류
  '배추김치': { fridge: 90, freezer: 0, risk: { danger: 7, warning: 14 } },
  '부추김치': { fridge: 30, freezer: 0, risk: { danger: 5, warning: 10 } },
  '파김치': { fridge: 60, freezer: 0, risk: { danger: 7, warning: 14 } },
  '깍두기': { fridge: 90, freezer: 0, risk: { danger: 7, warning: 14 } },
  '김치': { fridge: 90, freezer: 0, risk: { danger: 7, warning: 14 } },

  // 고기류
  '돼지고기': { fridge: 3, freezer: 30, risk: { danger: 1, warning: 2 } }, 
  '소고기': { fridge: 3, freezer: 30, risk: { danger: 1, warning: 2 } },
  '닭고기': { fridge: 2, freezer: 90, risk: { danger: 1, warning: 2 } },
  '오리훈제': { fridge: 14, freezer: 180, risk: { danger: 2, warning: 5 } },
  '양고기': { fridge: 3, freezer: 180, risk: { danger: 1, warning: 2 } },
  '다짐육': { fridge: 2, freezer: 30, risk: { danger: 1, warning: 2 } }, // 추가

  // 가공육 & 햄
  '베이컨': { fridge: 7, freezer: 30, risk: { danger: 2, warning: 4 } },
  '햄': { fridge: 7, freezer: 30, risk: { danger: 2, warning: 4 } },
  '소시지': { fridge: 14, freezer: 60, risk: { danger: 3, warning: 7 } },
  '맛살': { fridge: 7, freezer: 0, risk: { danger: 2, warning: 4 } }, // 추가

  // 해산물
  '고등어': { fridge: 2, freezer: 90, risk: { danger: 1, warning: 2 } },
  '연어': { fridge: 2, freezer: 90, risk: { danger: 1, warning: 2 } },
  '새우': { fridge: 2, freezer: 180, risk: { danger: 1, warning: 2 } },
  '오징어': { fridge: 2, freezer: 180, risk: { danger: 1, warning: 2 } },
  '바지락': { fridge: 2, freezer: 90, risk: { danger: 1, warning: 2 } },
  '해물믹스': { fridge: 2, freezer: 180, risk: { danger: 1, warning: 2 } }, // 추가
  '김': { pantry: 180, risk: { danger: 7, warning: 14 } },
  '미역': { pantry: 365, risk: { danger: 30, warning: 60 } }, // 추가
  '멸치': { pantry: 90, freezer: 365, risk: { danger: 7, warning: 14 } }, // 추가

  // 유제품 & 계란
  '우유': { fridge: 7, freezer: 30, risk: { danger: 2, warning: 4 } }, 
  '달걀': { fridge: 30, freezer: 0, risk: { danger: 3, warning: 7 } },
  '요거트': { fridge: 10, freezer: 30, risk: { danger: 2, warning: 5 } },
  '치즈': { fridge: 20, freezer: 180, risk: { danger: 3, warning: 7 } },
  '모짜렐라치즈': { fridge: 7, freezer: 90, risk: { danger: 2, warning: 5 } }, // 추가
  '생크림': { fridge: 7, freezer: 30, risk: { danger: 2, warning: 4 } },
  '버터': { fridge: 90, freezer: 365, risk: { danger: 7, warning: 14 } },

  // 채소 & 농산물
  '두부': { fridge: 5, freezer: 90, risk: { danger: 1, warning: 3 } },
  '순두부': { fridge: 5, freezer: 0, risk: { danger: 1, warning: 3 } }, // 추가
  '콩나물': { fridge: 5, freezer: 0, risk: { danger: 1, warning: 3 } },
  '숙주': { fridge: 3, freezer: 0, risk: { danger: 1, warning: 2 } },
  '양파': { fridge: 14, freezer: 180, risk: { danger: 3, warning: 5 } },
  '감자': { fridge: 30, freezer: 365, risk: { danger: 5, warning: 10 } },
  '마늘': { fridge: 30, freezer: 365, risk: { danger: 5, warning: 10 } },
  '다진마늘': { fridge: 14, freezer: 180, risk: { danger: 3, warning: 7 } }, // 추가
  '대파': { fridge: 14, freezer: 180, risk: { danger: 3, warning: 5 } },
  '쪽파': { fridge: 7, freezer: 90, risk: { danger: 2, warning: 4 } }, // 추가
  '부추': { fridge: 5, freezer: 90, risk: { danger: 2, warning: 3 } }, // 추가
  '오이': { fridge: 7, freezer: 0, risk: { danger: 2, warning: 4 } },
  '양배추': { fridge: 30, freezer: 90, risk: { danger: 5, warning: 10 } },
  '당근': { fridge: 21, freezer: 365, risk: { danger: 3, warning: 7 } },
  '무': { fridge: 14, freezer: 90, risk: { danger: 3, warning: 6 } },
  '단무지': { fridge: 30, risk: { danger: 5, warning: 10 } }, // 추가
  '애호박': { fridge: 7, freezer: 90, risk: { danger: 2, warning: 4 } },
  '토마토': { fridge: 10, freezer: 90, risk: { danger: 2, warning: 5 } },
  '고수': { fridge: 5, freezer: 30, risk: { danger: 1, warning: 3 } },
  '바질': { fridge: 5, freezer: 90, risk: { danger: 1, warning: 3 } },
  '청양고추': { fridge: 7, freezer: 90, risk: { danger: 2, warning: 5 } }, // 추가
  '버섯': { fridge: 5, freezer: 30, risk: { danger: 2, warning: 3 } }, // 추가
  '시금치': { fridge: 3, freezer: 90, risk: { danger: 1, warning: 2 } }, // 추가
  '깻잎': { fridge: 5, freezer: 0, risk: { danger: 1, warning: 3 } }, // 추가
  '상추': { fridge: 5, freezer: 0, risk: { danger: 1, warning: 3 } }, // 추가
  '양상추': { fridge: 5, freezer: 0, risk: { danger: 1, warning: 3 } }, // 추가

  // 과일
  '사과': { fridge: 21, freezer: 0, risk: { danger: 3, warning: 7 } }, 
  '바나나': { fridge: 5, freezer: 90, risk: { danger: 1, warning: 2 } },
  '딸기': { fridge: 3, freezer: 180, risk: { danger: 1, warning: 2 } },
  '귤': { fridge: 14, freezer: 0, risk: { danger: 3, warning: 6 } },
  '레몬': { fridge: 21, freezer: 90, risk: { danger: 5, warning: 10 } }, // 추가
  '라임': { fridge: 21, freezer: 90, risk: { danger: 5, warning: 10 } }, // 추가

  // 곡류 & 면류 & 떡 (추가)
  '밥': { fridge: 3, freezer: 30, risk: { danger: 1, warning: 2 } },
  '쌀': { pantry: 365, risk: { danger: 30, warning: 60 } },
  '식빵': { pantry: 3, freezer: 30, risk: { danger: 1, warning: 2 } },
  '떡': { fridge: 3, freezer: 90, risk: { danger: 1, warning: 3 } },
  '소면': { pantry: 365, risk: { danger: 30, warning: 60 } },
  '당면': { pantry: 365, risk: { danger: 30, warning: 60 } },
  '파스타면': { pantry: 365, risk: { danger: 30, warning: 60 } },
  '우동면': { fridge: 30, freezer: 180, risk: { danger: 5, warning: 10 } },
  '라면': { pantry: 180, risk: { danger: 14, warning: 30 } },
  '중화면': { fridge: 7, freezer: 60, risk: { danger: 2, warning: 4 } },
  '쌀국수': { pantry: 365, risk: { danger: 30, warning: 60 } },
  '또띠아': { fridge: 7, freezer: 90, risk: { danger: 2, warning: 5 } },
  '바게트': { pantry: 2, freezer: 30, risk: { danger: 1, warning: 2 } },
  '빵가루': { pantry: 90, freezer: 180, risk: { danger: 7, warning: 14 } },

  // 소스 & 양념 (대거 추가)
  '간장': { pantry: 180, fridge: 365, risk: { danger: 30, warning: 60 } },
  '고추장': { fridge: 365, risk: { danger: 30, warning: 60 } },
  '된장': { fridge: 365, risk: { danger: 30, warning: 60 } },
  '쌈장': { fridge: 180, risk: { danger: 14, warning: 30 } },
  '고춧가루': { freezer: 365, pantry: 90, risk: { danger: 14, warning: 30 } },
  '설탕': { pantry: 730, risk: { danger: 60, warning: 120 } },
  '소금': { pantry: 1825, risk: { danger: 60, warning: 120 } },
  '후추': { pantry: 365, risk: { danger: 30, warning: 60 } },
  '식초': { pantry: 365, risk: { danger: 30, warning: 60 } },
  '맛술': { pantry: 180, risk: { danger: 14, warning: 30 } },
  '참기름': { pantry: 90, risk: { danger: 14, warning: 30 } },
  '식용유': { pantry: 365, risk: { danger: 30, warning: 60 } },
  '올리브오일': { pantry: 365, risk: { danger: 30, warning: 60 } },
  '굴소스': { fridge: 180, risk: { danger: 14, warning: 30 } },
  '마요네즈': { fridge: 90, risk: { danger: 7, warning: 14 } },
  '케찹': { fridge: 90, risk: { danger: 7, warning: 14 } },
  '머스타드': { fridge: 180, risk: { danger: 14, warning: 30 } },
  '칠리소스': { fridge: 180, risk: { danger: 14, warning: 30 } },
  '토마토소스': { fridge: 5, risk: { danger: 2, warning: 3 } }, // 개봉 후
  '크림소스': { fridge: 3, risk: { danger: 1, warning: 2 } }, // 개봉 후
  '카레': { pantry: 365, risk: { danger: 30, warning: 60 } },
  '전분': { pantry: 365, risk: { danger: 30, warning: 60 } },
  '밀가루': { pantry: 180, risk: { danger: 14, warning: 30 } },
  '부침가루': { pantry: 180, risk: { danger: 14, warning: 30 } },
  '튀김가루': { pantry: 180, risk: { danger: 14, warning: 30 } },
  '다시다': { pantry: 365, risk: { danger: 30, warning: 60 } },
  '액젓': { pantry: 365, risk: { danger: 30, warning: 60 } },
  '육수': { fridge: 3, freezer: 30, risk: { danger: 1, warning: 2 } },
  
  // 기본값
  'default': { fridge: 7, risk: { danger: 2, warning: 4 } }
};

// --- 레시피 데이터베이스 (60종 - 상세 버전 & 재료 동기화) ---
const RECIPE_FULL_DB = [
  // --- 한식 (1-20) ---
  {
    id: 1, category: 'Korean', name: '김치찌개',
    ingredients: ['김치', '돼지고기', '양파', '두부', '대파', '다진마늘', '고춧가루', '설탕', '간장', '육수', '식용유'],
    measure: '잘 익은 김치 180g, 돼지고기 120g, 양파 1/4개, 두부 1/3모, 대파 15cm, 다진마늘 1T, 고춧가루 1T, 설탕 0.3T, 국간장 1T, 멸치육수 400ml, 식용유 1T',
    steps: ['1. [재료 손질] 김치, 돼지고기, 두부, 양파, 대파를 알맞은 크기로 썹니다.', '2. [밑간] 돼지고기에 소금, 후추로 밑간합니다.', '3. [파기름] 식용유를 두르고 대파를 볶아 파기름을 냅니다.', '4. [고기 볶기] 돼지고기를 넣고 하얗게 될 때까지 볶습니다.', '5. [김치 볶기] 김치, 양파, 설탕을 넣고 충분히 볶습니다.', '6. [육수 끓이기] 육수를 붓고 센불에서 끓이며 거품을 걷어냅니다.', '7. [양념] 다진마늘, 고춧가루, 국간장을 넣고 끓입니다.', '8. [마무리] 두부와 남은 대파를 넣고 한소끔 더 끓여 완성합니다.']
  },
  {
    id: 2, category: 'Korean', name: '된장찌개',
    ingredients: ['된장', '애호박', '두부', '감자', '양파', '육수', '다진마늘', '고춧가루', '청양고추', '대파'],
    measure: '된장 2T, 애호박 1/4개, 두부 1/2모, 감자 1개, 양파 1/2개, 멸치육수 500ml, 다진마늘 0.5T, 고춧가루 0.5T, 청양고추 1개, 대파 10cm',
    steps: ['1. [육수] 냄비에 멸치육수를 붓고 끓입니다.', '2. [손질] 채소와 두부를 먹기 좋게 썹니다.', '3. [된장] 육수가 끓으면 된장을 곱게 풉니다.', '4. [채소1] 감자를 먼저 넣고 3분간 익힙니다.', '5. [채소2] 애호박, 양파, 마늘, 고춧가루를 넣고 끓입니다.', '6. [두부] 두부를 넣고 2분 더 끓입니다.', '7. [완성] 대파와 고추를 넣고 마무리합니다.']
  },
  {
    id: 3, category: 'Korean', name: '순두부찌개',
    ingredients: ['순두부', '바지락', '다짐육', '대파', '양파', '계란', '고춧가루', '식용유', '참기름', '간장', '다진마늘'],
    measure: '순두부 1봉, 바지락 1봉, 다진고기 50g, 대파 1/2대, 양파 1/4개, 계란 1개, 고춧가루 2T, 식용유 2T, 참기름 1T, 국간장 1T, 다진마늘 1T',
    steps: ['1. [준비] 재료를 손질하고 바지락은 해감합니다.', '2. [고추기름] 기름에 대파, 고기를 볶다 고춧가루를 볶아 고추기름을 냅니다.', '3. [육수] 물을 붓고 끓입니다.', '4. [재료] 바지락, 마늘, 간장, 양파를 넣고 끓입니다.', '5. [순두부] 순두부를 넣고 한소끔 끓입니다.', '6. [완성] 간을 맞추고 계란을 넣어 마무리합니다.']
  },
  {
    id: 4, category: 'Korean', name: '미역국',
    ingredients: ['미역', '소고기', '참기름', '간장', '다진마늘', '액젓', '소금'],
    measure: '건미역 20g, 소고기 150g, 참기름 2T, 국간장 2T, 다진마늘 1T, 액젓 1T, 물 1.5L, 소금',
    steps: ['1. [불리기] 미역을 불려 씻고 자릅니다.', '2. [고기 볶기] 냄비에 참기름을 두르고 소고기를 볶습니다.', '3. [미역 볶기] 미역과 간장을 넣고 충분히 볶습니다.', '4. [끓이기] 물을 붓고 센불에서 끓입니다.', '5. [졸이기] 마늘, 액젓을 넣고 중약불에서 20분 이상 푹 끓입니다.', '6. [완성] 소금으로 간을 맞춥니다.']
  },
  {
    id: 5, category: 'Korean', name: '삼계탕',
    ingredients: ['닭고기', '찹쌀', '마늘', '대추', '인삼', '대파', '소금', '후추'],
    measure: '영계 1마리, 불린 찹쌀, 통마늘 6알, 대추 4알, 수삼, 한방팩, 대파, 소금, 후추',
    steps: ['1. [손질] 닭의 기름을 제거하고 씻습니다.', '2. [속 채우기] 뱃속에 찹쌀, 마늘, 대추, 인삼을 채우고 다리를 꼬아줍니다.', '3. [끓이기] 물과 한방팩을 넣고 센불에서 끓입니다.', '4. [거품] 거품을 걷어내고 뚜껑을 덮습니다.', '5. [삶기] 중약불에서 40~50분간 푹 삶습니다.', '6. [완성] 대파를 올리고 소금, 후추를 곁들입니다.']
  },
  {
    id: 6, category: 'Korean', name: '불고기',
    ingredients: ['소고기', '양파', '당근', '대파', '버섯', '간장', '설탕', '다진마늘', '맛술', '참기름'],
    measure: '소고기 600g, 양파 1/2개, 당근, 대파, 버섯, 진간장 6T, 설탕 3T, 다진마늘 2T, 맛술 2T, 참기름 1T',
    steps: ['1. [핏물] 고기의 핏물을 제거합니다.', '2. [재우기] 양념장에 고기를 버무려 30분 재웁니다.', '3. [손질] 채소를 썹니다.', '4. [볶기] 팬에 고기를 먼저 볶습니다.', '5. [채소] 고기가 익으면 채소를 넣고 볶습니다.', '6. [완성] 참기름과 통깨로 마무리합니다.']
  },
  {
    id: 7, category: 'Korean', name: '제육볶음',
    ingredients: ['돼지고기', '양파', '대파', '당근', '고추장', '고춧가루', '간장', '설탕', '다진마늘', '맛술', '참기름'],
    measure: '돼지고기 600g, 양파 1개, 대파, 당근, 고추장 3T, 고춧가루 3T, 간장 3T, 설탕 2T, 다진마늘 2T, 맛술 2T, 참기름 1T',
    steps: ['1. [밑간] 고기에 설탕을 먼저 넣어 버무립니다.', '2. [양념] 나머지 양념에 고기를 재웁니다.', '3. [손질] 채소를 큼직하게 썹니다.', '4. [볶기] 고기를 센불에서 볶습니다.', '5. [수분] 물을 조금 넣어 촉촉하게 익힙니다.', '6. [완성] 채소를 넣고 빠르게 볶아냅니다.']
  },
  {
    id: 8, category: 'Korean', name: '갈비찜',
    ingredients: ['소고기', '무', '당근', '버섯', '간장', '설탕', '맛술', '다진마늘', '대파', '참기름'],
    measure: '소갈비 1kg, 무, 당근, 표고버섯, 간장 1컵, 설탕 0.5컵, 맛술 0.5컵, 다진마늘, 대파, 참기름',
    steps: ['1. [핏물] 갈비 핏물을 1시간 뺍니다.', '2. [데치기] 끓는 물에 데쳐 씻습니다.', '3. [양념] 양념장을 만듭니다.', '4. [끓이기] 고기, 양념, 물을 넣고 1시간 끓입니다.', '5. [채소] 무, 당근을 넣고 졸입니다.', '6. [완성] 국물이 자작해지면 완성합니다.']
  },
  {
    id: 9, category: 'Korean', name: '닭갈비',
    ingredients: ['닭고기', '양배추', '고구마', '떡', '대파', '깻잎', '고추장', '고춧가루', '간장', '설탕', '다진마늘', '카레'],
    measure: '닭다리살 500g, 양배추, 고구마, 떡, 대파, 깻잎, 고추장 4T, 고춧가루 4T, 간장 4T, 설탕 3T, 다진마늘 2T, 카레가루',
    steps: ['1. [손질] 재료를 먹기 좋게 썹니다.', '2. [재우기] 닭을 양념에 재웁니다.', '3. [익히기] 닭과 고구마를 먼저 볶습니다.', '4. [채소] 양배추, 떡, 대파를 넣고 볶습니다.', '5. [졸이기] 잘 저어가며 익힙니다.', '6. [완성] 깻잎을 넣고 마무리합니다.']
  },
  {
    id: 10, category: 'Korean', name: '보쌈',
    ingredients: ['돼지고기', '된장', '대파', '양파', '마늘', '후추', '월계수잎'],
    measure: '통삼겹살 1kg, 된장 2T, 대파, 양파, 통마늘, 통후추, 월계수잎, 물',
    steps: ['1. [준비] 물에 향신 재료를 넣고 끓입니다.', '2. [넣기] 물이 끓으면 고기를 넣습니다.', '3. [삶기] 50분간 푹 삶습니다.', '4. [확인] 젓가락으로 찔러 핏물을 확인합니다.', '5. [뜸] 불을 끄고 10분간 담가둡니다.', '6. [완성] 건져서 썰어냅니다.']
  },
  {
    id: 11, category: 'Korean', name: '비빔밥',
    ingredients: ['밥', '콩나물', '시금치', '당근', '애호박', '다짐육', '계란', '고추장', '참기름', '설탕'],
    measure: '밥 1공기, 콩나물, 시금치, 당근, 애호박, 다진고기, 계란, 고추장 2T, 설탕 1T, 참기름 1T',
    steps: ['1. [나물] 콩나물, 시금치를 데쳐 무칩니다.', '2. [볶기] 당근, 애호박, 고기를 볶습니다.', '3. [프라이] 계란 프라이를 합니다.', '4. [담기] 밥 위에 재료를 담습니다.', '5. [양념] 고추장 양념을 곁들입니다.', '6. [완성] 비벼 먹습니다.']
  },
  {
    id: 12, category: 'Korean', name: '김치볶음밥',
    ingredients: ['김치', '밥', '햄', '양파', '대파', '식용유', '버터', '굴소스', '설탕', '김', '계란'],
    measure: '김치 120g, 밥 1공기, 햄, 양파, 대파, 식용유, 버터, 굴소스, 설탕, 김가루, 계란',
    steps: ['1. [손질] 김치, 햄, 채소를 잘게 썹니다.', '2. [준비] 밥을 풀어둡니다.', '3. [파기름] 대파를 볶아 향을 냅니다.', '4. [재료] 햄과 김치, 설탕을 넣고 볶습니다.', '5. [양념] 굴소스를 넣고 볶습니다.', '6. [밥] 밥을 넣고 잘 비벼 볶습니다.', '7. [버터] 버터를 넣어 풍미를 더합니다.', '8. [완성] 계란프라이와 김가루를 올립니다.']
  },
  {
    id: 13, category: 'Korean', name: '김밥',
    ingredients: ['김', '밥', '햄', '단무지', '맛살', '계란', '시금치', '당근', '참기름', '소금'],
    measure: '김, 밥, 햄, 단무지, 맛살, 계란, 시금치, 당근, 소금, 참기름, 통깨',
    steps: ['1. [밥] 밥에 소금, 참기름, 깨로 밑간합니다.', '2. [재료] 속재료를 볶거나 데쳐 준비합니다.', '3. [펴기] 김 위에 밥을 얇게 폅니다.', '4. [말기] 재료를 넣고 단단하게 맙니다.', '5. [썰기] 참기름을 바르고 썹니다.']
  },
  {
    id: 14, category: 'Korean', name: '잡채',
    ingredients: ['당면', '돼지고기', '시금치', '당근', '양파', '버섯', '간장', '설탕', '참기름', '다진마늘'],
    measure: '당면 200g, 돼지고기, 시금치, 당근, 양파, 버섯, 간장 5T, 설탕 2T, 참기름 3T, 다진마늘 1T',
    steps: ['1. [준비] 당면을 불리고 재료를 손질합니다.', '2. [볶기] 채소와 고기를 각각 볶습니다.', '3. [나물] 시금치를 데쳐 무칩니다.', '4. [당면] 당면을 삶아 건집니다.', '5. [양념] 당면을 양념에 볶습니다.', '6. [완성] 모든 재료를 버무립니다.']
  },
  {
    id: 15, category: 'Korean', name: '떡볶이',
    ingredients: ['떡', '어묵', '대파', '양배추', '고추장', '고춧가루', '설탕', '간장', '다진마늘'],
    measure: '떡, 어묵, 대파, 양배추, 물, 고추장 3T, 고춧가루 2T, 설탕 3T, 간장 2T, 다진마늘 1T',
    steps: ['1. [손질] 재료를 썹니다.', '2. [국물] 물에 양념을 풉니다.', '3. [떡] 국물이 끓으면 떡을 넣습니다.', '4. [어묵] 어묵과 양배추를 넣습니다.', '5. [졸이기] 대파를 넣고 걸쭉하게 졸입니다.', '6. [완성] 맛있게 먹습니다.']
  },
  {
    id: 16, category: 'Korean', name: '해물파전',
    ingredients: ['쪽파', '오징어', '새우', '계란', '부침가루', '튀김가루', '식용유'],
    measure: '쪽파, 오징어, 새우, 홍고추, 계란, 부침가루, 튀김가루, 물, 식용유',
    steps: ['1. [반죽] 가루와 물을 섞습니다.', '2. [손질] 파와 해물을 다듬습니다.', '3. [굽기] 팬에 반죽과 파를 올립니다.', '4. [토핑] 해물과 계란물을 올립니다.', '5. [뒤집기] 노릇하게 앞뒤로 굽습니다.', '6. [완성] 바삭하게 익혀 냅니다.']
  },
  {
    id: 17, category: 'Korean', name: '냉면',
    ingredients: ['냉면', '육수', '무', '오이', '계란', '식초', '겨자'],
    measure: '냉면사리, 시판육수, 쌈무, 오이, 삶은계란, 겨자, 식초',
    steps: ['1. [육수] 육수를 살얼음지게 얼립니다.', '2. [면] 면을 풀어 삶고 찬물에 빡빡 씻습니다.', '3. [물기] 물기를 짭니다.', '4. [담기] 그릇에 면과 육수를 담습니다.', '5. [고명] 오이, 무, 계란을 올립니다.']
  },
  {
    id: 18, category: 'Korean', name: '칼국수',
    ingredients: ['칼국수면', '육수', '바지락', '애호박', '감자', '당근', '대파', '간장', '다진마늘'],
    measure: '칼국수면, 멸치육수, 바지락, 애호박, 감자, 당근, 대파, 국간장, 다진마늘',
    steps: ['1. [육수] 육수에 바지락을 끓여 건집니다.', '2. [채소] 감자, 당근을 넣습니다.', '3. [면] 면을 넣고 끓입니다.', '4. [양념] 애호박, 마늘, 간장을 넣습니다.', '5. [완성] 바지락과 대파를 넣고 마무리합니다.']
  },
  {
    id: 19, category: 'Korean', name: '안동찜닭',
    ingredients: ['닭고기', '당면', '감자', '당근', '양파', '대파', '간장', '설탕', '맛술', '다진마늘'],
    measure: '닭, 당면, 감자, 당근, 양파, 대파, 건고추, 간장, 흑설탕, 맛술, 다진마늘',
    steps: ['1. [데치기] 닭을 데쳐 씻습니다.', '2. [끓이기] 닭, 소스, 물을 넣고 끓입니다.', '3. [채소] 감자, 당근을 넣고 익힙니다.', '4. [졸이기] 양파, 대파를 넣습니다.', '5. [당면] 당면을 넣고 익힙니다.', '6. [완성] 참기름을 뿌립니다.']
  },
  {
    id: 20, category: 'Korean', name: '콩국수',
    ingredients: ['소면', '콩', '오이', '토마토', '소금', '설탕'],
    measure: '소면, 콩국물, 오이, 방울토마토, 검은깨, 소금, 설탕',
    steps: ['1. [면] 소면을 삶아 찬물에 헹굽니다.', '2. [식히기] 얼음물에 담가 차갑게 합니다.', '3. [담기] 면을 그릇에 담습니다.', '4. [국물] 콩국물을 붓습니다.', '5. [고명] 오이, 토마토를 올립니다.']
  },
  // --- JAPANESE (21-30) ---
  {
    id: 21, category: 'Japanese', name: '초밥',
    ingredients: ['밥', '식초', '설탕', '소금', '회', '와사비', '간장'],
    measure: '밥, 횟감, 와사비, 식초 3T, 설탕 2T, 소금 0.5t',
    steps: ['1. [단촛물] 식초, 설탕, 소금을 섞습니다.', '2. [밥] 밥에 단촛물을 섞어 식힙니다.', '3. [쥐기] 밥을 뭉치고 와사비를 바릅니다.', '4. [올리기] 회를 올리고 모양을 잡습니다.', '5. [완성] 접시에 담습니다.']
  },
  {
    id: 22, category: 'Japanese', name: '라멘',
    ingredients: ['라면', '육수', '숙주', '대파', '계란', '돼지고기', '김'],
    measure: '라멘생면, 돈코츠육수, 숙주, 대파, 반숙계란, 차슈, 김',
    steps: ['1. [육수] 육수를 끓입니다.', '2. [면] 면을 삶고 숙주를 데칩니다.', '3. [물기] 물기를 텁니다.', '4. [담기] 그릇에 면, 숙주, 육수를 담습니다.', '5. [토핑] 차슈, 계란, 파, 김을 올립니다.']
  },
  {
    id: 23, category: 'Japanese', name: '우동',
    ingredients: ['우동면', '간장', '어묵', '대파', '튀김가루'],
    measure: '우동면, 쯔유, 물, 어묵, 대파, 쑥갓, 텐카스',
    steps: ['1. [육수] 물과 쯔유를 끓입니다.', '2. [어묵] 어묵을 넣습니다.', '3. [면] 면을 넣고 풉니다.', '4. [끓이기] 익을 때까지 끓입니다.', '5. [완성] 대파, 쑥갓, 튀김가루를 올립니다.']
  },
  {
    id: 24, category: 'Japanese', name: '규동',
    ingredients: ['소고기', '밥', '양파', '계란', '간장', '설탕', '맛술'],
    measure: '소고기, 밥, 양파, 계란, 대파, 쯔유, 설탕, 맛술',
    steps: ['1. [소스] 팬에 소스와 양파를 끓입니다.', '2. [고기] 고기를 넣고 익힙니다.', '3. [계란] 계란을 대충 풀어 붓습니다.', '4. [익히기] 뚜껑 덮고 반숙으로 익힙니다.', '5. [완성] 밥 위에 얹습니다.']
  },
  {
    id: 25, category: 'Japanese', name: '오코노미야키',
    ingredients: ['양배추', '베이컨', '계란', '부침가루', '마요네즈', '가쓰오부시'],
    measure: '양배추, 베이컨, 계란, 부침가루, 물, 소스, 마요네즈, 가쓰오부시',
    steps: ['1. [반죽] 가루, 물, 계란, 양배추를 섞습니다.', '2. [굽기] 팬에 반죽을 올립니다.', '3. [토핑] 베이컨을 올립니다.', '4. [익히기] 앞뒤로 속까지 익힙니다.', '5. [완성] 소스, 마요네즈, 가쓰오부시를 뿌립니다.']
  },
  {
    id: 26, category: 'Japanese', name: '타코야키',
    ingredients: ['밀가루', '문어', '계란', '대파', '튀김가루', '마요네즈', '가쓰오부시'],
    measure: '타코야키파우더, 물, 계란, 문어, 쪽파, 텐카스, 소스, 마요네즈, 가쓰오부시',
    steps: ['1. [반죽] 반죽물을 만듭니다.', '2. [붓기] 팬에 반죽과 문어를 넣습니다.', '3. [채우기] 파, 텐카스를 넣고 반죽을 더 붓습니다.', '4. [굴리기] 동그랗게 굴려가며 굽습니다.', '5. [완성] 소스와 가쓰오부시를 뿌립니다.']
  },
  {
    id: 27, category: 'Japanese', name: '튀김 (덴푸라)',
    ingredients: ['새우', '고구마', '튀김가루', '식용유'],
    measure: '새우, 고구마, 튀김가루, 얼음물, 식용유',
    steps: ['1. [손질] 재료를 손질합니다.', '2. [반죽] 가루와 얼음물을 대충 섞습니다.', '3. [입히기] 재료에 반죽을 입힙니다.', '4. [튀기기] 기름에 바삭하게 튀깁니다.', '5. [기름빼기] 건져서 기름을 뺍니다.']
  },
  {
    id: 28, category: 'Japanese', name: '야키소바',
    ingredients: ['중화면', '돼지고기', '양배추', '숙주', '양파', '굴소스', '케찹'],
    measure: '면, 돼지고기, 양배추, 숙주, 양파, 굴소스, 우스터소스, 케찹, 설탕',
    steps: ['1. [고기] 고기를 볶습니다.', '2. [채소] 양파, 양배추를 볶습니다.', '3. [면] 면과 물을 넣고 볶습니다.', '4. [양념] 소스를 넣고 볶습니다.', '5. [숙주] 숙주를 넣고 빠르게 볶아냅니다.']
  },
  {
    id: 29, category: 'Japanese', name: '카레라이스',
    ingredients: ['카레', '돼지고기', '양파', '감자', '당근', '버터', '밥'],
    measure: '고형카레, 돼지고기, 양파, 감자, 당근, 물, 버터',
    steps: ['1. [양파] 버터에 양파를 오래 볶습니다.', '2. [재료] 고기, 감자, 당근을 볶습니다.', '3. [끓이기] 물을 붓고 익힙니다.', '4. [카레] 카레를 넣고 풉니다.', '5. [졸이기] 걸쭉하게 끓여 밥에 얹습니다.']
  },
  {
    id: 30, category: 'Japanese', name: '소바',
    ingredients: ['소면', '간장', '무', '대파', '와사비', '김'],
    measure: '메밀면, 쯔유, 물, 무, 쪽파, 와사비, 김가루',
    steps: ['1. [삶기] 면을 삶습니다.', '2. [씻기] 찬물에 빡빡 씻습니다.', '3. [담기] 면을 담습니다.', '4. [소스] 쯔유를 희석합니다.', '5. [완성] 무, 파, 와사비를 곁들입니다.']
  },
  // --- CHINESE (31-40) ---
  {
    id: 31, category: 'Chinese', name: '짜장면',
    ingredients: ['중화면', '간장', '돼지고기', '양파', '대파', '설탕', '굴소스', '전분', '식용유'],
    measure: '중화면, 춘장, 다짐육, 양파, 대파, 설탕, 굴소스, 식용유, 전분물',
    steps: ['1. [춘장] 기름에 춘장을 볶습니다.', '2. [파기름] 파와 고기를 볶습니다.', '3. [채소] 양파, 춘장, 소스를 볶습니다.', '4. [끓이기] 물과 전분물을 넣어 소스를 만듭니다.', '5. [면] 면을 삶습니다.', '6. [완성] 면에 소스를 붓습니다.']
  },
  {
    id: 32, category: 'Chinese', name: '짬뽕',
    ingredients: ['중화면', '오징어', '해물믹스', '양파', '배추', '대파', '다진마늘', '고춧가루', '간장', '굴소스', '육수'],
    measure: '중화면, 해물, 양파, 배추, 대파, 다진마늘, 고춧가루, 간장, 굴소스, 육수',
    steps: ['1. [고추기름] 기름에 대파, 마늘, 고춧가루를 볶습니다.', '2. [볶기] 해물, 채소, 간장을 넣고 센불에 볶습니다.', '3. [끓이기] 육수와 굴소스를 넣고 끓입니다.', '4. [면] 면을 삶습니다.', '5. [완성] 국물을 붓습니다.']
  },
  {
    id: 33, category: 'Chinese', name: '탕수육',
    ingredients: ['돼지고기', '전분', '식용유', '설탕', '식초', '간장'],
    measure: '돼지등심, 전분, 식용유, 설탕, 식초, 간장, 채소, 전분물',
    steps: ['1. [반죽] 불린 전분 앙금에 고기를 버무립니다.', '2. [1차] 고기를 튀깁니다.', '3. [2차] 한번 더 바삭하게 튀깁니다.', '4. [소스] 소스 재료를 끓이고 전분물로 농도를 잡습니다.', '5. [완성] 곁들여 냅니다.']
  },
  {
    id: 34, category: 'Chinese', name: '마파두부',
    ingredients: ['두부', '다짐육', '대파', '다진마늘', '고추장', '굴소스', '고춧가루', '설탕', '전분'],
    measure: '두부, 다짐육, 대파, 마늘, 두반장(또는 고추장), 굴소스, 고춧가루, 설탕, 전분물',
    steps: ['1. [두부] 두부를 데칩니다.', '2. [향] 파, 마늘을 볶습니다.', '3. [고기] 고기를 볶습니다.', '4. [양념] 양념과 물을 넣고 끓입니다.', '5. [두부] 두부를 넣고 졸입니다.', '6. [전분] 전분물로 농도를 맞춥니다.']
  },
  {
    id: 35, category: 'Chinese', name: '볶음밥',
    ingredients: ['밥', '계란', '대파', '당근', '햄', '간장', '굴소스', '식용유'],
    measure: '밥, 계란, 대파, 당근, 햄, 간장, 굴소스, 식용유, 소금',
    steps: ['1. [파기름] 파를 볶습니다.', '2. [계란] 스크램블을 합니다.', '3. [밥] 밥을 넣고 볶습니다.', '4. [간] 간장, 굴소스로 간을 합니다.', '5. [볶기] 센불에 고슬하게 볶습니다.', '6. [완성] 담아냅니다.']
  },
  {
    id: 36, category: 'Chinese', name: '딤섬(만두)',
    ingredients: ['밀가루', '돼지고기', '부추', '대파', '간장', '굴소스', '참기름'],
    measure: '만두피, 다짐육, 부추, 대파, 생강, 간장, 굴소스, 참기름',
    steps: ['1. [소] 고기, 채소, 양념을 치댑니다.', '2. [빚기] 피에 소를 넣고 빚습니다.', '3. [찌기] 찜기에 찝니다.', '4. [굽기] (선택) 팬에 굽습니다.', '5. [완성] 초간장을 곁들입니다.']
  },
  {
    id: 37, category: 'Chinese', name: '양꼬치',
    ingredients: ['양고기', '식용유'],
    measure: '양고기, 쯔란, 식용유',
    steps: ['1. [손질] 고기를 깍둑썹니다.', '2. [시즈닝] 쯔란, 오일에 버무립니다.', '3. [꽂기] 꼬치에 꽂습니다.', '4. [굽기] 굽습니다.', '5. [완성] 쯔란을 찍어 먹습니다.']
  },
  {
    id: 38, category: 'Chinese', name: '마라탕',
    ingredients: ['소고기', '육수', '당면', '숙주', '두부', '버섯'],
    measure: '마라소스, 사골육수, 소고기, 청경채, 버섯, 푸주, 당면, 숙주, 땅콩소스',
    steps: ['1. [불리기] 당면, 푸주를 불립니다.', '2. [육수] 육수에 소스를 풉니다.', '3. [재료] 단단한 재료부터 넣고 끓입니다.', '4. [고기] 고기와 채소를 넣습니다.', '5. [완성] 땅콩소스를 곁들입니다.']
  },
  {
    id: 39, category: 'Chinese', name: '토마토 달걀 볶음',
    ingredients: ['토마토', '계란', '대파', '식용유', '굴소스', '설탕', '참기름'],
    measure: '토마토, 계란, 대파, 식용유, 소금, 설탕, 굴소스, 참기름',
    steps: ['1. [준비] 토마토와 파를 썹니다.', '2. [계란] 스크램블을 해 덜어둡니다.', '3. [파기름] 파를 볶습니다.', '4. [토마토] 토마토를 볶습니다.', '5. [합치기] 계란, 양념을 넣고 섞습니다.', '6. [완성] 참기름을 두릅니다.']
  },
  {
    id: 40, category: 'Chinese', name: '쿵파오 치킨',
    ingredients: ['닭고기', '간장', '식초', '설탕', '굴소스', '맛술', '대파', '다진마늘'],
    measure: '닭가슴살, 땅콩, 건고추, 대파, 마늘, 간장, 식초, 설탕, 굴소스, 맛술',
    steps: ['1. [밑간] 닭을 밑간합니다.', '2. [볶기] 닭을 볶아 덜어둡니다.', '3. [향] 고추, 파, 마늘을 볶습니다.', '4. [소스] 소스를 끓입니다.', '5. [합치기] 닭을 넣고 볶습니다.', '6. [완성] 땅콩을 넣습니다.']
  },
  // --- ITALIAN (41-50) ---
  {
    id: 41, category: 'Italian', name: '알리오 올리오',
    ingredients: ['파스타면', '마늘', '올리브오일', '소금', '후추'],
    measure: '파스타면, 마늘, 올리브오일, 페페론치노, 소금, 파슬리, 후추, 면수',
    steps: ['1. [삶기] 소금물에 면을 삶고 면수를 둡니다.', '2. [오일] 오일에 마늘, 페페론치노를 볶습니다.', '3. [에멀전] 면수를 넣고 끓입니다.', '4. [볶기] 면을 넣고 볶습니다.', '5. [완성] 간을 맞추고 파슬리를 뿌립니다.']
  },
  {
    id: 42, category: 'Italian', name: '까르보나라',
    ingredients: ['파스타면', '베이컨', '계란', '치즈', '후추', '올리브오일'],
    measure: '파스타면, 베이컨, 계란노른자, 파마산치즈, 후추, 올리브오일',
    steps: ['1. [소스] 노른자, 치즈, 후추를 섞습니다.', '2. [삶기] 면을 삶습니다.', '3. [볶기] 베이컨을 볶습니다.', '4. [면] 면과 면수를 넣고 볶고 불을 끕니다.', '5. [식히기] 약간 식힙니다.', '6. [비비기] 소스를 넣고 비벼 완성합니다.']
  },
  {
    id: 43, category: 'Italian', name: '토마토 파스타',
    ingredients: ['파스타면', '토마토소스', '마늘', '양파', '올리브오일', '바질'],
    measure: '파스타면, 토마토소스, 마늘, 양파, 페페론치노, 올리브오일, 바질',
    steps: ['1. [삶기] 면을 삶습니다.', '2. [향] 오일에 마늘, 양파를 볶습니다.', '3. [소스] 소스와 면수를 넣고 끓입니다.', '4. [볶기] 면을 넣고 볶습니다.', '5. [완성] 바질을 뿌립니다.']
  },
  {
    id: 44, category: 'Italian', name: '피자 마르게리타',
    ingredients: ['또띠아', '토마토소스', '모짜렐라치즈', '바질', '올리브오일'],
    measure: '또띠아, 토마토소스, 모짜렐라치즈, 바질, 올리브오일',
    steps: ['1. [준비] 도우를 준비합니다.', '2. [소스] 소스를 바릅니다.', '3. [치즈] 치즈를 올립니다.', '4. [오일] 오일을 뿌립니다.', '5. [굽기] 오븐에 굽습니다.', '6. [완성] 바질을 올립니다.']
  },
  {
    id: 45, category: 'Italian', name: '리조또',
    ingredients: ['쌀', '육수', '양파', '버터', '치즈'],
    measure: '쌀, 육수, 양파, 버터, 파마산치즈, 화이트와인',
    steps: ['1. [볶기] 버터에 양파, 쌀을 볶습니다.', '2. [와인] 와인을 넣고 날립니다.', '3. [육수] 육수를 조금씩 부으며 저어 익힙니다.', '4. [농도] 쌀이 익으면 불을 끕니다.', '5. [만테까레] 버터, 치즈를 섞습니다.']
  },
  {
    id: 46, category: 'Italian', name: '라자냐',
    ingredients: ['파스타면', '토마토소스', '크림소스', '모짜렐라치즈', '치즈'],
    measure: '라자냐면, 라구소스, 베샤멜소스, 모짜렐라치즈, 파마산치즈',
    steps: ['1. [준비] 면을 준비합니다.', '2. [깔기] 소스, 면을 깝니다.', '3. [쌓기] 소스, 치즈 순으로 반복해 쌓습니다.', '4. [치즈] 맨 위에 치즈를 덮습니다.', '5. [굽기] 오븐에 굽습니다.', '6. [식히기] 식혀서 썹니다.']
  },
  {
    id: 47, category: 'Italian', name: '뇨끼',
    ingredients: ['감자', '밀가루', '계란', '크림소스', '치즈', '소금'],
    measure: '감자, 밀가루, 노른자, 소금, 치즈, 크림소스',
    steps: ['1. [감자] 감자를 삶아 으깹니다.', '2. [반죽] 재료를 섞어 반죽합니다.', '3. [성형] 모양을 만듭니다.', '4. [삶기] 물에 삶아 건집니다.', '5. [소스] 소스에 버무립니다.', '6. [완성] 치즈를 뿌립니다.']
  },
  {
    id: 48, category: 'Italian', name: '카프레제 샐러드',
    ingredients: ['토마토', '모짜렐라치즈', '바질', '올리브오일', '소금', '후추'],
    measure: '토마토, 모짜렐라치즈, 바질, 발사믹글레이즈, 올리브오일, 소금, 후추',
    steps: ['1. [손질] 토마토, 치즈를 슬라이스합니다.', '2. [담기] 재료를 교차해 담습니다.', '3. [간] 소금, 후추를 뿌립니다.', '4. [오일] 오일을 뿌립니다.', '5. [완성] 발사믹을 뿌립니다.']
  },
  {
    id: 49, category: 'Italian', name: '티라미수',
    ingredients: ['치즈', '생크림', '설탕'],
    measure: '마스카포네치즈, 생크림, 설탕, 에스프레소, 레이디핑거쿠키, 코코아파우더',
    steps: ['1. [커피] 커피를 식힙니다.', '2. [크림] 생크림, 설탕, 치즈를 섞습니다.', '3. [쿠키] 쿠키를 커피에 적십니다.', '4. [쌓기] 쿠키, 크림 순으로 쌓습니다.', '5. [굳히기] 냉장고에 굳힙니다.', '6. [완성] 코코아파우더를 뿌립니다.']
  },
  {
    id: 50, category: 'Italian', name: '스테이크',
    ingredients: ['소고기', '올리브오일', '버터', '마늘', '소금', '후추'],
    measure: '소고기, 올리브오일, 버터, 마늘, 로즈마리, 소금, 후추',
    steps: ['1. [준비] 고기를 상온에 두고 시즈닝합니다.', '2. [굽기] 센불에 겉면을 굽습니다.', '3. [아로제] 버터, 향신료를 넣고 끼얹으며 굽습니다.', '4. [레스팅] 꺼내서 래스팅합니다.', '5. [완성] 썰어 냅니다.']
  },
  // --- OTHER (51-60) ---
  {
    id: 51, category: 'Other', name: '햄버거',
    ingredients: ['식빵', '다짐육', '치즈', '토마토', '양상추', '양파', '마요네즈', '소금', '후추'],
    measure: '햄버거번, 다진소고기, 체다치즈, 토마토, 양상추, 양파, 마요네즈, 소금, 후추',
    steps: ['1. [패티] 고기를 빚습니다.', '2. [빵] 빵을 굽습니다.', '3. [굽기] 패티를 굽고 치즈를 녹입니다.', '4. [소스] 빵에 소스를 바릅니다.', '5. [조립] 재료를 쌓습니다.']
  },
  {
    id: 52, category: 'Other', name: '감바스 알 아히요',
    ingredients: ['새우', '마늘', '올리브오일', '바게트', '소금', '후추'],
    measure: '새우, 마늘, 올리브오일, 페페론치노, 바게트, 소금, 후추, 파슬리',
    steps: ['1. [손질] 재료를 손질합니다.', '2. [가열] 오일에 마늘을 끓입니다.', '3. [향] 페페론치노를 넣습니다.', '4. [새우] 새우를 넣고 익힙니다.', '5. [간] 간을 맞춥니다.', '6. [완성] 빵과 곁들입니다.']
  },
  {
    id: 53, category: 'Other', name: '쌀국수',
    ingredients: ['쌀국수', '육수', '소고기', '숙주', '양파', '고수'],
    measure: '쌀국수면, 육수, 소고기, 숙주, 양파, 레몬, 고수, 소스',
    steps: ['1. [불리기] 면을 불립니다.', '2. [절임] 양파를 절입니다.', '3. [육수] 육수를 끓입니다.', '4. [데치기] 면을 데칩니다.', '5. [고기] 고기를 익힙니다.', '6. [완성] 담아서 냅니다.']
  },
  {
    id: 54, category: 'Other', name: '팟타이',
    ingredients: ['쌀국수', '새우', '숙주', '계란', '다진마늘', '설탕', '굴소스', '식초'],
    measure: '쌀국수면, 새우, 숙주, 부추, 계란, 다진마늘, 땅콩, 피시소스, 설탕, 굴소스, 식초',
    steps: ['1. [불리기] 면을 불립니다.', '2. [계란] 스크램블을 합니다.', '3. [볶기] 마늘, 새우, 면, 소스를 볶습니다.', '4. [채소] 숙주, 부추, 계란을 넣고 섞습니다.', '5. [완성] 땅콩을 뿌립니다.']
  },
  {
    id: 55, category: 'Other', name: '치킨 커리',
    ingredients: ['닭고기', '요거트', '양파', '토마토소스', '카레', '버터', '다진마늘'],
    measure: '닭다리살, 요거트, 양파, 토마토소스, 카레가루, 버터, 다진마늘',
    steps: ['1. [재우기] 닭을 요거트, 카레에 재웁니다.', '2. [볶기] 버터에 양파, 마늘을 볶습니다.', '3. [닭] 닭을 볶습니다.', '4. [끓이기] 소스, 물, 카레를 넣고 끓입니다.', '5. [졸이기] 걸쭉하게 졸입니다.']
  },
  {
    id: 56, category: 'Other', name: '타코',
    ingredients: ['또띠아', '다짐육', '양파', '토마토', '고수', '소금', '후추'],
    measure: '또띠아, 다진고기, 양파, 토마토, 고수, 라임, 소금, 후추, 큐민',
    steps: ['1. [살사] 채소를 다져 살사를 만듭니다.', '2. [고기] 고기를 양념해 볶습니다.', '3. [또띠아] 또띠아를 굽습니다.', '4. [담기] 또띠아에 고기를 올립니다.', '5. [완성] 토핑을 올립니다.']
  },
  {
    id: 57, category: 'Other', name: '피시 앤 칩스',
    ingredients: ['감자', '튀김가루', '식용유'],
    measure: '흰살생선, 감자, 튀김가루, 맥주, 식용유, 타르타르소스',
    steps: ['1. [감자] 감자를 썰어 1차로 튀깁니다.', '2. [반죽] 튀김옷을 만듭니다.', '3. [생선] 생선을 튀깁니다.', '4. [감자] 감자를 2차로 튀깁니다.', '5. [완성] 소스를 곁들입니다.']
  },
  {
    id: 58, category: 'Other', name: '빠에야',
    ingredients: ['쌀', '해물믹스', '닭고기', '양파', '토마토소스', '육수'],
    measure: '쌀, 해물, 닭고기, 양파, 피망, 토마토소스, 육수, 샤프란',
    steps: ['1. [볶기] 재료를 볶습니다.', '2. [쌀] 쌀과 소스를 볶습니다.', '3. [육수] 육수를 붓고 젓지 않고 끓입니다.', '4. [토핑] 해물을 올립니다.', '5. [뜸] 불을 끄고 뜸을 들입니다.']
  },
  {
    id: 59, category: 'Other', name: '어니언 수프',
    ingredients: ['양파', '버터', '육수', '바게트', '치즈'],
    measure: '양파, 버터, 육수, 화이트와인, 바게트, 치즈',
    steps: ['1. [볶기] 양파를 갈색이 되도록 오래 볶습니다.', '2. [끓이기] 와인, 육수를 넣고 끓입니다.', '3. [담기] 그릇에 담고 빵을 올립니다.', '4. [치즈] 치즈를 올립니다.', '5. [굽기] 치즈를 녹여 완성합니다.']
  },
  {
    id: 60, category: 'Other', name: '슈니첼',
    ingredients: ['돼지고기', '밀가루', '계란', '빵가루', '버터', '식용유'],
    measure: '돼지등심, 밀가루, 계란, 빵가루, 버터, 식용유, 레몬, 잼',
    steps: ['1. [펴기] 고기를 얇게 두드립니다.', '2. [밑간] 소금, 후추를 뿌립니다.', '3. [옷] 밀가루, 계란, 빵가루를 입힙니다.', '4. [굽기] 기름에 튀기듯 굽습니다.', '5. [완성] 레몬, 잼을 곁들입니다.']
  }
];
const MOCK_USAGE_HISTORY = [
  { name: '우유', count: 5, avgDays: 4 }, 
  { name: '달걀', count: 3, avgDays: 10 },
  { name: '요거트', count: 4, avgDays: 5 },
  { name: '두부', count: 3, avgDays: 3 },
  { name: '양파', count: 2, avgDays: 14 }
];
// ------------------------------------------------------------------


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

  if (!auth) return <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50"><AlertTriangle className="text-red-500 w-16 h-16 mb-4" /><h1 className="text-2xl font-bold mb-2">Firebase 오류</h1><p className="text-gray-600">설정값을 확인해주세요.</p></div>;
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
  const [trashItems, setTrashItems] = useState([]);
  const [selectedDateForAdd, setSelectedDateForAdd] = useState(null);

  useEffect(() => {
    const qIng = query(collection(db, `users/${user.uid}/ingredients`));
    const unsubIng = onSnapshot(qIng, (snap) => {
      const items = snap.docs.map(d => {
        const data = d.data();
        return { ...data, id: d.id, expiry: data.expiry?.toDate() || new Date(), addedDate: data.addedDate?.toDate() || new Date() };
      });
      setIngredients(items);
      checkNotifications(items); 
    });

    const qCart = query(collection(db, `users/${user.uid}/cart`));
    const unsubCart = onSnapshot(qCart, (snap) => setCart(snap.docs.map(d => ({...d.data(), id: d.id}))));

    const qTrash = query(collection(db, `users/${user.uid}/trash`));
    const unsubTrash = onSnapshot(qTrash, (snap) => {
      const items = snap.docs.map(d => ({ ...d.data(), id: d.id, deletedAt: d.data().deletedAt?.toDate() }));
      setTrashItems(items);
    });

    return () => { unsubIng(); unsubCart(); unsubTrash(); };
  }, [user]);

  const checkNotifications = (items) => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    const urgentCount = items.filter(i => {
      const risk = getRiskLevel(i.expiry, i.name);
      return risk === 'danger' || risk === 'warning' || risk === 'expired';
    }).length;
  };

  const requestNotiPermission = () => {
    if ("Notification" in window) Notification.requestPermission();
  };

  const addItem = async (item) => {
    try { await addDoc(collection(db, `users/${user.uid}/ingredients`), { ...item, addedDate: new Date(), expiry: item.expiry }); } catch (e) { alert("저장 실패: " + e.message); }
  };
  
  // --- 휴지통 기능 ---
  const moveToTrash = async (ids) => {
    const batch = writeBatch(db);
    ids.forEach(id => {
      const item = ingredients.find(i => i.id === id);
      if (item) {
        const { id: itemId, ...itemData } = item;
        const trashRef = doc(collection(db, `users/${user.uid}/trash`));
        batch.set(trashRef, { ...itemData, deletedAt: new Date() });
        const ingRef = doc(db, `users/${user.uid}/ingredients`, id);
        batch.delete(ingRef);
      }
    });
    await batch.commit();
  };

  const restoreFromTrash = async (item) => {
    const batch = writeBatch(db);
    const ingRef = doc(collection(db, `users/${user.uid}/ingredients`));
    const { id, deletedAt, ...rest } = item;
    batch.set(ingRef, { ...rest });
    const trashRef = doc(db, `users/${user.uid}/trash`, item.id);
    batch.delete(trashRef);
    await batch.commit();
  };

  const permanentDelete = async (id) => {
    await deleteDoc(doc(db, `users/${user.uid}/trash`, id));
  };

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
    const batch = writeBatch(db);

    itemsToCheckout.forEach(item => {
      let dbEntry = SHELF_LIFE_DB[item.name] || SHELF_LIFE_DB[item.name.toLowerCase()] || SHELF_LIFE_DB['default'];
      if (!dbEntry) dbEntry = { fridge: 7 }; 

      let shelfLife = dbEntry.fridge || 7;
      let storage = 'fridge';
      if (!dbEntry.fridge && dbEntry.freezer) storage = 'freezer';
      
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + shelfLife);

      for(let i=0; i<item.count; i++) {
        const newRef = doc(collection(db, `users/${user.uid}/ingredients`));
        batch.set(newRef, {
          name: item.name, category: storage, expiry: expiry, addedDate: new Date()
        });
      }
      const cartRef = doc(db, `users/${user.uid}/cart`, item.id);
      batch.delete(cartRef);
    });
    
    await batch.commit();
    setActiveTab('list');
  };

  const getRiskLevel = (expiryDate, itemName = '') => {
    if (!expiryDate) return 'safe';
    const today = new Date();
    today.setHours(0,0,0,0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0,0,0,0);
    
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    const settings = SHELF_LIFE_DB[itemName] || SHELF_LIFE_DB[itemName.replace(/\s+/g, '')] || SHELF_LIFE_DB['default'] || { risk: { danger: 3, warning: 7 } };
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
        {activeTab === 'list' && <FridgeListView ingredients={ingredients} getRiskLevel={getRiskLevel} moveToTrash={moveToTrash} updateItemExpiry={updateItemExpiry} onOpenTrash={() => setActiveTab('trash')} />}
        {activeTab === 'trash' && <TrashView trashItems={trashItems} onRestore={restoreFromTrash} onPermanentDelete={permanentDelete} onClose={() => setActiveTab('list')} />}
        {activeTab === 'recipes' && <RecipeView ingredients={ingredients} onAddToCart={addToCart} recipes={RECIPE_FULL_DB} />}
        {activeTab === 'cart' && <ShoppingCartView cart={cart} onUpdateCount={updateCartCount} onRemove={removeItemsFromCart} onCheckout={checkoutCartItems} />}
        {activeTab === 'stats' && <InsightsView ingredients={ingredients} onAddToCart={addToCart} history={MOCK_USAGE_HISTORY} />}
        {activeTab === 'add' && <AddItemModal onClose={() => setActiveTab('calendar')} onAdd={addItem} initialDate={selectedDateForAdd} />}
      </main>

      <nav className="bg-white border-t flex justify-between px-6 py-3 pb-5 shadow-inner">
        <NavBtn active={activeTab==='calendar'} onClick={()=>setActiveTab('calendar')} icon={<Calendar />} label="달력" />
        <NavBtn active={activeTab==='list' || activeTab==='trash'} onClick={()=>setActiveTab('list')} icon={<Refrigerator />} label="냉장고" />
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
    if (!i.expiry) return false;
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

// --- 냉장고 목록 뷰 (선택 삭제 버그 수정됨) ---
function FridgeListView({ ingredients, getRiskLevel, moveToTrash, updateItemExpiry, onOpenTrash }) {
  const sorted = [...ingredients].sort((a,b) => (a.expiry || 0) - (b.expiry || 0));
  const [editingItem, setEditingItem] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === ingredients.length && ingredients.length > 0) setSelectedIds([]);
    else setSelectedIds(ingredients.map(i => i.id));
  };

  const handleDeleteSelected = (e) => {
    e.stopPropagation();
    // confirm()을 제거하여 휴지통으로 즉시 이동 (iframe에서 confirm 차단 문제 해결)
    if (selectedIds.length === 0) return;
    moveToTrash(selectedIds);
    setSelectedIds([]);
  };

  const EditModal = () => {
    if (!editingItem) return null;
    const initialDate = editingItem.expiry ? new Date(editingItem.expiry).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(initialDate);
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          내 냉장고 
          <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{ingredients.length}개</span>
        </h2>
        <button onClick={onOpenTrash} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="휴지통">
          <Trash2 size={20} />
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={toggleSelectAll} className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-2 rounded-xl font-bold flex items-center gap-1 shadow-sm hover:bg-gray-50 transition-all flex-1 justify-center">
            {selectedIds.length === ingredients.length && ingredients.length > 0 ? <CheckSquare size={14} className="text-green-600" /> : <Square size={14} />} 
            전체 선택
        </button>
        {selectedIds.length > 0 && (
          <button onClick={handleDeleteSelected} className="text-xs bg-red-50 text-red-600 px-3 py-2 rounded-xl font-bold border border-red-100 shadow-sm animate-in zoom-in duration-200 flex-1 cursor-pointer hover:bg-red-100">
            {selectedIds.length}개 삭제 (휴지통)
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {sorted.map(item => {
          const risk = getRiskLevel(item.expiry, item.name);
          const diff = item.expiry ? Math.ceil((item.expiry - new Date().setHours(0,0,0,0)) / (86400000)) : 0;
          const isSelected = selectedIds.includes(item.id);

          return (
            <div key={item.id} className={`p-4 rounded-xl border flex justify-between items-center shadow-sm transition-all duration-200 ${isSelected ? 'bg-green-50 border-green-300 ring-1 ring-green-500' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleSelect(item.id)}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'}`}>
                    {isSelected && <Check size={14} className="text-white" />}
                </div>
                <div className={`w-1.5 h-10 rounded-full ${risk === 'danger' ? 'bg-red-500' : risk === 'warning' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                <div>
                  <h3 className="font-bold text-gray-800">{item.name}</h3>
                  <p className={`text-xs ${risk === 'danger' ? 'text-red-500 font-bold' : 'text-gray-500'}`}>{diff < 0 ? '만료됨' : diff === 0 ? '오늘 만료' : `${diff}일 남음`} ({item.expiry ? item.expiry.toLocaleDateString() : '?'})</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); setEditingItem(item); }} className="text-gray-300 hover:text-green-600 p-2"><Edit2 size={18} /></button>
                <button onClick={(e) => { e.stopPropagation(); moveToTrash([item.id]); }} className="text-gray-300 hover:text-red-500 p-2"><Trash2 size={18} /></button>
              </div>
            </div>
          );
        })}
        {ingredients.length === 0 && <div className="text-center py-20 text-gray-400">냉장고가 비었습니다.<br/>장을 보고 채워보세요!</div>}
      </div>
    </div>
  );
}

// --- 휴지통 뷰 ---
function TrashView({ trashItems, onRestore, onPermanentDelete, onClose }) {
  return (
    <div className="p-4 pb-20 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={onClose}><ArrowLeft className="text-gray-600" /></button>
        <h2 className="text-lg font-bold flex items-center gap-2 text-red-600">
          <Trash2 size={20} /> 휴지통
        </h2>
      </div>
      <div className="bg-red-50 p-3 rounded-lg text-xs text-red-700 mb-4 flex items-start gap-2">
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
        <span>실수로 삭제했나요? 여기서 복구할 수 있습니다.</span>
      </div>
      <div className="space-y-3">
        {trashItems.length === 0 ? (
          <div className="text-center py-20 text-gray-400">휴지통이 비어있습니다.</div>
        ) : (
          trashItems.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm opacity-75 hover:opacity-100 transition-opacity">
              <div>
                <h3 className="font-bold text-gray-700 line-through decoration-gray-400">{item.name}</h3>
                <p className="text-xs text-gray-400">삭제일: {item.deletedAt ? new Date(item.deletedAt).toLocaleDateString() : '알 수 없음'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onRestore(item)} className="p-2 bg-green-50 text-green-600 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-green-100"><Undo2 size={14} /> 복구</button>
                <button onClick={() => { if(confirm('정말 영구 삭제하시겠습니까?')) onPermanentDelete(item.id); }} className="p-2 bg-gray-100 text-gray-500 rounded-lg text-xs font-bold hover:bg-red-100 hover:text-red-600">영구 삭제</button>
              </div>
            </div>
          ))
        )}
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
        <div><label className="block text-sm font-bold text-gray-700 mb-2">빠른 설정</label><div className="flex gap-2 overflow-x-auto pb-1"><button type="button" onClick={() => setExpiryByCategory(3, '고기')} className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100 whitespace-nowrap">🥩 고기 (3일)</button><button type="button" onClick={() => setExpiryByCategory(7, '채소')} className="px-3 py-2 bg-green-50 text-green-600 rounded-lg text-xs font-bold border border-green-100 whitespace-nowrap">🥬 채소 (7일)</button><button type="button" onClick={() => setExpiryByCategory(90, '김치')} className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-bold border border-red-200 whitespace-nowrap">🌶️ 김치 (90일)</button><button type="button" onClick={() => setExpiryByCategory(14, '유제품')} className="px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg text-xs font-bold border border-yellow-100 whitespace-nowrap">🥛 유제품 (14일)</button><button type="button" onClick={() => setExpiryByCategory(30, '냉동')} className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100 whitespace-nowrap">❄️ 냉동 (30일)</button></div></div>
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
  const toggleSelectAll = () => { if (selectedNames.length === cart.length && cart.length > 0) setSelectedNames([]); else setSelectedNames(cart.map(i => i.name)); };

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

// --- 레시피 뷰 (부추김치 및 김 매칭 오류 수정됨) ---
function RecipeView({ ingredients, onAddToCart, recipes }) { 
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [servings, setServings] = useState(1); 
  const categories = ['All', 'Korean', 'Japanese', 'Chinese', 'Italian', 'Other'];

  const toggleSelection = (name) => { if (selectedIngredients.includes(name)) setSelectedIngredients(selectedIngredients.filter(i => i !== name)); else setSelectedIngredients([...selectedIngredients, name]); };
  const toggleSelectAll = () => { if (selectedIngredients.length === ingredients.length && ingredients.length > 0) setSelectedIngredients([]); else setSelectedIngredients(ingredients.map(i => i.name)); };
  const scaleText = (text, multiplier) => { if (multiplier === 1) return text; return text.replace(/(\d+\/\d+|\d+(?:\.\d+)?)(\s*[a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣%도]*)/g, (match, number, unit) => { let val = number.includes('/') ? parseInt(number.split('/')[0]) / parseInt(number.split('/')[1]) : parseFloat(number); if (!val) return match; let scaled = val * multiplier; return `${Number.isInteger(scaled) ? scaled : parseFloat(scaled.toFixed(1))}${unit}`; }); };
  
  // 수정된 매칭 로직 (부추김치 & 김 오류 해결)
  const matchIngredient = (recipeIng, userIng) => {
    const r = recipeIng.replace(/\s/g, ''); 
    const u = userIng.replace(/\s/g, ''); 
    
    if (r === u) return true;
    if (r === '김' && u.includes('김치')) return false; // 김 != 김치
    if (u.includes('부추김치') && (r === '부추' || r === '김치')) return false; // 부추김치 != 부추, 김치
    
    return r.includes(u) || u.includes(r);
  };

  const getMatchedRecipes = () => { 
    if (!recipes || recipes.length === 0) return [];
    let filtered = recipes; 
    if (filterCategory !== 'All') filtered = filtered.filter(r => r.category === filterCategory); 
    return filtered.map(recipe => { 
      const existing = recipe.ingredients.filter(req => selectedIngredients.some(sel => matchIngredient(req, sel)));
      const missing = recipe.ingredients.filter(req => !selectedIngredients.some(sel => matchIngredient(req, sel))); 
      return { ...recipe, existing, missing, score: existing.length }; 
    }).sort((a, b) => b.score - a.score); 
  };
  
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
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2 flex justify-between items-center">
          1. Select Leftovers
          <button onClick={toggleSelectAll} className="text-xs font-medium text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg hover:bg-green-100"><CheckSquare size={14} /> 전체 선택</button>
        </h2>
        <div className="flex flex-wrap gap-2">{ingredients.length > 0 ? ingredients.map(item => (<button key={item.id} onClick={() => toggleSelection(item.name)} className={`px-3 py-1.5 rounded-full text-sm border transition-all ${selectedIngredients.includes(item.name) ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'}`}>{item.name}</button>)) : <p className="text-gray-400 text-xs">냉장고에 재료가 없습니다.</p>}</div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">{categories.map(cat => (<button key={cat} onClick={() => setFilterCategory(cat)} className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filterCategory === cat ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'}`}>{cat}</button>))}</div>
      <div className="flex-1 overflow-y-auto space-y-3">{matchedRecipes.length > 0 ? matchedRecipes.map(recipe => (<div key={recipe.id} onClick={() => setSelectedRecipe(recipe)} className={`bg-white p-4 rounded-xl border shadow-sm cursor-pointer transition-all hover:border-green-300 ${recipe.score > 0 ? 'border-green-200 bg-green-50' : 'border-gray-100'}`}><div className="flex justify-between items-start mb-1"><h3 className="font-bold text-gray-800">{recipe.name}</h3>{recipe.score > 0 && <span className="text-[10px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded font-bold">Match</span>}</div>{recipe.score > 0 ? (<div className="text-xs text-gray-600"><span className="text-green-600 font-medium">Have: {recipe.existing.join(', ')}</span>{recipe.missing.length > 0 && <span className="text-gray-400 ml-2">Missing: {recipe.missing.slice(0, 3).join(', ')}...</span>}</div>) : (<p className="text-xs text-gray-400 line-clamp-1">{recipe.measure}</p>)}</div>)) : <div className="text-center py-10 text-gray-400">표시할 레시피가 없습니다.<br/>데이터를 확인해주세요.</div>}</div>
    </div>
  );
}

// --- 통계 뷰 ---
function InsightsView({ ingredients, onAddToCart, history }) {
  const usageHistory = history && history.length > 0 ? history : [];
  const maxCount = usageHistory.length > 0 ? Math.max(...usageHistory.map(h => h.count)) : 1;
  const handleQuickAdd = (name) => { onAddToCart(name); alert(`${name}이(가) 장바구니에 담겼습니다!`); };

  return (
    <div className="p-4 pb-20 animate-in fade-in duration-500">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><BarChart2 className="text-green-600" /> 통계 및 분석</h2>
      <div className="bg-white p-5 rounded-2xl border shadow-sm mb-4">
        <h3 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-1"><PieChart size={14} /> 현재 냉장고 상태</h3>
        <div className="flex items-center justify-between">
            <div className="text-center"><div className="text-2xl font-bold text-green-600">{ingredients.length}</div><div className="text-xs text-gray-400">총 식재료</div></div>
            <div className="h-8 w-[1px] bg-gray-200"></div>
            <div className="text-center"><div className="text-2xl font-bold text-gray-800">100<span className="text-xs text-gray-400">%</span></div><div className="text-xs text-gray-400">신선도</div></div>
            <div className="h-8 w-[1px] bg-gray-200"></div>
            <div className="text-center"><div className="text-2xl font-bold text-blue-500">0</div><div className="text-xs text-gray-400">폐기율</div></div>
        </div>
      </div>
      <div className="bg-white p-5 rounded-2xl border shadow-sm mb-4">
        <h3 className="text-sm font-bold text-gray-500 mb-4 flex items-center gap-1"><TrendingUp size={14} /> 자주 쓰는 재료 Top 5</h3>
        <div className="space-y-4">
          {usageHistory.length > 0 ? usageHistory.map((item, idx) => (
            <div key={idx} className="group">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-gray-700">{item.name}</span>
                <div className="flex items-center gap-2"><span className="text-gray-400">{item.count}회 구매</span><button onClick={() => handleQuickAdd(item.name)} className="bg-green-50 text-green-600 p-1 rounded hover:bg-green-100 transition-colors" title="장바구니에 담기"><Plus size={12} /></button></div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${(item.count / maxCount) * 100}%` }}></div></div>
              <div className="text-[10px] text-gray-400 mt-1 text-right">평균 {item.avgDays}일 만에 소진</div>
            </div>
          )) : <div className="text-center text-gray-400 text-xs py-4">데이터가 부족합니다.</div>}
        </div>
      </div>
      <div className="bg-green-50 p-5 rounded-2xl border border-green-100 flex items-center justify-between">
        <div><h3 className="font-bold text-green-800 mb-1">이번 달 절약 금액</h3><p className="text-xs text-green-600">집밥으로 외식비 절약!</p></div>
        <div className="text-xl font-bold text-green-700 flex items-center"><DollarSign size={20} /> 125,000원</div>
      </div>
    </div>
  );
}

function NavBtn({ active, onClick, icon, label, count }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 relative ${active ? 'text-green-600' : 'text-gray-400'}`}>
      <div className="relative">{React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 2 })}{count > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-1 ring-white">{count}</span>}</div><span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}