/* ---------- 카카오톡 SDK 초기화 ---------- */
// 🚨 현실적인 주의사항: 아래 'YOUR_KAKAO_JAVASCRIPT_KEY' 부분에 
// 실제 카카오 디벨로퍼스에서 발급받은 키를 넣기 전까지는 카톡 공유 버튼을 눌러도 작동하지 않습니다.
if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
    Kakao.init('fbb1520306ffaad0a882e993109a801c'); 
}

/* ---------- 1. 데이터 설정 ---------- */
const IS_TEST_MODE = true; 

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

// 내 발음 피드백 텍스트
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
        
        // 안드로이드 3초 침묵 시 마이크 꺼짐 완벽 방어
        if (!hasSpoken && time > 0) {
            try { recognition.start(); } catch(e) {}
        }
    };

    recognition.onresult = (event) => {
        let fullTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript;
        }
        
        // 띄어쓰기 차이로 인한 오답 방지
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
    
    // 삼성폰 마이크 얼어붙음 방지 로직
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

// 🚨 [변경됨] 결과 화면 출력 로직 (정답률 계산 및 카카오 공유 버튼 추가)
function showResults() {
    updateLobbyStats();
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
    }
    
    document.querySelector('.app').style.display = 'none'; 

    // 정답률 계산
    const totalWords = sessionResults.length;
    const correctWords = sessionResults.filter(res => res.status === "정답").length;
    const accuracy = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 0;

    let resultHTML = `<div class="card" style="padding: 30px 20px; text-align: left; overflow-y: auto; max-height: 80vh;">`;
    resultHTML += `<h2 style="margin-top:0; color:#1F3B34; text-align:center;">학습 결과</h2>`;
    
    // 점수 요약
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
    
    // 다시 시작 버튼
    resultHTML += `<button id="restartBtn" style="width:100%; padding: 16px; border-radius: 14px; border:none; background-color:#FF6B3D; color:white; font-size:18px; font-weight:700; cursor:pointer; margin-top: 20px; box-shadow: 4px 4px 0px #2C3639;">다시 시작하기</button>`;
    
    // 카카오톡 공유 버튼
    resultHTML += `<button id="kakaoShareBtn" style="width:100%; padding: 16px; border-radius: 14px; border:none; background-color:#FEE500; color:#3C1E1E; font-size:18px; font-weight:800; cursor:pointer; margin-top: 15px; box-shadow: 4px 4px 0px #2C3639;">💬 오단완 리포트 카톡 전송</button>`;
    
    resultHTML += `</div>`;

    let resultContainer = document.createElement('div');
    resultContainer.className = 'app';
    resultContainer.innerHTML = resultHTML;
    document.body.appendChild(resultContainer);

    // 이벤트 리스너
    document.getElementById('restartBtn').onclick = () => location.reload();
    
    document.getElementById('kakaoShareBtn').onclick = () => {
        if (!Kakao.isInitialized()) {
            alert("카카오 공유 기능이 설정되지 않았습니다. 개발자 키를 확인해주세요.");
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
                        mobileWebUrl: 'https://www.notion.so/3-26ea81fd05e580869538e10685e3cdf2', // 🚨 실제 노션 링크로 변경 필수
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

function startSession(dayKey) {
    document.getElementById('startOverlay').style.display = "none";
    document.querySelector('.app').style.display = "block";

    if (dayKey && wordData[dayKey]) {
        currentSessionWords = IS_TEST_MODE ? wordData[dayKey].slice(0, 2) : wordData[dayKey];
        isReviewMode = false;
    } else {
        currentSessionWords = getTargetWords();
    }

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