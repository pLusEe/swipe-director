/* Keyframe review and non-destructive edits. No image-edit backend is configured. */
let keyframeFace = "front";
let keyframeTool = "prompt";
let keyframeImportPending = false;

function ensureKeyframeState() {
  if (state.keyframePlan?.length === state.keyframeCount && state.demoMediaVersion === DEMO_MEDIA_VERSION) {
    state.keyframePlan.forEach((frame) => {
      frame.candidates.forEach(candidate=>{
        const demoCandidate=DEMO_SHOTS.flatMap(shot=>shot.candidates).find(item=>item.source===candidate.source);
        if(demoCandidate && /用户提供的图片/.test(candidate.prompt) && !/用户提供的图片/.test(demoCandidate.prompt)){
          candidate.prompt=demoCandidate.prompt;
          if(candidate.draft && /用户提供的图片/.test(candidate.draft))candidate.draft=null;
        }
      });
      if(frame.morePrompt && /用户提供的图片/.test(frame.morePrompt)){
        frame.morePrompt=frame.candidates[state.keyframeIndexes[state.keyframePlan.indexOf(frame)] || 0].prompt;
      }
      frame.videoPrompt ??= "缓慢推进镜头，保持主体外观，人物自然运动，环境光线连续。";
      frame.face ??= frame.video ? "back" : "front";
    });
    if (state.shotStudioVersion !== 1) {
      state.shotStudioVersion = 1;
      syncKeyframeShots();
    }
    keyframeFace = state.keyframePlan[state.activeKeyframe || 0].face;
    return;
  }
  const shots = state.shotPlan;
  if (!shots.length) return;
  state.keyframePlan = Array.from({ length: state.keyframeCount }, (_, index) => {
    const shot = shots[Math.max(0, index - 1)];
    const beat = state.storyPlan[index] || state.storyPlan.at(-1);
    const demo = DEMO_SHOTS[index % DEMO_SHOTS.length];
    const image = demo.candidates[0].source;
    const plannedPrompt = keyframePromptForIndex(index);
    const title = plannedPrompt ? plannedPrompt.slice(0, 40) : demo.title;
    return {
      id: `K${index + 1}`, title, image, face: "front", directVideo:false, videoPrompt: `${demo.description} 镜头缓慢推进，主体自然运动，保持外观一致。`, video: null, videoStatus: "idle",
      candidates: demo.candidates.slice(0,state.candidatesPerKeyframe || 3).map((candidate, candidateIndex) => ({
        id: `K${index + 1}-${candidateIndex}`,
        source: demo.candidates[candidateIndex].source,
        style: "object-position:50% 50%;transform:none",
        prompt: plannedPrompt || demo.candidates[candidateIndex].prompt,
        draft: null,
        change: "",
        mode: "replace",
        strokes: [],
        brushSize: 24,
        adjustment: { brightness: 100, saturation: 100, warmth: 0 },
        versions: [],
        activeVersion: -1,
        request: null
      }))
    };
  });
  state.keyframeSelections = state.keyframePlan.map(() => null);
  state.keyframeIndexes = state.keyframePlan.map(() => 0);
  state.activeKeyframe = 0;
  state.history = [];
  state.demoMediaVersion = DEMO_MEDIA_VERSION;
  state.shotStudioVersion = 1;
  state.keyframeExportReady = false;
  state.selections = [];
  state.storyPlan.forEach((beat, index) => {
    const demo = DEMO_SHOTS[index % DEMO_SHOTS.length];
    beat.title = demo.title;
    beat.plot = demo.description;
    beat.image = demo.candidates[0].source;
  });
  syncKeyframeShots();
}

function keyframePromptForIndex(index) {
  const matches = [...state.seed.matchAll(/(?:^|[\n;；])\s*(?:K|Keyframe\s*|第\s*)(\d+)\s*(?:个?(?:关键帧|镜头))?\s*[:：]\s*([\s\S]*?)(?=(?:[\n;；]\s*(?:K|Keyframe\s*|第\s*)\d+)|$)/gi)];
  return matches.find(match => Number(match[1]) === index + 1)?.[2].trim() || "";
}

function currentKeyframe() {
  ensureKeyframeState();
  return state.keyframePlan[state.activeKeyframe || 0];
}

function currentFrameCandidate() {
  return currentKeyframe().candidates[state.keyframeIndexes[state.activeKeyframe || 0] || 0];
}

function candidateVersion(candidate) {
  return candidate.activeVersion >= 0 ? candidate.versions[candidate.activeVersion] : null;
}

function candidateImage(candidate) {
  return candidateVersion(candidate)?.source || candidate.source;
}

function candidateStyle(candidate) {
  const version = candidateVersion(candidate);
  const adjustment = version?.adjustment || { brightness: 100, saturation: 100, warmth: 0 };
  return `${version?.kind === "Imported edit" ? "" : candidate.style};filter:brightness(${adjustment.brightness}%) saturate(${adjustment.saturation}%) sepia(${adjustment.warmth}%)`;
}

function renderKeyframeDirector() {
  ensureKeyframeState();
  const frame = currentKeyframe();
  const candidate = currentFrameCandidate();
  const index = state.activeKeyframe || 0;
  const candidateIndex = state.keyframeIndexes[index] || 0;
  const chosen = state.keyframeSelections.filter(Boolean).length;
  if (!["prompt", "region"].includes(keyframeTool)) keyframeTool = "prompt";
  const back = keyframeFace === "back";
  return `
    <section class="screen screen--dark screen--creator director-screen director-workbench keyframe-workbench" aria-labelledby="director-title">
      ${statusBar()}
      <header class="app-header creator-header director-workbench-header">
        <button class="header-action" id="director-back" type="button" aria-label="Back to story input">${capcutIcon("nav-back")}</button>
        <h2 id="director-title">Choose your keyframes<span>STEP 2 · ${chosen}/${state.keyframeCount} chosen · ${state.shotPlan.length} shots</span></h2>
      </header>
      <nav class="v32-story-rail director-shot-rail keyframe-rail" aria-label="Keyframe progress">
        ${state.keyframePlan.map((item, frameIndex) => {
          const selected = state.keyframeSelections[frameIndex];
          const preview = item.candidates[0];
          return `<button type="button" class="v32-rail-item ${selected ? "is-selected" : ""}" data-keyframe="${frameIndex}" aria-label="${item.id}, ${selected ? "chosen" : "not chosen"}" aria-current="${frameIndex === index ? "step" : "false"}">
            ${generatedImage(selected?.source || candidateImage(preview), "", true, selected?.style || candidateStyle(preview))}
            <span>${item.id}</span>
            ${selected ? `<i>${icon("check")}</i>` : ""}
          </button>`;
        }).join("")}
      </nav>
      ${state.keyframeExportReady ? `<div class="frame-chain-ready"><span>Keyframe chain ready · video generation needed</span><button id="export-keyframe-chain" type="button">Export chain</button></div>` : ""}
      <div class="director-body director-swipe-body keyframe-body">
        <div class="candidate-stage">
          <article id="candidate-card" class="candidate-card candidate-card--depth-0 keyframe-card ${back ? "is-flipped" : ""}" aria-label="${frame.id}, candidate ${candidateIndex + 1}">
            <div class="keyframe-turn">
              <div class="keyframe-front" ${back ? 'inert aria-hidden="true"' : ""}>
                <button type="button" class="keyframe-flip-hit" id="flip-card" aria-label="Flip card to edit prompt" aria-describedby="keyframe-gesture-help">
                  <span class="candidate-media">${generatedImage(candidateImage(candidate), frame.title, true, candidateStyle(candidate))}</span>
                  <span class="card-count">${candidateIndex + 1} / ${frame.candidates.length}</span>
                  <span class="keyframe-front-caption">${frame.title}<small>${icon("pencil")} Tap to refine</small></span>
                </button>
              </div>
              <section class="keyframe-back" aria-label="Refine this keyframe" ${back ? "" : 'inert aria-hidden="true"'}>
                <header class="keyframe-back-header"><div><small>${frame.id} · Option ${candidateIndex + 1}</small><h3>Refine this frame</h3></div>
                  <button type="button" id="flip-back" aria-label="Back to image">${icon("x")}</button>
                </header>
                <nav class="keyframe-tools" aria-label="Refinement tools">
                  ${[["prompt", "Prompt"], ["region", "Retouch"]].map(([tool, label]) => `<button type="button" data-frame-tool="${tool}" aria-pressed="${keyframeTool === tool}">${label}</button>`).join("")}
                </nav>
                <div class="keyframe-editor-scroll">${renderKeyframeTool(candidate, frame)}</div>
              </section>
            </div>
          </article>
        </div>
      </div>
      <span id="keyframe-gesture-help" class="frame-sr-only">Swipe left or right to browse. Swipe up to choose. Keyboard: left or right to browse, up to choose.</span>
    </section>`;
}

function renderKeyframeTool(candidate, frame) {
  const version = candidateVersion(candidate);
  const prompt = candidate.draft ?? version?.prompt ?? candidate.prompt;
  if (keyframeTool === "prompt") {
    return `<form id="frame-prompt-form" class="frame-editor-form">
      <label for="frame-prompt" class="frame-sr-only">Prompt</label>
      <textarea id="frame-prompt" rows="9" autocomplete="off" spellcheck="false">${escapeHtml(prompt)}</textarea>
      <button class="frame-primary" type="submit">Save edit request ${icon("arrow-right")}</button>
      ${renderFrameRequest(candidate)}
    </form>`;
  }
  if (keyframeTool === "region") {
    return `<form id="frame-region-form" class="frame-editor-form">
      <div class="frame-mask-stage"><img src="${candidateImage(candidate)}" alt="${escapeHtml(frame.title)}" style="${candidateStyle(candidate)}"><canvas id="frame-mask" width="540" height="720" aria-label="Paint an edit region" tabindex="0"></canvas></div>
      <div class="frame-brush-row"><label for="frame-brush">Brush <output id="brush-output">${candidate.brushSize}px</output></label><input id="frame-brush" type="range" min="8" max="64" value="${candidate.brushSize}" aria-label="Brush size"><button id="clear-mask" type="button">Clear</button></div>
      <div class="frame-region-modes">${[["replace", "Replace"], ["remove", "Remove"]].map(([mode, label]) => `<button type="button" data-region-mode="${mode}" aria-pressed="${candidate.mode === mode}">${label}</button>`).join("")}</div>
      <label for="frame-region-prompt">Change this area</label>
      <textarea id="frame-region-prompt" rows="2" placeholder="Describe the replacement, or choose Remove">${escapeHtml(candidate.change)}</textarea>
      <button class="frame-primary" type="submit">Save retouch request ${icon("arrow-right")}</button>
      ${renderFrameRequest(candidate)}
    </form>`;
  }
  if (keyframeTool === "adjust") {
    return `<form id="frame-adjust-form" class="frame-editor-form">
      <div class="frame-adjust-preview"><img id="frame-adjust-image" src="${candidateImage(candidate)}" style="${candidateStyle(candidate)}" alt="Adjustment preview"></div>
      ${[["brightness", "Exposure", 70, 140], ["saturation", "Saturation", 50, 140], ["warmth", "Warmth", 0, 35]].map(([key, label, min, max]) => `<label class="frame-adjust-label" for="frame-${key}">${label}<output id="output-${key}">${candidate.adjustment[key]}</output></label><input id="frame-${key}" type="range" data-adjustment="${key}" min="${min}" max="${max}" value="${candidate.adjustment[key]}">`).join("")}
      <button type="button" id="compare-original" class="frame-secondary" aria-pressed="false">Compare original</button>
      <p class="frame-editor-note">Local colour adjustment. Saves a new version and keeps the original.</p>
      <button class="frame-primary" type="submit">Save as new version ${icon("check")}</button>
    </form>`;
  }
  return `<div class="frame-editor-form">
    <p class="frame-editor-note">Versions belong to this candidate. Previewing a version never adopts it into the story.</p>
    <button class="frame-version ${candidate.activeVersion === -1 ? "is-current" : ""}" type="button" data-frame-version="-1"><img src="${candidate.source}" alt=""><span>Original<small>Always preserved</small></span>${candidate.activeVersion === -1 ? icon("check") : ""}</button>
    ${candidate.versions.map((item, index) => `<button class="frame-version ${candidate.activeVersion === index ? "is-current" : ""}" type="button" data-frame-version="${index}"><img src="${item.source}" alt=""><span>Version ${index + 1}<small>${escapeHtml(item.kind)}</small></span>${candidate.activeVersion === index ? icon("check") : ""}</button>`).join("")}
    ${candidate.request ? "" : `<label class="frame-secondary frame-import-label" for="frame-import">Import edited result<input id="frame-import" type="file" accept="image/png,image/jpeg,image/webp"></label>`}
    <p class="frame-editor-note">AI edits need a connected image-edit service. Import its result here to compare and choose it.</p>
    ${renderFrameRequest(candidate)}
  </div>`;
}

function renderFrameRequest(candidate) {
  if (!candidate.request) return "";
  return `<div class="frame-request-status" role="status">${candidate.request.status === "result_imported" ? "Edited result imported" : "Request saved · image service not connected"}</div><button class="frame-secondary" id="export-frame-request" type="button">Export request</button><label class="frame-secondary frame-import-label" for="frame-import">Import edited result<input id="frame-import" type="file" accept="image/png,image/jpeg,image/webp"></label>`;
}

function bindKeyframeDirector() {
  const candidate = currentFrameCandidate();
  const turn = (back) => {
    keyframeFace = back ? "back" : "front";
    const card = $("#candidate-card");
    card.classList.toggle("is-flipped", back);
    $(".keyframe-front").inert = back;
    $(".keyframe-back").inert = !back;
    $(".keyframe-front").setAttribute("aria-hidden", String(back));
    $(".keyframe-back").setAttribute("aria-hidden", String(!back));
    (back ? $("#flip-back") : $("#flip-card")).focus({ preventScroll: true });
    bindFrameMask();
  };
  $("#flip-card").addEventListener("click", () => turn(true));
  $("#flip-back").addEventListener("click", () => turn(false));
  $$("[data-frame-tool]").forEach((button) => button.addEventListener("click", () => {
    keyframeTool = button.dataset.frameTool;
    render();
  }));
  $$("[data-keyframe]").forEach((button) => button.addEventListener("click", () => {
    state.activeKeyframe = Number(button.dataset.keyframe);
    state.activeStep = Math.max(0, state.activeKeyframe - 1);
    keyframeFace = "front";
    render();
    $(`[data-keyframe="${state.activeKeyframe}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }));
  $("#export-keyframe-chain")?.addEventListener("click", () => downloadFrameJson({
    keyframes: state.keyframeSelections,
    shots: state.shotPlan.map((shot) => ({ startKey: shot.startKey, endKey: shot.endKey, startFrame: shot.startFrame, endFrame: shot.endFrame, startStyle: shot.startStyle, endStyle: shot.endStyle, status: "needs_video_generation" }))
  }, "keyframe-chain.json"));
  bindFrameEditor(candidate);
  bindKeyframeSwipe();
}

function bindFrameEditor(candidate) {
  $("#frame-prompt")?.addEventListener("input", (event) => {
    candidate.draft = event.target.value;
    saveState();
  });
  for (const id of ["frame-change", "frame-region-prompt"]) {
    $(`#${id}`)?.addEventListener("input", (event) => {
      candidate.change = event.target.value;
      saveState();
    });
  }
  $("#frame-prompt-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    saveFrameEditRequest(false);
  });
  $("#frame-region-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    saveFrameEditRequest(true);
  });
  $$(".frame-editor-form textarea").forEach((input) => input.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      input.closest("form")?.requestSubmit();
    }
  }));
  $$("[data-region-mode]").forEach((button) => button.addEventListener("click", () => {
    candidate.mode = button.dataset.regionMode;
    $$("[data-region-mode]").forEach(option => option.setAttribute("aria-pressed",String(option === button)));
    saveState();
  }));
  $("#clear-mask")?.addEventListener("click", () => {
    candidate.strokes = [];
    drawFrameMask();
    saveState();
  });
  $("#frame-brush")?.addEventListener("input", (event) => {
    candidate.brushSize = Number(event.target.value);
    $("#brush-output").textContent = `${candidate.brushSize}px`;
    saveState();
  });
  const adjustPreview = () => {
    const a = candidate.adjustment;
    $("#frame-adjust-image").style.cssText = `${candidate.style};filter:brightness(${a.brightness}%) saturate(${a.saturation}%) sepia(${a.warmth}%)`;
  };
  $$("[data-adjustment]").forEach((input) => input.addEventListener("input", () => {
    candidate.adjustment[input.dataset.adjustment] = Number(input.value);
    $(`#output-${input.dataset.adjustment}`).value = input.value;
    adjustPreview();
    saveState();
  }));
  $("#compare-original")?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    const original = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(original));
    button.textContent = original ? "Back to adjustment" : "Compare original";
    $("#frame-adjust-image").src = original ? candidate.source : candidateImage(candidate);
    if (original) $("#frame-adjust-image").style.cssText = candidate.style;
    else adjustPreview();
  });
  $("#frame-adjust-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    candidate.versions.push({
      source: candidateImage(candidate), prompt: candidate.draft ?? candidateVersion(candidate)?.prompt ?? candidate.prompt,
      kind: "Colour adjustment", adjustment: { ...candidate.adjustment }
    });
    candidate.activeVersion = candidate.versions.length - 1;
    keyframeTool = "versions";
    saveState();
    render();
    showToast("New version saved. Original preserved.");
  });
  $$("[data-frame-version]").forEach((button) => button.addEventListener("click", () => {
    candidate.activeVersion = Number(button.dataset.frameVersion);
    candidate.adjustment = { ...(candidateVersion(candidate)?.adjustment || { brightness: 100, saturation: 100, warmth: 0 }) };
    saveState();
    render();
  }));
  $("#export-frame-request")?.addEventListener("click", async () => {
    try {
      const request = { ...candidate.request, referenceImages: [await rasterizeCandidate(candidate)] };
      downloadFrameJson(request, `${currentKeyframe().id}-edit-request.json`);
    } catch {
      showToast("Could not read reference image. Retry.");
    }
  });
  $("#frame-import")?.addEventListener("change", async (event) => {
    if (keyframeImportPending) return;
    const file = event.target.files[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) {
      showToast("Choose a PNG, JPEG or WebP under 10 MB.");
      return;
    }
    keyframeImportPending = true;
    const importLabel = event.target.closest("label");
    event.target.disabled = true;
    if (importLabel) importLabel.firstChild.textContent = "Importing image…";
    const target = candidate;
    try {
      const source = await resizeImportedFrame(file);
      target.versions.push({ source, prompt: target.request?.prompt || target.draft || target.prompt, kind: "Imported edit", adjustment: { brightness: 100, saturation: 100, warmth: 0 } });
      target.activeVersion = target.versions.length - 1;
      if (target.request) target.request.status = "result_imported";
      saveState();
      render();
      showToast("Edited result added as a new version.");
    } catch {
      showToast("Image could not be imported.");
    } finally {
      keyframeImportPending = false;
    }
  });
  bindFrameMask();
}

function bindKeyframeSwipe() {
  const card = $("#candidate-card");
  let start = null;
  let dx = 0;
  let dy = 0;
  let axis = null;
  let ignoreClick = false;
  card.addEventListener("click", (event) => {
    if (ignoreClick) {
      event.stopPropagation();
      event.preventDefault();
      ignoreClick = false;
    }
  }, true);
  card.addEventListener("pointerdown", (event) => {
    if (keyframeFace !== "front" || event.button !== 0) return;
    start = { x: event.clientX, y: event.clientY };
    dx = 0;
    dy = 0;
    axis = null;
  });
  card.addEventListener("pointermove", (event) => {
    if (!start) return;
    dx = event.clientX - start.x;
    dy = event.clientY - start.y;
    if (!axis && Math.max(Math.abs(dx), Math.abs(dy)) > 8) {
      axis = Math.abs(dx) >= Math.abs(dy) ? "horizontal" : "vertical";
      card.setPointerCapture(event.pointerId);
    }
    card.style.transform = axis === "horizontal" ? `translateX(${dx}px)` : `translateY(${Math.min(0, dy)}px)`;
  });
  const finish = (event) => {
    if (!start) return;
    start = null;
    if (card.hasPointerCapture(event.pointerId)) card.releasePointerCapture(event.pointerId);
    ignoreClick = Math.max(Math.abs(dx), Math.abs(dy)) > 8;
    card.style.transform = "";
    if (event.type === "pointercancel") return;
    if (axis === "horizontal" && Math.abs(dx) >= 60) browseKeyframe(dx < 0 ? 1 : -1);
    else if (axis === "vertical" && dy <= -74) decideKeyframe(true);
  };
  card.addEventListener("pointerup", finish);
  card.addEventListener("pointercancel", finish);
}

function browseKeyframe(direction) {
  if (keyframeFace !== "front") return;
  const index = state.activeKeyframe;
  const count = currentKeyframe().candidates.length;
  state.keyframeIndexes[index] = (state.keyframeIndexes[index] + direction + count) % count;
  render();
}

function decideKeyframe(adopt) {
  if (keyframeFace !== "front") return;
  const index = state.activeKeyframe;
  state.history.push({
    activeKeyframe: index, activeStep: state.activeStep,
    keyframeIndexes: [...state.keyframeIndexes],
    keyframeSelections: structuredClone(state.keyframeSelections)
  });
  state.history = state.history.slice(-20);
  if (!adopt) {
    state.keyframeIndexes[index] = (state.keyframeIndexes[index] + 1) % currentKeyframe().candidates.length;
    render();
    return;
  }
  state.keyframeExportReady = false;
  const candidate = currentFrameCandidate();
  const nextSelection = {
    candidateIndex: state.keyframeIndexes[index],
    source: candidateImage(candidate), style: candidateStyle(candidate),
    version: candidate.activeVersion
  };
  const previous = state.keyframeSelections[index];
  if (previous && (previous.source !== nextSelection.source || previous.style !== nextSelection.style)) {
    state.keyframeSelections = state.keyframeSelections.map((entry, frameIndex) => frameIndex > index ? null : entry);
  }
  state.keyframeSelections[index] = nextSelection;
  syncKeyframeShots();
  const incomplete = state.keyframeSelections.findIndex((entry) => !entry);
  if (incomplete < 0) {
    if (state.demoMediaVersion || state.keyframePlan.some((frame) => frame.candidates.some((option) => option.versions.length))) {
      state.keyframeExportReady = true;
      render();
      showToast("Chain ready. Edited frames need video generation.");
      return;
    }
    state.view = "generating";
    state.generationProgress = 8;
    render();
    return;
  }
  state.activeKeyframe = index < state.keyframeCount - 1 ? index + 1 : incomplete;
  state.activeStep = Math.max(0, state.activeKeyframe - 1);
  render();
  $(`[data-keyframe="${state.activeKeyframe}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest" });
}

function syncKeyframeShots() {
  state.shotPlan.forEach((shot, index) => {
    const start = state.keyframeSelections[index];
    const end = state.keyframeSelections[index + 1];
    shot.startFrame = start?.source || state.keyframePlan[index].image;
    shot.endFrame = end?.source || state.keyframePlan[index + 1].image;
    shot.startStyle = start?.style || "";
    shot.endStyle = end?.style || "";
    shot.image = shot.endFrame;
  });
  state.selections = state.shotPlan.map((_, index) => {
    const start = state.keyframeSelections[index];
    const end = state.keyframeSelections[index + 1];
    return start && end ? { treatmentIndex: end.candidateIndex } : null;
  });
}

function resetKeyframesFromStory(index) {
  state.keyframePlan = null;
  ensureKeyframeState();
  state.activeKeyframe = Math.min(index, state.keyframeCount - 1);
  // Story changes rebuild the dependent chain from the earliest affected frame.
  state.activeKeyframe = 0;
  keyframeFace = "front";
}

function handleKeyframeKey(event) {
  if (!state.keyframePlan) return false;
  if (event.key === "Escape" && keyframeFace === "back") {
    event.preventDefault();
    $("#flip-back")?.click();
    return true;
  }
  if (keyframeFace === "back") return true;
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    browseKeyframe(event.key === "ArrowRight" ? 1 : -1);
    return true;
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    decideKeyframe(true);
    return true;
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
    event.preventDefault();
    const previous = state.history.pop();
    if (previous?.keyframeSelections) {
      Object.assign(state, previous);
      syncKeyframeShots();
      render();
    }
    return true;
  }
  return true;
}

function bindFrameMask() {
  const canvas = $("#frame-mask");
  if (!canvas || canvas.dataset.bound) return;
  canvas.dataset.bound = "true";
  const candidate = currentFrameCandidate();
  let stroke = null;
  const point = (event) => {
    const rect = canvas.getBoundingClientRect();
    return { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) };
  };
  canvas.addEventListener("pointerdown", (event) => {
    stroke = { size: candidate.brushSize / canvas.getBoundingClientRect().width, points: [point(event)] };
    candidate.strokes.push(stroke);
    canvas.setPointerCapture(event.pointerId);
    drawFrameMask();
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!stroke) return;
    stroke.points.push(point(event));
    drawFrameMask();
  });
  const finish = (event) => {
    stroke = null;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    saveState();
  };
  canvas.addEventListener("pointerup", finish);
  canvas.addEventListener("pointercancel", finish);
  requestAnimationFrame(drawFrameMask);
}

function drawFrameMask() {
  const canvas = $("#frame-mask");
  if (!canvas) return;
  paintMask(canvas, currentFrameCandidate().strokes, "rgba(0,200,221,.5)");
}

function paintMask(canvas, strokes, color) {
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineCap = "round";
  context.lineJoin = "round";
  strokes.forEach((stroke) => {
    context.lineWidth = stroke.size * canvas.width;
    const first = stroke.points[0];
    context.beginPath();
    context.arc(first.x * canvas.width, first.y * canvas.height, context.lineWidth / 2, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.moveTo(first.x * canvas.width, first.y * canvas.height);
    stroke.points.slice(1).forEach((point) => context.lineTo(point.x * canvas.width, point.y * canvas.height));
    context.stroke();
  });
}

function saveFrameEditRequest(region) {
  const candidate = currentFrameCandidate();
  const prompt = candidate.draft ?? candidateVersion(candidate)?.prompt ?? candidate.prompt;
  const promptChanged = candidate.draft !== null && candidate.draft !== (candidateVersion(candidate)?.prompt ?? candidate.prompt);
  if (!prompt.trim() || (!region && !candidate.change.trim() && !promptChanged)) {
    showToast("Describe what you want to change.");
    return;
  }
  if (region && (!candidate.strokes.length || (candidate.mode === "replace" && !candidate.change.trim()))) {
    showToast("Paint an area and describe the replacement.");
    return;
  }
  let mask = null;
  if (region) {
    const canvas = document.createElement("canvas");
    canvas.width = 540;
    canvas.height = 720;
    paintMask(canvas, candidate.strokes, "#ffffff");
    mask = canvas.toDataURL("image/png");
  }
  candidate.request = {
    schemaVersion: 1, status: "awaiting_provider",
    keyframeId: currentKeyframe().id,
    candidateId: candidate.id,
    model: candidate.imageModel || state.model,
    operation: region ? candidate.mode === "remove" ? "inpaint_remove" : "inpaint_replace" : "image_edit",
    prompt, instruction: region && candidate.mode === "remove" ? "Remove the masked object and fill using surrounding context." : candidate.change || "Apply the revised image prompt while preserving character identity and composition.",
    referenceImages: [candidateImage(candidate)],
    referenceStyle: candidateStyle(candidate),
    mask, maskConvention: "white_alpha=edit;transparent=preserve",
    preserve: ["character_identity", "composition", "story_action", ...(region ? ["unmasked_pixels"] : [])],
    aspectRatio: state.ratio, resolution: state.resolution
  };
  saveState();
  render();
  showToast("Edit request saved. Original image unchanged.");
}

function downloadFrameJson(value, name) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function rasterizeCandidate(candidate) {
  const image = await loadFrameImage(candidateImage(candidate));
  const canvas = document.createElement("canvas");
  canvas.width = 540;
  canvas.height = 720;
  const context = canvas.getContext("2d");
  const cropStyle = candidateVersion(candidate)?.kind === "Imported edit" ? "" : candidate.style;
  const scaleMatch = cropStyle.match(/scale\(([\d.]+)\)/);
  const position = cropStyle.match(/object-position:\s*([\d.]+)%\s*([\d.]+)%/);
  const zoom = Number(scaleMatch?.[1] || 1);
  const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  const version = candidateVersion(candidate);
  const a = version?.adjustment || { brightness: 100, saturation: 100, warmth: 0 };
  context.filter = `brightness(${a.brightness}%) saturate(${a.saturation}%) sepia(${a.warmth}%)`;
  context.translate(canvas.width / 2, canvas.height / 2);
  context.scale(zoom, zoom);
  context.translate(-canvas.width / 2, -canvas.height / 2);
  context.drawImage(image, (canvas.width - width) * Number(position?.[1] || 50) / 100, (canvas.height - height) * Number(position?.[2] || 50) / 100, width, height);
  return canvas.toDataURL("image/png");
}

function loadFrameImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

async function resizeImportedFrame(file) {
  const url = URL.createObjectURL(file);
  try {
    const image = await loadFrameImage(url);
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", .85);
  } finally {
    URL.revokeObjectURL(url);
  }
}
