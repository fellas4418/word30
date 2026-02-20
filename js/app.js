/* ---------- 데이터 및 변수 설정 ---------- */
const words = [
  { word: "abandon", pos: "verb" },
  { word: "ability", pos: "noun" },
  { word: "active", pos: "adj" }
];

let currentIndex = 0;
let time = 10;
let interval;
let wrongWords = [];
let correctCount = 0; 
let hasSpoken = false;

/* ---------- DOM 요소 선택 ---------- */
const wordEl = document.getElementById("word");
const timerEl = document.getElementById("timer");
const remainingEl = document.getElementById("remaining");
const buttons = document.querySelectorAll(".pos-buttons button");
const startBtn = document.getElementById("startBtn");
const overlay = document.getElementById("startOverlay");

/* ---------- 음성 인식 설정 (검증 완화 버전) ---------- */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US"; 

  recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      
      // 디버깅용: 내가 말한 게 어떻게 인식되는지 확인 (F12 콘솔창)
      console.log("인식된 소리:", transcript);

      // [수정] 너무 엄격한 단어 비교 대신, 소리가 나면(글자가 생기면) 바로 인정
      if (transcript.trim().length >= 1) {
          if (!hasSpoken) {
              hasSpoken = true;
              buttons.forEach(btn => btn.disabled = false);
              timerEl.style.color = "#2ecc71";
              wordEl.style.color = "#2ecc71";
          }
      }
  };

  recognition.onerror = (event) => {
      console.error("음성 인식 에러:", event.error);
      // 에러가 나도 게임을 계속할 수 있게 버튼을 그냥 풀어주는 보험
      if (event.error === 'network') {
          alert("네트워크 연결을 확인해주세요.");
      }
  };
}

/* ---------- 문제 로딩 함수 ---------- */
function loadWord() {
  const current = words[currentIndex];
  wordEl.textContent = current.word;
  wordEl.style.color = "#1F3B34";
  remainingEl.textContent = words.length - currentIndex;

  buttons.forEach(btn => {
      btn.style.backgroundColor = "#FF6B3D";
      btn.disabled = true;
  });

  timerEl.style.color = "#FF6B3D";
  hasSpoken = false;
}

/* ---------- 타이머 및 로직 ---------- */
function startTimer() {
  time = 10;
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
  if (recognition) { try { recognition.stop(); } catch(e) {} }
  if (!hasSpoken) {
      wrongWords.push(words[currentIndex]);
      nextWord();
  }
}

function nextWord() {
  currentIndex++;
  if (currentIndex >= words.length) {
      clearInterval(interval);
      if (recognition) recognition.stop();
      alert(`학습 완료!\n✅ 정답: ${correctCount}개\n❌ 오답: ${wrongWords.length}개`);
      location.reload();
      return;
  }
  loadWord();
  if (recognition) { 
      try { recognition.start(); } catch(e) { console.log("재시작 중..."); } 
  }
  startTimer();
}

/* ---------- 버튼 이벤트 ---------- */
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
      const selected = btn.dataset.pos;
      const correct = words[currentIndex].pos;
      clearInterval(interval);
      if (recognition) { try { recognition.stop(); } catch(e) {} }

      if (selected === correct) {
          btn.style.backgroundColor = "#2ecc71"; 
          correctCount++;
      } else {
          btn.style.backgroundColor = "#e74c3c"; 
          wrongWords.push(words[currentIndex]);
      }
      setTimeout(() => nextWord(), 800);
  });
});

startBtn.addEventListener("click", () => {
  overlay.style.display = "none";
  loadWord();
  if (recognition) { 
      try { 
          recognition.start(); 
          console.log("음성 인식 시작됨");
      } catch(err) {
          console.error("시작 실패:", err);
      } 
  }
  startTimer();
});