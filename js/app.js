/* ---------- 카카오톡 SDK 초기화 ---------- */
if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
    Kakao.init('fbb1520306ffaad0a882e993109a801c'); 
}

/* ---------- 1. 데이터 설정 ---------- */
const IS_TEST_MODE = false; // 🚨 테스트 끄고 실전 모드로 변경

const wordData = {
    day1: [
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
        { word: "maintain", pos: "verb", meaning: "유지하다" }
    ],
    day2: [
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
    ]
};

const allWords = [...wordData.day1, ...wordData.day2];
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
    recognition.lang = "ko-KR"; 

    recognition.onstart = () => {
        if(cardEl && !hasSpoken) cardEl.style.borderColor = "#FF6B3D"; 
    };

    recognition.onend = () => {
        if(cardEl && !hasSpoken) cardEl.style.borderColor = "transparent";
        if (!hasSpoken && time > 0) {
            try { recognition.start(); } catch(e) {}
        }
    };

    recognition.onresult = (event) => {
        let fullTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript;
        }
        
        const transcript = fullTranscript.replace(/\s+/g, ""); 
        const currentMeaning = currentSessionWords[currentIndex].meaning.replace(/\s+/g, "");
        
        feedbackEl.textContent = "인식 중: " + fullTranscript.trim();
        feedbackEl.style.color = "#FF6B3D";

        if (transcript.includes(currentMeaning)) {
            if (!hasSpoken) {
                hasSpoken = true;
                feedbackEl.textContent = `✨ 뜻 정답: ${currentSessionWords[currentIndex].meaning}`; 
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
} else {
    alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
}

/* ---------- 5. 핵심 로직 ---------- */
function getTargetWords() {
    return words;
}

function loadWord() {
    const current = currentSessionWords[currentIndex];
    wordEl.textContent = current.word;
    wordEl.style.color = "#1F3B34";
    
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
    sessionResults.push({
        word: currentSessionWords[currentIndex].word,
        meaning: currentSessionWords[currentIndex].meaning,
        correctPos: currentSessionWords[currentIndex].pos,
        status: "시간 초과 (뜻 오답 또는 발화 안함)"
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

function showResults() {
    updateLobbyStats();
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
    }
    
    document.querySelector('.app').style.display = 'none'; 

    const totalWords = sessionResults.length;
    const correctWords = sessionResults.filter(res => res.status === "정답").length;
    const accuracy = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 0;

    let resultHTML = `<div class="card doodle-box" style="padding: 30px 20px; text-align: left; overflow-y: auto; max-height: 80vh;">`;
    resultHTML += `<h2 style="margin-top:0; color:#1F3B34; text-align:center;">학습 결과</h2>`;
    
    resultHTML += `<div style="text-align:center; margin-bottom: 20px; font-size: 18px; font-weight: 800; color: #FF6B3D;">
        정답률: ${correctWords}/${totalWords} (${accuracy}%)
    </div>`;

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
    resultHTML += `<button id="restartBtn" style="width:100%; padding: 16px; border-radius: 14px; border:none; background-color:#FF6B3D; color:white; font-size:18px; font-weight:700; cursor:pointer; margin-top: 20px; box-shadow: 4px 4px 0px #2C3639;">처음으로</button>`;
    resultHTML += `<button id="kakaoShareBtn" style="width:100%; padding: 16px; border-radius: 14px; border:none; background-color:#FEE500; color:#3C1E1E; font-size:18px; font-weight:800; cursor:pointer; margin-top: 15px; box-shadow: 4px 4px 0px #2C3639;">💬 오단완 리포트 카톡 전송</button>`;
    resultHTML += `</div>`;

    let resultContainer = document.createElement('div');
    resultContainer.className = 'app';
    resultContainer.innerHTML = resultHTML;
    document.body.appendChild(resultContainer);

    document.getElementById('restartBtn').onclick = () => location.reload();
    
    document.getElementById('kakaoShareBtn').onclick = () => {
        if (typeof Kakao === 'undefined' || !Kakao.isInitialized()) {
            alert("카카오 공유 기능이 로드되지 않았습니다. 인터넷을 확인해주세요.");
            return;
        }

        Kakao.Share.sendDefault({
            objectType: 'text',
            text: `📊 [오단완 학습 리포트]\n학생의 오늘의 단어 학습이 완료되었습니다!\n\n✅ 정답률: ${correctWords}/${totalWords} (${accuracy}%)\n\n----------------------\n🔒 [루크 쌤의 시크릿 영문법 라운지]\n영단어를 외워도 문장 해석이 안 된다면?\n1:1 과외 대기생을 위한 '3시간 코어 영문법'\n👉 아래 버튼을 눌러 라운지에 입장하세요.`,
            link: {
                mobileWebUrl: 'https://word30.pages.dev',
                webUrl: 'https://word30.pages.dev',
            },
            buttons: [
                {
                    title: '시크릿 노션 VOD 입장',
                    link: {
                        mobileWebUrl: 'https://www.notion.so/3-26ea81fd05e580869538e10685e3cdf2',
                        webUrl: 'https://www.notion.so/3-26ea81fd05e580869538e10685e3cdf2',
                    },
                },
                {
                    title: '나도 Trigger Voca 앱 써보기',
                    link: {
                        mobileWebUrl: 'https://word30.pages.dev',
                        webUrl: 'https://word30.pages.dev',
                    },
                }
            ]
        });
    };
}

/* ---------- 6. 버튼 이벤트 & 복습 로직 ---------- */
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

function startSession(dayKey) {
    document.getElementById('startOverlay').style.display = "none";
    document.querySelector('.app').style.display = "block";

    if (dayKey && wordData[dayKey]) {
        currentSessionWords = IS_TEST_MODE ? wordData[dayKey].slice(0, 2) : wordData[dayKey];
        isReviewMode = false;
    } else {
        currentSessionWords = IS_TEST_MODE ? getTargetWords().slice(0, 2) : getTargetWords();
        isReviewMode = false;
    }

    currentIndex = 0;
    sessionResults = [];
    hasSpoken = false;

    loadWord();
    if (recognition) {
        try { recognition.start(); } catch(err) {}
    }
    startTimer();
}

// 🚨 오답 노트 클릭 시 복습 시작하는 함수 추가
function startReview() {
    let history = JSON.parse(localStorage.getItem('word30_history') || '{"wrongs":[]}');
    if (!history.wrongs || history.wrongs.length === 0) {
        alert("오답 노트가 텅 비어 있습니다! 학습을 먼저 진행해주세요.");
        return;
    }
    
    isReviewMode = true;
    currentSessionWords = history.wrongs.slice(0, 10); // 최대 10개만 복습
    currentIndex = 0;
    sessionResults = [];
    hasSpoken = false;

    document.getElementById('startOverlay').style.display = "none";
    document.querySelector('.app').style.display = "block";

    loadWord();
    if (recognition) {
        try { recognition.start(); } catch(err) {}
    }
    startTimer();
}

startBtn.addEventListener("click", function(e) {
    e.preventDefault();
    startSession(null);
}, { passive: false });

document.querySelectorAll('.start-day-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        startSession(this.dataset.day);
    });
});

document.getElementById('quitBtn').addEventListener('click', () => {
    if(confirm("학습을 중단하시겠습니까? 지금까지 푼 내용만 채점됩니다.")) {
        clearInterval(interval);
        if(recognition) { try { recognition.stop(); } catch(e){} }
        showResults();
    }
});

function updateLobbyStats() {
    try {
        const raw = localStorage.getItem('word30_history');
        const history = raw ? JSON.parse(raw) : { wrongs: [] };
        const wrongs = history.wrongs || [];
        const uniqueCount = new Set(wrongs.map(w => w.word || w)).size;
        const el = document.getElementById('weakListCount');
        if (el) el.textContent = uniqueCount + " 단어";
    } catch(e) {}
}

updateLobbyStats();