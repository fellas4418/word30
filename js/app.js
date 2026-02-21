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
let correctCount = 0;
let hasSpoken = false;
let isReviewMode = false;

/* ---------- 3. DOM 요소 ---------- */
const wordEl = document.getElementById("word");
const timerEl = document.getElementById("timer");
const remainingEl = document.getElementById("remaining");
const buttons = document.querySelectorAll(".pos-buttons button");
const startBtn = document.getElementById("startBtn");
const overlay = document.getElementById("startOverlay");
const cardEl = document.getElementById("wordCard");

/* ---------- 4. 음성 인식 설정 ---------- */
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
        
        if (transcript.includes(currentWord)) {
            if (!hasSpoken) {
                hasSpoken = true;
                buttons.forEach(btn => btn.disabled = false);
                timerEl.style.color = "#2ecc71";
                wordEl.style.color = "#2ecc71";
                if(cardEl) cardEl.style.borderColor = "#2ecc71";
            }
        }
    };
    recognition.onerror = () => { try { recognition.stop(); } catch(e) {} };
}

/* ---------- 5. 핵심 로직 ---------- */
function getTargetWords() {
    let history = JSON.parse(localStorage.getItem('word30_history') || '{"wrongs":[]}');
    
    // [버그 청소기] 300개 넘게 쌓인 쓰레기 데이터를 고유 단어 1개씩만 남기고 싹 정리
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
        alert("복습 세션을 먼저 시작합니다!");
        isReviewMode = true;
        return reviewList.slice(0, 10); // 최대 10개만 복습
    } else {
        isReviewMode = false;
        return words;
    }
}

function loadWord() {
    const current = currentSessionWords[currentIndex];
    wordEl.textContent = current.word;
    wordEl.style.color = "#1F3B34";
    if(cardEl) cardEl.style.borderColor = "#FF6B3D";
    remainingEl.textContent = currentSessionWords.length - currentIndex;
    
    buttons.forEach(btn => {
        btn.style.backgroundColor = "#FF6B3D";
        btn.disabled = true;
    });
    hasSpoken = false;
}

function startTimer() {
    time = isReviewMode ? 8 : 10; // [핵심] 여기서 8초 또는 10초로 무조건 리셋됨
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
        location.reload();
        return;
    }
    loadWord();
    if (recognition) {
        try {
            recognition.stop();
            setTimeout(() => { recognition.start(); }, 300);
        } catch(e) {}
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
        if (!hasSpoken) return;
        
        // [방어 로직] 버튼 클릭 시 기존 타이머와 음성 인식 즉시 강제 종료
        clearInterval(interval);
        if (recognition) try { recognition.stop(); } catch(e) {}
        
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
    
    if (recognition) {
        try { recognition.start(); } catch(err) {}
    }
    startTimer();
}, { passive: false });