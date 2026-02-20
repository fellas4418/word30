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
  
  const wordEl = document.getElementById("word");
  const timerEl = document.getElementById("timer");
  const remainingEl = document.getElementById("remaining");
  const buttons = document.querySelectorAll(".pos-buttons button");
  const startBtn = document.getElementById("startBtn");
  const overlay = document.getElementById("startOverlay");
  
  /* ---------- 음성 인식 ---------- */
  
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  
  let recognition;
  
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "ko-KR";
  
    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript;
  
      if (transcript.trim().length >= 2) {
        hasSpoken = true;
        buttons.forEach(btn => btn.disabled = false);
        timerEl.style.color = "green";
      }
    };
  }
  
  /* ---------- 문제 로딩 ---------- */
  
  function loadWord() {
    const current = words[currentIndex];
    wordEl.textContent = current.word;
    remainingEl.textContent = words.length - currentIndex;
  
    buttons.forEach(btn => {
      btn.style.backgroundColor = "#FF6B3D";
      btn.disabled = true;
    });
  
    timerEl.style.color = "#FF6B3D";
  }
  
  /* ---------- 타이머 ---------- */
  
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
        if (recognition) recognition.stop();
  
        if (!hasSpoken) {
          wrongWords.push(words[currentIndex]);
          nextWord();
        }
      }
    }, 1000);
  }
  
  /* ---------- 다음 문제 ---------- */
  
  function nextWord() {
    currentIndex++;
  
    if (currentIndex >= words.length) {
      alert("완료\n오답 개수: " + wrongWords.length);
      return;
    }
  
    hasSpoken = false;
  
    loadWord();
    if (recognition) recognition.start();
    startTimer();
  }
  
  /* ---------- 품사 선택 ---------- */
  
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const selected = btn.dataset.pos;
      const correct = words[currentIndex].pos;
  
      clearInterval(interval);
      if (recognition) recognition.stop();
  
      if (selected === correct) {
        btn.style.backgroundColor = "#2ecc71";
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
    hasSpoken = false;
    loadWord();
    if (recognition) recognition.start();
    startTimer();
  });