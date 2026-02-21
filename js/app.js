/* ---------- 데이터 설정 (30개 예시) ---------- */
const words = [
  { word: "abandon", pos: "verb", meaning: "포기하다" },
  { word: "ability", pos: "noun", meaning: "능력" },
  { word: "active", pos: "adj", meaning: "활동적인" },
  { word: "benefit", pos: "noun", meaning: "이익" },
  { word: "collect", pos: "verb", meaning: "수집하다" }
  // ... 추가 단어는 이 형식으로 넣으시면 됩니다.
];

let currentIndex = 0;
let time = 10;
let interval;
let results = [];
let hasSpoken = false;

const wordEl = document.getElementById("word");
const timerEl = document.getElementById("timer");
const remainingEl = document.getElementById("remaining");
const buttons = document.querySelectorAll(".pos-buttons button");
const startBtn = document.getElementById("startBtn");
const overlay = document.getElementById("startOverlay");
const cardEl = document.getElementById("wordCard");

/* ---------- 음성 인식 설정 ---------- */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onstart = () => {
      cardEl.style.borderColor = "#FF6B3D"; // 인식 시작 시 주황색 테두리
  };

  recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      if (transcript.trim().length >= 1) {
          if (!hasSpoken) {
              hasSpoken = true;
              buttons.forEach(btn => btn.disabled = false);
              timerEl.style.color = "#2ecc71";
              wordEl.style.color = "#2ecc71";
              cardEl.style.borderColor = "#2ecc71"; // 성공 시 초록색 테두리
          }
      }
  };

  recognition.onerror = () => {
      // 에러 발생 시 재시작 시도 (모바일 안정성)
      try { recognition.stop(); } catch(e) {}
  };
}

function loadWord() {
  const current = words[currentIndex];
  wordEl.textContent = current.word;
  wordEl.style.color = "#1F3B34";
  cardEl.style.borderColor = "transparent";
  remainingEl.textContent = words.length - currentIndex;
  buttons.forEach(btn => {
      btn.style.backgroundColor = "#FF6B3D";
      btn.disabled = true;
  });
  timerEl.style.color = "#FF6B3D";
  hasSpoken = false;
}

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
  results.push({
      word: words[currentIndex].word,
      meaning: words[currentIndex].meaning,
      status: "오답",
      reason: "시간초과(미발화)"
  });
  nextWord();
}

function nextWord() {
  currentIndex++;
  if (currentIndex >= words.length) {
      showFinalResult();
      return;
  }
  loadWord();
  if (recognition) {
      try { recognition.start(); } catch(e) {}
  }
  startTimer();
}

function showFinalResult() {
  clearInterval(interval);
  if (recognition) try { recognition.stop(); } catch(e) {}

  const correctCount = results.filter(r => r.status === "정답").length;
  let report = `학습 완료!\n✅ 정답: ${correctCount}개 / ❌ 오답: ${results.length - correctCount}개\n\n`;
  
  const fails = results.filter(r => r.status === "오답");
  if (fails.length > 0) {
      report += "------- 오답 노트 -------\n";
      fails.forEach((res) => {
          report += `• ${res.word}(${res.meaning}): ${res.reason}\n`;
      });
  }

  alert(report);
  location.reload();
}

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
      const selected = btn.dataset.pos;
      const correct = words[currentIndex].pos;
      const posMap = { noun: "명사", verb: "동사", adj: "형용사" };

      clearInterval(interval);
      if (recognition) try { recognition.stop(); } catch(e) {}

      if (selected === correct) {
          btn.style.backgroundColor = "#2ecc71";
          results.push({ status: "정답" });
      } else {
          btn.style.backgroundColor = "#e74c3c";
          results.push({
              word: words[currentIndex].word,
              meaning: words[currentIndex].meaning,
              status: "오답",
              reason: `품사 오답 (정답: ${posMap[correct]})`
          });
      }
      setTimeout(() => nextWord(), 800);
  });
});

startBtn.addEventListener("click", () => {
  overlay.style.display = "none";
  loadWord();
  if (recognition) {
      try {
          recognition.stop();
          setTimeout(() => recognition.start(), 100);
      } catch(e) {}
  }
  startTimer();
});