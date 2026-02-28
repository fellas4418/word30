/* ---------- 카카오톡 SDK 초기화 ---------- */
if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
    Kakao.init('fbb1520306ffaad0a882e993109a801c'); 
}

/* ---------- 1. 데이터 설정 ---------- */
const IS_TEST_MODE = false; 

// 대표님 원본 엑셀 데이터 그대로 사용! (AI 노가다 불필요)
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
let sessionResults = []; 
let currentDayKey = null; 
let isReviewMode = false;
let isRevealed = false; // 카드가 뒤집혔는지 확인하는 변수

/* ---------- 3. DOM 요소 ---------- */
const wordEl = document.getElementById("word");
const meaningEl = document.getElementById("meaning");
const timerEl = document.getElementById("timer");
const remainingEl = document.getElementById("remaining");
const cardEl = document.getElementById("wordCard");
const actionMsg = document.getElementById("actionMsg");
const oxButtons = document.getElementById("oxButtons");
const btnCorrect = document.getElementById("btnCorrect");
const btnWrong = document.getElementById("btnWrong");

/* ---------- 4. 핵심 로직 (터치 플래시카드 방식) ---------- */
function getTargetWords() {
    return words;
}

function loadWord() {
    const current = currentSessionWords[currentIndex];
    
    // 초기화: 단어만 보여주고 뜻은 숨김
    wordEl.textContent = current.word;
    meaningEl.style.display = "none";
    oxButtons.style.display = "none";
    actionMsg.style.display = "block";
    cardEl.style.borderColor = "transparent";
    
    remainingEl.textContent = currentSessionWords.length - currentIndex;
    isRevealed = false;

    // 카드 터치 이벤트 활성화
    cardEl.onclick = revealMeaning;

    // 🔊 자동 발음 로직 (원어민 소리는 그대로 살려둠)
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(current.word);
        utter.lang = 'en-US';
        utter.rate = 0.9;
        window.speechSynthesis.speak(utter);
    }
}

// 🚨 카드를 터치하면 정답이 보이는 함수
function revealMeaning() {
    if (isRevealed) return; // 이미 뒤집혔으면 무시
    isRevealed = true;
    
    // 타이머 멈춤 (여유롭게 O/X 누를 수 있도록 배려)
    clearInterval(interval);
    
    // 뜻 보이기
    meaningEl.textContent = currentSessionWords[currentIndex].meaning;
    meaningEl.style.display = "block";
    
    // 안내 문구 숨기고 O/X 버튼 보이기
    actionMsg.style.display = "none";
    oxButtons.style.display = "grid";
    cardEl.style.borderColor = "#FF6B3D";
    cardEl.onclick = null; // 중복 터치 방지
}

// O 버튼 눌렀을 때
btnCorrect.onclick = () => {
    sessionResults.push({
        word: currentSessionWords[currentIndex].word,
        meaning: currentSessionWords[currentIndex].meaning,
        status: "정답"
    });
    saveResult(currentSessionWords[currentIndex], "정답");
    nextWord();
};

// X 버튼 눌렀을 때
btnWrong.onclick = () => {
    sessionResults.push({
        word: currentSessionWords[currentIndex].word,
        meaning: currentSessionWords[currentIndex].meaning,
        status: "오답 (몰랐음)"
    });
    saveResult(currentSessionWords[currentIndex], "오답");
    nextWord();
};

function startTimer() {
    time = isReviewMode ? 8 : 10;
    timerEl.textContent = time;
    timerEl.style.color = "#FF6B3D"; 
    
    clearInterval(interval);
    interval = setInterval(() => {
        time--;
        timerEl.textContent = time;
        if (time <= 3) timerEl.style.color = "red";
        
        // 시간 초과 시 강제 오답 처리 후 다음으로
        if (time <= 0) {
            clearInterval(interval);
            sessionResults.push({
                word: currentSessionWords[currentIndex].word,
                meaning: currentSessionWords[currentIndex].meaning,
                status: "시간 초과"
            });
            saveResult(currentSessionWords[currentIndex], "오답");
            nextWord();
        }
    }, 1000);
}

function nextWord() {
    currentIndex++;
    if (currentIndex >= currentSessionWords.length) {
        showResults();
        return;
    }
    loadWord();
    startTimer();
}

function saveResult(wordObj, status) {
    let history = JSON.parse(localStorage.getItem('word30_history') || '{"wrongs":[]}');
    if (status === "오답") {
        if (!history.wrongs.some(w => w.word === wordObj.word)) {
            history.wrongs.push({
                ...wordObj,
                timestamp: new Date().toISOString()
            });
        }
    } else if (status === "정답" && isReviewMode) {
        history.wrongs = history.wrongs.filter(w => w.word !== wordObj.word);
    }
    localStorage.setItem('word30_history', JSON.stringify(history));
}

function showResults() {
    updateLobbyStats();
    document.querySelector('.app').style.display = 'none'; 

    const totalWords = sessionResults.length;
    const correctWords = sessionResults.filter(res => res.status === "정답").length;
    const accuracy = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 0;

    // 🚨 정답률 80% 자물쇠 로직
    if (currentDayKey && accuracy >= 80) {
        let progress = JSON.parse(localStorage.getItem('word30_progress') || '{}');
        progress[currentDayKey] = true;
        localStorage.setItem('word30_progress', JSON.stringify(progress));
    }
    updateCurriculumUI(); 

    let resultHTML = `<div class="card doodle-box" style="padding: 30px 20px; text-align: left; overflow-y: auto; max-height: 80vh;">`;
    resultHTML += `<h2 style="margin-top:0; color:#1F3B34; text-align:center;">학습 결과</h2>`;
    resultHTML += `<div style="text-align:center; margin-bottom: 20px; font-size: 18px; font-weight: 800; color: #FF6B3D;">
        정답률: ${correctWords}/${totalWords} (${accuracy}%)
    </div>`;
    resultHTML += `<ul style="list-style:none; padding:0; color:#1F3B34;">`;

    sessionResults.forEach(res => {
        let color = res.status === "정답" ? "#2ecc71" : "#e74c3c";
        resultHTML += `
            <li style="border-bottom: 2px dashed rgba(31, 59, 52, 0.2); padding: 15px 0;">
                <strong style="font-size: 22px;">${res.word}</strong> <span style="font-size: 14px; opacity:0.8;">(${res.meaning})</span><br>
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

        const rawUser = localStorage.getItem('word30_user');
        const userNameForShare = rawUser ? JSON.parse(rawUser).name : '익명';

        Kakao.Share.sendDefault({
            objectType: 'text',
            text: `📊 [${userNameForShare} 학생의 오단완 학습 리포트]\n학생의 오늘의 단어 학습이 완료되었습니다!\n\n✅ 정답률: ${correctWords}/${totalWords} (${accuracy}%)\n\n----------------------\n🔒 [루크 쌤의 시크릿 영문법 라운지]\n영단어를 외워도 문장 해석이 안 된다면?\n1:1 과외 대기생을 위한 '3시간 코어 영문법'\n👉 아래 버튼을 눌러 라운지에 입장하세요.`,
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

function startSession(dayKey) {
    const lobby = document.getElementById('startOverlay');
    if (lobby) lobby.style.display = "none";
    document.querySelector('.app').style.display = "block";

    if (dayKey && wordData[dayKey]) {
        currentSessionWords = IS_TEST_MODE ? wordData[dayKey].slice(0, 2) : wordData[dayKey];
        currentDayKey = dayKey; 
        isReviewMode = false;
    } else {
        currentSessionWords = IS_TEST_MODE ? getTargetWords().slice(0, 2) : getTargetWords();
        currentDayKey = null;
        isReviewMode = false;
    }

    currentIndex = 0;
    sessionResults = [];
    
    loadWord();
    startTimer();
}

function startReview() {
    let history = JSON.parse(localStorage.getItem('word30_history') || '{"wrongs":[]}');
    if (!history.wrongs || history.wrongs.length === 0) {
        alert("오답 노트가 텅 비어 있습니다! 학습을 먼저 진행해주세요.");
        return;
    }
    
    isReviewMode = true;
    currentSessionWords = history.wrongs.slice(0, 10); 
    currentDayKey = null; 
    currentIndex = 0;
    sessionResults = [];

    const lobby = document.getElementById('startOverlay');
    if (lobby) lobby.style.display = "none";
    document.querySelector('.app').style.display = "block";

    loadWord();
    startTimer();
}

const mainStartBtn = document.getElementById("startBtn");
if (mainStartBtn) {
    mainStartBtn.addEventListener("click", function(e) {
        e.preventDefault();
        startSession(null);
    }, { passive: false });
}

document.querySelectorAll('.start-day-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        startSession(this.dataset.day);
    });
});

document.getElementById('quitBtn').addEventListener('click', () => {
    if(confirm("학습을 중단하시겠습니까? 지금까지 푼 내용만 채점됩니다.")) {
        clearInterval(interval);
        showResults();
    }
});

// ── 회원 등록 모달 로직 (팝업창) ──────────────────────────────
function generateRandomID() {
    return 'uid_' + Math.random().toString(36).substr(2, 9);
}

window.addEventListener('load', function() {
    const existing = localStorage.getItem('word30_user');
    const modal = document.getElementById('registrationModal');
    const lobby = document.getElementById('startOverlay');
    
    if (!existing) {
        if (modal) modal.style.display = 'flex';
        if (lobby) lobby.style.display = 'none';
    } else {
        if (modal) modal.style.display = 'none';
        if (lobby) lobby.style.display = 'flex'; 
    }
});

document.getElementById('saveUserBtn').addEventListener('click', function() {
    const nameVal = document.getElementById('userName').value.trim();
    const contactVal = document.getElementById('userContact').value.trim();
    const consent = document.getElementById('privacyConsent').checked;

    if (!nameVal) {
        alert('이름을 입력해주세요.');
        return;
    }
    if (!consent) {
        alert('개인정보 수집 동의는 필수입니다.');
        return;
    }

    const userData = {
        name: nameVal,
        contact: contactVal,
        id: generateRandomID(),
        registeredAt: new Date().toISOString()
    };
    localStorage.setItem('word30_user', JSON.stringify(userData));

    document.getElementById('registrationModal').style.display = 'none';
    const lobby = document.getElementById('startOverlay');
    if (lobby) lobby.style.display = 'flex';
});

// ── 로비 통계 및 자물쇠 업데이트 ──
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

function updateCurriculumUI() {
    let progress = JSON.parse(localStorage.getItem('word30_progress') || '{}');
    const day2Btn = document.getElementById('btn-day2');
    if (day2Btn) {
        if (progress['day1']) { 
            day2Btn.textContent = '시작';
            day2Btn.style.backgroundColor = '#2ecc71';
            day2Btn.disabled = false;
        } else {
            day2Btn.textContent = '🔒 잠김';
            day2Btn.style.backgroundColor = '#95a5a6';
            day2Btn.disabled = true;
        }
    }
}

updateLobbyStats();
updateCurriculumUI();