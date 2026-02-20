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
let hasSpoken = false;

/* ---------- DOM 요소 선택 ---------- */
const wordEl = document.getElementById("word");
const timerEl = document.getElementById("timer");
const remainingEl = document.getElementById("remaining");
const buttons = document.querySelectorAll(".pos-buttons button");
const startBtn = document.getElementById("startBtn");
const overlay = document.getElementById("startOverlay");

/* ---------- 음성 인식 설정 (모바일/HTTPS 대응) ---------- */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US"; // 영어 단어 학습이므로 영어 인식이 정확도가 높음

  recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      
      // 두 글자 이상 소리내면 인식 성공 처리
      if (transcript.trim().length >= 2) {
          if (!hasSpoken) {
              hasSpoken = true;
              // 버튼 잠금 해제
              buttons.forEach(btn => btn.disabled = false);
              // 시각적 피드백 제공
              timerEl.style.color = "#2ecc71";
              wordEl.style.color = "#2ecc71";
          }
      }
  };

  recognition.onerror = (event) => {
      console.error("음성 인식 오류:", event.error);
      // 모바일에서 권한 거부 시 안내
      if (event.error === 'not-allowed') {
          alert("마이크 사용 권한이 필요합니다. 설정에서 마이크를 허용해주세요.");
      }
  };
}

/* ---------- 문제 로딩 함수 ---------- */
function loadWord() {
  const current = words[currentIndex];
  wordEl.textContent = current.word;
  wordEl.style.color = "#1F3B34"; // 초기 색상
  remainingEl.textContent = words.length - currentIndex;

  // 버튼 초기화 및 비활성화
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

/* ---------- 시간 초과 처리 ---------- */
function handleTimeUp() {
  if (recognition) {
      try { recognition.stop(); } catch(e) {}
  }

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
      alert(`학습 완료!\n오답 개수: ${wrongWords.length}`);
      location.reload(); // 처음부터 다시 시작
      return;
  }

  loadWord();
  
  // 모바일에서는 수동으로 다시 시작해주어야 함
  if (recognition) {
      try { recognition.start(); } catch(e) {}
  }
  startTimer();
}

/* ---------- 품사 선택 이벤트 ---------- */
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
      if (!hasSpoken) return; // 혹시나 하는 방어 코드

      const selected = btn.dataset.pos;
      const correct = words[currentIndex].pos;

      clearInterval(interval);
      if (recognition) {
          try { recognition.stop(); } catch(e) {}
      }

      if (selected === correct) {
          btn.style.backgroundColor = "#2ecc71"; // 정답: 초록색
      } else {
          btn.style.backgroundColor = "#e74c3c"; // 오답: 빨간색
          wrongWords.push(words[currentIndex]);
      }

      // 정답 확인 후 0.8초 뒤 다음 문제
      setTimeout(() => {
          nextWord();
      }, 800);
  });
});

/* ---------- 시작 버튼 (핵심) ---------- */
startBtn.addEventListener("click", () => {
  // 1. 오버레이 숨기기
  overlay.style.display = "none";
  
  // 2. 문제 준비
  loadWord();

  // 3. 음성 인식 시작 (사용자 클릭 시점에 실행해야 모바일에서 작동)
  if (recognition) {
      try {
          recognition.start();
      } catch (err) {
          console.log("인식 시작 실패:", err);
      }
  }

  // 4. 타이머 작동
  startTimer();
});