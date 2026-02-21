/* ---------- 1. 데이터 및 상태 관리 ---------- */
const words = [
  { word: "abandon", pos: "verb", meaning: "포기하다" },
  { word: "ability", pos: "noun", meaning: "능력" },
  { word: "active", pos: "adj", meaning: "활동적인" },
  { word: "benefit", pos: "noun", meaning: "이익" },
  { word: "collect", pos: "verb", meaning: "수집하다" },
  { word: "decline", pos: "verb", meaning: "거절하다" },
  { word: "efficient", pos: "adj", meaning: "효율적인" },
  { word: "factor", pos: "noun", meaning: "요인" },
  { word: "gather", pos: "verb", meaning: "모으다" },
  { word: "habit", pos: "noun", meaning: "습관" }
  // 필요한 30개 단어를 이 형식으로 추가하세요.
];

let currentSessionWords = []; 
let currentIndex = 0;
let time = 10;
let interval;
let sessionResults = [];
let correctCount = 0;
let hasSpoken = false;
let isReviewMode = false;

/* ---------- 2. DOM 요소 선택 ---------- */
const wordEl = document.getElementById("word");
const timerEl = document.getElementById("timer");
const remainingEl = document.getElementById("remaining");
const buttons = document.querySelectorAll(".pos-buttons button");
const startBtn = document.getElementById("startBtn");
const overlay = document.getElementById("startOverlay");
const cardEl = document.getElementById("wordCard");

/* ---------- 3. 음성 인식 설정 (정밀 검증 버전) ---------- */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      const currentWord = currentSessionWords[currentIndex].word.toLowerCase();
      
      // 발화 검증: 단어를 읽었는지 확인
      if (transcript.includes(currentWord)) {
          if (!hasSpoken) {
              hasSpoken = true;
              buttons.forEach(btn => btn.disabled = false); // 발화 확인 시에만 버튼 활성화
              timerEl.style.color = "#2ecc71";
              wordEl.style.color = "#2ecc71";
              if(cardEl) cardEl.style.borderColor = "#2ecc71";
          }
      }
  };

  recognition.onerror = () => { try { recognition.stop(); } catch(e) {} };
}

/* ---------- 4. 복습 시스템 로직 (평일/주말 구분) ---------- */
function getTargetWords() {
  const now = new Date();
  const day = now.getDay(); // 0:일, 6:토
  const history = JSON.parse(localStorage.getItem('word30_history') || '{"wrongs":[], "daily":{}}');
  
  let reviewList = [];

  if (day === 0 || day === 6) { 
      // 주말: 주중(월~금) 오답 전체 모음
      reviewList = history.wrongs || [];
      isReviewMode = reviewList.length > 0;
  } else {
      // 평일: 최근 2일치 오답 리스트 추출
      reviewList = history.wrongs.slice(-10); // 임시로 최근 10개 오답 우선 복습
      isReviewMode = reviewList.length > 0;
  }

  if (isReviewMode) {
      alert("복습 세션을 시작합니다. 클리어할 때까지 반복됩니다.");
      time = 8; // 복습 모드 타이머 단축
      return reviewList;
  } else {
      return words; // 신규 학습
  }
}

/* ---------- 5. 학습 제어 기능 ---------- */
function loadWord() {
  const current = currentSessionWords[currentIndex];
  wordEl.textContent = current.word;
  wordEl.style.color = "#1F3B34";
  if(cardEl) cardEl.style.borderColor = "#FF6B3D";
  remainingEl.textContent = currentSessionWords.length - currentIndex;
  
  buttons.forEach(btn => {
      btn.style.backgroundColor = "#FF6B3D";
      btn.disabled = true; // 매 문제 시작 시 버튼 잠금
  });

  timerEl.style.color = "#FF6B3D";
  hasSpoken = false;
}

function startTimer() {
  timerEl.textContent = time;
  clearInterval(interval);
  interval = setInterval(() => {
      time--;
      timerEl.textContent = time;
      if (time <= 3) timerEl.style.color = "red";
      if (time <= 0) {
          clearInterval(interval);
          handleTimeUp();
      }
  }, 1000);
}

function handleTimeUp() {
  saveResult(currentSessionWords[currentIndex], "오답", "시간초과(미발화)");
  nextWord();
}

function nextWord() {
  currentIndex++;
  if (currentIndex >= currentSessionWords.length) {
      showFinalResult();
      return;
  }
  loadWord();
  restartMicrophone();
  startTimer();
}

function restartMicrophone() {
  if (recognition) {
      try {
          recognition.stop();
          // 모바일 하드웨어 초기화 시간을 위해 0.3초 지연 후 재시작 (마이크 끊김 방지)
          setTimeout(() => { recognition.start(); }, 300); 
      } catch(e) {}
  }
}

/* ---------- 6. 데이터 저장 및 리포트 (학부모 공유 기초) ---------- */
function saveResult(wordObj, status, reason) {
  let history = JSON.parse(localStorage.getItem('word30_history') || '{"wrongs":[], "weakList":[]}');
  
  if (status === "오답") {
      // 1) 날짜별/주간 복습용 저장
      history.wrongs.push(wordObj);
      // 2) Weak List(누적 약점) 저장
      const weakIdx = history.weakList.findIndex(w => w.word === wordObj.word);
      if (weakIdx > -1) {
          history.weakList[weakIdx].count++;
      } else {
          history.weakList.push({ ...wordObj, count: 1 });
      }
  } else if (status === "정답" && isReviewMode) {
      // 복습 모드에서 맞추면 리스트에서 제거
      history.wrongs = history.wrongs.filter(w => w.word !== wordObj.word);
  }

  localStorage.setItem('word30_history', JSON.stringify(history));
  sessionResults.push({ ...wordObj, status, reason });
}

function showFinalResult() {
  clearInterval(interval);
  if (recognition) try { recognition.stop(); } catch(e) {}

  const report = `학습 종료!\n✅ 정답: ${correctCount} / ❌ 오답: ${sessionResults.filter(r=>r.status==="오답").length}\n\n*오답은 복습 리스트와 Weak List에 저장되었습니다.`;
  alert(report);
  
  // 학부모 공유용 데이터 전송 시뮬레이션
  const parentData = {
      studentId: "fellas4418",
      date: new Date().toLocaleDateString(),
      accuracy: ((correctCount / currentSessionWords.length) * 100).toFixed(1),
      weakWords: JSON.parse(localStorage.getItem('word30_history')).weakList.sort((a,b)=>b.count-a.count).slice(0,5)
  };
  console.log("학부모 리포트 데이터:", parentData);

  location.reload();
}

/* ---------- 7. 이벤트 리스너 ---------- */
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
      if (!hasSpoken) return; // 말을 안 했으면 클릭 무시

      const selected = btn.dataset.pos;
      const correct = currentSessionWords[currentIndex].pos;

      clearInterval(interval);
      if (recognition) try { recognition.stop(); } catch(e) {}

      if (selected === correct) {
          btn.style.backgroundColor = "#2ecc71";
          correctCount++;
          saveResult(currentSessionWords[currentIndex], "정답", "");
      } else {
          btn.style.backgroundColor = "#e74c3c";
          saveResult(currentSessionWords[currentIndex], "오답", `품사 오류(정답:${correct})`);
      }
      setTimeout(() => nextWord(), 800);
  });
});

startBtn.addEventListener("click", () => {
  overlay.style.display = "none";
  currentSessionWords = getTargetWords();
  loadWord();
  if (recognition) {
      try { recognition.start(); } catch(e) {}
  }
  startTimer();
});