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
let correctCount = 0; // 정답 개수 추적용
let hasSpoken = false;

/* ---------- DOM 요소 선택 ---------- */
const wordEl = document.getElementById("word");
const timerEl = document.getElementById("timer");
const remainingEl = document.getElementById("remaining");
const buttons = document.querySelectorAll(".pos-buttons button");
const startBtn = document.getElementById("startBtn");
const overlay = document.getElementById("startOverlay");

/* ---------- 음성 인식 설정 ---------- */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US"; 

  recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      const currentWord = words[currentIndex].word.toLowerCase();
      
      // 사용자가 화면의 단어를 실제로 읽었는지 확인 (포함 여부 검사)
      if (transcript.includes(currentWord)) {
          if (!hasSpoken) {
              hasSpoken = true;
              buttons.forEach(btn => btn.disabled = false);
              timerEl.style.color = "#2ecc71";
              wordEl.style.color = "#2ecc71";
          }
      }
  };

  recognition.onerror = (event) => {
      console.error("음성 인식 오류:", event.error);
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

/* ---------- 타이머 실행 함수 ---------- */
function startTimer() {
  time = 10;
  timerEl.textContent = time;

  clearInterval(interval);
  interval = setInterval(() => {
      time--;
      timerEl.textContent = time;

      if (time <= 3) {
          timerEl.style.color = "red";
      }

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

/* ---------- 다음 문제로 이동 ---------- */
function nextWord() {
  currentIndex++;

  if (currentIndex >= words.length) {
      clearInterval(interval);
      if (recognition) recognition.stop();
      // 정답 개수와 오답 개수를 함께 표기
      alert(`학습 완료!\n✅ 정답: ${correctCount}개\n❌ 오답: ${wrongWords.length}개`);
      location.reload();
      return;
  }

  loadWord();
  if (recognition) { try { recognition.start(); } catch(e) {} }
  startTimer();
}

/* ---------- 품사 선택 이벤트 ---------- */
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
      if (!hasSpoken) return; 

      const selected = btn.dataset.pos;
      const correct = words[currentIndex].pos;

      clearInterval(interval);
      if (recognition) { try { recognition.stop(); } catch(e) {} }

      if (selected === correct) {
          btn.style.backgroundColor = "#2ecc71"; 
          correctCount++; // 정답 카운트 증가
      } else {
          btn.style.backgroundColor = "#e74c3c"; 
          wrongWords.push(words[currentIndex]);
      }

      setTimeout(() => {
          nextWord();
      }, 800);
  });
});

/* ---------- 시작 버튼 ---------- */
startBtn.addEventListener("click", () => {
  overlay.style.display = "none";
  loadWord();
  if (recognition) { try { recognition.start(); } catch(err) {} }
  startTimer();
});