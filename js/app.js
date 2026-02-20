/* ---------- 음성 인식 설정 부분 수정 ---------- */
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US"; // 단어가 영어이므로 영어 인식이 더 정확할 수 있습니다. 
                              // 만약 한국어 응답을 원하시면 "ko-KR" 유지.

  recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      
      // 두 글자 이상 말하면 인식 성공으로 간주
      if (transcript.trim().length >= 2) {
          hasSpoken = true;
          buttons.forEach(btn => btn.disabled = false);
          timerEl.style.color = "#2ecc71"; // 성공 시 타이머 녹색으로
          wordEl.style.color = "#2ecc71";  // 단어도 녹색으로 변경하여 피드백 제공
      }
  };
}

/* ---------- loadWord 함수 수정 (텍스트 색상 초기화 추가) ---------- */
function loadWord() {
  const current = words[currentIndex];
  wordEl.textContent = current.word;
  wordEl.style.color = "#1F3B34"; // 기본 색상으로 초기화
  remainingEl.textContent = words.length - currentIndex;

  buttons.forEach(btn => {
      btn.style.backgroundColor = "#FF6B3D";
      btn.disabled = true;
  });

  timerEl.style.color = "#FF6B3D";
}