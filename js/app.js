if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
    Kakao.init('20d31cb149e892d8b1bdd0a8e7306749'); 
}

const wordData = {
    "day1": { title: "Day 1. 기초 필수 단어", list: [{word:"abandon",pos:"verb",meaning:"포기하다"},{word:"ability",pos:"noun",meaning:"능력"}] }
};

let currentSessionWords = [];
let currentIndex = 0;
let time = 10;
let hasSpoken = false;
let sessionResults = [];

function initLobby() {
    const list = document.getElementById("dayList");
    Object.keys(wordData).forEach(id => {
        const li = document.createElement("li");
        li.style.display = "flex"; li.style.justifyContent = "space-between"; li.style.padding = "10px 0";
        li.innerHTML = `<span>${wordData[id].title}</span><button class="doodle-btn" onclick="startStudy('${id}')" style="padding:5px 15px;">시작</button>`;
        list.appendChild(li);
    });
}

function startStudy(id) {
    currentSessionWords = wordData[id].list;
    document.getElementById("startOverlay").style.display = "none";
    document.querySelector(".app").style.display = "block";
    loadWord();
    startTimer();
    if (recognition) recognition.start();
}

/* 기존 음성인식(recognition) 및 타이머(startTimer) 로직은 이전과 동일하게 유지됩니다 */
// ... (생략된 기존 핵심 로직) ...

initLobby();