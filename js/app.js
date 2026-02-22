/* ---------- 카카오톡 SDK 초기화 ---------- */
if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
    Kakao.init('fbb1520306ffaad0a882e993109a801c'); 
}

/* ---------- 1. 데이터 설정 (Day 1: 33개 풀세트) ---------- */
const wordData = {
    "day1": [
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
        { word: "patient", pos: "adj", meaning: "인내심있는" },
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
        { word: "capacity", pos: "noun", meaning: "용량" },
        { word: "damage", pos: "verb", meaning: "손상시키다" },
        { word: "eager", pos: "adj", meaning: "열망하는" },
        { word: "facility", pos: "noun", meaning: "시설" }
    ],
    "day2": [
        { word: "generate", pos: "verb", meaning: "발생시키다" },
        { word: "hazard", pos: "noun", meaning: "위험" },
        { word: "immediate", pos: "adj", meaning: "즉각적인" }
        // Day 2도 필요하실 때 33개를 채우시면 됩니다.
    ]
};

/* ---------- 2. 상태 관리 ---------- */
let currentSessionWords = []; 
let currentIndex = 0;
let time = 10;
let interval;
let hasSpoken = false;
let sessionResults = []; 
let currentDayTitle = "";

/* ---------- 3. DOM 요소 ---------- */
const wordEl = document.getElementById("word");
const timerEl = document.getElementById("timer");
const remainingEl = document.getElementById("remaining");
const buttons = document.querySelectorAll(".pos-buttons button");
const startOverlay = document.getElementById("startOverlay");
const cardEl = document.getElementById("wordCard");

const feedbackEl = document.createElement("div");
feedbackEl.style.cssText = "font-size:16px; margin-top:15px; font-weight:bold; color:#888; text-align:center;";
if(cardEl) cardEl.insertBefore(feedbackEl, timerEl);

/* ---------- 4. 음성 인식 설정 ---------- */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "ko-KR";

recognition.onresult = (event) => {
    let transcript = Array.from(event.results).map(res => res[0].transcript).join("").replace(/\s+/g, "");
    const target = currentSessionWords[currentIndex].meaning.replace(/\s+/g, "");
    
    feedbackEl.textContent = "인식 중: " + transcript;
    
    if (transcript.includes(target) && !hasSpoken) {
        hasSpoken = true;
        feedbackEl.textContent = "✨ 정답: " + currentSessionWords[currentIndex].meaning;
        feedbackEl.style.color = "#2ecc71";
        buttons.forEach(btn => btn.disabled = false);
        timerEl.style.color = "#2ecc71";
    }
};

/* ---------- 5. 실행 로직 ---------- */
function startDay(dayKey) {
    currentSessionWords = wordData[dayKey] || [];
    currentDayTitle = dayKey.toUpperCase();
    
    if (currentSessionWords.length === 0) {
        alert("준비 중인 학습입니다.");
        return;
    }

    currentIndex = 0;
    sessionResults = [];
    startOverlay.style.display = "none";
    document.querySelector('.app').style.display = "block";
    
    loadWord();
    startTimer();
    try { recognition.start(); } catch(e) {}
}

function loadWord() {
    const current = currentSessionWords[currentIndex];
    wordEl.textContent = current.word;
    wordEl.style.color = "#1F3B34";
    remainingEl.textContent = currentSessionWords.length - currentIndex;
    feedbackEl.textContent = "뜻을 소리내어 말해주세요";
    feedbackEl.style.color = "#888";
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.backgroundColor = "#FF6B3D";
    });
    hasSpoken = false;
}

function startTimer() {
    time = 10;
    timerEl.textContent = time;
    timerEl.style.color = "#FF6B3D";
    clearInterval(interval);
    interval = setInterval(() => {
        time--;
        timerEl.textContent = time;
        if (time <= 3) timerEl.style.color = "red";
        if (time <= 0) {
            clearInterval(interval);
            sessionResults.push({...currentSessionWords[currentIndex], status: "시간초과"});
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

function showResults() {
    try { recognition.stop(); } catch(e) {}
    document.querySelector('.app').style.display = 'none';

    const correct = sessionResults.filter(r => r.status === "정답").length;
    const total = sessionResults.length;
    const acc = Math.round((correct / total) * 100) || 0;

    let resHTML = `<div class="card doodle-box" style="text-align:center; padding: 40px 20px;">
        <h2 class="brand-title" style="font-size:24px;">${currentDayTitle} 오단완!</h2>
        <p style="font-size:22px; font-weight:800; color:#FF6B4A; margin: 20px 0;">정답률: ${acc}% (${correct}/${total})</p>
        <button onclick="location.reload()" class="doodle-btn primary-btn" style="margin-bottom:12px; width:100%;">다른 Day 공부하기</button>
        <button id="kakaoBtn" class="doodle-btn" style="background:#FEE500; width:100%; color:#3C1E1E; font-weight:800;">💬 오단완 리포트 전송</button>
    </div>`;

    document.body.innerHTML += resHTML;

    document.getElementById('kakaoBtn').onclick = () => {
        Kakao.Share.sendDefault({
            objectType: 'text',
            text: `📊 [Trigger Voca 리포트]\n루크 학생이 오늘의 단어 학습을 완료했습니다!\n\n📅 학습 범위: ${currentDayTitle}\n✅ 정답률: ${acc}%\n\n----------------------\n🔒 [루크 쌤의 시크릿 라운지]\n영단어를 문장으로 바꾸는 힘!\n👉 아래 버튼을 눌러 입장하세요.`,
            link: { mobileWebUrl: 'https://word30.pages.dev' },
            buttons: [
                {
                    title: '시크릿 노션 VOD 입장',
                    link: { 
                        mobileWebUrl: 'https://www.notion.so/3-26ea81fd05e580869538e10685e3cdf2?openExternalBrowser=1',
                        webUrl: 'https://www.notion.so/3-26ea81fd05e580869538e10685e3cdf2'
                    }
                }
            ]
        });
    };
}

buttons.forEach(btn => {
    btn.onclick = () => {
        if (!hasSpoken) return;
        clearInterval(interval);
        const isCorrect = btn.dataset.pos === currentSessionWords[currentIndex].pos;
        btn.style.backgroundColor = isCorrect ? "#2ecc71" : "#e74c3c";
        
        sessionResults.push({
            ...currentSessionWords[currentIndex], 
            status: isCorrect ? "정답" : "품사오답"
        });

        setTimeout(() => nextWord(), 800);
    };
});