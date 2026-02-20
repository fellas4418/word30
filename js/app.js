/* ---------- 음성 인식 설정 (모바일 호환성 강화) ---------- */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    // 모바일에서는 언어 설정을 명확히 해주는 것이 좋습니다.
    recognition.lang = "en-US"; 

    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        if (transcript.trim().length >= 2) {
            hasSpoken = true;
            buttons.forEach(btn => btn.disabled = false);
            timerEl.style.color = "#2ecc71";
            wordEl.style.color = "#2ecc71";
        }
    };

    // 모바일에서 끊김 방지를 위한 에러 핸들링 추가
    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        // 에러 발생 시에도 게임이 멈추지 않도록 버튼을 수동으로 열어주는 보험 코드
        if (event.error === 'not-allowed') {
            alert("마이크 권한이 필요합니다. 브라우저 설정에서 마이크를 허용해주세요.");
        }
    };
} else {
    console.warn("이 브라우저는 음성 인식을 지원하지 않습니다.");
}

/* ---------- 시작 버튼 (터치 이벤트 대응) ---------- */
startBtn.addEventListener("click", () => {
    // 1. 오버레이 제거
    overlay.style.display = "none";
    hasSpoken = false;
    
    // 2. 문제 로드
    loadWord();

    // 3. 음성 인식 시작 (try-catch로 감싸서 오류 시에도 게임 진행되게 함)
    if (recognition) {
        try {
            recognition.start();
        } catch (err) {
            console.log("이미 인식 중이거나 오류 발생:", err);
        }
    }

    // 4. 타이머 시작
    startTimer();
});