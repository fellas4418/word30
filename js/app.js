// ─── Kakao SDK 초기화 ───────────────────────────────────────────
if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
    Kakao.init('fbb1520306ffaad0a882e993109a801c');
}

// ═══════════════════════════════════════════════════════════════
// 1. 전체 단어 데이터 (중등 25개/고등 30개 독해 싱크 리스트)
// ═══════════════════════════════════════════════════════════════
const wordData = {
    mid: {
        day1: [{word:"appear",meaning:"나타나다"},{word:"disappear",meaning:"사라지다"},{word:"happen",meaning:"일어나다"},{word:"occur",meaning:"발생하다"},{word:"stay",meaning:"머무르다"},{word:"arrive",meaning:"도착하다"},{word:"exist",meaning:"존재하다"},{word:"rise",meaning:"오르다"},{word:"fall",meaning:"떨어지다"},{word:"wait",meaning:"기다리다"},{word:"smile",meaning:"미소 짓다"},{word:"laugh",meaning:"웃다"},{word:"sleep",meaning:"자다"},{word:"live",meaning:"살다"},{word:"die",meaning:"죽다"},{word:"walk",meaning:"걷다"},{word:"run",meaning:"달리다"},{word:"stand",meaning:"서다"},{word:"sit",meaning:"앉다"},{word:"grow",meaning:"자라다"},{word:"seem",meaning:"~인 것 같다"},{word:"look",meaning:"~하게 보이다"},{word:"feel",meaning:"느끼다"},{word:"sound",meaning:"~하게 들리다"},{word:"smell",meaning:"~한 냄새가 나다"}],
        day2: [{word:"accept",meaning:"받아들이다"},{word:"achieve",meaning:"성취하다"},{word:"avoid",meaning:"피하다"},{word:"choose",meaning:"선택하다"},{word:"create",meaning:"만들다"},{word:"destroy",meaning:"파괴하다"},{word:"enjoy",meaning:"즐기다"},{word:"expect",meaning:"기대하다"},{word:"find",meaning:"찾다"},{word:"forget",meaning:"잊다"},{word:"imagine",meaning:"상상하다"},{word:"improve",meaning:"향상시키다"},{word:"include",meaning:"포함하다"},{word:"keep",meaning:"유지하다"},{word:"lose",meaning:"잃다"},{word:"maintain",meaning:"유지하다"},{word:"offer",meaning:"제공하다"},{word:"prefer",meaning:"선호하다"},{word:"protect",meaning:"보호하다"},{word:"receive",meaning:"받다"},{word:"reduce",meaning:"줄이다"},{word:"remember",meaning:"기억하다"},{word:"solve",meaning:"해결하다"},{word:"suggest",meaning:"제안하다"},{word:"understand",meaning:"이해하다"}],
        day3: [{word:"give",meaning:"주다"},{word:"send",meaning:"보내다"},{word:"show",meaning:"보여주다"},{word:"tell",meaning:"말해주다"},{word:"teach",meaning:"가르치다"},{word:"lend",meaning:"빌려주다"},{word:"bring",meaning:"가져오다"},{word:"buy",meaning:"사주다"},{word:"make",meaning:"만들어주다"},{word:"cook",meaning:"요리해주다"},{word:"find",meaning:"찾아주다"},{word:"ask",meaning:"요청하다"},{word:"wish",meaning:"바라다"},{word:"offer",meaning:"제공하다"},{word:"hand",meaning:"건네주다"},{word:"write",meaning:"써주다"},{word:"read",meaning:"읽어주다"},{word:"pay",meaning:"지불하다"},{word:"sell",meaning:"팔다"},{word:"promise",meaning:"약속하다"},{word:"grant",meaning:"허락하다"},{word:"feed",meaning:"먹이를 주다"},{word:"leave",meaning:"남겨두다"},{word:"award",meaning:"수여하다"},{word:"allow",meaning:"허용하다"}],
        day4: [{word:"make",meaning:"~하게 만들다"},{word:"keep",meaning:"~상태로 유지"},{word:"find",meaning:"~라고 느끼다"},{word:"call",meaning:"~라고 부르다"},{word:"name",meaning:"~라고 이름짓다"},{word:"leave",meaning:"~상태로 두다"},{word:"paint",meaning:"~로 칠하다"},{word:"drive",meaning:"~하게 몰아가다"},{word:"want",meaning:"~하기를 원하다"},{word:"ask",meaning:"~하도록 요청"},{word:"tell",meaning:"~하라고 말하다"},{word:"advice",meaning:"충고하다"},{word:"allow",meaning:"~하도록 허락"},{word:"order",meaning:"~하라고 명령"},{word:"expect",meaning:"~하기를 기대"},{word:"help",meaning:"~하도록 돕다"},{word:"let",meaning:"~하게 해주다"},{word:"have",meaning:"~하게 시키다"},{word:"see",meaning:"~하는 것을 보다"},{word:"watch",meaning:"~하는 것을 지켜보다"},{word:"hear",meaning:"~하는 것을 듣다"},{word:"feel",meaning:"~하는 것을 느끼다"},{word:"notice",meaning:"~함을 알아차리다"},{word:"encourage",meaning:"격려하다"},{word:"force",meaning:"강요하다"}],
        day5: [{word:"however",meaning:"그러나"},{word:"but",meaning:"하지만"},{word:"because",meaning:"왜냐하면"},{word:"therefore",meaning:"그러므로"},{word:"so",meaning:"그래서"},{word:"also",meaning:"또한"},{word:"besides",meaning:"게다가"},{word:"moreover",meaning:"더욱이"},{word:"for example",meaning:"예를 들어"},{word:"such as",meaning:"~와 같은"},{word:"finally",meaning:"마침내"},{word:"first",meaning:"첫째로"},{word:"then",meaning:"그 다음에"},{word:"suddenly",meaning:"갑자기"},{word:"actually",meaning:"사실은"},{word:"instead",meaning:"대신에"},{word:"otherwise",meaning:"그렇지 않으면"},{word:"although",meaning:"비록 ~이지만"},{word:"even if",meaning:"비록 ~일지라도"},{word:"unless",meaning:"~하지 않는 한"},{word:"still",meaning:"여전히"},{word:"yet",meaning:"아직"},{word:"especially",meaning:"특히"},{word:"similarly",meaning:"마찬가지로"},{word:"in conclusion",meaning:"결론적으로"}],
        day6: [{word:"accurate",meaning:"정확한"},{word:"basic",meaning:"기본적인"},{word:"common",meaning:"흔한"},{word:"different",meaning:"다른"},{word:"difficult",meaning:"어려운"},{word:"easy",meaning:"쉬운"},{word:"famous",meaning:"유명한"},{word:"general",meaning:"일반적인"},{word:"healthy",meaning:"건강한"},{word:"important",meaning:"중요한"},{word:"main",meaning:"주요한"},{word:"natural",meaning:"자연스러운"},{word:"necessary",meaning:"필요한"},{word:"normal",meaning:"보통의"},{word:"popular",meaning:"인기 있는"},{word:"possible",meaning:"가능한"},{word:"real",meaning:"진짜의"},{word:"several",meaning:"여러"},{word:"simple",meaning:"단순한"},{word:"strange",meaning:"이상한"},{word:"careful",meaning:"조심스러운"},{word:"quickly",meaning:"빠르게"},{word:"slowly",meaning:"천천히"},{word:"clearly",meaning:"명확하게"},{word:"luckily",meaning:"운 좋게"}],
        day7: [{word:"activity",meaning:"활동"},{word:"attention",meaning:"주의"},{word:"benefit",meaning:"이익"},{word:"chance",meaning:"기회"},{word:"community",meaning:"공동체"},{word:"condition",meaning:"조건"},{word:"culture",meaning:"문화"},{word:"environment",meaning:"환경"},{word:"experience",meaning:"경험"},{word:"goal",meaning:"목표"},{word:"government",meaning:"정부"},{word:"health",meaning:"건강"},{word:"information",meaning:"정보"},{word:"knowledge",meaning:"지식"},{word:"level",meaning:"수준"},{word:"method",meaning:"방법"},{word:"opinion",meaning:"의견"},{word:"problem",meaning:"문제"},{word:"process",meaning:"과정"},{word:"reason",meaning:"이유"},{word:"result",meaning:"결과"},{word:"skill",meaning:"기술"},{word:"society",meaning:"사회"},{word:"technology",meaning:"기술"},{word:"value",meaning:"가치"}]
    },
    high: {
        day1: [{word:"acknowledge",meaning:"인정하다"},{word:"acquire",meaning:"습득하다"},{word:"advocate",meaning:"옹호하다"},{word:"analyze",meaning:"분석하다"},{word:"anticipate",meaning:"예상하다"},{word:"appreciate",meaning:"인식/감사하다"},{word:"articulate",meaning:"명확히 표현"},{word:"assert",meaning:"주장하다"},{word:"assume",meaning:"가정하다"},{word:"attribute",meaning:"~에 귀인하다"},{word:"clarify",meaning:"명확히 하다"},{word:"coincide",meaning:"일치하다"},{word:"collaborate",meaning:"협력하다"},{word:"compensate",meaning:"보상하다"},{word:"conceive",meaning:"생각해내다"},{word:"conclude",meaning:"결론 짓다"},{word:"confirm",meaning:"확인하다"},{word:"constitute",meaning:"구성하다"},{word:"contradict",meaning:"모순되다"},{word:"contribute",meaning:"기여하다"},{word:"convert",meaning:"변환하다"},{word:"convey",meaning:"전달하다"},{word:"convince",meaning:"납득시키다"},{word:"correspond",meaning:"상응하다"},{word:"demonstrate",meaning:"증명하다"},{word:"derive",meaning:"도출하다"},{word:"detect",meaning:"감지하다"},{word:"deviate",meaning:"벗어나다"},{word:"differentiate",meaning:"구별하다"},{word:"diminish",meaning:"감소하다"}],
        day2: [{word:"emphasize",meaning:"강조하다"},{word:"encounter",meaning:"마주치다"},{word:"enhance",meaning:"향상시키다"},{word:"ensure",meaning:"보장하다"},{word:"entail",meaning:"수반하다"},{word:"establish",meaning:"확립하다"},{word:"evaluate",meaning:"평가하다"},{word:"evolve",meaning:"진화하다"},{word:"exceed",meaning:"초과하다"},{word:"exclude",meaning:"제외하다"},{word:"exhibit",meaning:"나타내다"},{word:"expand",meaning:"확장하다"},{word:"exploit",meaning:"이용하다"},{word:"facilitate",meaning:"촉진하다"},{word:"fluctuate",meaning:"변동하다"},{word:"foster",meaning:"조성하다"},{word:"fulfill",meaning:"이행하다"},{word:"generate",meaning:"생성하다"},{word:"harness",meaning:"활용하다"},{word:"identify",meaning:"확인하다"},{word:"ignore",meaning:"무시하다"},{word:"illustrate",meaning:"설명하다"},{word:"implement",meaning:"시행하다"},{word:"imply",meaning:"암시하다"},{word:"impose",meaning:"부과하다"},{word:"incorporate",meaning:"통합하다"},{word:"indicate",meaning:"나타내다"},{word:"induce",meaning:"유발하다"},{word:"infer",meaning:"추론하다"},{word:"inhibit",meaning:"억제하다"}],
        day3: [{word:"initiate",meaning:"시작하다"},{word:"inspect",meaning:"검사하다"},{word:"install",meaning:"설치하다"},{word:"institute",meaning:"설립하다"},{word:"instruct",meaning:"지시하다"},{word:"integrate",meaning:"통합하다"},{word:"intend",meaning:"의도하다"},{word:"interpret",meaning:"해석하다"},{word:"intervene",meaning:"개입하다"},{word:"investigate",meaning:"조사하다"},{word:"justify",meaning:"정당화하다"},{word:"launch",meaning:"개시하다"},{word:"maintain",meaning:"유지하다"},{word:"manipulate",meaning:"조작하다"},{word:"maximize",meaning:"최대화하다"},{word:"mediate",meaning:"중재하다"},{word:"minimize",meaning:"최소화하다"},{word:"modify",meaning:"수정하다"},{word:"monitor",meaning:"모니터링하다"},{word:"motivate",meaning:"동기 부여하다"},{word:"neglect",meaning:"소홀히 하다"},{word:"neutralize",meaning:"중화하다"},{word:"observe",meaning:"관찰하다"},{word:"obtain",meaning:"획득하다"},{word:"offset",meaning:"상쇄하다"},{word:"overcome",meaning:"극복하다"},{word:"overlook",meaning:"간과하다"},{word:"participate",meaning:"참여하다"},{word:"perceive",meaning:"인식하다"},{word:"persist",meaning:"지속하다"}],
        day4: [{word:"predict",meaning:"예측하다"},{word:"preserve",meaning:"보존하다"},{word:"prioritize",meaning:"우선시하다"},{word:"process",meaning:"처리하다"},{word:"prohibit",meaning:"금지하다"},{word:"promote",meaning:"촉진하다"},{word:"propose",meaning:"제안하다"},{word:"pursue",meaning:"추구하다"},{word:"qualify",meaning:"자격을 갖추다"},{word:"quantify",meaning:"정량화하다"},{word:"quote",meaning:"인용하다"},{word:"radicalize",meaning:"급진화하다"},{word:"realize",meaning:"깨닫다"},{word:"recall",meaning:"회상하다"},{word:"reckon",meaning:"간주하다"},{word:"refine",meaning:"정제하다"},{word:"reflect",meaning:"반영하다"},{word:"reform",meaning:"개혁하다"},{word:"regulate",meaning:"규제하다"},{word:"reinforce",meaning:"강화하다"},{word:"reject",meaning:"거부하다"},{word:"release",meaning:"방출하다"},{word:"rely",meaning:"의존하다"},{word:"relieve",meaning:"완화하다"},{word:"remain",meaning:"남아있다"},{word:"remark",meaning:"언급하다"},{word:"remove",meaning:"제거하다"},{word:"render",meaning:"만들다"},{word:"renew",meaning:"갱신하다"},{word:"replace",meaning:"대체하다"}],
        day5: [{word:"nevertheless",meaning:"그럼에도 불구하고"},{word:"nonetheless",meaning:"그럼에도"},{word:"notwithstanding",meaning:"~에도 불구하고"},{word:"furthermore",meaning:"게다가"},{word:"consequently",meaning:"결과적으로"},{word:"subsequently",meaning:"그 후에"},{word:"accordingly",meaning:"따라서"},{word:"meanwhile",meaning:"그 사이에"},{word:"hence",meaning:"따라서"},{word:"thus",meaning:"따라서"},{word:"whereby",meaning:"그것에 의해"},{word:"whereas",meaning:"반면에"},{word:"provided that",meaning:"~라면"},{word:"assuming",meaning:"가정하면"},{word:"specifically",meaning:"구체적으로"},{word:"notably",meaning:"특히"},{word:"alternatively",meaning:"대안적으로"},{word:"conversely",meaning:"반대로"},{word:"paradoxically",meaning:"역설적으로"},{word:"fundamentally",meaning:"근본적으로"},{word:"essentially",meaning:"본질적으로"},{word:"inherently",meaning:"본질적으로"},{word:"precisely",meaning:"정확히"},{word:"primarily",meaning:"주로"},{word:"relatively",meaning:"상대적으로"},{word:"virtually",meaning:"사실상"},{word:"explicitly",meaning:"명시적으로"},{word:"implicitly",meaning:"암묵적으로"},{word:"significantly",meaning:"상당히"},{word:"appropriately",meaning:"적절하게"}],
        day6: [{word:"abstract",meaning:"추상적인"},{word:"adequate",meaning:"적절한"},{word:"ambiguous",meaning:"모호한"},{word:"arbitrary",meaning:"자의적인"},{word:"coherent",meaning:"일관된"},{word:"comprehensive",meaning:"포괄적인"},{word:"consistent",meaning:"일관된"},{word:"crucial",meaning:"중요한"},{word:"deficient",meaning:"부족한"},{word:"deliberate",meaning:"의도적인"},{word:"distinct",meaning:"뚜렷한"},{word:"diverse",meaning:"다양한"},{word:"domestic",meaning:"국내의"},{word:"dominant",meaning:"지배적인"},{word:"drastic",meaning:"급격한"},{word:"durable",meaning:"내구성 있는"},{word:"elaborate",meaning:"정교한"},{word:"elegant",meaning:"우아한"},{word:"empirical",meaning:"경험적인"},{word:"equivalent",meaning:"동등한"},{word:"essential",meaning:"필수적인"},{word:"evident",meaning:"명백한"},{word:"excessive",meaning:"과도한"},{word:"exclusive",meaning:"독점적인"},{word:"explicit",meaning:"명시적인"},{word:"feasible",meaning:"실현 가능한"},{word:"flexible",meaning:"유연한"},{word:"fundamental",meaning:"근본적인"},{word:"genuine",meaning:"진정한"},{word:"hypothetical",meaning:"가설적인"}],
        day7: [{word:"accumulation",meaning:"축적"},{word:"acquisition",meaning:"획득"},{word:"adaptation",meaning:"적응"},{word:"advocacy",meaning:"옹호"},{word:"aggregate",meaning:"집합체"},{word:"allocation",meaning:"배분"},{word:"alteration",meaning:"변경"},{word:"ambiguity",meaning:"모호함"},{word:"analogy",meaning:"유추"},{word:"analysis",meaning:"분석"},{word:"apparatus",meaning:"기구"},{word:"appendix",meaning:"부록"},{word:"application",meaning:"적용"},{word:"approach",meaning:"접근 방식"},{word:"appropriation",meaning:"전용"},{word:"arbitrary",meaning:"자의적인 것"},{word:"aspect",meaning:"측면"},{word:"assembly",meaning:"의회"},{word:"assessment",meaning:"평가"},{word:"assignment",meaning:"과제"},{word:"assumption",meaning:"가정"},{word:"assurance",meaning:"확신"},{word:"attachment",meaning:"애착"},{word:"attainment",meaning:"달성"},{word:"attitude",meaning:"태도"},{word:"attribute",meaning:"속성"},{word:"authority",meaning:"권위"},{word:"automation",meaning:"자동화"},{word:"availability",meaning:"가용성"},{word:"awareness",meaning:"인식"}]
    }
};

// ═══════════════════════════════════════════════════════════════
// 2. 상태 관리 (레벨별 독립 저장소 적용)
// ═══════════════════════════════════════════════════════════════
let currentLevel = localStorage.getItem('voca_level') || 'mid';
let currentSessionWords = [];
let currentIndex = 0;
let time = 10;
let interval;
let sessionResults = [];
let currentDayKey = null;
let isReviewMode = false;
let isRevealed = false;

// DOM 요소 매핑
const wordEl = document.getElementById("word");
const meaningEl = document.getElementById("meaning");
const timerEl = document.getElementById("timer");
const remainingEl = document.getElementById("remaining");
const cardEl = document.getElementById("wordCard");
const oxButtons = document.getElementById("oxButtons");
const btnStar = document.getElementById("btnStar");

// 로컬스토리지 헬퍼
const getProgressKey = () => `voca_progress_${currentLevel}`;
const getStarredKey = () => `voca_starred_${currentLevel}`;
function getProgress() { return JSON.parse(localStorage.getItem(getProgressKey()) || '{}'); }
function getStarredArr() { return JSON.parse(localStorage.getItem(getStarredKey()) || '[]'); }

// ═══════════════════════════════════════════════════════════════
// 3. 누적 복습 세션 빌더 (3일 규칙 + 별표)
// ═══════════════════════════════════════════════════════════════
function buildSessionWords(dayKey) {
    if (dayKey === 'day8') return buildDay8Words();

    const data = wordData[currentLevel];
    const dayNum = parseInt(dayKey.replace('day', ''));
    const newWords = data[dayKey] ? [...data[dayKey]] : [];
    const progress = getProgress();
    const starred = getStarredArr();

    let reviewMap = new Map();

    // 최근 2일치 오답 수집
    for (let i = Math.max(1, dayNum - 2); i < dayNum; i++) {
        const dKey = `day${i}`;
        const dProg = progress[dKey];
        if (dProg && dProg.wrongs) {
            dProg.wrongs.forEach(wStr => {
                const found = data[dKey]?.find(d => d.word === wStr);
                if (found) reviewMap.set(found.word, { ...found, isReview: true });
            });
        }
    }
    
    // 별표 단어 추가
    starred.forEach(sWord => {
        for (let d in data) {
            const found = data[d].find(x => x.word === sWord);
            if (found) reviewMap.set(found.word, { ...found, isReview: true });
        }
    });

    // 신규 단어 병합 (최대 50개 제한)
    let combined = Array.from(reviewMap.values());
    newWords.forEach(w => {
        if (!reviewMap.has(w.word)) combined.push({ ...w, isReview: false });
    });

    return combined.slice(0, 50);
}

function buildDay8Words() {
    const data = wordData[currentLevel];
    const progress = getProgress();
    const starred = getStarredArr();
    let wordMap = new Map();

    for (let i = 1; i <= 7; i++) {
        const dayKey = `day${i}`;
        const dayProg = progress[dayKey];
        const dData = data[dayKey] || [];
        if (dayProg && dayProg.wrongs) {
            dayProg.wrongs.forEach(wStr => {
                const found = dData.find(d => d.word === wStr);
                if (found) wordMap.set(found.word, { ...found, isReview: true });
            });
        }
    }

    starred.forEach(sWord => {
        for (let d in data) {
            const found = data[d].find(x => x.word === sWord);
            if (found) wordMap.set(found.word, { ...found, isReview: true });
        }
    });

    return Array.from(wordMap.values());
}

// ═══════════════════════════════════════════════════════════════
// 4. 퀴즈 엔진
// ═══════════════════════════════════════════════════════════════
function loadWord() {
    const current = currentSessionWords[currentIndex];
    wordEl.textContent = current.word;
    meaningEl.style.display = "none";
    oxButtons.style.display = "none";
    document.getElementById("actionMsg").style.display = "block";
    cardEl.style.borderColor = "transparent";
    isRevealed = false;

    remainingEl.textContent = currentSessionWords.length - currentIndex;
    document.getElementById("reviewTag").style.display = current.isReview ? 'block' : 'none';
    btnStar.classList.toggle('starred', getStarredArr().includes(current.word));

    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(current.word);
        utter.lang = 'en-US';
        window.speechSynthesis.speak(utter);
    }
}

function revealMeaning() {
    if (isRevealed) return;
    isRevealed = true;
    clearInterval(interval);
    meaningEl.textContent = currentSessionWords[currentIndex].meaning;
    meaningEl.style.display = "block";
    oxButtons.style.display = "grid";
    document.getElementById("actionMsg").style.display = "none";
    cardEl.style.borderColor = "#FF6B3D";
}

cardEl.onclick = revealMeaning;

btnStar.onclick = (e) => {
    e.stopPropagation();
    const word = currentSessionWords[currentIndex].word;
    let starred = getStarredArr();
    if (starred.includes(word)) {
        starred = starred.filter(w => w !== word);
    } else {
        starred.push(word);
    }
    localStorage.setItem(getStarredKey(), JSON.stringify(starred));
    btnStar.classList.toggle('starred', starred.includes(word));
};

function startTimer() {
    time = isReviewMode ? 8 : 10;
    timerEl.textContent = time;
    clearInterval(interval);
    interval = setInterval(() => {
        time--;
        timerEl.textContent = time;
        if (time <= 0) {
            clearInterval(interval);
            sessionResults.push({ ...currentSessionWords[currentIndex], status: "시간 초초과" });
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

btnCorrect.onclick = () => {
    sessionResults.push({ ...currentSessionWords[currentIndex], status: "정답" });
    nextWord();
};

btnWrong.onclick = () => {
    sessionResults.push({ ...currentSessionWords[currentIndex], status: "오답" });
    nextWord();
};

// ═══════════════════════════════════════════════════════════════
// 5. 결과 및 대시보드 관리 (80% 기준)
// ═══════════════════════════════════════════════════════════════
function saveSessionProgress(accuracy) {
    if (!currentDayKey || isReviewMode) return;
    const progress = getProgress();
    const wrongs = sessionResults.filter(r => r.status !== "정답").map(r => r.word);

    progress[currentDayKey] = {
        completed: accuracy >= 80,
        accuracy: accuracy,
        wrongs: wrongs,
        completedAt: new Date().toISOString()
    };
    localStorage.setItem(getProgressKey(), JSON.stringify(progress));
}

function showResults() {
    clearInterval(interval);
    const total = sessionResults.length;
    const correct = sessionResults.filter(r => r.status === "정답").length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    saveSessionProgress(accuracy);
    updateCurriculumUI();

    document.querySelector('.app').style.display = 'none';
    let html = `<div class="card doodle-box" style="text-align:center;">`;
    html += `<h2>학습 완료!</h2><div style="font-size:32px; font-weight:900; color:#FF6B3D;">${accuracy}%</div>`;
    html += `<button onclick="location.reload()" class="doodle-btn primary-btn" style="margin-top:20px;">메인으로 가기</button></div>`;
    
    const container = document.createElement('div');
    container.className = 'app';
    container.innerHTML = html;
    document.body.appendChild(container);
}

function switchLevel(level) {
    currentLevel = level;
    localStorage.setItem('voca_level', level);
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.toggle('active-level', btn.dataset.level === level));
    document.getElementById('wordGoal').textContent = (level === 'mid' ? '25' : '30') + '개';
    document.getElementById('totalCount').textContent = (level === 'mid' ? 175 : 210) + ' 단어';
    updateCurriculumUI();
}

function updateCurriculumUI() {
    const progress = getProgress();
    for (let i = 1; i <= 7; i++) {
        const btn = document.getElementById(`btn-day${i}`);
        if (!btn) continue;
        const prevKey = `day${i - 1}`;
        const unlocked = (i === 1) || (progress[prevKey] && progress[prevKey].completed);
        
        if (progress[`day${i}`]?.completed) {
            btn.textContent = "✅ 완료";
            btn.disabled = false;
            btn.classList.add('complete');
        } else if (unlocked) {
            btn.textContent = "시작";
            btn.disabled = false;
        } else {
            btn.textContent = "🔒 잠김";
            btn.disabled = true;
        }
    }
}

function startSession(dayKey) {
    currentDayKey = dayKey;
    currentSessionWords = buildSessionWords(dayKey);
    document.getElementById('startOverlay').style.display = 'none';
    document.querySelector('.app').style.display = 'block';
    loadWord();
    startTimer();
}

function startReview() {
    // 오답노트 전용 복습 로직
}

// 이벤트 리스너 바인딩
document.getElementById('midTab').onclick = () => switchLevel('mid');
document.getElementById('highTab').onclick = () => switchLevel('high');
document.getElementById('startBtn').onclick = () => {
    let progress = getProgress();
    let targetDay = 'day1';
    for(let i=1; i<=7; i++) {
        if(!progress[`day${i}`]?.completed) { targetDay = `day${i}`; break; }
    }
    startSession(targetDay);
};

document.querySelectorAll('.start-day-btn').forEach(btn => {
    btn.onclick = (e) => startSession(e.target.dataset.day);
});

document.getElementById('saveUserBtn').onclick = () => {
    const name = document.getElementById('userName').value.trim();
    if(!name) return alert('이름을 입력하세요.');
    localStorage.setItem('word30_user', JSON.stringify({name}));
    document.getElementById('registrationModal').style.display = 'none';
    document.getElementById('startOverlay').style.display = 'flex';
};

window.onload = () => {
    if(!localStorage.getItem('word30_user')) document.getElementById('registrationModal').style.display = 'flex';
    else document.getElementById('startOverlay').style.display = 'flex';
    switchLevel(currentLevel);
};