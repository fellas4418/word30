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
let sessionResults = []; 

/* ---------- 3. DOM 요소 ---------- */
const wordEl = document.getElementById("word");
const timerEl = document.getElementById("timer");
const remainingEl = document.getElementById("remaining");
const buttons = document.querySelectorAll(".pos-buttons button");
const startBtn = document.getElementById("startBtn");
const overlay = document.getElementById("startOverlay");
const cardEl = document.getElementById("wordCard");

// [복구] 내 발음 확인 및 안내용 텍스트 요소
const feedbackEl = document.createElement("div");
feedbackEl.style.fontSize = "16px";
feedbackEl.style.marginTop = "15px";
feedbackEl.style.fontWeight = "bold";
if(cardEl) cardEl.insertBefore(feedbackEl, timerEl);

/* ---------- 4. 음성 인식 설정 ---------- */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "ko-KR"; // 한국어 뜻 발화 감지

    recognition.onstart = () => {
        if(cardEl && !hasSpoken) cardEl.style.borderColor = "#FF6B3D"; 
    };

    recognition.onend = () => {
        if(cardEl && !hasSpoken) cardEl.style.borderColor = "transparent";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        const currentMeaning = currentSessionWords[currentIndex].meaning;
        
        // [복구] 내가 말한 내용 화면에 표시
        feedbackEl.textContent = "인식 중: " + transcript;
        feedbackEl.style.color = "#FF6B3D";

        // [수정] 아무 말이나 2글자 이상이 아니라, '실제 뜻'이 포함되어야만 통과!
        if (transcript.includes(currentMeaning)) {
            if (!hasSpoken) {
                hasSpoken = true;
                feedbackEl.textContent = `✨ 뜻 정답: ${currentMeaning}`; 
                feedbackEl.style.color = "#2ecc71";
                buttons.forEach(btn => btn.disabled = false);
                timerEl.style.color = "#2ecc71";
                wordEl.style.color = "#2ecc71";
                if(cardEl) cardEl.style.borderColor = "#2ecc71"; 
            }
        }
    };

    recognition.onerror = (event) => { 
        if (event.error === 'not-allowed') {
            alert("마이크 권한이 차단되어 있습니다.");
        }
    };
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
    
    // [복구] 멘트 초기화
    feedbackEl.textContent = "뜻을 소리내어 말해주세요";
    feedbackEl.style.color = "#888";

    if(cardEl) cardEl.style.borderColor = "transparent"; 
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
    // 오답 기록 (뜻을 틀렸거나 말을 안 한 경우)
    sessionResults.push({
        word: currentSessionWords[currentIndex].word,
        meaning: currentSessionWords[currentIndex].meaning,
        correctPos: currentSessionWords[currentIndex].pos,
        status: "시간 초과 (뜻 오답/발화 안함)" 
    });
    saveResult(currentSessionWords[currentIndex], "오답");
    nextWord();
}

function nextWord() {
    currentIndex++;
    if (currentIndex >= currentSessionWords.length) {
        showResults(); 
        return;
    }
    
    loadWord();
    
    // 모바일 멈춤 방지 (유지)
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
        setTimeout(() => { 
            try { recognition.start(); } catch(e) {} 
        }, 300);
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

// 결과 화면 렌더링 (유지)
function showResults() {
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
    }
    
    document.querySelector('.app').style.display = 'none'; 

    let resultHTML = `<div class="card" style="padding: 30px 20px; text-align: left; overflow-y: auto; max-height: 80vh;">`;
    resultHTML += `<h2 style="margin-top:0; color:#1F3B34; text-align:center;">학습 결과</h2>`;
    resultHTML += `<ul style="list-style:none; padding:0; color:#1F3B34;">`;

    sessionResults.forEach(res => {
        let color = res.status === "정답" ? "#2ecc71" : "#e74c3c";
        let posKo = res.correctPos === 'noun' ? '명사' : res.correctPos === 'verb' ? '동사' : '형용사';
        
        resultHTML += `
            <li style="border-bottom: 2px dashed rgba(31, 59, 52, 0.2); padding: 15px 0;">
                <strong style="font-size: 22px;">${res.word}</strong> <span style="font-size: 14px; opacity:0.8;">(${res.meaning} / ${posKo})</span><br>
                <div style="margin-top: 5px; color:${color}; font-weight:800; font-size: 16px;">${res.status}</div>
            </li>
        `;
    });

    resultHTML += `</ul>`;
    resultHTML += `<button id="restartBtn" style="width:100%; padding: 16px; border-radius: 14px; border:none; background-color:#FF6B3D; color:white; font-size:18px; font-weight:700; cursor:pointer; margin-top: 20px;">다시 시작하기</button>`;
    resultHTML += `</div>`;

    let resultContainer = document.createElement('div');
    resultContainer.className = 'app';
    resultContainer.innerHTML = resultHTML;
    document.body.appendChild(resultContainer);

    document.getElementById('restartBtn').onclick = () => location.reload();
}

/* ---------- 6. 버튼 이벤트 ---------- */
buttons.forEach(btn => {
    btn.onclick = () => {
        if (!hasSpoken || btn.disabled) return;
        
        buttons.forEach(b => b.disabled = true); 
        clearInterval(interval);
        
        const selected = btn.dataset.pos;
        const correct = currentSessionWords[currentIndex].pos;
        
        if (selected === correct) {
            btn.style.backgroundColor = "#2ecc71";
            sessionResults.push({
                word: currentSessionWords[currentIndex].word,
                meaning: currentSessionWords[currentIndex].meaning,
                correctPos: correct,
                status: "정답"
            });
            saveResult(currentSessionWords[currentIndex], "정답");
        } else {
            btn.style.backgroundColor = "#e74c3c";
            sessionResults.push({
                word: currentSessionWords[currentIndex].word,
                meaning: currentSessionWords[currentIndex].meaning,
                correctPos: correct,
                status: "품사 오답"
            });
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