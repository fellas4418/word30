/* 1. 초기화 */
if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
    Kakao.init('20d31cb149e892d8b1bdd0a8e7306749'); 
}

const wordData = {
    "day1": [
        { word: "abandon", pos: "verb", meaning: "포기하다" },
        { word: "ability", pos: "noun", meaning: "능력" }
    ]
};

let currentSessionWords = [];
let currentIndex = 0;
let time = 10;
let interval;
let sessionResults = [];

/* 2. 학습 시작 함수 */
function startStudy(dayId) {
    currentSessionWords = wordData[dayId];
    document.getElementById("startOverlay").style.display = "none";
    document.querySelector(".app").style.display = "block";
    loadWord();
    startTimer();
}

function loadWord() {
    document.getElementById("word").textContent = currentSessionWords[currentIndex].word;
    document.getElementById("timer").textContent = "10";
}

function startTimer() {
    time = 10;
    clearInterval(interval);
    interval = setInterval(() => {
        time--;
        document.getElementById("timer").textContent = time;
        if(time <= 0) {
            clearInterval(interval);
            sessionResults.push({ word: currentSessionWords[currentIndex].word, status: "시간초과" });
            nextWord();
        }
    }, 1000);
}

function nextWord() {
    currentIndex++;
    if(currentIndex >= currentSessionWords.length) {
        showResults();
        return;
    }
    loadWord();
    startTimer();
}

function showResults() {
    document.querySelector(".app").innerHTML = `
        <div class="doodle-box" style="text-align:center;">
            <h2>오단완 리포트</h2>
            <p>오늘의 학습을 마쳤습니다!</p>
            <button id="kakaoBtn" class="doodle-btn" style="background:#FEE500; width:100%;">💬 카톡으로 결과 보내기</button>
            <button onclick="location.reload()" class="doodle-btn" style="width:100%; margin-top:10px;">처음으로</button>
        </div>
    `;

    document.getElementById("kakaoBtn").onclick = () => {
        Kakao.Share.sendDefault({
            objectType: 'text',
            text: '📊 [Trigger Voca 오단완 리포트]\n루크 쌤의 영단어 학습 완료!',
            link: { mobileWebUrl: 'https://word30.pages.dev', webUrl: 'https://word30.pages.dev' },
            buttons: [{ title: '비법 노션 입장', link: { mobileWebUrl: 'https://대표님의_노션_링크' } }]
        });
    };
}

// 품사 버튼 클릭 이벤트
document.querySelectorAll(".pos-buttons button").forEach(btn => {
    btn.onclick = () => {
        const correct = currentSessionWords[currentIndex].pos;
        if(btn.dataset.pos === correct) {
            sessionResults.push({ word: currentSessionWords[currentIndex].word, status: "정답" });
        } else {
            sessionResults.push({ word: currentSessionWords[currentIndex].word, status: "오답" });
        }
        nextWord();
    };
});