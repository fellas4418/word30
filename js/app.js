// 카카오 초기화
if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
    Kakao.init('20d31cb149e892d8b1bdd0a8e7306749'); 
}

/* ---------- 1. 데이터 설정 (Day별 분리) ---------- */
const wordData = {
    "day1": {
        title: "Day 1. 기초 필수 단어",
        list: [
            { word: "abandon", pos: "verb", meaning: "포기하다" },
            { word: "ability", pos: "noun", meaning: "능력" },
            { word: "active", pos: "adj", meaning: "활동적인" }
        ]
    },
    "day2": {
        title: "Day 2. 상태와 동작",
        list: [
            { word: "benefit", pos: "noun", meaning: "이익" },
            { word: "collect", pos: "verb", meaning: "수집하다" },
            { word: "decline", pos: "verb", meaning: "거절하다" }
        ]
    }
};

/* ---------- 2. 상태 관리 ---------- */
let currentSessionWords = []; 
let currentIndex = 0;
let time = 10;
let interval;
let hasSpoken = false;
let sessionResults = [];
let selectedDayId = "day1";

/* ---------- 3. DOM 요소 ---------- */
const wordEl = document.getElementById("word");
const timerEl = document.getElementById("timer");
const remainingEl = document.getElementById("remaining");
const buttons = document.querySelectorAll(".pos-buttons button");
const dayListEl = document.getElementById("dayList");
const overlay = document.getElementById("startOverlay");
const cardEl = document.getElementById("wordCard");

/* ---------- 4. 초기 UI 세팅 (Day 리스트 생성) ---------- */
function initLobby() {
    dayListEl.innerHTML = "";
    Object.keys(wordData).forEach(dayId => {
        const dayInfo = wordData[dayId];
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${dayInfo.title} (${dayInfo.list.length})</span>
            <button class="status-badge start-day-btn" onclick="startStudy('${dayId}')">시작</button>
        `;
        dayListEl.appendChild(li);
    });
}

function startStudy(dayId) {
    selectedDayId = dayId;
    currentSessionWords = wordData[dayId].list;
    currentIndex = 0;
    sessionResults = [];
    
    overlay.style.display = "none";
    document.querySelector('.app').style.display = "block";
    
    loadWord();
    if (recognition) { try { recognition.start(); } catch(e) {} }
    startTimer();
}

/* ---------- 5. 음성 인식 및 퀴즈 로직 (기존 로직 보존) ---------- */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "ko-KR";
    recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        const currentMeaning = currentSessionWords[currentIndex].meaning.replace(/\s+/g, "");
        if (transcript.replace(/\s+/g, "").includes(currentMeaning)) {
            if (!hasSpoken) {
                hasSpoken = true;
                buttons.forEach(btn => btn.disabled = false);
                timerEl.style.color = "#2ecc71";
                if(cardEl) cardEl.style.borderColor = "#2ecc71";
            }
        }
    };
    recognition.onend = () => { if (!hasSpoken && time > 0) try { recognition.start(); } catch(e) {} };
}

function loadWord() {
    const current = currentSessionWords[currentIndex];
    wordEl.textContent = current.word;
    remainingEl.textContent = currentSessionWords.length - currentIndex;
    buttons.forEach(btn => {
        btn.style.backgroundColor = "#FF6B3D";
        btn.disabled = true;
    });
    hasSpoken = false;
    if(cardEl) cardEl.style.borderColor = "transparent";
}

function startTimer() {
    time = 10;
    timerEl.textContent = time;
    timerEl.style.color = "#FF6B3D";
    clearInterval(interval);
    interval = setInterval(() => {
        time--;
        timerEl.textContent = time;
        if (time <= 0) { clearInterval(interval); handleTimeUp(); }
    }, 1000);
}

function handleTimeUp() {
    sessionResults.push({ word: currentSessionWords[currentIndex].word, status: "시간초과" });
    nextWord();
}

function nextWord() {
    currentIndex++;
    if (currentIndex >= currentSessionWords.length) { showResults(); return; }
    loadWord();
    startTimer();
}

function showResults() {
    if (recognition) try { recognition.stop(); } catch(e) {}
    document.querySelector('.app').style.display = 'none';
    const correctWords = sessionResults.filter(r => r.status === "정답").length;
    const total = currentSessionWords.length;
    const accuracy = Math.round((correctWords / total) * 100);

    let resultHTML = `<div class="card doodle-box" style="text-align:center; padding:40px 20px;">
        <h2>학습 완료!</h2>
        <p style="font-size:24px; font-weight:800; color:#FF6B3D;">정답률: ${correctWords}/${total} (${accuracy}%)</p>
        <button onclick="location.reload()" class="doodle-btn primary-btn" style="margin-top:20px;">홈으로 가기</button>
        <button id="kakaoShareBtn" class="doodle-btn" style="width:100%; margin-top:10px; background:#FEE500;">💬 오단완 리포트 전송</button>
    </div>`;
    
    document.body.innerHTML += resultHTML;
    
    document.getElementById('kakaoShareBtn').onclick = () => {
        Kakao.Share.sendDefault({
            objectType: 'text',
            text: `📊 [Trigger Voca 오단완 리포트]\n오늘의 학습을 완료했습니다!\n\n✅ 정답률: ${correctWords}/${total} (${accuracy}%)\n\n----------------------\n🔒 [루크 쌤의 시크릿 영문법 라운지]\n👉 아래 버튼을 눌러 입장하세요.`,
            link: { mobileWebUrl: 'https://word30.pages.dev', webUrl: 'https://word30.pages.dev' },
            buttons: [{ title: '시크릿 라운지 입장', link: { mobileWebUrl: 'https://대표님의_노션_주소' } }]
        });
    };
}

buttons.forEach(btn => {
    btn.onclick = () => {
        if (!hasSpoken) return;
        const selected = btn.dataset.pos;
        const correct = currentSessionWords[currentIndex].pos;
        if (selected === correct) {
            btn.style.backgroundColor = "#2ecc71";
            sessionResults.push({ word: currentSessionWords[currentIndex].word, status: "정답" });
        } else {
            btn.style.backgroundColor = "#e74c3c";
            sessionResults.push({ word: currentSessionWords[currentIndex].word, status: "오답" });
        }
        setTimeout(() => nextWord(), 600);
    };
});

initLobby();