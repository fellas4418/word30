/* ---------- 1. 데이터 설정 ---------- */
const IS_TEST_MODE = true; 

const allWords = [
    { word: "abandon", pos: "verb", meaning: "포기하다" },
    { word: "ability", pos: "noun", meaning: "능력" },
    { word: "active", pos: "adj", meaning: "활동적인" },
    { word: "benefit", pos: "noun", meaning: "이익" },
    { word: "collect", pos: "verb", meaning: "수집하다" },
    { word: "decline", pos: "verb", meaning: "거절하다" },
    { word: "efficient", pos: "adj", meaning: "효율적인" },
    { word: "factor", pos: "noun", meaning: "요인" },
    { word: "gather", pos: "verb", meaning: "모으다" },
    { word: "habit", pos: "noun", meaning: "습관" },
    { word: "ignore", pos: "verb", meaning: "무시하다" },
    { word: "joint", pos: "adj", meaning: "공동의" },
    { word: "knowledge", pos: "noun", meaning: "지식" },
    { word: "labor", pos: "noun", meaning: "노동" },
    { word: "maintain", pos: "verb", meaning: "유지하다" },
    { word: "notice", pos: "verb", meaning: "알아차리다" },
    { word: "object", pos: "noun", meaning: "물체" },
    { word: "patient", pos: "adj", meaning: "인내심 있는" },
    { word: "quality", pos: "noun", meaning: "품질" },
    { word: "rare", pos: "adj", meaning: "드문" },
    { word: "seek", pos: "verb", meaning: "찾다" },
    { word: "target", pos: "noun", meaning: "목표" },
    { word: "urban", pos: "adj", meaning: "도시의" },
    { word: "value", pos: "noun", meaning: "가치" },
    { word: "waste", pos: "verb", meaning: "낭비하다" },
    { word: "yield", pos: "verb", meaning: "생산하다" },
    { word: "zeal", pos: "noun", meaning: "열정" },
    { word: "accurate", pos: "adj", meaning: "정확한" },
    { word: "believe", pos: "verb", meaning: "믿다" },
    { word: "capacity", pos: "noun", meaning: "용량" }
];

const words = IS_TEST_MODE ? allWords.slice(0, 2) : allWords;

/* ---------- 2. 상태 관리 ---------- */
let currentSessionWords = []; 
let currentIndex = 0;
let time = 10;
let interval;
let hasSpoken = false;
let isReviewMode = false;
let isRecognizing = false; // [추가] 마이크가 실제로 켜져있는지 추적

/* ---------- 3. DOM 요소 ---------- */
const wordEl = document.getElementById("word");
const timerEl = document.getElementById("timer");
const remainingEl = document.getElementById("remaining");
const buttons = document.querySelectorAll(".pos-buttons button");
const startBtn = document.getElementById("startBtn");
const overlay = document.getElementById("startOverlay");
const cardEl = document.getElementById("wordCard");

/* ---------- 4. 음성 인식 설정 (모바일 최적화 적용) ---------- */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
        console.log("🎤 마이크 켜짐");
        isRecognizing = true;
        if(cardEl && !hasSpoken) cardEl.style.borderColor = "#FF6B3D"; 
    };

    // [수정1] 좀비 마이크 방지: onend에서 강제 재시작하지 않음
    recognition.onend = () => {
        console.log("❌ 마이크 꺼짐 감지됨");
        isRecognizing = false;
        if(cardEl && !hasSpoken) cardEl.style.borderColor = "transparent";
    };

    // [수정2] 인식률 개선: 문장 전체를 합쳐서 검사
    recognition.onresult = (event) => {
        if (hasSpoken) return; // 이미 정답 처리되었으면 무시

        let fullTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript.toLowerCase() + " ";
        }
        
        console.log("인식된 소리:", fullTranscript); 

        const currentWord = currentSessionWords[currentIndex].word.toLowerCase();

        if (fullTranscript.includes(currentWord)) {
            hasSpoken = true;
            buttons.forEach(btn => btn.disabled = false);
            timerEl.style.color = "#2ecc71";
            wordEl.style.color = "#2ecc71";
            if(cardEl) cardEl.style.borderColor = "#2ecc71"; 
        }
    };

    recognition.onerror = (event) => { 
        console.error("마이크 에러:", event.error);
        if (event.error === 'not-allowed') {
            alert("마이크 권한이 차단되어 있습니다. 브라우저 설정에서 마이크를 허용해주세요.");
        }
    };
} else {
    alert("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome이나 Safari를 이용해주세요.");
}

/* ---------- 5. 핵심 로직 ---------- */
function getTargetWords() {
    let history = JSON.parse(localStorage.getItem('word30_history') || '{"wrongs":[]}');
    
    let uniqueWrongs = [];
    let seen = new Set();
    for (let w of (history.wrongs || [])) {
        if (!seen.has(w.word)) {
            seen.add(w.word);
            uniqueWrongs.push(w);
        }
    }
    history.wrongs = uniqueWrongs;
    localStorage.setItem('word30_history', JSON.stringify(history));

    let reviewList = history.wrongs;

    if (reviewList.length > 0) {
        isReviewMode = true;
        return reviewList.slice(0, 10);
    } else {
        isReviewMode = false;
        return words;
    }
}

function loadWord() {
    const current = currentSessionWords[currentIndex];
    wordEl.textContent = current.word;
    wordEl.style.color = "#1F3B34";
    if(cardEl) cardEl.style.borderColor = isRecognizing ? "#FF6B3D" : "transparent"; 
    remainingEl.textContent = currentSessionWords.length - currentIndex;
    
    buttons.forEach(btn => {
        btn.style.backgroundColor = "#FF6B3D";
        btn.disabled = true;
    });
    hasSpoken = false;
}

function startTimer() {
    time = isReviewMode ? 8 : 10;
    timerEl.textContent = time;
    timerEl.style.color = "#FF6B3D"; 
    
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
    saveResult(currentSessionWords[currentIndex], "오답");
    nextWord();
}

function nextWord() {
    currentIndex++;
    if (currentIndex >= currentSessionWords.length) {
        alert("학습 완료!");
        if (recognition) {
            try { recognition.stop(); } catch(e) {}
        }
        location.reload();
        return;
    }
    
    loadWord();
    
    // [수정3] 다음 단어로 넘어갈 때 마이크를 껐다 켜지 않고 유지합니다.
    // 만약 모종의 이유로 꺼져있다면 다시 켭니다.
    if (recognition && !isRecognizing) {
        try { recognition.start(); } catch(e) {}
    }
    
    startTimer();
}

function saveResult(wordObj, status) {
    let history = JSON.parse(localStorage.getItem('word30_history') || '{"wrongs":[]}');
    if (status === "오답") {
        if (!history.wrongs.some(w => w.word === wordObj.word)) {
            history.wrongs.push(wordObj);
        }
    } else if (status === "정답" && isReviewMode) {
        history.wrongs = history.wrongs.filter(w => w.word !== wordObj.word);
    }
    localStorage.setItem('word30_history', JSON.stringify(history));
}

/* ---------- 6. 버튼 이벤트 ---------- */
buttons.forEach(btn => {
    btn.onclick = () => {
        if (!hasSpoken || btn.disabled) return;
        
        // [수정4] 중복 클릭 방지: 클릭 즉시 모든 버튼 비활성화
        buttons.forEach(b => b.disabled = true);
        
        clearInterval(interval);
        // [수정3] 여기서 recognition.stop()을 제거하여 흐름이 끊기지 않게 합니다.
        
        const selected = btn.dataset.pos;
        const correct = currentSessionWords[currentIndex].pos;
        if (selected === correct) {
            btn.style.backgroundColor = "#2ecc71";
            saveResult(currentSessionWords[currentIndex], "정답");
        } else {
            btn.style.backgroundColor = "#e74c3c";
            saveResult(currentSessionWords[currentIndex], "오답");
        }
        
        setTimeout(() => nextWord(), 800);
    };
});

startBtn.addEventListener("click", function(e) {
    e.preventDefault(); 
    overlay.style.display = "none";
    currentSessionWords = getTargetWords();
    loadWord();
    
    if (recognition && !isRecognizing) {
        try { recognition.start(); } catch(err) {}
    }
    startTimer();
}, { passive: false });

// [수정5] 모바일 섀도우밴 완벽 해결: 사용자 터치 시 자연스럽게 마이크 복구
document.addEventListener("touchstart", function() {
    if (overlay.style.display === "none" && recognition && !isRecognizing && time > 0) {
        try { recognition.start(); } catch(err) {}
    }
}, { passive: true });