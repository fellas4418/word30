/* ---------- 카카오톡 SDK 초기화 ---------- */
if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
    Kakao.init('fbb1520306ffaad0a882e993109a801c'); 
}

/* ---------- 1. 데이터 설정 (Day 1: 33개) ---------- */
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

const wordEl = document.getElementById("word");
const timerEl = document.getElementById("timer");
const remainingEl = document.getElementById("remaining");
const buttons = document.querySelectorAll(".pos-buttons button");
const startOverlay = document.getElementById("startOverlay");
const cardEl = document.getElementById("wordCard");

// 피드백 요소 생성
let feedbackEl = document.getElementById("speechFeedback");
if (!feedbackEl && cardEl) {
    feedbackEl = document.createElement("div");
    feedbackEl.id = "speechFeedback";
    feedbackEl.style.cssText = "font-size:16px; margin-top:15px; font-weight:bold; color:#888; text-align:center;";
    cardEl.insertBefore(feedbackEl, timerEl);
}

/* ---------- 3. 음성 인식 설정 (전역 하나만 사용) ---------- */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "ko-KR";

recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
    }
    transcript = transcript.replace(/\s+/g, "");
    
    const target = currentSessionWords[currentIndex].meaning.replace(/\s+/g, "");
    feedbackEl.textContent = "인식 중: " + transcript;
    
    if (transcript.includes(target) && !hasSpoken) {
        hasSpoken = true;
        feedbackEl.textContent = "✨ 정답: " + currentSessionWords[currentIndex].meaning;
        feedbackEl.style.color = "#2ecc71";
        buttons.forEach(btn => btn.disabled = false);
    }
};

/* ---------- 4. 핵심 실행 로직 ---------- */

window.startDay = function(dayKey) {
    currentSessionWords = wordData[dayKey] || [];
    currentDayTitle = dayKey.toUpperCase();
    
    if (currentSessionWords.length === 0) {
        alert("준비 중인 학습입니다.");
        return;
    }

    currentIndex = 0;
    sessionResults = [];
    
    // UI 전환
    startOverlay.style.display = "none";
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelector('.app').style.display = "block";
    
    loadWord();
};

function loadWord() {
    const current = currentSessionWords[currentIndex];
    wordEl.textContent = current.word;
    remainingEl.textContent = currentSessionWords.length - currentIndex;
    feedbackEl.textContent = "뜻을 말해주세요";
    feedbackEl.style.color = "#888";
    buttons.forEach(btn => btn.disabled = true);
    hasSpoken = false;

    // 음성 인식 및 타이머 시작
    startTimer();
    try { recognition.start(); } catch(e) {} 
}

function startTimer() {
    time = 10;
    timerEl.textContent = time;
    clearInterval(interval);
    interval = setInterval(() => {
        time--;
        timerEl.textContent = time;
        if (time <= 0) {
            clearInterval(interval);
            sessionResults.push({...currentSessionWords[currentIndex], status: "시간초과"});
            nextWord();
        }
    }, 1000);
}

function nextWord() {
    // 다음으로 넘어가기 전 인식 중단
    try { recognition.stop(); } catch(e) {}
    
    currentIndex++;
    if (currentIndex >= currentSessionWords.length) {
        showResults();
        return;
    }
    
    // 약간의 시간차를 두고 다음 단어 로드 (인식기 재부팅 시간)
    setTimeout(() => loadWord(), 300);
}

function showResults() {
    try { recognition.stop(); } catch(e) {}
    document.querySelector('.app').style.display = 'none';
    const correct = sessionResults.filter(r => r.status === "정답").length;
    const total = sessionResults.length;
    const acc = Math.round((correct / total) * 100) || 0;

    let resHTML = `<div class="card doodle-box" style="text-align:center; padding: 40px 20px;">
        <h2 class="brand-title">${currentDayTitle} 완료!</h2>
        <p style="font-size:22px; font-weight:800; color:#FF6B4A;">정답률: ${acc}%</p>
        <button onclick="location.reload()" class="doodle-btn" style="width:100%; margin-bottom:10px;">메인으로</button>
        <button id="kakaoBtn" class="doodle-btn" style="background:#FEE500; width:100%; color:#3C1E1E;">💬 리포트 전송</button>
    </div>`;
    document.body.innerHTML += resHTML;

    document.getElementById('kakaoBtn').onclick = () => {
        Kakao.Share.sendDefault({
            objectType: 'text',
            text: `📊 [Trigger Voca 리포트]\n${currentDayTitle} 완료!\n✅ 정답률: ${acc}%`,
            link: { mobileWebUrl: 'https://word30.pages.dev' },
            buttons: [{
                title: '시크릿 노션 입장',
                link: { mobileWebUrl: 'https://www.notion.so/3-26ea81fd05e580869538e10685e3cdf2?openExternalBrowser=1' }
            }]
        });
    };
}

buttons.forEach(btn => {
    btn.onclick = () => {
        if (!hasSpoken) return;
        clearInterval(interval);
        const isCorrect = btn.dataset.pos === currentSessionWords[currentIndex].pos;
        sessionResults.push({...currentSessionWords[currentIndex], status: isCorrect ? "정답" : "오답"});
        nextWord();
    };
});