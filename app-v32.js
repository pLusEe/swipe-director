const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const STORAGE_KEY = "swipe-director-v36-single-workbench";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const SAMPLE_REFERENCE = "generated-keyframes/final/K1.jpg";

const PROJECT = {
  title: "异色甲宝宝",
  seed: "黑色甲油瓶父亲和粉色甲油瓶母亲发现，他们刚出生的异色宝宝带着失传的王室纹章。",
  premise: "一个新生宝宝身上的王室纹章，迫使这个家庭面对被隐瞒多年的身份。"
};

const STORY_BLUEPRINT = [
  {
    id: "crib-glow",
    title: "摇篮里出现异色光",
    alternateTitle: "宝宝的水晶瓶盖突然发亮",
    plot: "宝宝躺在婴儿床中央，黑色与粉色光芒第一次同时亮起。",
    alternatePlot: "育婴房灯光熄灭后，宝宝的黑粉瓶身成为房间里唯一的光源。",
    dialogue: "“它为什么会有两种颜色？”",
    image: "generated-keyframes/final/K1.jpg",
    shots: [
      { id: "01", title: "建立育婴房", objective: "交代父母、摇篮和宝宝的位置关系。", duration: 6, image: "generated-keyframes/final/K1.jpg" },
      { id: "02", title: "推近异色宝宝", objective: "镜头缓慢靠近宝宝发亮的瓶身。", duration: 5, image: "generated-keyframes/final/K1.jpg" }
    ]
  },
  {
    id: "mother-lifts",
    title: "母亲抱起宝宝确认",
    alternateTitle: "母亲第一次发现纹章轮廓",
    plot: "母亲从床边抱起宝宝，父亲仍站在原地，不敢靠近。",
    alternatePlot: "母亲托起宝宝检查水晶瓶盖，隐约看见一个陌生纹章。",
    dialogue: "“你是不是早就知道？”",
    image: "generated-keyframes/final/K2.jpg",
    shots: [
      { id: "03", title: "母亲伸手抱起", objective: "保持空间连续，展示动作起点。", duration: 6, image: "generated-keyframes/final/K2.jpg" },
      { id: "04", title: "父亲迟疑后退", objective: "用反应镜头暗示父亲知道秘密。", duration: 5, image: "generated-keyframes/final/K2.jpg" }
    ]
  },
  {
    id: "confrontation",
    title: "母亲当面质问父亲",
    alternateTitle: "父亲承认隐瞒了身份",
    plot: "母亲抱着宝宝转向父亲，父亲紧张抬手，却无法继续回避。",
    alternatePlot: "母亲逼问纹章来源，父亲承认自己一直在隐藏真正的家族身份。",
    dialogue: "“我只是想让你们远离那里。”",
    image: "generated-keyframes/final/K3.jpg",
    shots: [
      { id: "05", title: "对峙关系全景", objective: "同时看清母亲、宝宝和父亲的距离。", duration: 6, image: "generated-keyframes/final/K3.jpg" },
      { id: "06", title: "父亲紧张抬手", objective: "压近父亲的犹豫和防御动作。", duration: 5, image: "generated-keyframes/final/K3.jpg" },
      { id: "07", title: "宝宝瓶盖特写", objective: "把注意力落到水晶瓶盖里的纹章。", duration: 5, image: "generated-keyframes/final/K3.jpg" }
    ]
  },
  {
    id: "crest-reveal",
    title: "触碰唤醒王室纹章",
    alternateTitle: "黑粉光芒拼成完整王冠",
    plot: "父亲触碰宝宝的水晶瓶盖，黑粉双色在空中拼成失传纹章。",
    alternatePlot: "父亲的黑色光芒与宝宝的粉色光芒交汇，完整王冠在两人之间显现。",
    dialogue: "那是王室失踪多年的继承印记。",
    image: "generated-keyframes/final/K4.jpg",
    shots: [
      { id: "08", title: "父亲触碰瓶盖", objective: "展示动作与纹章出现的因果关系。", duration: 6, image: "generated-keyframes/final/K4.jpg" },
      { id: "09", title: "纹章完全亮起", objective: "固定构图，让揭晓信息清晰可读。", duration: 5, image: "generated-keyframes/final/K4.jpg" }
    ]
  },
  {
    id: "messenger-arrives",
    title: "金色使者来到门口",
    alternateTitle: "门外的人称宝宝为殿下",
    plot: "金色甲油瓶使者在门口低头行礼，父母同时回头。",
    alternatePlot: "门被推开，金色使者越过父母直接向宝宝行礼。",
    dialogue: "“殿下，该回家了。”",
    image: "generated-keyframes/final/K5.jpg",
    shots: [
      { id: "10", title: "门口出现异动", objective: "从家庭内部把注意力转向门口。", duration: 6, image: "generated-keyframes/final/K5.jpg" },
      { id: "11", title: "金色使者行礼", objective: "以低头动作确认来者的身份关系。", duration: 5, image: "generated-keyframes/final/K5.jpg" },
      { id: "12", title: "父母同时回头", objective: "用反应镜头承接使者的称呼。", duration: 6, image: "generated-keyframes/final/K5.jpg" }
    ]
  },
  {
    id: "family-choice",
    title: "一家人决定面对真相",
    alternateTitle: "父亲终于打开隐藏的门",
    plot: "父亲站到母亲和宝宝身边，决定跟随使者离开育婴房。",
    alternatePlot: "父亲不再躲避过去，亲手打开通往王室的隐藏门。",
    dialogue: "“这一次，我们一起去。”",
    image: "assets/shot-04-e.jpg",
    shots: [
      { id: "13", title: "一家人站到一起", objective: "重新组织三人的站位，确认共同选择。", duration: 7, image: "assets/shot-04-e.jpg" },
      { id: "14", title: "门缓缓打开", objective: "用门后的金色光线结束这一段故事。", duration: 7, image: "assets/shot-04-e.jpg" }
    ]
  },
  {
    id: "royal-corridor",
    title: "门后是陌生的王室长廊",
    alternateTitle: "宝宝第一次看见真正的家",
    plot: "一家人跟随使者穿过门，走进从未见过的金色长廊。",
    alternatePlot: "隐藏门完全打开，宝宝瓶盖里的纹章与长廊尽头同时亮起。",
    dialogue: "长廊尽头，所有灯依次亮了起来。",
    image: "assets/shot-04-f.jpg",
    shots: [
      { id: "15", title: "跟随使者离开", objective: "从背后跟拍一家人进入门内。", duration: 7, image: "assets/shot-04-f.jpg" },
      { id: "16", title: "王室长廊揭晓", objective: "用宽阔远景完成世界观扩展。", duration: 7, image: "assets/shot-04-d.jpg" }
    ]
  }
];

const ROUTES = {
  family: {
    name: "家族秘密",
    eyebrow: "Emotional mystery",
    summary: "父亲隐瞒的旧身份被宝宝意外揭开，冲突留在这个家庭内部。",
    image: "assets/shot-03-a.jpg",
    accent: "亲密 · 反转"
  },
  royal: {
    name: "王室继承人",
    eyebrow: "Fantasy reveal",
    summary: "宝宝的异色甲片拼出失传纹章，门外的金色使者前来迎接。",
    image: "assets/shot-04-e.jpg",
    accent: "宏大 · 揭晓"
  },
  escape: {
    name: "今夜逃亡",
    eyebrow: "Suspense chase",
    summary: "父母发现追兵将至，只能带着宝宝从隐藏密道离开。",
    image: "assets/shot-04-f.jpg",
    accent: "紧张 · 悬念"
  }
};

const STORY_OPTIONS = [
  {
    family: {
      title: "异色在摇篮中亮起",
      plot: "宝宝的甲片同时闪出黑色与粉色，父母当场愣住。",
      dialogue: "“这……为什么会有两种颜色？”",
      image: "assets/shot-01-a.jpg"
    },
    royal: {
      title: "镜中出现一顶王冠",
      plot: "母亲在镜子里看见宝宝戴着一顶并不存在的金色王冠。",
      dialogue: "镜子里的宝宝，忽然变成了金色。",
      image: "assets/shot-01-d.jpg"
    },
    escape: {
      title: "黑暗中只有宝宝发亮",
      plot: "灯光突然熄灭，异色宝宝成为房间里唯一的光源。",
      dialogue: "父母后退一步，宝宝却突然不哭了。",
      image: "assets/shot-01-f.jpg"
    }
  },
  {
    family: {
      title: "母亲第一次质问父亲",
      plot: "母亲抱起宝宝，追问父亲是否早就知道异色甲的秘密。",
      dialogue: "“你是不是早就知道会这样？”",
      image: "assets/shot-02-a.jpg"
    },
    royal: {
      title: "倒影不再属于宝宝",
      plot: "母亲抱宝宝照镜子，金色倒影却先一步转过头来。",
      dialogue: "“镜子里那是谁？”",
      image: "assets/shot-02-d.jpg"
    },
    escape: {
      title: "门外传来陌生脚步",
      plot: "母亲把宝宝藏进怀里，示意父亲不要发出声音。",
      dialogue: "“有人来了。别让他们看见宝宝。”",
      image: "assets/shot-02-b.jpg"
    }
  },
  {
    family: {
      title: "父亲承认真正的颜色",
      plot: "父亲承认自己曾是粉色甲，只是把真相藏了二十年。",
      dialogue: "“我把真正的颜色藏了二十年。”",
      image: "assets/shot-03-a.jpg"
    },
    royal: {
      title: "三只手拼出王室纹章",
      plot: "父亲触碰宝宝，两种颜色在三只手之间拼成失传纹章。",
      dialogue: "那是王室失踪多年的继承印记。",
      image: "assets/shot-03-c.jpg"
    },
    escape: {
      title: "父亲要求立刻离开",
      plot: "父亲拉上帘子，告诉母亲王室的人已经找到这里。",
      dialogue: "“他们会来找这个孩子。现在就走。”",
      image: "assets/shot-03-b.jpg"
    }
  },
  {
    family: {
      title: "被抹去的家族肖像",
      plot: "父亲拿出旧照片，照片里消失的人和宝宝拥有相同颜色。",
      dialogue: "“她是宝宝的祖母。”",
      image: "assets/shot-03-d.jpg"
    },
    royal: {
      title: "家谱早已写下宝宝的名字",
      plot: "床下密屉里的王室家谱，最后一行早已出现宝宝的名字。",
      dialogue: "墨迹很新，名字却像存在了很多年。",
      image: "assets/shot-03-e.jpg"
    },
    escape: {
      title: "墙后密道自行打开",
      plot: "宝宝指向墙壁，家中从未有人见过的密道突然开启。",
      dialogue: "门外脚步逼近，墙后亮起了出口。",
      image: "assets/shot-04-f.jpg"
    }
  },
  {
    family: {
      title: "门外站着另一个异色孩子",
      plot: "母亲打开门，来客竟和宝宝拥有一模一样的异色甲片。",
      dialogue: "“我终于找到你们了。”",
      image: "assets/shot-04-c.jpg"
    },
    royal: {
      title: "金色使者前来迎接",
      plot: "金色甲使者在门外低头行礼，称宝宝为失踪的殿下。",
      dialogue: "“殿下，该回家了。”",
      image: "assets/shot-04-e.jpg"
    },
    escape: {
      title: "追兵的影子停在门前",
      plot: "一家人进入密道，巨大影子在关闭的门外停下。",
      dialogue: "影子没有进来，只问：“孩子醒了吗？”",
      image: "assets/shot-04-d.jpg"
    }
  }
];

const TREATMENTS = [
  {
    name: "关系全景",
    camera: "广角全景 · 缓慢推进",
    intent: "先交代人物关系与空间，让剧情最容易读懂。",
    style: "object-position: 50% 50%; transform: scale(1)"
  },
  {
    name: "情绪近景",
    camera: "面部近景 · 浅景深拉焦",
    intent: "压近表情和材质，让这一刻更像角色的主观体验。",
    style: "object-position: 42% 48%; transform: scale(1.17)"
  },
  {
    name: "动态低角度",
    camera: "低机位 · 轻微环绕",
    intent: "改变观看力量关系，让揭晓更突然、更有压迫感。",
    style: "object-position: 62% 58%; transform: scale(1.1)"
  }
];

const DIRECTOR_SHOTS = [
  {
    id: "lift",
    title: "母亲抱起异色宝宝",
    objective: "从摇篮里的异色光，连续过渡到母亲抱起宝宝确认。",
    dialogue: "“它为什么会有两种颜色？”",
    startFrame: "generated-keyframes/final/K1.jpg",
    endFrame: "generated-keyframes/final/K2.jpg",
    video: "generated-video/shot-01.mp4",
    startKey: "K1",
    endKey: "K2",
    duration: 5,
    beatIndex: 1
  },
  {
    id: "confrontation",
    title: "母亲转身质问父亲",
    objective: "保持人物位置连续，把怀疑推进成正面对峙。",
    dialogue: "“你是不是早就知道？”",
    startFrame: "generated-keyframes/final/K2.jpg",
    endFrame: "generated-keyframes/final/K3.jpg",
    video: "generated-video/shot-02.mp4",
    startKey: "K2",
    endKey: "K3",
    duration: 5,
    beatIndex: 2
  },
  {
    id: "crest",
    title: "触碰唤醒王室纹章",
    objective: "由父亲抬手承接到瓶盖发光，清楚呈现纹章被唤醒的因果。",
    dialogue: "“我只是想让你们远离那里。”",
    startFrame: "generated-keyframes/final/K3.jpg",
    endFrame: "generated-keyframes/final/K4.jpg",
    video: "generated-video/shot-03.mp4",
    startKey: "K3",
    endKey: "K4",
    duration: 5,
    beatIndex: 3
  },
  {
    id: "messenger",
    title: "金色使者在门口行礼",
    objective: "从发亮的纹章切到门口来客，完成身份揭晓。",
    dialogue: "“殿下，该回家了。”",
    startFrame: "generated-keyframes/final/K4.jpg",
    endFrame: "generated-keyframes/final/K5.jpg",
    video: "generated-video/shot-04.mp4",
    startKey: "K4",
    endKey: "K5",
    duration: 5,
    beatIndex: 4
  },
  {
    id: "family-choice",
    title: "一家人决定共同离开",
    objective: "从使者行礼承接到一家人重新站到一起，确认共同面对王室。",
    dialogue: "“这一次，我们一起去。”",
    startFrame: "generated-keyframes/final/K5.jpg",
    endFrame: "assets/shot-04-e.jpg",
    video: "generated-video/shot-04.mp4",
    startKey: "K5",
    endKey: "K6",
    duration: 5,
    beatIndex: 4
  },
  {
    id: "royal-corridor",
    title: "隐藏门通向王室长廊",
    objective: "共享上一镜头尾帧，跟随一家人穿过门并揭开新的世界。",
    dialogue: "长廊尽头，所有灯依次亮了起来。",
    startFrame: "assets/shot-04-e.jpg",
    endFrame: "assets/shot-04-f.jpg",
    video: "generated-video/shot-04.mp4",
    startKey: "K6",
    endKey: "K7",
    duration: 5,
    beatIndex: 4
  },
  {
    id: "corridor-lights",
    title: "长廊灯光逐盏亮起",
    objective: "共享长廊入口关键帧，用连续亮起的灯光引导一家人向前。",
    dialogue: "长廊尽头，所有灯依次亮了起来。",
    startFrame: "assets/shot-04-f.jpg",
    endFrame: "assets/shot-04-d.jpg",
    video: "generated-video/shot-04.mp4",
    startKey: "K7",
    endKey: "K8",
    duration: 5,
    beatIndex: 4
  },
  {
    id: "family-record",
    title: "家谱显现宝宝的名字",
    objective: "从长廊全景推进到家谱细节，让身份揭晓落到可读证据。",
    dialogue: "墨迹很新，名字却像存在了很多年。",
    startFrame: "assets/shot-04-d.jpg",
    endFrame: "assets/shot-03-e.jpg",
    video: "generated-video/shot-03.mp4",
    startKey: "K8",
    endKey: "K9",
    duration: 5,
    beatIndex: 4
  },
  {
    id: "crest-response",
    title: "王冠回应宝宝的纹章",
    objective: "保持家谱位置连续，让纹章与王冠在同一动作中产生回应。",
    dialogue: "宝宝的瓶盖再次亮了起来。",
    startFrame: "assets/shot-03-e.jpg",
    endFrame: "assets/shot-03-c.jpg",
    video: "generated-video/shot-03.mp4",
    startKey: "K9",
    endKey: "K10",
    duration: 5,
    beatIndex: 4
  },
  {
    id: "royal-gathering",
    title: "王室成员在门后聚集",
    objective: "由王冠光芒拉回关系全景，交代等待宝宝的人群。",
    dialogue: "所有人同时向宝宝低下头。",
    startFrame: "assets/shot-03-c.jpg",
    endFrame: "assets/shot-04-b.jpg",
    video: "generated-video/shot-04.mp4",
    startKey: "K10",
    endKey: "K11",
    duration: 5,
    beatIndex: 4
  },
  {
    id: "other-child",
    title: "另一个异色孩子出现",
    objective: "承接人群视线，揭示宝宝并不是唯一的异色继承人。",
    dialogue: "“我终于等到你了。”",
    startFrame: "assets/shot-04-b.jpg",
    endFrame: "assets/shot-04-c.jpg",
    video: "generated-video/shot-04.mp4",
    startKey: "K11",
    endKey: "K12",
    duration: 5,
    beatIndex: 4
  },
  {
    id: "new-home",
    title: "宝宝走向新的家",
    objective: "共享相遇关键帧，以全景收束家庭选择和新的故事起点。",
    dialogue: "父母牵着宝宝，一起走进光里。",
    startFrame: "assets/shot-04-c.jpg",
    endFrame: "assets/shot-04-a.jpg",
    video: "generated-video/shot-04.mp4",
    startKey: "K12",
    endKey: "K13",
    duration: 5,
    beatIndex: 4
  }
];

const IMAGE_MODELS = [
  {
    id: "seedream-5-lite",
    name: "Seedream 5.0 Lite",
    provider: "ByteDance",
    summary: "Fast text-to-image and image editing",
    logo: "assets/capcut/model-seed-official.ico",
    resolutions: ["1K", "2K"]
  },
  {
    id: "nano-banana-2-lite",
    name: "Nano Banana 2 Lite",
    provider: "Google",
    summary: "Fast image generation and editing",
    logo: "assets/capcut/model-gemini-official.png",
    resolutions: ["1K", "2K"]
  },
  {
    id: "flux-2-klein-4b",
    name: "FLUX.2 Klein 4B",
    provider: "Black Forest Labs",
    summary: "Low-latency image generation",
    logo: "assets/capcut/model-bfl-official.png",
    resolutions: ["1K"]
  },
  {
    id: "seedream-5-pro",
    name: "Seedream 5.0 Pro",
    provider: "ByteDance",
    summary: "Higher-detail generation and editing",
    logo: "assets/capcut/model-seed-official.ico",
    resolutions: ["1K", "2K", "4K"],
    premium: true
  }
];

const initialState = () => ({
  view: "home",
  workspaceView: "setup",
  projectStarted: false,
  homePrompt: "",
  seed: "",
  referenceAttached: false,
  referenceRole: "subject",
  referencePreview: "",
  preferencesOpen: false,
  duration: 25,
  keyframeCount: 6,
  candidatesPerKeyframe: 4,
  generationType: "image",
  videoModel: "Seedance 2.0",
  model: "seedream-5-lite",
  ratio: "9:16",
  resolution: "2K",
  selectedRoute: "royal",
  beatCount: 5,
  storyPlan: [],
  shotPlan: [],
  keyframePlan: null,
  keyframeSelections: [],
  keyframeIndexes: [],
  activeKeyframe: 0,
  sequenceComposition: null,
  sequenceReplacement: null,
  sequenceTime: 0,
  sequenceToolsOpen: false,
  activeStep: 0,
  treatmentIndexes: [],
  selections: [],
  history: [],
  generationProgress: 0,
  resultFrame: 0,
  selectedClip: 0,
  resultPlaying: true,
  storySheetOpen: false
});

let state = restoreState();
let transientTimer = null;
let generationTimer = null;
let resultTimer = null;
let toastTimer = null;
let swipePending = false;

function restoreState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return initialState();
    const restored = { ...initialState(), ...saved, history: [] };
    if(restored.demoMediaVersion !== DEMO_MEDIA_VERSION){
      restored.candidatesPerKeyframe=4;
      restored.keyframeCount=6;
      restored.generationType="image";
    }
    restored.keyframePlan?.forEach((frame) => {
      if (frame.videoStatus === "generating") frame.videoStatus = "idle";
      frame.candidates?.forEach(candidate => {
        if (candidate.videoCard?.videoStatus === "generating") candidate.videoCard.videoStatus = "idle";
      });
    });
    const legacyModels = {
      "Seedance 2.5": "seedream-5-lite",
      "Seedance 2.0": "seedream-5-lite",
      "Seedance 2.0 Fast": "seedream-5-lite",
      "Seedance 2.0 Mini": "seedream-5-lite",
      "Seedance 1.5 Pro": "seedream-5-pro",
      "Seedance 1.0 Fast": "seedream-5-lite"
    };
    const parsedKeyframeCount = Number(saved.keyframeCount);
    const parsedLegacyShotCount = Number(saved.shotCount);
    restored.keyframeCount = Number.isFinite(parsedKeyframeCount)
      ? Math.max(2, Math.min(12, Math.round(parsedKeyframeCount)))
      : Number.isFinite(parsedLegacyShotCount)
        ? Math.max(2, Math.min(12, Math.round(parsedLegacyShotCount) + 1))
        : 6;
    delete restored.shotCount;
    restored.candidatesPerKeyframe = Math.max(1,Math.min(4,Math.round(Number(restored.candidatesPerKeyframe) || 3)));
    if (!["image","video"].includes(restored.generationType)) restored.generationType = "image";
    if (!["Seedance 2.0","Seedance 1.5 Pro"].includes(restored.videoModel)) restored.videoModel = "Seedance 2.0";
    restored.model = legacyModels[restored.model] || restored.model;
    if (!IMAGE_MODELS.some((model) => model.id === restored.model)) restored.model = "seedream-5-lite";
    if (!["1K", "2K", "4K"].includes(restored.resolution)) restored.resolution = "2K";
    const selectedModel = getImageModel(restored.model);
    if (!selectedModel.resolutions.includes(restored.resolution)) {
      restored.resolution = selectedModel.resolutions.includes("2K") ? "2K" : selectedModel.resolutions[0];
    }
    const restoredShotCount = shotCountFromKeyframes(restored.keyframeCount);
    restored.duration = restoredShotCount * 5;
    if (restored.referencePreview?.startsWith("data:")) restored.referencePreview = SAMPLE_REFERENCE;
    if (["routes", "storymap", "preparing", "review", "generating"].includes(restored.view)) {
      restored.view = restored.storyPlan.length ? "director" : "setup";
    }
    if (restored.storyPlan.length && restored.shotPlan.length !== restoredShotCount) {
      restored.shotPlan = createDirectorShots(restoredShotCount);
      restored.selections = restored.shotPlan.map(() => null);
      restored.treatmentIndexes = restored.shotPlan.map(() => 0);
      restored.activeStep = 0;
    }
    return restored;
  } catch {
    return initialState();
  }
}

function saveState() {
  const stable = {
    ...state,
    history: [],
    referencePreview: state.referencePreview?.startsWith("data:") ? SAMPLE_REFERENCE : state.referencePreview
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stable));
  } catch {
    // The prototype remains usable even when browser storage is unavailable.
  }
}

const ICON_PATHS = {
  "aperture": '<circle cx="12" cy="12" r="10"/><path d="m14.31 8 5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16 3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94"/>',
  "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  "battery-full": '<rect width="16" height="12" x="2" y="6" rx="2"/><path d="M22 10v4"/><path d="M6 10v4M10 10v4M14 10v4"/>',
  "check": '<path d="m20 6-11 11-5-5"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  "chevron-right": '<path d="m9 18 6-6-6-6"/>',
  "chevron-up": '<path d="m18 15-6-6-6 6"/>',
  "circle-check": '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  "ellipsis": '<circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/>',
  "image-plus": '<path d="M16 5h6M19 2v6"/><rect width="16" height="16" x="2" y="6" rx="2"/><circle cx="8" cy="12" r="2"/><path d="m22 17-3-3-5 5-3-3-5 5"/>',
  "list-tree": '<path d="M21 12h-8M21 6H8M21 18h-8M3 6v4c0 1.1.9 2 2 2h3M3 10v6c0 1.1.9 2 2 2h3"/>',
  "minus": '<path d="M5 12h14"/>',
  "pause": '<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/>',
  "pencil": '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  "play": '<polygon points="6 3 20 12 6 21 6 3" fill="currentColor" stroke="none"/>',
  "plus": '<path d="M5 12h14M12 5v14"/>',
  "rectangle-horizontal": '<rect width="20" height="12" x="2" y="6" rx="2"/>',
  "refresh-cw": '<path d="M21 12a9 9 0 0 1-15.1 6.6L3 16"/><path d="M3 21v-5h5M3 12A9 9 0 0 1 18.1 5.4L21 8"/><path d="M21 3v5h-5"/>',
  "route": '<circle cx="6" cy="19" r="3"/><path d="M9 19h4.5a3.5 3.5 0 0 0 0-7h-3a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  "shuffle": '<path d="m18 14 4 4-4 4M18 2l4 4-4 4M2 18h1.5A6.5 6.5 0 0 0 10 11.5v-1A6.5 6.5 0 0 1 16.5 4H22M2 6h1.5a6.5 6.5 0 0 1 5.1 2.5M15.4 15.5A6.5 6.5 0 0 0 16.5 18H22"/>',
  "signal": '<path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 4v16"/>',
  "sliders-horizontal": '<path d="M21 4H14M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3"/><path d="M14 2v4M8 10v4M16 18v4"/>',
  "sparkles": '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="M5 3v4M3 5h4M19 17v4M17 19h4"/>',
  "upload": '<path d="M12 3v12M17 8l-5-5-5 5"/><path d="M5 21h14a2 2 0 0 0 2-2v-4M3 15v4a2 2 0 0 0 2 2"/>',
  "user-round-check": '<path d="M2 21a8 8 0 0 1 13.3-6M16 19l2 2 4-4"/><circle cx="10" cy="7" r="4"/>',
  "wifi": '<path d="M5 13a10 10 0 0 1 14 0M8.5 16.5a5 5 0 0 1 7 0M2 9.5a15 15 0 0 1 20 0"/><circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/>',
  "x": '<path d="M18 6 6 18M6 6l12 12"/>'
};

function icon(name, label = "") {
  const aria = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${aria}>${ICON_PATHS[name] || ""}</svg>`;
}

function capcutIcon(name) {
  return `<img class="capcut-icon" src="assets/capcut/${name}.png" alt="">`;
}

function statusBar() {
  return `
    <div class="statusbar ios-statusbar" aria-hidden="true">
      <span>9:41</span>
      <span class="ios-island"></span>
      <span class="status-icons"><img src="assets/ios/signal.svg" alt=""><img src="assets/ios/wifi.svg" alt=""><img src="assets/ios/battery.svg" alt=""></span>
    </div>`;
}

function generatedImage(src, alt, eager = false, style = "") {
  return `
    <span class="image-skeleton" aria-hidden="true"></span>
    <img
      src="${src}"
      alt="${escapeHtml(alt)}"
      ${style ? `style="${style}"` : ""}
      ${eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'}
      onload="window.imageReady(this)"
      onerror="window.imageFailed(this)"
    >`;
}

window.imageReady = (image) => image.previousElementSibling?.remove();
window.imageFailed = (image) => {
  const skeleton = image.previousElementSibling;
  if (skeleton) {
    skeleton.classList.remove("image-skeleton");
    skeleton.textContent = "Preview unavailable";
  }
  image.remove();
};

function render() {
  const railScroll = $(".keyframe-rail")?.scrollLeft ?? state.keyframeRailScroll ?? 0;
  clearTransientTimers();
  swipePending = false;
  if (state.view !== "home") {
    state.projectStarted = true;
    state.workspaceView = state.view;
  }
  const views = {
    home: renderHome,
    setup: renderSetup,
    routes: renderRoutes,
    storymap: renderStoryMap,
    preparing: renderPreparing,
    director: renderDirector,
    sequence: renderShotSequence,
    review: renderReview,
    generating: renderGenerating,
    result: renderResult
  };
  $("#app").innerHTML = views[state.view]();
  const rail = $(".keyframe-rail");
  if (rail) {
    rail.scrollLeft = railScroll;
    state.keyframeRailScroll = rail.scrollLeft;
    rail.addEventListener("scroll", () => { state.keyframeRailScroll = rail.scrollLeft; }, { passive: true });
  }
  bindCommon();
  if (state.view === "home") bindHome();
  if (state.view === "setup") bindSetup();
  if (state.view === "routes") bindRoutes();
  if (state.view === "storymap") bindStoryMap();
  if (state.view === "preparing") startPreparing();
  if (state.view === "director") bindDirector();
  if (state.view === "sequence") bindShotSequence();
  if (state.view === "review") bindReview();
  if (state.view === "generating") startGeneration();
  if (state.view === "result") bindResult();
  saveState();
  window.swipeGuide?.update();
}

function renderHome() {
  return `
    <section class="screen lab-home screen-enter" aria-labelledby="lab-home-title">
      ${statusBar()}
      <div class="lab-topbar">
        <span></span>
        <button class="lab-history" type="button" data-toast="Generation history" aria-label="Generation history">
          ${capcutIcon("nav-history")}
        </button>
      </div>

      <div class="lab-scroll">
        <h1 id="lab-home-title">What are we creating<br>today?</h1>

        <section class="lab-inspiration" aria-label="Viral content inspiration">
          <div class="lab-inspiration-strip">
            <img class="lab-native-inspiration" src="assets/capcut/remix-viral-native.png" alt="CapCut recommendations: B.Duck, animated characters, snowboarding, brain freeze and LEGO airport">
          </div>
          <button type="button" data-toast="Viral remix opened">
            <span>Remix viral content</span>${icon("chevron-right")}
          </button>
        </section>

        <div class="lab-actions" aria-label="AI Lab tools">
          <button type="button" data-toast="Quick photo edit">
            <img src="assets/capcut/quick-photo.png" alt="">
            <span>Quick photo edit</span>
          </button>
          <button type="button" data-toast="AutoCut">
            <img src="assets/capcut/autocut.png" alt="">
            <span>AutoCut</span>
          </button>
          <button type="button" data-toast="Create AI video">
            <img src="assets/capcut/create-ai-video.png" alt="">
            <span>Create AI video</span>
          </button>
          <button class="lab-swipe-entry" id="start-swipe-director" type="button">
            <img src="assets/capcut/swipe-director-template.svg" alt="">
            <span class="lab-action-label">Swipe Director</span>
            <small>New</small>
          </button>
        </div>

      </div>

      <form class="lab-composer" id="lab-composer">
        <input id="lab-prompt" type="text" aria-label="Tell AI Lab what you want to create" placeholder="Tell me your idea" value="${escapeHtml(state.homePrompt)}" autocomplete="off">
        <div>
          <button type="button" data-toast="Add media" aria-label="Add media"><img src="assets/capcut/composer-add.png" alt=""></button>
          <button class="lab-video-action" type="button" data-toast="Add video" aria-label="Add video"><img src="assets/capcut/composer-video.png" alt=""></button>
          <button type="button" data-toast="Generation options" aria-label="Adjust options"><img src="assets/capcut/composer-tune.png" alt=""></button>
          <button type="button" data-toast="Mention someone" aria-label="Mention someone"><img src="assets/capcut/composer-at.png" alt=""></button>
          <span></span>
          <button type="button" data-toast="Voice input" aria-label="Voice input"><img src="assets/capcut/composer-mic.png" alt=""></button>
          <button type="submit" aria-label="Create from prompt"><img src="assets/capcut/composer-send.png" alt=""></button>
        </div>
      </form>

      <nav class="lab-tabbar" aria-label="CapCut primary navigation">
        ${labTab("tab-edit.png", "Edit")}
        ${labTab("tab-templates.png", "Templates")}
        ${labTab("tab-ai-lab.png", "AI Lab", true)}
        ${labTab("tab-projects.png", "Projects")}
        ${labTab("tab-me.png", "Me")}
      </nav>
    </section>`;
}

function renderActiveProject() {
  const selectedCount = state.selections.filter(Boolean).length;
  const detail = state.workspaceView === "director"
    ? `Choosing shot ${Math.min(state.activeStep + 1, state.shotPlan.length)} of ${state.shotPlan.length}`
    : state.workspaceView === "review"
      ? `${state.shotPlan.length}-shot storyboard ready`
      : state.workspaceView === "result"
        ? "Rough cut ready"
        : state.storyPlan.length
          ? `${state.storyPlan.length} beats · ${state.shotPlan.length} shots`
          : "Story idea saved";
  return `
    <section class="lab-active-project" aria-labelledby="active-project-title">
      <div class="lab-project-heading">
        <span>Continue creating</span>
        <small>${selectedCount ? `${selectedCount} shots chosen` : "Draft"}</small>
      </div>
      <button id="resume-project" type="button">
        <div class="lab-project-thumb">${generatedImage(state.storyPlan[0]?.image || SAMPLE_REFERENCE, PROJECT.title, true)}</div>
        <span>
          <strong id="active-project-title">${PROJECT.title}</strong>
          <small>${detail}</small>
        </span>
        ${icon("chevron-right")}
      </button>
    </section>`;
}

function labTab(asset, label, active = false) {
  return `
    <button type="button" class="${active ? "is-active" : ""}" ${active ? 'aria-current="page"' : `data-toast="${label}"`}>
      <img src="assets/capcut/${asset}" alt="">
      <span>${label}</span>
    </button>`;
}

function renderSetup() {
  const preview = state.referencePreview || SAMPLE_REFERENCE;
  const selectedModel = getImageModel(state.model);
  const keyframeProgress = ((state.keyframeCount - 2) / 10) * 100;
  const generatedShotCount = shotCountFromKeyframes(state.keyframeCount);
  const generatedShotLabel = `${generatedShotCount} ${generatedShotCount === 1 ? "shot" : "shots"}`;
  return `
    <section class="screen screen--dark setup-screen setup-screen--ai-video screen-enter" aria-labelledby="setup-title">
      ${statusBar()}
      <button class="ai-video-close" id="setup-back-home" type="button" aria-label="Exit Swipe Director">
        ${icon("x")}
      </button>
      <form class="ai-video-form" id="story-form">
        <div class="ai-video-scroll">
          <h1 class="ai-video-title" id="setup-title">
            <span class="ai-video-step-label">STEP 1</span>
            <span class="ai-video-title-line">Generate shots with</span>
            <span class="ai-video-product-label">Swipe Director</span>
          </h1>

          <section class="ai-video-composer" aria-label="Story shot prompt">
            <button class="ai-video-mode" type="button" data-toast="Shots" aria-label="Shot generation mode">
              AI video
              <span aria-hidden="true">${icon("chevron-up")}${icon("chevron-down")}</span>
            </button>
            <button class="ai-video-fill-example" id="fill-outsider-example" type="button">填入示例</button>

            ${state.referenceAttached ? `
              <div class="ai-video-reference">
                ${generatedImage(preview, "Uploaded story reference", true)}
                <button type="button" id="remove-reference" aria-label="Remove reference image">${icon("x")}</button>
              </div>` : `
              <label class="ai-video-add-reference" for="reference-input" aria-label="Add a character or style reference">
                ${icon("plus")}
              </label>`}

            <textarea
              id="seed-input"
              name="story"
              maxlength="4000"
              aria-label="Scene and shot descriptions"
              spellcheck="false"
              autocomplete="off"
              placeholder="Describe your scene and each shot"
            >${escapeHtml(state.seed)}</textarea>

            <div class="ai-video-composer-actions">
              <button class="ai-video-mention" type="button" data-toast="Reference a character or style" aria-label="Reference a character or style">@</button>
              <button class="ai-video-model-pill" type="button" data-toast="${selectedModel.name}" aria-label="Selected model ${selectedModel.name}">
                <span class="ai-video-model-marquee" aria-hidden="true">
                  ${renderSelectedModelMarquee(selectedModel)}
                </span>
              </button>
              <button class="ai-video-generate${state.seed.trim() ? "" : " is-empty"}" id="create-story-map" type="submit">
                <img class="ai-video-generate-icon" src="assets/capcut/generate-sparkles-source.png" alt=""> Generate
              </button>
            </div>
          </section>

          <section class="ai-video-settings" aria-label="Shot generation settings">
            <div class="ai-video-settings-scroll">
              <h2>Image model</h2>
              <p id="image-model-summary">${selectedModel.summary}</p>
              <div class="ai-video-model-strip" role="radiogroup" aria-label="Image model">
                ${IMAGE_MODELS.map((model) => `
                  <button type="button" data-model="${model.id}" role="radio" aria-checked="${state.model === model.id}" aria-label="${model.name}, ${model.provider}">
                    <span class="ai-video-model-tile">
                      ${renderImageModelMark(model)}
                      ${model.premium ? `<img class="ai-video-credit-icon" src="assets/capcut/ai-poster-credit.png" alt="">` : ""}
                    </span>
                    <strong>${model.name}</strong>
                  </button>`).join("")}
              </div>

              <label class="setup-video-toggle" for="generate-video-also">
                <span><strong>Auto-generate videos</strong><small>Create video previews for each shot</small></span>
                <input id="generate-video-also" type="checkbox" role="switch" aria-controls="setup-video-model" ${state.generationType === "video" ? "checked" : ""}>
              </label>
              <div id="setup-video-model" ${state.generationType === "video" ? "" : "hidden"}>
                <h2 class="ai-video-setting-title">Video model</h2>
                <div class="ai-video-model-strip" role="radiogroup" aria-label="Video model">
                  ${["Seedance 2.0","Seedance 1.5 Pro"].map(model=>`<button type="button" data-setup-video-model="${model}" role="radio" aria-checked="${state.videoModel === model}" aria-label="${model}"><span class="ai-video-model-tile"><span class="image-model-mark"><img src="assets/capcut/seedance-transparent.png" alt=""></span></span><strong>${model}</strong></button>`).join("")}
                </div>
              </div>

              <div class="ai-video-keyframes-control">
                <label for="keyframes-range">
                  <span>Shots</span>
                  <output id="keyframes-output" for="keyframes-range">${state.keyframeCount}</output>
                  <small id="derived-shot-count">Creates ${generatedShotLabel}</small>
                </label>
                <input id="keyframes-range" type="range" min="2" max="12" step="1" value="${state.keyframeCount}" style="--range-progress:${keyframeProgress}%" aria-label="Number of shots" aria-valuetext="${state.keyframeCount} shots">
                <div class="ai-video-keyframe-ticks" aria-hidden="true"><span>2</span><span>12</span></div>
              </div>

              <h2 class="ai-video-setting-title">Images per shot</h2>
              <div class="ai-video-setting-options setup-candidate-count" role="group" aria-label="Images per shot">
                ${[1,2,3,4].map(count=>`<button type="button" data-candidate-count="${count}" aria-pressed="${state.candidatesPerKeyframe === count}">${count}</button>`).join("")}
              </div>
              <p id="setup-generation-total">${setupGenerationTotal()}</p>

              <h2 class="ai-video-setting-title">Aspect ratio</h2>
              <div class="ai-video-setting-options ai-video-ratio-options" aria-label="Aspect ratio">
                ${["9:16", "1:1", "3:4", "16:9"].map((ratio) => `
                  <button type="button" data-ratio="${ratio}" aria-pressed="${state.ratio === ratio}">
                    <span class="ai-video-ratio-icon ai-video-ratio-icon--${ratio.replace(":", "-")}" aria-hidden="true"></span>
                    ${ratio}
                  </button>`).join("")}
              </div>

              <h2 class="ai-video-setting-title">Resolution</h2>
              <div class="ai-video-setting-options" aria-label="Resolution">
                ${["1K", "2K", "4K"].map((resolution) => `
                  <button type="button" data-resolution="${resolution}" aria-pressed="${state.resolution === resolution}" ${selectedModel.resolutions.includes(resolution) ? "" : "disabled"}>
                    ${resolution}
                    ${resolution === "4K" ? `<img src="assets/capcut/ai-poster-credit.png" alt="">` : ""}
                  </button>`).join("")}
              </div>
            </div>
          </section>

          <input class="visually-hidden" id="reference-input" type="file" accept="image/*">
        </div>
      </form>
    </section>`;
}

function renderRoutes() {
  return `
    <section class="screen screen-enter" aria-labelledby="routes-title">
      ${statusBar()}
      <header class="app-header">
        <button class="header-action" id="routes-back" type="button" aria-label="Back to story idea">${capcutIcon("nav-back")}</button>
        <h2>Story direction</h2>
        <span></span>
      </header>

      <div class="setup-scroll route-scroll">
        <p class="setup-kicker">Choose the plot first</p>
        <h1 class="v32-page-title" id="routes-title">Where should it go?</h1>
        <p class="v32-page-copy">Each direction is a complete story spine. Shots come later.</p>

        <div class="route-list" role="radiogroup" aria-label="Story directions">
          ${Object.entries(ROUTES).map(([id, route], index) => `
            <button class="route-option" type="button" data-route="${id}" role="radio" aria-checked="${state.selectedRoute === id}">
              <div class="route-image">${generatedImage(route.image, route.name, index === 0)}</div>
              <div class="route-copy">
                <span>${route.eyebrow}</span>
                <h3>${route.name}</h3>
                <p>${route.summary}</p>
                <small>${route.accent}</small>
              </div>
              <i class="route-radio" aria-hidden="true"></i>
            </button>`).join("")}
        </div>
      </div>

      <footer class="setup-footer">
        <button class="primary-button" id="review-story-map" type="button" ${state.selectedRoute ? "" : "disabled"}>
          Review story map ${icon("arrow-right")}
        </button>
      </footer>
    </section>`;
}

function renderStoryMap() {
  return `
    <section class="screen screen--dark screen--creator screen-enter" aria-labelledby="story-map-title">
      ${statusBar()}
      <header class="app-header creator-header">
        <button class="header-action" id="story-map-back" type="button" aria-label="Back to story input">${capcutIcon("nav-back")}</button>
        <h2>Story map</h2>
        <button class="header-action" id="regenerate-story-map" type="button" aria-label="Regenerate story map">${icon("refresh-cw")}</button>
      </header>

      <div class="creator-scroll story-map-scroll-v34">
        <div class="story-map-intro">
          <p class="creator-stage-label">STEP 1 · Edit story</p>
          <h1 id="story-map-title">${PROJECT.title}</h1>
          <p>${PROJECT.premise}</p>
        </div>

        <div class="story-map-summary">
          <span><b>${state.duration}s</b> duration</span>
          <span><b>${state.storyPlan.length}</b> beats</span>
          <span><b>${state.shotPlan.length}</b> shots</span>
        </div>

        <div class="beat-control beat-control-v34">
          <div>
            <strong>Story beats</strong>
            <small>Changing the plot rebuilds downstream shots</small>
          </div>
          <div class="stepper" aria-label="Number of story beats">
            <button type="button" id="remove-beat" aria-label="Remove one story beat" ${state.beatCount <= 5 ? "disabled" : ""}>${icon("minus")}</button>
            <output>${state.storyPlan.length}</output>
            <button type="button" id="add-beat" aria-label="Add one story beat" ${state.beatCount >= 7 ? "disabled" : ""}>${icon("plus")}</button>
          </div>
        </div>

        <ol class="story-map-list story-map-list-v34">
          ${state.storyPlan.map((beat, index) => `
            <li class="story-map-beat">
              <div class="story-map-image">${generatedImage(beat.image, beat.title, index < 2)}</div>
              <span class="story-map-index">${String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>${beat.title}</strong>
                <p>${beat.plot}</p>
                <small>${beat.shots.length} shots · ${beatDuration(index)}s</small>
              </div>
              <button type="button" data-change-beat="${index}" aria-label="Rewrite story beat ${index + 1}">${icon("shuffle")}</button>
            </li>`).join("")}
        </ol>
      </div>

      <footer class="creator-bottom-action">
        <button class="creator-primary-button" id="choose-story-shots" type="button">
          Choose shots ${icon("arrow-right")}
        </button>
      </footer>
    </section>`;
}

function renderPreparing() {
  return `
    <section class="screen screen--dark screen--creator loading-screen screen-enter" aria-live="polite">
      ${statusBar()}
      <div class="loading-mark" aria-hidden="true"></div>
      <div>
        <h2>Preparing ${state.shotPlan.length} shot cards</h2>
        <p>Your story is ready. Each card represents one continuous shot.</p>
      </div>
    </section>`;
}

function renderDirector() {
  return renderKeyframeDirector();
}

function renderLegacyDirector() {
  const shot = state.shotPlan[state.activeStep];
  const beat = state.storyPlan[shot.beatIndex];
  const treatmentIndex = state.treatmentIndexes[state.activeStep] || 0;
  return `
    <section class="screen screen--dark screen--creator director-screen director-workbench screen-enter" aria-labelledby="director-title">
      ${statusBar()}
      <header class="app-header creator-header director-header director-workbench-header">
        <button class="header-action" id="director-back" type="button" aria-label="Back to story input">${capcutIcon("nav-back")}</button>
        <h2 id="director-title">Swipe to choose your shots<span>STEP 2 · ${state.selections.filter(Boolean).length}/${state.shotPlan.length} chosen</span></h2>
        <button class="header-action" id="open-story-sheet" type="button" aria-label="Open story map" aria-expanded="${state.storySheetOpen}">${icon("list-tree")}</button>
      </header>

      <nav class="v32-story-rail v34-shot-rail director-shot-rail" aria-label="${state.selections.filter(Boolean).length} of ${state.shotPlan.length} shots chosen">
        ${renderStoryRail()}
      </nav>

      <div class="director-context director-context-v34 director-position">
        <span>${String(state.activeStep + 1).padStart(2, "0")} / ${String(state.shotPlan.length).padStart(2, "0")}</span>
        <strong>${beat.title}</strong>
        <p>${shot.startKey} → ${shot.endKey} · ${shot.duration}s</p>
      </div>

      <div class="director-body v32-director-body director-swipe-body">
        <div class="candidate-stage">
          ${renderTreatmentStack(shot, treatmentIndex)}
        </div>
        <div class="director-actions director-decision-actions">
          <button class="swipe-action swipe-action--undo" id="undo-action" type="button" aria-label="Undo last choice" ${state.history.length ? "" : "disabled"}>${icon("refresh-cw")}</button>
          <button class="swipe-action swipe-action--skip" id="next-treatment" type="button" aria-label="Reject this preview and show another">${icon("x")}</button>
          <span class="swipe-instruction" aria-hidden="true">${String(state.activeStep + 1).padStart(2, "0")} / ${String(state.shotPlan.length).padStart(2, "0")}</span>
          <button class="swipe-action swipe-action--use" id="use-treatment" type="button" aria-label="Use this preview">${icon("check")}</button>
        </div>
      </div>
      ${state.storySheetOpen ? renderDirectorStorySheet() : ""}
    </section>`;
}

function renderStoryRail() {
  const firstIncomplete = state.selections.findIndex((entry) => !entry);
  const latestAvailable = firstIncomplete === -1 ? state.shotPlan.length - 1 : firstIncomplete;
  return state.shotPlan.map((shot, index) => {
    const selected = state.selections[index];
    const current = index === state.activeStep;
    const unavailable = index > latestAvailable;
    return `
      <button class="v32-rail-item ${selected ? "is-selected" : ""} ${unavailable ? "is-unavailable" : ""}" type="button" data-edit-shot="${index}" aria-current="${current ? "step" : "false"}" aria-label="Shot ${index + 1}, ${shot.title}${selected ? ", chosen" : unavailable ? ", unavailable" : ", current"}" ${unavailable ? "disabled" : ""}>
        ${generatedImage(shot.endFrame, "", index < 2, selected ? TREATMENTS[selected.treatmentIndex].style : "")}
        <span>${String(index + 1).padStart(2, "0")}</span>
        <small>${shot.startKey} → ${shot.endKey}</small>
        ${selected ? `<i>${icon("check")}</i>` : ""}
      </button>`;
  }).join("");
}

function renderTreatmentStack(shot, treatmentIndex) {
  const index = treatmentIndex % TREATMENTS.length;
  const treatment = TREATMENTS[index];
  return `
      <article class="candidate-card candidate-card--depth-0 is-entering" id="candidate-card" data-depth="0" aria-label="${treatment.name} for ${shot.title}">
        <div class="candidate-media">
          ${!reduceMotion.matches ? `
            <video src="${shot.video}" poster="${shot.endFrame}" autoplay muted loop playsinline preload="metadata" aria-label="${escapeHtml(shot.title)} preview" style="${treatment.style}"></video>
          ` : generatedImage(shot.endFrame, shot.title, true, treatment.style)}
        </div>
        <span class="card-count">${index + 1} / ${TREATMENTS.length}</span>
        <span class="swipe-stamp swipe-stamp--skip" id="skip-stamp">Pass</span>
        <span class="swipe-stamp swipe-stamp--use" id="use-stamp">Use</span>
        <div class="candidate-info v32-candidate-info">
          <span class="candidate-kicker">Shot ${String(state.activeStep + 1).padStart(2, "0")} · ${shot.startKey} → ${shot.endKey} · ${shot.duration}s</span>
          <h3>${shot.title}</h3>
          <p class="candidate-change">${icon("aperture")} ${treatment.camera}</p>
          <p class="candidate-dialogue">${shot.dialogue}</p>
        </div>
      </article>`;
}

function renderDirectorStorySheet() {
  return `
    <button class="director-sheet-backdrop" id="close-story-sheet" type="button" aria-label="Close story map"></button>
    <section class="director-story-sheet" role="dialog" aria-modal="true" aria-labelledby="director-story-title">
      <div class="director-sheet-handle" aria-hidden="true"></div>
      <header>
        <div>
          <span>Story</span>
          <h3 id="director-story-title">${PROJECT.title}</h3>
        </div>
        <button id="close-story-sheet-button" type="button" aria-label="Close story map">${icon("x")}</button>
      </header>
      <ol>
        ${state.storyPlan.map((storyBeat, index) => `
          <li class="${index === beatIndexForStep(state.activeStep) ? "is-current" : ""}">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <div>
              <strong>${storyBeat.title}</strong>
              <p>${storyBeat.plot}</p>
            </div>
            <button type="button" data-rewrite-story-beat="${index}" aria-label="Regenerate story from beat ${index + 1}">${icon("shuffle")}</button>
          </li>`).join("")}
      </ol>
    </section>`;
}

function renderReview() {
  return `
    <section class="screen screen--dark screen--creator screen-enter" aria-labelledby="review-title">
      ${statusBar()}
      <header class="app-header creator-header">
        <button class="header-action" id="review-back" type="button" aria-label="Back to shot choices">${capcutIcon("nav-back")}</button>
        <h2>Storyboard</h2>
        <button class="header-action" id="edit-story-map" type="button" aria-label="Edit story map">${icon("list-tree")}</button>
      </header>

      <div class="review-scroll v32-review-scroll v34-review-scroll">
        <p class="creator-stage-label">STEP 2 · Continuity check</p>
        <h1 class="review-title" id="review-title">Storyboard ready.</h1>
        <p class="review-copy">${state.storyPlan.length} beats · ${state.shotPlan.length} shots · ${state.duration}s target</p>

        <div class="v32-review-board v34-review-board">
          ${state.shotPlan.map((shot, index) => {
            const selection = state.selections[index];
            const treatment = TREATMENTS[selection.treatmentIndex];
            return `
              <article class="v32-review-shot">
                <div class="v32-review-media">${generatedImage(shot.image, shot.title, true, treatment.style)}</div>
                <span>${String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>${shot.title}</strong>
                  <p>Beat ${shot.beatIndex + 1} · ${treatment.name} · ${shot.duration}s</p>
                </div>
                <button type="button" data-edit-review-shot="${index}" aria-label="Change shot ${index + 1}">${icon("aperture")}</button>
              </article>`;
          }).join("")}
        </div>

        <div class="continuity-note">
          <span>${icon("circle-check")}</span>
          <div>
            <strong>Continuity check</strong>
            <p>Characters and props stay consistent. Shot 04 may need its screen direction checked before generation.</p>
          </div>
        </div>

        <div class="review-settings">
          ${settingRow("route", "Story", `${state.storyPlan.length} beats`, `${state.shotPlan.length} generated shot briefs`)}
          ${settingRow("user-round-check", "Continuity", state.referenceAttached ? "Reference set" : "AI proposal", "Characters, props, and locations")}
          ${settingRow("rectangle-horizontal", "Format", state.ratio, `${state.duration}s rough cut`)}
        </div>

        <div class="generation-note"><span>Estimated 2–4 min</span><span>${state.duration === 60 ? "48" : state.duration === 90 ? "72" : "96"} credits</span></div>
      </div>

      <footer class="creator-bottom-action">
        <button class="creator-primary-button" id="generate-video" type="button">${icon("sparkles")} Generate rough cut</button>
      </footer>
    </section>`;
}

function settingRow(iconName, label, value, detail) {
  return `
    <button class="setting-row" type="button" data-toast="${label} settings">
      ${icon(iconName)}
      <span><strong>${label}</strong><small>${detail}</small></span>
      <span class="setting-value">${value} ${icon("chevron-right")}</span>
    </button>`;
}

function renderGenerating() {
  const shot = state.shotPlan[0];
  const treatment = TREATMENTS[state.selections[0].treatmentIndex];
  return `
    <section class="screen screen--dark screen--creator generate-screen screen-enter" aria-live="polite">
      ${statusBar()}
      <div class="generation-preview">${generatedImage(shot.image, shot.title, true, treatment.style)}</div>
      <div class="generation-progress">
        <span class="creator-stage-label">STEP 3</span>
        <h2>Generating ${state.shotPlan.length} video clips</h2>
        <p id="generation-label">Animating shots and building the timeline · ${state.generationProgress}%</p>
        <div class="progress-track" aria-hidden="true"><i id="generation-bar" style="width:${state.generationProgress}%"></i></div>
      </div>
    </section>`;
}

function renderResult() {
  const activeShot = state.shotPlan[state.resultFrame];
  return `
    <section class="screen screen--dark screen--creator result-screen result-workbench screen-enter" aria-labelledby="result-title">
      ${statusBar()}
      <header class="app-header creator-header result-workbench-header">
        <button class="header-action" id="result-back" type="button" aria-label="Back to shot choices">${capcutIcon("nav-back")}</button>
        <h2 id="result-title">${PROJECT.title}<span>${state.shotPlan.length} shots · ${state.duration}s video</span></h2>
        <button class="result-export" type="button" data-toast="Video saved to Projects">Export</button>
      </header>

      <div class="result-video-stage">
        <video id="result-video" src="generated-video/swipe-director-4-shot-test.mp4" poster="${activeShot.endFrame}" ${state.resultPlaying && !reduceMotion.matches ? "autoplay" : ""} muted playsinline preload="metadata" aria-label="Complete generated video"></video>
        <button class="result-player-toggle ${state.resultPlaying ? "is-playing" : ""}" id="result-player-toggle" type="button" aria-label="${state.resultPlaying ? "Pause video" : "Play video"}">${icon(state.resultPlaying ? "pause" : "play")}</button>
        <div class="result-scrubber" aria-hidden="true"><i id="result-scrubber-progress"></i></div>
      </div>

      <div class="result-timeline-heading">
        <strong>Shots</strong>
        <span id="result-timecode">00:00 / 00:20</span>
      </div>

      <div class="rough-cut-timeline result-thumbnail-timeline" aria-label="Generated clip timeline">
        ${state.shotPlan.map((shot, index) => `
          <button type="button" data-result-clip="${index}" aria-current="${index === state.resultFrame ? "true" : "false"}" aria-label="Clip ${index + 1}, ${shot.title}">
            ${generatedImage(shot.endFrame, "", true)}
            <span>${String(index + 1).padStart(2, "0")}</span>
            <small>${shot.duration}s</small>
          </button>`).join("")}
      </div>

      <div class="result-clip-context">
        <span>${String(state.resultFrame + 1).padStart(2, "0")}</span>
        <div>
          <strong id="result-clip-title">${activeShot.title}</strong>
          <small>${activeShot.startKey} → ${activeShot.endKey}</small>
        </div>
      </div>

      <div class="result-editor-tools" aria-label="Clip editing tools">
        <button type="button" data-toast="Replace clip">${icon("image-plus")}<span>Replace</span></button>
        <button type="button" data-toast="Adjust clip">${icon("sliders-horizontal")}<span>Adjust</span></button>
        <button id="regenerate-clip" type="button">${icon("refresh-cw")}<span>Regenerate</span></button>
      </div>
    </section>`;
}

function bindCommon() {
  $$("[data-toast]").forEach((button) => {
    button.addEventListener("click", () => showToast(button.dataset.toast));
  });
}

function bindHome() {
  $("#lab-prompt")?.addEventListener("input", (event) => {
    state.homePrompt = event.target.value;
    saveState();
  });

  $("#start-swipe-director")?.addEventListener("click", () => {
    beginNewProject();
    window.swipeGuide?.event("entered");
  });

  $("#lab-composer")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const prompt = $("#lab-prompt").value.trim();
    if (!prompt) {
      showToast("Enter an idea first");
      return;
    }
    beginNewProject(prompt);
  });

  $("#resume-project")?.addEventListener("click", () => {
    state.view = state.workspaceView || "setup";
    render();
  });
}

function beginNewProject(prompt = "") {
  const homePrompt = state.homePrompt;
  Object.assign(state, initialState(), {
    view: "setup",
    workspaceView: "setup",
    projectStarted: true,
    homePrompt,
    seed: prompt
  });
  render();
}

function bindSetup() {
  const resizeScenePrompt = () => {
    const input = $("#seed-input");
    if (!input) return;
    input.style.height = "0px";
    const height = Math.max(63, Math.min(84, input.scrollHeight));
    input.style.height = `${height}px`;
    input.closest(".ai-video-composer").style.setProperty("--scene-prompt-height", `${height}px`);
  };
  resizeScenePrompt();
  const updateGenerationSettings = () => {
    $("#setup-video-model").hidden = state.generationType !== "video";
    $("#setup-generation-total").textContent = setupGenerationTotal();
    saveState();
  };
  $("#generate-video-also").addEventListener("change",event=>{
    state.generationType = event.target.checked ? "video" : "image";
    updateGenerationSettings();
    if (event.target.checked) $("#setup-video-model").scrollIntoView({block:"nearest",behavior:"instant"});
  });
  $$("[data-candidate-count]").forEach(button=>button.addEventListener("click",()=>{
    state.candidatesPerKeyframe = Number(button.dataset.candidateCount);
    $$("[data-candidate-count]").forEach(option=>option.setAttribute("aria-pressed",String(option===button)));
    updateGenerationSettings();
  }));
  $$("[data-setup-video-model]").forEach(button=>button.addEventListener("click",()=>{
    state.videoModel = button.dataset.setupVideoModel;
    $$("[data-setup-video-model]").forEach(option=>option.setAttribute("aria-checked",String(option===button)));
    saveState();
  }));
  $("#setup-back-home")?.addEventListener("click", () => {
    state.workspaceView = "setup";
    state.view = "home";
    render();
  });

  $("#seed-input")?.addEventListener("input", (event) => {
    state.seed = event.target.value;
    resizeScenePrompt();
    const generateButton = $("#create-story-map");
    const isEmpty = !state.seed.trim();
    generateButton?.classList.toggle("is-empty", isEmpty);
    saveState();
  });
  $("#fill-outsider-example")?.addEventListener("click", () => {
    const scenes = [
      OUTSIDER_IMAGE_PROMPTS[0][0],
      OUTSIDER_IMAGE_PROMPTS[1][0],
      OUTSIDER_IMAGE_PROMPTS[2][0],
      OUTSIDER_IMAGE_PROMPTS[3][0],
      "海边礁石旁，两名男子在正午烈日下对峙。突出人物动作、手部细节与刺眼反光，白沙、深色岩壁和蓝海保持连续，气氛紧张而克制。写实油画，厚涂笔触，1:1 构图。",
      "延续海滩对峙场景，聚焦冲突后的凝滞瞬间与人物反应。保持黑色短卷发男子的浅灰米色短袖衬衫、海边礁石、白沙和正午硬光一致。疏离而压抑的写实油画，厚涂笔触，1:1 构图。"
    ];
    state.seed = "《局外人》海滩场景。统一采用低饱和写实油画、厚涂笔触与刺眼正午硬光。主角为黑色短卷发、面容瘦削的成年男子，穿浅灰米色短袖衬衫与浅色长裤；保持跨镜头角色和环境一致。为每个镜头提供四种构图候选。\n\n" +
      scenes.map((scene, index) => `Shot ${index + 1}: ${scene}`).join("\n\n");
    state.keyframeCount = 6;
    state.candidatesPerKeyframe = 4;
    state.ratio = "1:1";
    state.generationType = "image";
    render();
    window.swipeGuide?.event("example");
  });

  $("#seed-input")?.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      $("#story-form")?.requestSubmit();
    }
  });

  $("#reference-input")?.addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      state.referenceAttached = true;
      state.referencePreview = reader.result;
      render();
    });
    reader.readAsDataURL(file);
  });

  $("#remove-reference")?.addEventListener("click", () => {
    state.referenceAttached = false;
    state.referencePreview = "";
    render();
  });

  $$("[data-reference-role]").forEach((button) => {
    button.addEventListener("click", () => {
      state.referenceRole = button.dataset.referenceRole;
      render();
    });
  });

  $("#toggle-preferences")?.addEventListener("click", () => {
    state.preferencesOpen = !state.preferencesOpen;
    render();
  });

  $("#close-preferences")?.addEventListener("click", () => {
    state.preferencesOpen = false;
    render();
  });

  $$("[data-model]").forEach((button) => {
    button.addEventListener("click", () => {
      state.model = button.dataset.model;
      const selectedModel = getImageModel(state.model);
      if (!selectedModel.resolutions.includes(state.resolution)) {
        state.resolution = selectedModel.resolutions.includes("2K") ? "2K" : selectedModel.resolutions[0];
      }
      $$("[data-model]").forEach((option) => {
        option.setAttribute("aria-checked", String(option === button));
      });
      const modelPill = $(".ai-video-model-pill");
      const modelMarquee = $(".ai-video-model-marquee");
      const modelSummary = $("#image-model-summary");
      if (modelPill) modelPill.setAttribute("aria-label", `Selected model ${selectedModel.name}`);
      if (modelMarquee) modelMarquee.innerHTML = renderSelectedModelMarquee(selectedModel);
      if (modelSummary) modelSummary.textContent = selectedModel.summary;
      $$("[data-resolution]").forEach((option) => {
        const supported = selectedModel.resolutions.includes(option.dataset.resolution);
        option.disabled = !supported;
        option.setAttribute("aria-pressed", String(option.dataset.resolution === state.resolution));
      });
      saveState();
    });
  });

  $("#keyframes-range")?.addEventListener("input", (event) => {
    const range = event.currentTarget;
    state.keyframeCount = Number(range.value);
    const generatedShotCount = shotCountFromKeyframes(state.keyframeCount);
    const generatedShotLabel = `${generatedShotCount} ${generatedShotCount === 1 ? "shot" : "shots"}`;
    state.duration = generatedShotCount * 5;
    range.style.setProperty("--range-progress", `${((state.keyframeCount - 2) / 10) * 100}%`);
    range.setAttribute("aria-valuetext", `${state.keyframeCount} shots`);
    const output = $("#keyframes-output");
    const derivedShotCount = $("#derived-shot-count");
    if (output) output.value = String(state.keyframeCount);
    if (derivedShotCount) derivedShotCount.textContent = `Creates ${generatedShotLabel}`;
    $("#setup-generation-total").textContent = setupGenerationTotal();
    saveState();
  });

  $$("[data-ratio]").forEach((button) => {
    button.addEventListener("click", () => {
      state.ratio = button.dataset.ratio;
      $$("[data-ratio]").forEach((option) => {
        option.setAttribute("aria-pressed", String(option === button));
      });
      saveState();
    });
  });

  $$("[data-resolution]").forEach((button) => {
    button.addEventListener("click", () => {
      state.resolution = button.dataset.resolution;
      $$("[data-resolution]").forEach((option) => {
        option.setAttribute("aria-pressed", String(option === button));
      });
      saveState();
    });
  });

  $("#story-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    if ($("#keyframe-loading")) return;
    if (!state.seed.trim()) {
      $("#seed-input")?.focus();
      showToast("Describe your scene and shots first");
      return;
    }
    state.storyPlan = buildStoryPlan(5);
    state.shotPlan = buildDirectorShots();
    state.keyframePlan = null;
    keyframeFace = "front";
    state.selections = state.shotPlan.map(() => null);
    state.treatmentIndexes = state.shotPlan.map(() => 0);
    state.activeStep = 0;
    state.history = [];
    showKeyframeLoading();
  });
}

let capcutLoaderId = 0;
function capcutLoadingMark() {
  // Original CapCut lv_loading.json path, rendered inline so the first toast
  // cannot be empty while an external SVG is still being fetched.
  const mask = `capcut-loading-mask-${++capcutLoaderId}`;
  return `<svg class="capcut-loading-mark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 44" aria-hidden="true"><defs><clipPath id="${mask}"><path d="M -30.974 -80.755 C -30.974 -80.755 -30.974 -30.88 -30.974 -30.88 C -30.974 -30.88 29.318 -30.88 29.318 -30.88 C 29.318 -30.88 29.318 -40.739 29.318 -40.739 C 29.318 -40.739 -0.604 -55.63 -0.604 -55.63 C -0.604 -55.63 29.288 -70.559 29.288 -70.559 C 29.288 -70.559 29.318 -80.755 29.318 -80.755 C 29.318 -80.755 -30.974 -80.755 -30.974 -80.755 Z"/></clipPath></defs><g transform="translate(28.724 77.755)" clip-path="url(#${mask})"><g transform="translate(.068 .058) scale(.9)"><path class="capcut-loading-stroke" d="M 32.719 -81.438 C 32.719 -81.438 -28.125 -51.438 -28.125 -51.438 C -28.125 -51.438 -28.095 -49.37 -28.122 -48.012 C -28.192 -44.432 -26.006 -42.371 -23.188 -42.313 C -17.256 -42.192 -1.317 -41.933 10.313 -42.063 C 13.808 -42.102 16.232 -44.631 16.239 -48.121 C 16.245 -51.12 16 -76.047 16 -76.047 C 16 -76.047 16.307 -81.557 10.5 -81.984 C 4.375 -82 -23.734 -82 -23.734 -82 C -23.734 -82 -28.529 -81.308 -28.461 -76.719 C -28.409 -73.21 -28.375 -72.875 -28.375 -72.875 C -28.375 -72.875 32.812 -42.469 32.812 -42.469 C 32.812 -42.469 32.719 -81.438 32.719 -81.438 Z" fill="none" stroke="rgb(85,190,176)" stroke-width="5" pathLength="100" stroke-dasharray="86 14" stroke-dashoffset="-14"/></g></g></svg>`;
}

async function showKeyframeLoading() {
  const setup = $(".setup-screen");
  const overlay = document.createElement("div");
  overlay.id = "keyframe-loading";
  overlay.className = "keyframe-loading";
  overlay.setAttribute("role", "status");
  overlay.setAttribute("aria-label", state.generationType === "video" ? "Preparing images and videos" : "Preparing shots");
  overlay.innerHTML = `<div class="keyframe-loading-tile">${capcutLoadingMark()}</div><span class="frame-sr-only">${state.generationType === "video" ? "Preparing images and videos…" : "Preparing shots…"}</span>`;
  setup.append(overlay);
  $("#story-form").inert = true;
  $("#create-story-map").disabled = true;
  const media = DEMO_SHOTS.slice(0, state.keyframeCount).flatMap(shot => shot.candidates.slice(0,state.candidatesPerKeyframe).map(candidate => candidate.source));
  const preload = Promise.all(media.map(source => new Promise(resolve => {
    const image = new Image();
    image.onload = image.onerror = resolve;
    image.src = source;
  })));
  await Promise.all([
    new Promise(resolve => setTimeout(resolve, 950)),
    Promise.race([preload, new Promise(resolve => setTimeout(resolve, 5000))])
  ]);
  if (state.generationType === "video" && DEMO_HAS_VIDEO) {
    const videos = await Promise.allSettled(media.map(source=>fetch(pairedShotVideoSource(source)).then(response=>{
      if (!response.ok) throw new Error("Video preview unavailable");
      return response.blob();
    }).then(blob=>shotDemoClips.set(pairedShotVideoSource(source),Promise.resolve(URL.createObjectURL(blob))))));
    if (videos.some(result=>result.status === "rejected")) {
      overlay.remove();
      $("#story-form").inert = false;
      $("#create-story-map").disabled = false;
      showToast("Video previews could not load. Try again.");
      return;
    }
  }
  if (!overlay.isConnected || state.view !== "setup") return;
  state.keyframeRailScroll = 0;
  state.view = "director";
  render();
}

function bindRoutes() {
  $("#routes-back")?.addEventListener("click", () => {
    state.view = "setup";
    render();
  });

  $$("[data-route]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedRoute = button.dataset.route;
      state.storyPlan = buildStoryPlan(state.selectedRoute, state.beatCount);
      render();
    });
  });

  $("#review-story-map")?.addEventListener("click", () => {
    if (!state.storyPlan.length) state.storyPlan = buildStoryPlan(state.selectedRoute, state.beatCount);
    state.view = "storymap";
    render();
  });
}

function bindStoryMap() {
  const goSetup = () => {
    state.view = "setup";
    render();
  };
  $("#story-map-back")?.addEventListener("click", goSetup);

  $("#regenerate-story-map")?.addEventListener("click", () => {
    state.storyPlan = buildStoryPlan(state.beatCount, true);
    state.shotPlan = flattenShots(state.storyPlan);
    state.selections = [];
    state.treatmentIndexes = [];
    render();
    showToast("Story map regenerated");
  });

  $("#remove-beat")?.addEventListener("click", () => updateBeatCount(-1));
  $("#add-beat")?.addEventListener("click", () => updateBeatCount(1));

  $$("[data-change-beat]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.changeBeat);
      const beat = state.storyPlan[index];
      const useAlternate = !beat.useAlternate;
      state.storyPlan[index] = {
        ...beat,
        useAlternate,
        title: useAlternate ? beat.alternateTitle : STORY_BLUEPRINT[index].title,
        plot: useAlternate ? beat.alternatePlot : STORY_BLUEPRINT[index].plot
      };
      state.shotPlan = flattenShots(state.storyPlan);
      state.selections = [];
      state.treatmentIndexes = [];
      render();
    });
  });

  $("#choose-story-shots")?.addEventListener("click", () => {
    state.activeStep = 0;
    state.treatmentIndexes = state.shotPlan.map(() => 0);
    state.selections = state.shotPlan.map(() => null);
    state.history = [];
    state.view = "preparing";
    render();
  });
}

function startPreparing() {
  state.shotPlan.forEach((shot) => {
    const image = new Image();
    image.src = shot.image;
  });
  transientTimer = window.setTimeout(() => {
    state.view = "director";
    render();
  }, reduceMotion.matches ? 150 : 900);
}

function bindDirector() {
  $("#director-back")?.addEventListener("click", () => {
    state.view = "setup";
    render();
  });
  $("#open-story-sheet")?.addEventListener("click", () => {
    state.storySheetOpen = true;
    render();
    requestAnimationFrame(() => $("#close-story-sheet-button")?.focus());
  });
  const closeStorySheet = () => {
    state.storySheetOpen = false;
    render();
    requestAnimationFrame(() => $("#open-story-sheet")?.focus());
  };
  $("#close-story-sheet")?.addEventListener("click", closeStorySheet);
  $("#close-story-sheet-button")?.addEventListener("click", closeStorySheet);
  $$("[data-rewrite-story-beat]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.rewriteStoryBeat);
      const beat = state.storyPlan[index];
      const useAlternate = !beat.useAlternate;
      state.storyPlan[index] = {
        ...beat,
        useAlternate,
        title: useAlternate ? beat.alternateTitle : STORY_BLUEPRINT[index].title,
        plot: useAlternate ? beat.alternatePlot : STORY_BLUEPRINT[index].plot
      };
      const resetFrom = Math.max(0, index - 1);
      state.selections = state.selections.map((entry, shotIndex) => shotIndex < resetFrom ? entry : null);
      state.treatmentIndexes = state.treatmentIndexes.map((entry, shotIndex) => shotIndex < resetFrom ? entry : 0);
      state.activeStep = resetFrom;
      state.storySheetOpen = false;
      state.history = [];
      resetKeyframesFromStory(index);
      render();
      showToast(`Story rebuilt from beat ${index + 1}`);
    });
  });
  bindKeyframeDirector();
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
    velocityX = (event.clientX - previousX) / Math.max(1, now - previousTime);
    previousX = event.clientX;
    previousTime = now;
    const rotate = Math.max(-8, Math.min(8, deltaX / 24));
    card.style.transform = `translate3d(${deltaX}px, ${deltaY * 0.08}px, 0) rotate(${rotate}deg)`;
    const intensity = Math.min(1, Math.abs(deltaX) / 92);
    $("#skip-stamp").style.opacity = deltaX < 0 ? intensity : 0;
    $("#use-stamp").style.opacity = deltaX > 0 ? intensity : 0;
    if (backOne) backOne.style.transform = `translate3d(0, ${12 - 12 * intensity}px, 0) scale(${0.965 + 0.035 * intensity})`;
    if (backTwo) backTwo.style.transform = `translate3d(0, ${24 - 12 * intensity}px, 0) scale(${0.93 + 0.035 * intensity})`;
  });

  const finish = (event) => {
    if (!dragging) return;
    dragging = false;
    if (card.hasPointerCapture(event.pointerId)) card.releasePointerCapture(event.pointerId);
    const averageVelocity = deltaX / Math.max(1, performance.now() - startTime);
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
  if (!card || swipePending) return;
  swipePending = true;
  if (animate && !reduceMotion.matches) {
    card.classList.remove("is-entering");
    card.classList.add(direction === "right" ? "is-exiting-right" : "is-exiting-left");
    transientTimer = window.setTimeout(() => applySwipe(direction), 180);
  } else {
    applySwipe(direction);
  }
}

function applySwipe(direction) {
  pushHistory();
  const step = state.activeStep;
  if (direction === "left") {
    state.treatmentIndexes[step] = ((state.treatmentIndexes[step] || 0) + 1) % TREATMENTS.length;
    render();
    return;
  }

  state.selections[step] = { treatmentIndex: state.treatmentIndexes[step] || 0 };
  const nextIncomplete = state.selections.findIndex((entry, index) => index > step && !entry);
  if (nextIncomplete >= 0) {
    state.activeStep = nextIncomplete;
    render();
    return;
  }
  const firstIncomplete = state.selections.findIndex((entry) => !entry);
  if (firstIncomplete >= 0) {
    state.activeStep = firstIncomplete;
    render();
    return;
  }
  state.view = "generating";
  state.generationProgress = 8;
  render();
}

function pushHistory() {
  state.history.push({
    view: state.view,
    activeStep: state.activeStep,
    treatmentIndexes: [...state.treatmentIndexes],
    selections: state.selections.map((entry) => entry ? { ...entry } : null)
  });
  state.history = state.history.slice(-20);
}

function undo() {
  const previous = state.history.pop();
  if (!previous) return;
  const remainingHistory = state.history;
  Object.assign(state, previous);
  state.history = remainingHistory;
  render();
}

function bindReview() {
  const editShot = (index) => {
    state.activeStep = index;
    state.view = "director";
    render();
  };
  $("#review-back")?.addEventListener("click", () => editShot(state.shotPlan.length - 1));
  $$("[data-edit-review-shot]").forEach((button) => {
    button.addEventListener("click", () => editShot(Number(button.dataset.editReviewShot)));
  });
  $("#edit-story-map")?.addEventListener("click", () => {
    state.view = "storymap";
    render();
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
    progress = Math.min(100, progress + Math.round(8 + Math.random() * 14));
    state.generationProgress = progress;
    const bar = $("#generation-bar");
    const label = $("#generation-label");
    if (bar) bar.style.width = `${progress}%`;
    if (label) label.textContent = `Animating clips and building the timeline · ${progress}%`;
    if (progress >= 100) {
      clearInterval(generationTimer);
      generationTimer = window.setTimeout(() => {
        state.view = "result";
        state.resultFrame = 0;
        state.resultPlaying = !reduceMotion.matches;
        render();
      }, reduceMotion.matches ? 100 : 350);
    }
  }, reduceMotion.matches ? 70 : 300);
}

function bindResult() {
  const video = $("#result-video");
  const toggle = $("#result-player-toggle");
  $("#result-back")?.addEventListener("click", () => {
    state.view = "director";
    state.activeStep = state.shotPlan.length - 1;
    state.resultPlaying = false;
    render();
  });
  toggle?.addEventListener("click", async () => {
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
        state.resultPlaying = true;
      } catch {
        state.resultPlaying = false;
      }
    } else {
      video.pause();
      state.resultPlaying = false;
    }
    toggle.setAttribute("aria-label", state.resultPlaying ? "Pause video" : "Play video");
    toggle.innerHTML = icon(state.resultPlaying ? "pause" : "play");
    toggle.classList.toggle("is-playing", state.resultPlaying);
  });
  $$("[data-result-clip]").forEach((button) => {
    button.addEventListener("click", () => {
      state.resultFrame = Number(button.dataset.resultClip);
      state.selectedClip = state.resultFrame;
      if (video) video.currentTime = state.resultFrame * 5;
      updateResultFrame(video);
    });
  });
  $("#regenerate-clip")?.addEventListener("click", () => {
    state.selectedClip = state.resultFrame;
    showToast(`Regenerating clip ${state.resultFrame + 1}`);
  });
  video?.addEventListener("timeupdate", () => {
    state.resultFrame = Math.min(state.shotPlan.length - 1, Math.floor(video.currentTime / 5));
    updateResultFrame(video);
  });
  video?.addEventListener("play", () => {
    state.resultPlaying = true;
    toggle?.classList.add("is-playing");
    if (toggle) toggle.innerHTML = icon("pause");
  });
  video?.addEventListener("pause", () => {
    state.resultPlaying = false;
    toggle?.classList.remove("is-playing");
    if (toggle) toggle.innerHTML = icon("play");
  });
  updateResultFrame(video);
}

function startResultPlayback() {
  $("#result-video")?.play().catch(() => {});
}

function updateResultFrame(video = $("#result-video")) {
  $$("[data-result-clip]").forEach((button, index) => {
    button.setAttribute("aria-current", index === state.resultFrame ? "true" : "false");
  });
  const shot = state.shotPlan[state.resultFrame];
  const title = $("#result-clip-title");
  const index = $(".result-clip-context > span");
  if (title && shot) title.textContent = shot.title;
  if (index) index.textContent = String(state.resultFrame + 1).padStart(2, "0");
  if (!video) return;
  const duration = Number.isFinite(video.duration) ? video.duration : 20;
  const progress = $("#result-scrubber-progress");
  const timecode = $("#result-timecode");
  if (progress) progress.style.width = `${Math.min(100, (video.currentTime / duration) * 100)}%`;
  if (timecode) timecode.textContent = `${formatTime(video.currentTime)} / ${formatTime(duration)}`;
}

function formatTime(seconds) {
  const total = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function buildStoryPlan(count = state.beatCount, alternate = false) {
  return STORY_BLUEPRINT.slice(0, count).map((beat) => ({
    ...beat,
    title: alternate ? beat.alternateTitle : beat.title,
    plot: alternate ? beat.alternatePlot : beat.plot,
    useAlternate: alternate,
    shots: beat.shots.map((shot) => ({ ...shot }))
  }));
}

function getImageModel(id) {
  return IMAGE_MODELS.find((model) => model.id === id) || IMAGE_MODELS[0];
}

function renderImageModelMark(model) {
  return `<span class="image-model-mark" aria-hidden="true"><img src="${model.logo}" alt=""></span>`;
}

function renderSelectedModelMarquee(model) {
  const group = `
    <span class="ai-video-model-marquee-group">
      ${renderImageModelMark(model)}
      <span>${model.name}</span>
    </span>`;
  return `<span class="ai-video-model-marquee-track">${group}${group}</span>`;
}

function createDirectorShots(count) {
  return DIRECTOR_SHOTS.slice(0, Math.max(1, Math.min(11, Number(count) || 5))).map((shot) => ({
    ...shot,
    image: shot.endFrame,
    duration: 5
  }));
}

function shotCountFromKeyframes(count) {
  return Math.max(2, Math.min(12, Math.round(Number(count) || 6)));
}

function setupGenerationTotal() {
  const total = state.keyframeCount * state.candidatesPerKeyframe;
  return `${total} ${total === 1 ? "image" : "images"}${state.generationType === "video" ? ` + ${total} videos` : ""} · choose 1 per shot`;
}

function buildDirectorShots() {
  const shots = createDirectorShots(shotCountFromKeyframes(state.keyframeCount));
  state.duration = shots.length * 5;
  return shots;
}

function beatIndexForStep(step) {
  return state.shotPlan[step]?.beatIndex ?? 0;
}

function flattenShots(plan) {
  const shots = plan.flatMap((beat, beatIndex) =>
    beat.shots.map((shot) => ({ ...shot, beatId: beat.id, beatIndex }))
  );
  if (!shots.length) return [];

  const rawTotal = shots.reduce((total, shot) => total + shot.duration, 0);
  const scaled = shots.map((shot) => ({
    ...shot,
    duration: Math.max(3, Math.round((shot.duration / rawTotal) * state.duration))
  }));
  let difference = state.duration - scaled.reduce((total, shot) => total + shot.duration, 0);
  let index = 0;
  while (difference !== 0) {
    const direction = difference > 0 ? 1 : -1;
    const shot = scaled[index % scaled.length];
    if (direction > 0 || shot.duration > 3) {
      shot.duration += direction;
      difference -= direction;
    }
    index += 1;
  }
  return scaled;
}

function updateBeatCount(delta) {
  state.beatCount = Math.max(5, Math.min(7, state.beatCount + delta));
  state.storyPlan = buildStoryPlan(state.beatCount);
  state.shotPlan = flattenShots(state.storyPlan);
  state.selections = [];
  state.treatmentIndexes = [];
  render();
}

function beatDuration(index) {
  return state.shotPlan
    .filter((shot) => shot.beatIndex === index)
    .reduce((total, shot) => total + shot.duration, 0);
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
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

document.addEventListener("keydown", (event) => {
  if (state.view !== "director" || ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
  if (handleKeyframeKey(event)) return;
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
  } else if (state.view === "result") {
    startResultPlayback();
  }
});

$("#reset-demo").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  state = initialState();
  window.swipeGuide?.event("reset");
  render();
  showToast("Demo reset");
});

render();
