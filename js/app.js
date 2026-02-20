/* ---------- 데이터 및 변수 설정 ---------- */
// 뜻(meaning) 데이터를 추가했습니다.
const words = [
  { word: "abandon", pos: "verb", meaning: "포기하다, 버리다" },
  { word: "ability", pos: "noun", meaning: "능력" },
  { word: "active", pos: "adj", meaning: "활동적인" }
];

let currentIndex = 0;
let time = 10;
let interval;
let results = []; // 각 문제의 결과를 상세히 저장 (정답여부, 선택품사, 오답원인 등)
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
      if (transcript.trim().length >= 1) {
          if (!hasSpoken) {
              hasSpoken = true;
              buttons.forEach(btn => btn.disabled = false);
              timerEl.style.color = "#2ecc71";
              wordEl.style.color = "#2ecc71";
          }
      }
  };
}

/* ---------- 문제 로딩 ---------- */
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

/* ---------- 타이머 ---------- */
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

// 시간 초과 시 (음성 인식 실패로 간주)
function handleTimeUp() {
  if (recognition) { try { recognition.stop(); } catch(e) {} }
  results.push({
      word: words[currentIndex].word,
      meaning: words[currentIndex].meaning,
      status: "오답",
      reason: "미발화/시간초과"
  });
  nextWord();
}

/* ---------- 다음 문제 ---------- */
function nextWord() {
  currentIndex++;
  if (currentIndex >= words.length) {
      showFinalResult();
      return;
  }
  loadWord();
  if (recognition) { try { recognition.start(); } catch(e) {} }
  startTimer();
}

/* ---------- 최종 결과 표시 ---------- */
function showFinalResult() {
  clearInterval(interval);
  if (recognition) recognition.stop();

  const correctCount = results.filter(r => r.status === "정답").length;
  let report = `학습 완료! (총 30문제 중 ${correctCount}개 정답)\n\n`;
  report += "------- 오답 노트 -------\n";

  results.forEach((res, idx) => {
      if (res.status === "오답") {
          report += `${idx + 1}. ${res.word} (${res.meaning})\n   사유: ${res.reason}\n`;
      }
  });

  if (correctCount === words.length) report += "와우! 만점입니다! 🎉";
  
  alert(report);
  location.reload();
}

/* ---------- 품사 버튼 클릭 ---------- */
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
      const selected = btn.dataset.pos;
      const correct = words[currentIndex].pos;
      clearInterval(interval);
      if (recognition) { try { recognition.stop(); } catch(e) {} }

      if (selected === correct) {
          btn.style.backgroundColor = "#2ecc71"; 
          results.push({ status: "정답" });
      } else {
          btn.style.backgroundColor = "#e74c3c"; 
          // 품사 선택 오류인 경우 원인 기록
          const posMap = { noun: "명사", verb: "동사", adj: "형용사" };
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

/* ---------- 시작 버튼 ---------- */
startBtn.addEventListener("click", () => {
  overlay.style.display = "none";
  loadWord();
  if (recognition) { try { recognition.start(); } catch(err) {} }
  startTimer();
});