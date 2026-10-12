/* The desktop guide follows completed product actions; it never generates or
   confirms media on the user's behalf. */
window.swipeGuide = (() => {
  const steps = [
    ["entry", "打开 Swipe Director", "从入口开始制作。", "点击 Swipe Director"],
    ["example", "填入示例", "先用一组示例镜头跑通流程。", "点击「填入示例」"],
    ["generate", "生成图片", "保持默认参数即可。", "点击 Generate"],
    ["browse", "浏览候选", "左右滑动，比较同一 Shot 的不同画面。", "左右滑动图片", "horizontal"],
    ["add", "新增候选", "没有满意的，滑到最后再新增一张。", "滑到最后，再向左滑一次", "horizontal", true],
    ["addGenerate", "生成新候选", "改一下提示词，再生成一张。", "调整提示词 → Generate image", null, true],
    ["choose", "确认图片", "选中喜欢的画面，进入下一个 Shot。", "向上滑动图片", "up"],
    ["video", "生成视频", "把当前图片翻到视频生成面。", "点击 Go generate video"],
    ["videoGenerate", "提交视频", "默认设置即可生成。", "点击 Generate video"],
    ["flip", "翻面查看", "点击画面，在图片和视频之间切换。", "点击视频 → 点击图片"],
    ["retouch", "局部编辑", "只修改画面中的一小块区域。", "回到图片 → 点击 Edit area", null, true],
    ["retouchClose", "完成局部编辑", "涂出区域，生成后关闭面板。", "涂抹区域 → Generate → 关闭", null, true],
    ["complete", "填满镜头", "把剩余 Shot 都确认好。", "向上滑确认剩余镜头", "up"],
    ["play", "播放预览", "检查整段视频的衔接。", "点击播放"],
    ["timing", "调整时长", "需要时再微调节奏。", "Edit → 选择片段 → Duration", null, true],
    ["export", "导出视频", "完成后导出第一段视频。", "点击 Export"]
  ];
  const panel = document.getElementById("swipe-guide");
  const device = document.querySelector(".device");
  const prototypeStage = document.querySelector(".prototype-stage");
  const focus = document.createElement("div");
  focus.className = "guide-focus";
  focus.setAttribute("aria-hidden", "true");
  device.append(focus);
  const gestureCoach = document.createElement("div");
  gestureCoach.className = "guide-gesture-coach";
  gestureCoach.setAttribute("aria-hidden", "true");
  gestureCoach.innerHTML = '<span class="guide-gesture-coach-icon"></span><span class="guide-gesture-coach-label"></span>';
  prototypeStage.append(gestureCoach);
  let step = 0, initialized = false, enabled = true, frontSeen = false;
  let lastContent = "", pulseTimer, pendingPulse = false, exportStatus = "";
  const id = () => steps[step]?.[0];
  const gesture = () => id() === "complete" && allChosen() ? null : steps[step]?.[4] || null;
  const set = name => {
    const next = steps.findIndex(item => item[0] === name);
    if (next >= 0) step = next;
    exportStatus = "";
    update();
  };
  const current = () => typeof state !== "undefined" ? state : null;
  const frame = () => current()?.keyframePlan?.[current().activeKeyframe || 0];
  function minStepForCurrentView() {
    const s = current();
    if (!s || s.view === "home") return 0;
    if (s.view === "setup") return s.seed?.trim() ? 2 : 1;
    if (s.view === "director") return 3;
    if (s.view === "sequence") return 13;
    return 0;
  }
  function canGoBack() {
    return enabled && exportStatus !== "done" && step > minStepForCurrentView();
  }
  function target() {
    const item = frame();
    const selectors = {
      entry: "#start-swipe-director", example: "#fill-outsider-example", generate: "#create-story-map",
      browse: "#flip-card", add: item?.addCandidateOpen ? "#focus-more-prompt" : "#flip-card",
      addGenerate: "#more-candidate-form [type=submit]", choose: "#flip-card",
      video: "#go-generate-video", videoGenerate: "#shot-video-form [type=submit]",
      flip: item?.face === "back" ? ".shot-video-stage" : "#flip-card",
      retouch: item?.face === "back" ? ".shot-video-stage" : "#open-retouch",
      retouchClose: "#close-retouch",
      complete: allChosen() ? "#preview-sequence" : item?.face === "back" ? ".shot-video-stage" : "#flip-card",
      play: "#sequence-play",
      timing: document.querySelector(".sequence-dialog:not(.sequence-native-export)") ? ".sequence-dialog [type=submit]" :
        current()?.sequenceToolsOpen
          ? '[data-sequence-panel="timing"]' : "#sequence-edit",
      export: "#sequence-export"
    };
    return document.querySelector(selectors[id()] || "#sequence-export");
  }
  function allChosen() {
    const s = current();
    return s?.keyframePlan?.length && s.keyframeSelections?.filter(Boolean).length === s.keyframePlan.length;
  }
  function drawFocus() {
    const element = enabled && exportStatus !== "busy" && exportStatus !== "done" ? target() : null;
    if (!element || !element.getClientRects().length || element.closest("[inert]")) {
      focus.hidden = true;
      gestureCoach.hidden = true;
      return;
    }
    const entering = element.closest(".screen-enter");
    if (entering?.getAnimations().some(animation => animation.playState === "running")) {
      focus.hidden = true;
      gestureCoach.hidden = true;
      return;
    }
    const r = element.getBoundingClientRect(), d = device.getBoundingClientRect();
    const innerTop = r.top - d.top - device.clientTop;
    const innerLeft = r.left - d.left - device.clientLeft;
    const top = Math.max(3, innerTop - 4), left = Math.max(3, innerLeft - 4);
    const right = Math.min(device.clientWidth - 3, innerLeft + r.width + 4);
    const bottom = Math.min(device.clientHeight - 3, innerTop + r.height + 4);
    focus.hidden = r.bottom <= d.top || r.top >= d.bottom;
    const gestureType = gesture();
    focus.classList.toggle("is-click", !gestureType);
    focus.classList.toggle("is-gesture", Boolean(gestureType));
    Object.assign(focus.style, { top: `${top}px`, left: `${left}px`,
      width: `${Math.max(0, right - left)}px`,
      height: `${Math.max(0, bottom - top)}px`,
      borderRadius: ["browse", "add", "choose", "flip", "complete"].includes(id()) ? "14px" : "10px" });
    drawGestureCoach(gestureType, r);
    if (pendingPulse) {
      pendingPulse = false;
      if (gestureType) replayGestureCoach();
      else {
        focus.classList.remove("is-breathing");
        void focus.offsetWidth;
        focus.classList.add("is-breathing");
        clearTimeout(pulseTimer);
        pulseTimer = setTimeout(() => focus.classList.remove("is-breathing"), 1650);
      }
    }
  }
  function drawGestureCoach(type, targetRect) {
    const deviceRect = device.getBoundingClientRect();
    if (!type || focus.hidden || deviceRect.left < 132 || innerWidth <= 760) {
      gestureCoach.hidden = true;
      return;
    }
    gestureCoach.hidden = false;
    gestureCoach.classList.toggle("is-horizontal", type === "horizontal");
    gestureCoach.classList.toggle("is-up", type === "up");
    gestureCoach.querySelector(".guide-gesture-coach-icon").textContent = type === "horizontal" ? "↔" : "↑";
    gestureCoach.querySelector(".guide-gesture-coach-label").textContent = type === "horizontal" ? "左右滑动" : "向上滑动";
    const top = Math.max(12, Math.min(innerHeight - 52, targetRect.top + targetRect.height / 2 - 22));
    Object.assign(gestureCoach.style, {
      left: `${deviceRect.left - 122}px`,
      top: `${top}px`
    });
  }
  function replayGestureCoach() {
    gestureCoach.classList.remove("is-replaying");
    void gestureCoach.offsetWidth;
    gestureCoach.classList.add("is-replaying");
    clearTimeout(pulseTimer);
    pulseTimer = setTimeout(() => gestureCoach.classList.remove("is-replaying"), 1200);
  }
  function isAllowedClick(clicked, expected) {
    if (expected === clicked || expected.contains(clicked)) return true;
    const allowedByStep = {
      addGenerate: "#more-candidate-form",
      videoGenerate: "#shot-video-form",
      retouchClose: ".shot-retouch-panel",
      timing: ".sequence-dialog",
      complete: "[data-keyframe],#flip-card,.shot-video-stage,#preview-sequence"
    };
    return Boolean(allowedByStep[id()] && clicked.closest(allowedByStep[id()]));
  }
  function update() {
    if (!panel) return;
    const s = current();
    if (!initialized && s) {
      initialized = true;
      if (s.view === "setup") step = s.seed?.trim() ? 2 : 1;
      else if (s.view === "director") step = allChosen() ? 12 : 3;
      else if (s.view === "sequence") step = 13;
    }
    // Recover when users go back or reach a later screen through normal actions.
    if (s?.view === "home" && step !== 0) step = 0;
    if (s?.view === "setup" && step > 2) step = s.seed?.trim() ? 2 : 1;
    if (s?.view === "director" && step < 3) step = 3;
    if (s?.view === "sequence" && step < 13) step = 13;
    if (id() === "add" && frame()?.addCandidateOpen) step = 5;
    const item = steps[step], chosen = s?.keyframeSelections?.filter(Boolean).length || 0;
    const complete = exportStatus === "done";
    const gesture = item[4] === "horizontal" ? '<span class="guide-gesture" aria-hidden="true">← <i></i> →</span>' :
      item[4] === "up" ? '<span class="guide-gesture is-up" aria-hidden="true">↑ <i></i></span>' : "";
    const headingStart = canGoBack()
      ? `<button class="guide-back" type="button" data-guide="back"><span aria-hidden="true">←</span><span>上一步</span></button>`
      : `<span>指南</span>`;
    const content = !enabled ? `<div class="guide-heading"><span>指南</span><button type="button" data-guide="resume">继续</button></div><h2>自由探索</h2><p class="guide-description">需要时再打开引导。</p>` :
      `<div class="guide-heading"><div class="guide-heading-main">${headingStart}</div><button type="button" data-guide="pause">收起</button></div>
       <div class="guide-progress"><span>${complete ? "完成" : `${step + 1} / ${steps.length}`}</span></div>
       <div class="guide-progress-track" aria-hidden="true"><i style="width:${complete ? 100 : step / steps.length * 100}%"></i></div>
       <h2>${complete ? "已完成" : item[1]}</h2>
       <p class="guide-description">${complete ? "可以继续探索，或重新走一遍。" : item[2]}</p>
       ${complete ? "" : `<div class="guide-action">${id() === "complete" && allChosen() ? "" : gesture}<span>${exportStatus === "busy" ? "正在导出，请等待下载…" : id() === "complete" && allChosen() ? "点击右上角 Next" : item[3]}</span></div>`}
       ${id() === "complete" && !complete ? `<p class="guide-count">${chosen} / ${s?.keyframePlan?.length || 6} 个镜头已确认${allChosen() ? " · 可以点击 Next" : ""}</p>` : ""}
       <div class="guide-footer"><button type="button" data-guide="restart">重新开始</button>
       ${!complete ? `<button type="button" data-guide="locate">提示位置</button>` : ""}
       ${item[5] && !complete ? `<button type="button" data-guide="skip">${id() === "timing" ? "直接导出" : "跳过这一步"}</button>` : ""}</div>`;
    if (content !== lastContent) {
      panel.innerHTML = content;
      lastContent = content;
    }
    requestAnimationFrame(drawFocus);
  }
  function event(name, detail) {
    if (!enabled) return;
    if (name === "reset") {
      step = 0; frontSeen = false; exportStatus = ""; initialized = true;
      update();
      return;
    }
    const transitions = { entered: ["entry", "example"], example: ["example", "generate"],
      generated: ["generate", "browse"], browsed: ["browse", "add"],
      added: ["addGenerate", "choose"], chosen: ["choose", "video"],
      videoOpened: ["video", "videoGenerate"], videoReady: ["videoGenerate", "flip"],
      retouchOpened: ["retouch", "retouchClose"], retouchClosed: ["retouchClose", "complete"],
      played: ["play", "timing"], timingSaved: ["timing", "export"] };
    const transition = transitions[name];
    if (transition && id() === transition[0]) set(transition[1]);
    if (name === "face" && id() === "flip") {
      if (detail === "front") frontSeen = true;
      if (detail === "back" && frontSeen) set("retouch");
    }
    if (name === "face") setTimeout(drawFocus, 300);
    if (name === "exportStart") { set("export"); exportStatus = "busy"; }
    if (name === "exportDone") exportStatus = "done";
    if (name === "exportCancelled") exportStatus = "";
    update();
  }
  panel?.addEventListener("click", e => {
    const action = e.target.closest("[data-guide]")?.dataset.guide;
    if (action === "pause") enabled = false;
    if (action === "resume") enabled = true;
    if (action === "back" && canGoBack()) {
      exportStatus = "";
      step = Math.max(minStepForCurrentView(), step - 1);
    }
    if (action === "locate") {
      target()?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
      pendingPulse = true;
    }
    if (action === "restart") {
      enabled = true;
      document.getElementById("reset-demo").click();
    }
    if (action === "skip") {
      if (id() === "add" || id() === "addGenerate") {
        if (frame()?.addCandidateOpen) { frame().addCandidateOpen = false; render(); }
        set("choose");
      } else if (id() === "retouch") set("complete");
      else if (id() === "retouchClose") document.getElementById("close-retouch")?.click();
      else if (id() === "timing") set("export");
    }
    update();
  });
  document.addEventListener("click", e => {
    if (!enabled || !device.contains(e.target)) return;
    const expected = target();
    if (!expected || isAllowedClick(e.target, expected)) return;
    pendingPulse = true;
    requestAnimationFrame(drawFocus);
  }, true);
  document.addEventListener("scroll", drawFocus, true);
  device.addEventListener("animationend", event => {
    if (event.animationName === "screen-enter") requestAnimationFrame(drawFocus);
  });
  window.addEventListener("resize", drawFocus);
  return { update, event };
})();
