/* ---------- 1. 데이터 및 초기 설정 ---------- */
const words = [
  { word: "abandon", pos: "verb", meaning: "포기하다" },
  { word: "ability", pos: "noun", meaning: "능력" },
  { word: "active", pos: "adj", meaning: "활동적인" },
  { word: "benefit", pos: "noun", meaning: "이익" },
  { word: "collect", pos: "verb", meaning: "수집하다" },
  { word: "decline", pos: "verb", meaning: "거절하다" },
  { word: "efficient", pos: "adj", meaning: "효율적인" }
];

let currentSessionWords = []; // 현재 풀고 있는 문제 리스트
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

/* ---------- 3. 음성 인식 설정 (안정화 버전) ---------- */
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
      
      // 발화 강제 로직: 단어가 포함되어 있는지 확인
      if (transcript.includes(currentWord)) {
          if (!hasSpoken) {
              hasSpoken = true;
              buttons.forEach(btn => btn.disabled = false);
              timerEl.style.color = "#2ecc71";
              wordEl.style.color = "#2ecc71";
              cardEl.style.borderColor = "#2ecc71";
          }
      }
  };

  recognition.onerror = () => {
      try { recognition.stop(); } catch(e) {}
  };
}

/* ---------- 4. 복습 로직 (오늘 날짜 및 주말 판별) ---------- */
function getTargetWords() {
  const now = new Date();
  const day = now.getDay(); // 0:일, 6:토
  const todayStr = now.toISOString().split('T')[0];
  
  // 로컬 스토리지에서 과거 오답 가져오기 (실제 DB 연결 전 단계)
  const allHistory = JSON.parse(localStorage.getItem('word30_history') || '{}');
  let reviewList = [];

  if (day === 0 || day === 6) { // 주말: 주중 전체 복습
      Object.values(allHistory).forEach(list => reviewList.push(...list));
      isReviewMode = true;
  } else {
      // 평일: 최근 2일치 복습 (예시로 어제, 그저께 날짜 계산 로직 필요)
      // 일단은 저장된 모든 오답 중 미해결된 것 위주로 구성
      reviewList = allHistory['wrongs'] || [];
      isReviewMode = reviewList.length > 0;
  }

  if (isReviewMode) {
      alert("복습 세션을 먼저 시작합니다!");
      time = 8; // 복습 모드는 8초
      return reviewList.slice(0, 10); // 최대 10개씩 복습
  } else {
      return words; // 신규 학습
  }
}

/* ---------- 5. 게임 제어 함수 ---------- */
function loadWord() {
  const current = currentSessionWords[currentIndex];
  wordEl.textContent = current.word;
  wordEl.style.color = "#1F3B34";
  cardEl.style.borderColor = "#FF6B3D";
  remainingEl.textContent = currentSessionWords.length - currentIndex;
  
  buttons.forEach(btn => {
      btn.style.backgroundColor = "#FF6B3D";
      btn.disabled = true;
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
  saveWrongWord(currentSessionWords[currentIndex], "시간초과");
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
          setTimeout(() => recognition.start(), 250); // 모바일 하드웨어 준비 시간
      } catch(e) {}
  }
}

/* ---------- 6. 오답 저장 (복습 시스템용) ---------- */
function saveWrongWord(wordObj, reason) {
  let history = JSON.parse(localStorage.getItem('word30_history') || '{"wrongs":[]}');
  
  // 중복 방지하며 Weak List에 추가
  if (!history.wrongs.some(w => w.word === wordObj.word)) {
      history.wrongs.push(wordObj);
  }
  localStorage.setItem('word30_history', JSON.stringify(history));
  
  sessionResults.push({ ...wordObj, status: "오답", reason: reason });
}

/* ---------- 7. 결과 및 UI 이벤트 ---------- */
function showFinalResult() {
  clearInterval(interval);
  if (recognition) try { recognition.stop(); } catch(e) {}

  const report = `학습 완료!\n정답: ${correctCount} / 총: ${currentSessionWords.length}`;
  alert(report);
  
  // 학부모 공유용 데이터 시뮬레이션 (콘솔 출력)
  console.log("학부모 전송 데이터:", {
      date: new Date().toLocaleDateString(),
      score: (correctCount / currentSessionWords.length * 100).toFixed(1),
      wrongs: sessionResults.filter(r => r.status === "오답")
  });

  location.reload();
}

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
      const selected = btn.dataset.pos;
      const correct = currentSessionWords[currentIndex].pos;

      clearInterval(interval);
      if (recognition) try { recognition.stop(); } catch(e) {}

      if (selected === correct) {
          btn.style.backgroundColor = "#2ecc71";
          correctCount++;
          sessionResults.push({ status: "정답" });
      } else {
          btn.style.backgroundColor = "#e74c3c";
          saveWrongWord(currentSessionWords[currentIndex], `품사 오류(정답:${correct})`);
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