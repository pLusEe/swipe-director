const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const STORAGE_KEY = "swipe-director-v31-canon-loop";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const NAIL_FAMILY_REFERENCE = "assets/shot-01-a.jpg";

const PROJECT = {
  title: "异色甲宝宝",
  seed: "黑色甲爸爸和粉色甲妈妈生下一个会发光的异色甲宝宝。",
  premise: "新生宝宝的异色甲片，揭开了这个华丽家族一直不敢说的秘密。",
  subject: NAIL_FAMILY_REFERENCE,
  contract: [
    ["Subject", "黑色甲爸爸、粉色甲妈妈与异色甲宝宝"],
    ["World rule", "甲片颜色会暴露血统与能力"],
    ["Story length", "15 秒 · 4 次故事决定"],
    ["Ending intent", "以身份揭晓或外来威胁收束"]
  ],
  beats: [
    {
      title: "摇篮里的异色",
      duration: "3s",
      purpose: "决定如何揭开宝宝的秘密",
      mode: "OPENING REVEAL",
      caption: "摇篮里，宝宝的甲片同时闪出黑色与粉色。",
      candidates: [
        {
          title: "先看见宝宝，再看见父母僵住",
          change: "宝宝极近景 → 焦点转移到父母 · 缓慢拉远",
          dialogue: "“这……为什么会有两种颜色？”",
          image: "assets/shot-01-a.jpg"
        },
        {
          title: "从父母背后越过肩膀看摇篮",
          change: "过肩中景 · 镜头沿摇篮缓慢下压",
          dialogue: "房间安静下来，只剩宝宝的呼吸声。",
          image: "assets/shot-01-b.jpg"
        },
        {
          title: "宝宝的甲片突然亮起一道粉光",
          change: "摇篮俯拍特写 · 快速推近后定格",
          dialogue: "一道光扫过父亲黑色的甲片。",
          image: "assets/shot-01-c.jpg"
        },
        {
          title: "镜子里的宝宝戴着金色王冠",
          change: "母亲过肩镜面特写 · 焦点在现实与倒影间切换",
          dialogue: "镜子里，宝宝却变成了金色。",
          image: "assets/shot-01-d.jpg"
        },
        {
          title: "水晶吊饰跟着宝宝分成黑粉两色",
          change: "宝宝低角度仰拍 · 环绕上方水晶吊饰",
          dialogue: "每一颗水晶，都在模仿宝宝的颜色。",
          image: "assets/shot-01-e.jpg"
        },
        {
          title: "灯光熄灭，宝宝独自在摇篮里发亮",
          change: "黑暗全景 → 宝宝近景 · 缓慢向前推进",
          dialogue: "父母后退一步，宝宝却突然不哭了。",
          image: "assets/shot-01-f.jpg"
        }
      ]
    },
    {
      title: "母亲的质问",
      duration: "4s",
      purpose: "选择人物下一步动作",
      mode: "STORY MOVE",
      caption: "母亲抱起宝宝，第一次问出了那个不能问的问题。",
      candidates: [
        {
          title: "母亲抱起宝宝，转身质问父亲",
          change: "手部中近景 → 母亲面部特写 · 缓慢推近",
          dialogue: "“为什么我们的宝宝，不像你也不像我？”",
          image: "assets/shot-02-a.jpg"
        },
        {
          title: "母亲把宝宝藏进怀里，警觉看向门外",
          change: "母亲侧脸近景 · 焦点从宝宝移向门缝",
          dialogue: "“有人来了。别让他们看见宝宝。”",
          image: "assets/shot-02-b.jpg"
        },
        {
          title: "宝宝抓住母亲，甲片颜色开始变化",
          change: "宝宝手部微距 · 环绕半圈跟随变色",
          dialogue: "粉色消失了一秒，整个房间变暗。",
          image: "assets/shot-02-c.jpg"
        },
        {
          title: "母亲抱宝宝照镜子，倒影却不属于他",
          change: "镜面过肩中近景 · 在现实与金色倒影间拉焦",
          dialogue: "“镜子里那是谁？”",
          image: "assets/shot-02-d.jpg"
        },
        {
          title: "母亲用粉色甲油刷测试宝宝",
          change: "刷头微距特写 · 焦点跟随颜色瞬间变化",
          dialogue: "刷毛落下，粉色立刻变成黑色。",
          image: "assets/shot-02-e.jpg"
        },
        {
          title: "宝宝站起来，说出第一句话",
          change: "摇篮低角度 · 快速推近宝宝后切父母反应",
          dialogue: "宝宝看着门口，只说了两个字：“快跑。”",
          image: "assets/shot-02-f.jpg"
        }
      ]
    },
    {
      title: "父亲的秘密",
      duration: "4s",
      purpose: "决定秘密以什么方式暴露",
      mode: "CONFLICT",
      caption: "父亲低下头，他早就知道异色甲意味着什么。",
      candidates: [
        {
          title: "父亲承认自己曾经也是粉色甲",
          change: "父亲正面近景 · 灯光扫过黑色甲片并显出旧色",
          dialogue: "“我把真正的颜色藏了二十年。”",
          image: "assets/shot-03-a.jpg"
        },
        {
          title: "父亲突然拉上帘子，要求立刻离开",
          change: "双人中景 · 快速横移跟随父亲转身",
          dialogue: "“王室的人会来找这个孩子。”",
          image: "assets/shot-03-b.jpg"
        },
        {
          title: "父亲伸手触碰宝宝，甲片同时发光",
          change: "三只手的俯拍特写 · 光线爆发后拉远",
          dialogue: "两种颜色拼成了失传的王室纹章。",
          image: "assets/shot-03-c.jpg"
        },
        {
          title: "父亲拿出被抹去的家族肖像",
          change: "肖像插入特写 → 父亲反应近景 · 缓慢拉焦",
          dialogue: "“照片里消失的人，是宝宝的祖母。”",
          image: "assets/shot-03-d.jpg"
        },
        {
          title: "床下密屉藏着一份王室家谱",
          change: "抽屉俯拍特写 · 沿金色家谱缓慢横移",
          dialogue: "家谱最后一行，早已写着宝宝的名字。",
          image: "assets/shot-03-e.jpg"
        },
        {
          title: "母亲撕开父亲的黑色伪装",
          change: "瓶身极近景 · 标签撕开后停在粉色旧漆",
          dialogue: "黑色外壳下面，是父亲藏了二十年的粉色。",
          image: "assets/shot-03-f.jpg"
        }
      ]
    },
    {
      title: "门外的来客",
      duration: "4s",
      purpose: "选择这一集的悬念结尾",
      mode: "CLIFFHANGER",
      caption: "门外响起三下敲门声，宝宝第一次停止了哭泣。",
      candidates: [
        {
          title: "门缝下出现一片金色甲影",
          change: "低机位贴地特写 · 影子缓慢逼近",
          dialogue: "门外的人说：“把继承人交出来。”",
          image: "assets/shot-04-a.jpg"
        },
        {
          title: "宝宝睁眼，整座房间变成黑色",
          change: "瞳孔极近景 · 瞬间拉远至全景",
          dialogue: "黑暗里，只有宝宝的甲片还在发光。",
          image: "assets/shot-04-b.jpg"
        },
        {
          title: "母亲打开门，来客竟和宝宝一模一样",
          change: "母亲背后过肩镜头 · 门开后缓慢推近来客",
          dialogue: "来客轻声说：“我终于找到你们了。”",
          image: "assets/shot-04-c.jpg"
        },
        {
          title: "门被推开，巨大影子落在地毯上",
          change: "贴地低机位 · 沿影子反向推向门口",
          dialogue: "影子没有进来，只问：“孩子醒了吗？”",
          image: "assets/shot-04-d.jpg"
        },
        {
          title: "金色甲使者站在门外",
          change: "母亲背后过肩镜头 · 门开后缓慢推近使者",
          dialogue: "金色来客低头行礼：“殿下，该回家了。”",
          image: "assets/shot-04-e.jpg"
        },
        {
          title: "宝宝指向墙壁，隐藏密道自行打开",
          change: "全家背影广角 · 墙面裂开后向密道推进",
          dialogue: "门外脚步逼近，墙后却亮起了逃生通道。",
          image: "assets/shot-04-f.jpg"
        }
      ]
    }
  ]
};

const CANDIDATE_META = [
  [
    { role: "continue", route: "family" },
    { role: "continue", route: "mystery" },
    { role: "escalate", route: "royal" },
    { role: "twist", route: "royal" },
    { role: "escalate", route: "mystery" },
    { role: "twist", route: "escape" }
  ],
  [
    { role: "continue", route: "family" },
    { role: "escalate", route: "escape" },
    { role: "twist", route: "mystery" },
    { role: "twist", route: "royal" },
    { role: "continue", route: "family" },
    { role: "escalate", route: "escape" }
  ],
  [
    { role: "continue", route: "family" },
    { role: "escalate", route: "escape" },
    { role: "continue", route: "royal" },
    { role: "twist", route: "family" },
    { role: "escalate", route: "royal" },
    { role: "twist", route: "family" }
  ],
  [
    { role: "continue", route: "royal" },
    { role: "escalate", route: "escape" },
    { role: "twist", route: "mystery" },
    { role: "continue", route: "escape" },
    { role: "escalate", route: "royal" },
    { role: "twist", route: "escape" }
  ]
];

const ROLE_LABELS = {
  continue: "承接",
  escalate: "加压",
  twist: "转折"
};

const BIAS_ROLE_ORDER = {
  balanced: ["continue", "escalate", "twist"],
  steady: ["continue", "escalate", "twist"],
  conflict: ["escalate", "continue", "twist"],
  twist: ["twist", "continue", "escalate"]
};

const initialState = () => ({
  view: "director",
  setupMode: "brief",
  seed: PROJECT.seed,
  ratio: "9:16",
  duration: 15,
  activeStep: 0,
  canon: [],
  deckIndexes: PROJECT.beats.map(() => 0),
  deckBiases: PROJECT.beats.map(() => "balanced"),
  deckRevisions: PROJECT.beats.map(() => 0),
  editingIndex: null,
  rebuildNotice: 0,
  history: [],
  generationProgress: 0,
  resultFrame: 0,
  resultPlaying: true
});

let state = restoreState();
let transientTimer = null;
let generationTimer = null;
let resultTimer = null;
let toastTimer = null;
let swipeLocked = false;

function restoreState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !Array.isArray(saved.canon) || saved.canon.length > PROJECT.beats.length) {
      return initialState();
    }
    if (["preparing", "generating"].includes(saved.view)) {
      saved.view = saved.view === "generating" ? "review" : "setup";
      saved.setupMode = saved.view === "setup" ? "brief" : saved.setupMode;
    }
    const restored = { ...initialState(), ...saved, history: [] };
    restored.activeStep = Math.min(restored.activeStep, restored.canon.length);
    if (restored.view === "review" && restored.canon.length !== PROJECT.beats.length) {
      restored.view = "director";
      restored.activeStep = restored.canon.length;
    }
    return restored;
  } catch {
    return initialState();
  }
}

function saveState() {
  const stable = { ...state, history: [] };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stable));
}

function icon(name, label = "") {
  const aria = label ? `aria-label="${label}"` : 'aria-hidden="true"';
  return `<i data-lucide="${name}" ${aria}></i>`;
}

function capcutIcon(name) {
  return `<img class="capcut-icon" src="assets/capcut/${name}.png" alt="">`;
}

function statusBar() {
  return `
    <div class="statusbar" aria-hidden="true">
      <span>9:41</span>
      <span class="status-icons">
        ${icon("signal")}
        ${icon("wifi")}
        ${icon("battery-full")}
      </span>
    </div>`;
}

function generatedImage(src, alt, eager = false, style = "") {
  return `
    <span class="image-skeleton" aria-hidden="true"></span>
    <img
      src="${src}"
      alt="${alt}"
      ${style ? `style="${style}"` : ""}
      ${eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'}
      onload="window.imageReady(this)"
      onerror="window.imageFailed(this)"
    >`;
}

function candidateImage(candidate, alt, eager = false, cameraVariant = 0) {
  return generatedImage(
    candidate.image || PROJECT.subject,
    alt,
    eager,
    cameraImageStyle(cameraVariant)
  );
}

function cameraImageStyle(cameraVariant) {
  if (cameraVariant === 1) return "object-position: 38% 50%; transform: scale(1.08)";
  if (cameraVariant === 2) return "object-position: 62% 50%; transform: scale(1.16)";
  return "";
}

function cameraOptions(candidate) {
  return [
    candidate.change,
    "固定中景 · 保留完整人物关系",
    "近景推进 · 放大表情与材质细节"
  ];
}

function candidateFromEntry(entry) {
  const candidate = PROJECT.beats[entry.step].candidates[entry.candidateIndex];
  const meta = CANDIDATE_META[entry.step][entry.candidateIndex];
  return { ...candidate, ...meta, sourceIndex: entry.candidateIndex };
}

function buildDeck(step) {
  const beat = PROJECT.beats[step];
  const bias = state.deckBiases[step] || "balanced";
  const revision = state.deckRevisions[step] || 0;
  const previousEntry = state.canon[step - 1];
  const previousRoute = previousEntry?.route;
  const candidates = beat.candidates.map((candidate, index) => ({
    ...candidate,
    ...CANDIDATE_META[step][index],
    sourceIndex: index
  }));

  return BIAS_ROLE_ORDER[bias].map((role, rolePosition) => {
    const roleCandidates = candidates
      .filter((candidate) => candidate.role === role)
      .sort((left, right) => {
        const leftMatch = left.route === previousRoute ? 1 : 0;
        const rightMatch = right.route === previousRoute ? 1 : 0;
        return rightMatch - leftMatch || left.sourceIndex - right.sourceIndex;
      });
    const offset = (revision + (bias === "balanced" ? 0 : rolePosition)) % roleCandidates.length;
    return roleCandidates[offset];
  });
}

window.imageReady = (image) => {
  image.previousElementSibling?.remove();
};

window.imageFailed = (image) => {
  const skeleton = image.previousElementSibling;
  if (skeleton) {
    skeleton.classList.remove("image-skeleton");
    skeleton.textContent = "Preview unavailable";
  }
  image.remove();
};

function render() {
  clearTransientTimers();
  swipeLocked = false;

  const views = {
    setup: renderSetup,
    preparing: renderPreparing,
    director: renderDirector,
    review: renderReview,
    generating: renderGenerating,
    result: renderResult
  };

  $("#app").innerHTML = views[state.view]();
  window.lucide?.createIcons({ attrs: { "stroke-width": 2 } });
  bindCommon();

  if (state.view === "setup") bindSetup();
  if (state.view === "preparing") startPreparing();
  if (state.view === "director") bindDirector();
  if (state.view === "review") bindReview();
  if (state.view === "generating") startGeneration();
  if (state.view === "result") bindResult();

  saveState();
}

function renderSetup() {
  if (state.setupMode === "brief") return renderBrief();

  return `
    <section class="screen screen-enter" aria-labelledby="setup-title">
      ${statusBar()}
      <header class="app-header">
        <button class="header-action" type="button" data-toast="返回 AI Lab" aria-label="Back to AI Lab">
          ${capcutIcon("nav-back")}
        </button>
        <h2>Swipe Director</h2>
        <button class="header-action" type="button" data-toast="Project history" aria-label="Project history">
          ${capcutIcon("nav-history")}
        </button>
      </header>

      <div class="setup-scroll">
        <p class="setup-kicker">New story</p>
        <h1 class="setup-title" id="setup-title">Direct it,<br>shot by shot.</h1>
        <p class="setup-copy">Start with one idea and one subject.</p>

        <div class="seed-media">
          ${generatedImage(PROJECT.subject, "AI-generated nail family character reference", true)}
          <span class="media-badge">${icon("sparkles")} AI character world</span>
        </div>

        <div class="field">
          <label for="seed-input">Creative seed</label>
          <textarea class="seed-input" id="seed-input" maxlength="120">${escapeHtml(state.seed)}</textarea>
        </div>

        <div class="field">
          <span class="section-label">Duration</span>
          <div class="segmented" aria-label="Video duration">
            ${[10, 15, 30].map((value) => `
              <button type="button" data-duration="${value}" aria-pressed="${state.duration === value}">
                ${value}s
              </button>`).join("")}
          </div>
        </div>
      </div>

      <footer class="setup-footer">
        <button class="primary-button" id="make-brief" type="button">
          Build story ${icon("arrow-right")}
        </button>
      </footer>
    </section>`;
}

function renderBrief() {
  return `
    <section class="screen screen-enter" aria-labelledby="brief-title">
      ${statusBar()}
      <header class="app-header">
        <button class="header-action" id="brief-back" type="button" aria-label="Edit creative seed">
          ${capcutIcon("nav-back")}
        </button>
        <h2>Project brief</h2>
        <button class="header-action" type="button" data-toast="Character settings" aria-label="Edit characters">
          ${icon("sliders-horizontal")}
        </button>
      </header>

      <div class="setup-scroll">
        <div class="brief-hero">
          ${generatedImage(PROJECT.subject, "Confirmed AI nail family character sheet", true)}
          <span class="brief-status">${icon("circle-check")} Characters locked</span>
        </div>

        <h1 class="brief-title" id="brief-title">${PROJECT.title}</h1>
        <p class="brief-premise">${PROJECT.premise}</p>

        <div class="beat-list" aria-label="Story contract">
          ${PROJECT.contract.map(([label, value], index) => `
            <div class="beat-item">
              <span class="beat-index">${String(index + 1).padStart(2, "0")}</span>
              <strong>${label}</strong>
              <small>${value}</small>
            </div>`).join("")}
        </div>
      </div>

      <footer class="setup-footer">
        <button class="primary-button" id="start-directing" type="button">
          Start directing ${icon("arrow-right")}
        </button>
      </footer>
    </section>`;
}

function renderPreparing() {
  return `
    <section class="screen loading-screen screen-enter" aria-live="polite">
      ${statusBar()}
      <div class="loading-mark" aria-hidden="true"></div>
      <div>
        <h2>Writing three next moves</h2>
        <p>Conditioning every option on the locked story contract.</p>
      </div>
    </section>`;
}

function renderDirector() {
  const step = state.activeStep;
  const beat = PROJECT.beats[step];
  const deck = buildDeck(step);
  const candidateIndex = state.deckIndexes[step] ?? 0;
  const exhausted = candidateIndex >= deck.length;
  const contextEntry = state.canon[step - 1];
  const contextCandidate = contextEntry ? candidateFromEntry(contextEntry) : null;
  const contextLabel = contextCandidate ? `承接 Shot ${step}` : "基于 Story Contract";
  const headerDetail = state.editingIndex !== null
    ? `${state.rebuildNotice} later event${state.rebuildNotice === 1 ? "" : "s"} will be rebuilt`
    : state.rebuildNotice
      ? `${state.rebuildNotice} later event${state.rebuildNotice === 1 ? "" : "s"} cleared`
      : beat.purpose;

  return `
    <section class="screen director-screen screen-enter" aria-labelledby="director-title">
      ${statusBar()}
      <header class="app-header director-header">
        <button class="header-action" id="director-back" type="button" aria-label="Back to project brief">
          ${capcutIcon("nav-back")}
        </button>
        <h2 id="director-title">
          Decision ${step + 1} of ${PROJECT.beats.length}
          <span>${headerDetail}</span>
        </h2>
        <button class="header-action" id="undo-action" type="button" aria-label="Undo last swipe" ${state.history.length ? "" : "disabled"}>
          ${capcutIcon("nav-history")}
        </button>
      </header>

      <nav class="storyboard-strip" aria-label="Canon, ${state.canon.length} of ${PROJECT.beats.length} story decisions committed">
        ${renderStorySlots()}
      </nav>

      <div class="director-body">
        <div class="candidate-stage">
          ${exhausted
            ? renderRewritePanel()
            : renderCandidateStack(beat, deck, candidateIndex, contextLabel)}
        </div>

        ${exhausted ? `
          <div class="director-actions director-actions--rewrite">
            <span class="swipe-instruction">No choice is forced into your story</span>
          </div>` : `
          <div class="director-actions">
            <button class="swipe-action swipe-action--skip" id="skip-shot" type="button" aria-label="Reject story move">
              ${icon("x")}
            </button>
            <span class="swipe-instruction">Reject or apply story move</span>
            <button class="swipe-action swipe-action--use" id="use-shot" type="button" aria-label="Apply story move">
              ${icon("check")}
            </button>
          </div>`}
      </div>
    </section>`;
}

function renderCandidateStack(beat, deck, candidateIndex, contextLabel) {
  return [2, 1, 0].map((depth) => {
    const index = Math.min(candidateIndex + depth, deck.length - 1);
    const candidate = deck[index];
    const active = depth === 0;

    return `
      <article
        class="candidate-card candidate-card--depth-${depth} ${active ? "is-entering" : ""}"
        ${active ? 'id="candidate-card"' : 'aria-hidden="true" inert'}
        data-depth="${depth}"
        aria-label="${active ? candidate.title : ""}"
      >
        <div class="candidate-media">
          ${candidateImage(candidate, active ? candidate.title : "", active)}
        </div>
        ${active ? `
          <span class="card-count">${candidateIndex + 1} / ${deck.length}</span>
          <span class="swipe-stamp swipe-stamp--skip" id="skip-stamp">Reject</span>
          <span class="swipe-stamp swipe-stamp--use" id="use-stamp">Apply</span>
          <div class="candidate-info">
            <span class="candidate-kicker">${ROLE_LABELS[candidate.role]} · ${contextLabel}</span>
            <h3>${candidate.title}</h3>
            <p class="candidate-change">${icon("aperture")} Auto camera · ${candidate.change}</p>
            <p class="candidate-dialogue">${candidate.dialogue}</p>
          </div>` : ""}
      </article>`;
  }).join("");
}

function renderRewritePanel() {
  return `
    <section class="rewrite-panel" aria-labelledby="rewrite-title">
      <span class="rewrite-icon">${icon("refresh-cw")}</span>
      <p class="candidate-kicker">All three rejected</p>
      <h3 id="rewrite-title">What should the next set do?</h3>
      <p>Choose one explicit direction. The confirmed Canon stays unchanged.</p>
      <div class="rewrite-options">
        <button type="button" data-rewrite="steady">${icon("route")} Follow the setup</button>
        <button type="button" data-rewrite="conflict">${icon("zap")} Raise the conflict</button>
        <button type="button" data-rewrite="twist">${icon("shuffle")} Make it stranger</button>
      </div>
    </section>`;
}

function renderStorySlots() {
  return PROJECT.beats.map((beat, index) => {
    const entry = state.canon[index];
    const current = index === state.activeStep;
    if (!entry) {
      return `
        <span class="story-slot ${index > state.canon.length ? "is-future" : ""}" aria-current="${current ? "step" : "false"}" aria-label="Shot ${index + 1}, not committed">
          <span class="story-slot-empty">${String(index + 1).padStart(2, "0")}</span>
        </span>`;
    }

    const candidate = candidateFromEntry(entry);
    return `
      <button class="story-slot" type="button" data-edit-story="${index}" aria-current="${current ? "step" : "false"}" aria-label="Rewrite story from shot ${index + 1}, ${candidate.title}">
        ${candidateImage(candidate, candidate.title, false, entry.cameraVariant)}
        <span class="story-number">${String(index + 1).padStart(2, "0")}</span>
      </button>`;
  }).join("");
}

function renderReview() {
  return `
    <section class="screen screen-enter" aria-labelledby="review-title">
      ${statusBar()}
      <header class="app-header">
        <button class="header-action" id="review-back" type="button" aria-label="Back to last shot">
          ${capcutIcon("nav-back")}
        </button>
        <h2>Storyboard</h2>
        <span></span>
      </header>

      <div class="review-scroll">
        <h1 class="review-title" id="review-title">Your Canon is ready.</h1>
        <p class="review-copy">${PROJECT.premise}</p>

        <div class="review-board">
          ${state.canon.map((entry, index) => {
            const candidate = candidateFromEntry(entry);
            return `
              <article class="review-shot" data-camera-variant="${entry.cameraVariant}">
                ${candidateImage(candidate, candidate.title, true, entry.cameraVariant)}
                <span>${String(index + 1).padStart(2, "0")}</span>
                <button class="camera-only" type="button" data-camera-shot="${index}" aria-label="Change camera only for shot ${index + 1}">
                  ${icon("aperture")}
                </button>
                <button class="replace-story" type="button" data-edit-story="${index}" aria-label="Rewrite story from shot ${index + 1}">
                  ${icon("replace")}
                </button>
              </article>`;
          }).join("")}
        </div>

        <p class="review-rule">${icon("git-branch")} Rewriting an event rebuilds everything after it. Camera changes do not.</p>

        <div class="review-settings">
          ${settingRow("palette", "Look", "Royal 3D fantasy", "Glossy material · dramatic light")}
          ${settingRow("audio-lines", "Voice", "Family secret", "Tense · theatrical")}
          ${settingRow("music-2", "Sound", "Clockwork suspense", "96 BPM · cinematic")}
          ${settingRow("git-branch", "Canon", `${state.canon.length} events`, "Every shot follows the confirmed story")}
          ${settingRow("rectangle-horizontal", "Format", state.ratio, `${state.duration}s`)}
        </div>

        <div class="generation-note">
          <span>Estimated 55 sec</span>
          <span>80 credits</span>
        </div>
      </div>

      <footer class="review-footer">
        <button class="primary-button" id="generate-video" type="button">
          ${icon("sparkles")} Generate video
        </button>
      </footer>
    </section>`;
}

function settingRow(iconName, label, value, detail) {
  return `
    <button class="setting-row" type="button" data-toast="${label} settings">
      ${icon(iconName)}
      <span>
        <strong>${label}</strong>
        <small>${detail}</small>
      </span>
      <span class="setting-value">${value} ${icon("chevron-right")}</span>
    </button>`;
}

function renderGenerating() {
  const first = selectedCandidate(0);
  const firstEntry = state.canon[0];
  return `
    <section class="screen screen--dark generate-screen screen-enter" aria-live="polite">
      ${statusBar()}
      <div class="generation-preview">
        ${candidateImage(first, first.title, true, firstEntry.cameraVariant)}
      </div>
      <div class="generation-progress">
        <h2>Generating your AI episode</h2>
        <p id="generation-label">Animating characters and camera · ${state.generationProgress}%</p>
        <div class="progress-track" aria-hidden="true"><i id="generation-bar" style="width:${state.generationProgress}%"></i></div>
      </div>
      <button class="background-button" id="continue-background" type="button">
        Continue in background
      </button>
    </section>`;
}

function renderResult() {
  const selected = state.canon.map((_, index) => selectedCandidate(index));
  return `
    <section class="screen screen--dark result-screen screen-enter" aria-labelledby="result-title">
      ${statusBar()}
      <header class="app-header">
        <button class="header-action" id="result-back" type="button" aria-label="Back to storyboard">
          ${capcutIcon("nav-back")}
        </button>
        <h2 id="result-title">${PROJECT.title}</h2>
        <button class="header-action" type="button" data-toast="More actions" aria-label="More actions">
          ${icon("ellipsis")}
        </button>
      </header>

      <button class="result-player ${state.resultPlaying ? "" : "is-paused"}" id="result-player" type="button" aria-label="${state.resultPlaying ? "Pause preview" : "Play preview"}">
        <div class="result-progress" aria-hidden="true">
          ${selected.map((_, index) => `
            <i class="${index < state.resultFrame ? "is-done" : index === state.resultFrame && state.resultPlaying ? "is-active" : ""}"></i>`).join("")}
        </div>
        ${selected.map((candidate, index) => `
          <div class="result-frame ${index === state.resultFrame ? "is-active" : ""}">
            ${candidateImage(candidate, candidate.title, true, state.canon[index].cameraVariant)}
          </div>`).join("")}
        <p class="result-caption">${selected[state.resultFrame].dialogue}</p>
        <span class="player-toggle">${icon("play")}</span>
      </button>

      <div class="result-actions">
        <button class="secondary-button" type="button" data-toast="Opening CapCut editor">
          ${icon("sliders-horizontal")} Edit
        </button>
        <button class="primary-button" type="button" data-toast="Export ready">
          ${icon("upload")} Export
        </button>
      </div>
    </section>`;
}

function bindCommon() {
  $$("[data-toast]").forEach((button) => {
    button.addEventListener("click", () => showToast(button.dataset.toast));
  });
}

function bindSetup() {
  $("#seed-input")?.addEventListener("input", (event) => {
    state.seed = event.target.value;
    saveState();
  });

  $$("[data-duration]").forEach((button) => {
    button.addEventListener("click", () => {
      state.duration = Number(button.dataset.duration);
      render();
    });
  });

  $("#make-brief")?.addEventListener("click", () => {
    state.setupMode = "brief";
    render();
    preloadDeck(0);
  });

  $("#brief-back")?.addEventListener("click", () => {
    state.setupMode = "input";
    render();
  });

  $("#start-directing")?.addEventListener("click", () => {
    state.view = "preparing";
    render();
  });
}

function startPreparing() {
  preloadDeck(0);
  transientTimer = window.setTimeout(() => {
    state.view = "director";
    render();
  }, reduceMotion.matches ? 250 : 1450);
}

function bindDirector() {
  $("#director-back")?.addEventListener("click", () => {
    state.view = "setup";
    state.setupMode = "brief";
    render();
  });

  $("#undo-action")?.addEventListener("click", undo);
  $("#skip-shot")?.addEventListener("click", () => dismissCard("left"));
  $("#use-shot")?.addEventListener("click", () => dismissCard("right"));

  $$("[data-edit-story]").forEach((button) => {
    button.addEventListener("click", () => {
      beginStoryRewrite(Number(button.dataset.editStory));
      render();
    });
  });

  $$("[data-rewrite]").forEach((button) => {
    button.addEventListener("click", () => {
      rewriteDeck(button.dataset.rewrite);
    });
  });

  const card = $("#candidate-card");
  if (card) bindCardGesture(card);
}

function bindCardGesture(card) {
  let startX = 0;
  let startY = 0;
  let startTime = 0;
  let previousX = 0;
  let previousTime = 0;
  let velocityX = 0;
  let deltaX = 0;
  let dragging = false;
  const backOne = $('[data-depth="1"]');
  const backTwo = $('[data-depth="2"]');

  card.addEventListener("pointerdown", (event) => {
    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    startTime = performance.now();
    previousTime = startTime;
    previousX = startX;
    velocityX = 0;
    deltaX = 0;
    card.setPointerCapture(event.pointerId);
    card.style.transition = "none";
  });

  card.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (Math.abs(deltaY) > Math.abs(deltaX) * 1.35) return;

    const now = performance.now();
    const elapsed = Math.max(1, now - previousTime);
    velocityX = (event.clientX - previousX) / elapsed;
    previousX = event.clientX;
    previousTime = now;

    const rotate = Math.max(-8, Math.min(8, deltaX / 24));
    card.style.transform = `translate3d(${deltaX}px, ${deltaY * 0.08}px, 0) rotate(${rotate}deg)`;

    const intensity = Math.min(1, Math.abs(deltaX) / 92);
    $("#skip-stamp").style.opacity = deltaX < 0 ? intensity : 0;
    $("#use-stamp").style.opacity = deltaX > 0 ? intensity : 0;
    if (backOne) {
      backOne.style.transform = `translate3d(0, ${12 - 12 * intensity}px, 0) scale(${0.965 + 0.035 * intensity})`;
    }
    if (backTwo) {
      backTwo.style.transform = `translate3d(0, ${24 - 12 * intensity}px, 0) scale(${0.93 + 0.035 * intensity})`;
    }
  });

  const finish = (event) => {
    if (!dragging) return;
    dragging = false;
    if (card.hasPointerCapture(event.pointerId)) card.releasePointerCapture(event.pointerId);

    const duration = Math.max(1, performance.now() - startTime);
    const averageVelocity = deltaX / duration;
    const committed = Math.abs(deltaX) >= 74 || Math.abs(velocityX) > 0.55 || Math.abs(averageVelocity) > 0.45;
    if (committed && Math.abs(deltaX) >= 24) {
      dismissCard(deltaX > 0 ? "right" : "left");
      return;
    }

    card.style.transition = "transform 260ms cubic-bezier(.22,1.35,.36,1)";
    card.style.transform = "";
    $("#skip-stamp").style.opacity = 0;
    $("#use-stamp").style.opacity = 0;
    if (backOne) backOne.style.transform = "";
    if (backTwo) backTwo.style.transform = "";
  };

  card.addEventListener("pointerup", finish);
  card.addEventListener("pointercancel", finish);
}

function dismissCard(direction, animate = true) {
  const card = $("#candidate-card");
  if (!card || swipeLocked) return;
  swipeLocked = true;
  if (animate && !reduceMotion.matches && card) {
    card.classList.remove("is-entering");
    card.classList.add(direction === "right" ? "is-exiting-right" : "is-exiting-left");
    transientTimer = window.setTimeout(() => applySwipe(direction), 180);
  } else {
    applySwipe(direction);
  }
}

function applySwipe(direction) {
  pushHistory();

  if (direction === "left") {
    state.deckIndexes[state.activeStep] += 1;
    render();
    return;
  }

  const step = state.activeStep;
  const deck = buildDeck(step);
  const candidate = deck[state.deckIndexes[step]];
  const oldCanonLength = state.canon.length;
  const entry = {
    step,
    candidateIndex: candidate.sourceIndex,
    cameraVariant: 0,
    route: candidate.route,
    role: candidate.role
  };

  state.canon = [...state.canon.slice(0, step), entry];
  state.rebuildNotice = state.editingIndex === null
    ? 0
    : Math.max(0, oldCanonLength - step - 1);
  state.editingIndex = null;
  state.activeStep = state.canon.length;
  resetDecksAfter(step);

  if (state.canon.length === PROJECT.beats.length) {
    state.view = "review";
  } else {
    preloadDeck(state.activeStep);
  }
  render();
}

function beginStoryRewrite(index) {
  state.activeStep = index;
  state.editingIndex = index;
  state.deckIndexes[index] = 0;
  state.rebuildNotice = Math.max(0, state.canon.length - index - 1);
}

function rewriteDeck(bias) {
  pushHistory();
  const step = state.activeStep;
  state.deckBiases[step] = bias;
  state.deckRevisions[step] += 1;
  state.deckIndexes[step] = 0;
  render();
}

function resetDecksAfter(step) {
  for (let index = step + 1; index < PROJECT.beats.length; index += 1) {
    state.deckIndexes[index] = 0;
    state.deckBiases[index] = "balanced";
    state.deckRevisions[index] = 0;
  }
}

function pushHistory() {
  state.history.push({
    view: state.view,
    activeStep: state.activeStep,
    canon: state.canon.map((entry) => ({ ...entry })),
    deckIndexes: [...state.deckIndexes],
    deckBiases: [...state.deckBiases],
    deckRevisions: [...state.deckRevisions],
    editingIndex: state.editingIndex,
    rebuildNotice: state.rebuildNotice
  });
  state.history = state.history.slice(-20);
}

function undo() {
  const previous = state.history.pop();
  if (!previous) return;
  Object.assign(state, previous);
  render();
}

function bindReview() {
  $("#review-back")?.addEventListener("click", () => {
    state.view = "director";
    beginStoryRewrite(PROJECT.beats.length - 1);
    render();
  });

  $$("[data-edit-story]").forEach((button) => {
    button.addEventListener("click", () => {
      beginStoryRewrite(Number(button.dataset.editStory));
      state.view = "director";
      render();
    });
  });

  $$("[data-camera-shot]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.cameraShot);
      pushHistory();
      state.canon[index].cameraVariant = (state.canon[index].cameraVariant + 1) % 3;
      const candidate = candidateFromEntry(state.canon[index]);
      const camera = cameraOptions(candidate)[state.canon[index].cameraVariant];
      render();
      showToast(`Shot ${index + 1} camera · ${camera}`);
    });
  });

  $("#generate-video")?.addEventListener("click", () => {
    state.view = "generating";
    state.generationProgress = 8;
    render();
  });
}

function startGeneration() {
  let progress = state.generationProgress || 8;
  generationTimer = window.setInterval(() => {
    progress = Math.min(100, progress + Math.round(7 + Math.random() * 13));
    state.generationProgress = progress;
    const bar = $("#generation-bar");
    const label = $("#generation-label");
    if (bar) bar.style.width = `${progress}%`;
    if (label) label.textContent = `Animating characters and camera · ${progress}%`;

    if (progress >= 100) {
      clearInterval(generationTimer);
      generationTimer = window.setTimeout(() => {
        state.view = "result";
        state.resultFrame = 0;
        state.resultPlaying = !reduceMotion.matches;
        render();
      }, reduceMotion.matches ? 100 : 450);
    }
  }, reduceMotion.matches ? 80 : 360);

  $("#continue-background")?.addEventListener("click", () => {
    showToast("Generation continues in Projects");
  });
}

function bindResult() {
  $("#result-back")?.addEventListener("click", () => {
    state.view = "review";
    state.resultPlaying = false;
    render();
  });

  $("#result-player")?.addEventListener("click", () => {
    state.resultPlaying = !state.resultPlaying;
    render();
  });

  startResultPlayback();
}

function startResultPlayback() {
  clearInterval(resultTimer);
  if (!state.resultPlaying || reduceMotion.matches) return;

  resultTimer = window.setInterval(() => {
    state.resultFrame = (state.resultFrame + 1) % state.canon.length;
    updateResultFrame();
  }, 2400);
}

function updateResultFrame() {
  $$(".result-frame").forEach((frame, index) => {
    frame.classList.toggle("is-active", index === state.resultFrame);
  });

  $$(".result-progress i").forEach((bar, index) => {
    bar.className = index < state.resultFrame
      ? "is-done"
      : index === state.resultFrame && state.resultPlaying
        ? "is-active"
        : "";
  });

  const caption = $(".result-caption");
  if (caption) caption.textContent = selectedCandidate(state.resultFrame).dialogue;
}

function selectedCandidate(shotIndex) {
  return candidateFromEntry(state.canon[shotIndex]);
}

function preloadDeck(step) {
  if (step >= PROJECT.beats.length) return;
  buildDeck(step).forEach((candidate) => {
    const image = new Image();
    image.src = candidate.image;
  });
}

function clearTransientTimers() {
  clearTimeout(transientTimer);
  clearInterval(generationTimer);
  clearInterval(resultTimer);
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

document.addEventListener("keydown", (event) => {
  if (state.view !== "director" || ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
  if (!$("#candidate-card")) return;
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    dismissCard("left", false);
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    dismissCard("right", false);
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
    event.preventDefault();
    undo();
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearInterval(resultTimer);
    return;
  }
  if (state.view === "result") startResultPlayback();
});

$("#reset-demo").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  state = initialState();
  render();
  showToast("Demo reset");
});

render();
