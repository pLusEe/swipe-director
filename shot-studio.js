const shotVideoTimers = new Map();
const shotDemoClips = new Map();
const shotPreviewLoads = new WeakMap();
const shotRailLoads = new WeakMap();
const shotMoreGenerating = new WeakSet();
const shotImageRegenerating = new WeakSet();
let shotAutoPlayRequested = false;
let shotRailMotion = 0;

async function regenerateShotImage() {
  const frame=currentKeyframe(),candidate=currentFrameCandidate();
  if(shotImageRegenerating.has(candidate))return;
  const button=$("#frame-prompt-form [type=submit]");
  const prompt=($("#frame-prompt")?.value || candidate.prompt).trim();
  shotImageRegenerating.add(candidate);
  button.textContent="Generating…";
  try {
    const demo=DEMO_SHOTS[state.keyframePlan.indexOf(frame)%DEMO_SHOTS.length];
    const previous=candidateImage(candidate);
    const index=demo.candidates.findIndex(item=>item.source===previous);
    const sample=demo.candidates[(index+1)%demo.candidates.length];
    const image=new Image();
    await Promise.all([
      new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=sample.source;}),
      new Promise(resolve=>setTimeout(resolve,500))
    ]);
    if(!state.keyframePlan.includes(frame))return;
    if(!candidate.versions.length)candidate.versions.push({source:previous,prompt:candidate.prompt,kind:"Original"});
    candidate.versions.push({source:sample.source,prompt,kind:"Regenerated demo",adjustment:{brightness:100,saturation:100,warmth:0}});
    candidate.activeVersion=candidate.versions.length-1;
    candidate.draft=prompt;
    frame.video=null;
    frame.videoStatus="idle";
    frame.videoRequest=null;
    saveState();
    if(currentFrameCandidate()===candidate)render();
  } catch {
    showToast("Could not regenerate. Try again.");
  } finally {
    shotImageRegenerating.delete(candidate);
    if(button.isConnected)button.textContent="Regenerate image";
  }
}
let shotSequencePlayback;
let shotSequenceReturn;
let sequenceResizeObserver;

function shotSequenceComplete() {
  return !!state.keyframePlan?.length && state.keyframePlan.every((frame,index)=>{
    const selected=state.keyframeSelections[index];
    return selected && frame.candidates.some(candidate=>candidateImage(candidate)===selected.source);
  });
}

function sequenceClips() {
  if(typeof editedSequenceClips==="function")return editedSequenceClips();
  let start=0;
  return state.shotPlan.map(shot=>{
    const duration=shot.video ? Math.max(1,Number(shot.duration)||5) : 3;
    const clip={...shot,start,duration};
    start+=duration;
    return clip;
  });
}

function sequenceClock(seconds) {
  const value=Math.floor(Math.max(0,seconds));
  return `${String(Math.floor(value/60)).padStart(2,"0")}:${String(value%60).padStart(2,"0")}`;
}

function sequenceMedia(shot) {
  const media=shot.video
    ? `<video id="sequence-video" data-demo-src="${escapeHtml(shot.video)}" poster="${escapeHtml(shot.image)}" playsinline preload="auto" loop></video>`
    : `<img src="${escapeHtml(shot.image)}" alt="${escapeHtml(shot.id)}">`;
  return `<div class="sequence-frame">${media}<span class="sequence-caption"></span></div>`;
}

function renderShotSequence() {
  clearInterval(shotSequencePlayback);
  sequencePreviewAudio?.pause();
  sequenceResizeObserver?.disconnect();
  const clips=sequenceClips(),total=clips.reduce((sum,clip)=>sum+clip.duration,0);
  const time=Math.min(Math.max(0,state.sequenceTime||0),total);
  const index=clips.findIndex(clip=>time<clip.start+clip.duration);
  state.sequenceIndex=index<0 ? clips.length-1 : index;
  state.sequenceTime=time;
  const shot=clips[state.sequenceIndex];
  return `<section class="screen screen--dark shot-sequence ${state.sequenceToolsOpen?"has-selected-clip":""}" aria-label="Sequence preview">
    ${statusBar()}
    <header class="sequence-header">
      <button class="header-action" id="sequence-back" type="button" aria-label="Back to shot choices">${capcutIcon("nav-back")}</button>
      <span class="sequence-quality" aria-label="Export quality">${escapeHtml(state.exportQuality||"1080P")}</span>
      <button class="sequence-export" id="sequence-export" type="button">Export</button>
    </header>
    <div class="sequence-media">${sequenceMedia(shot)}</div>
    <div class="sequence-controls">
        <span class="sequence-time"><span id="sequence-current-time">${sequenceClock(time)}</span><span class="sequence-time-divider">/</span>${sequenceClock(total)}</span>
        <button id="sequence-play" type="button" aria-label="Play sequence">${icon("play")}</button>
        <button id="sequence-undo" type="button" aria-label="Undo" ${sequenceUndo.length?"":"disabled"}><img src="assets/capcut/editor/undo.png" alt=""></button>
    </div>
    <section class="sequence-editor" aria-label="Sequence timeline">
      <span id="sequence-shot-label">${shot.id} · ${state.sequenceIndex+1} / ${clips.length}</span>
      <input class="sequence-progress" id="sequence-progress" type="range" min="0" max="${total}" step="0.01" value="${time}" aria-label="Sequence progress" aria-valuetext="${sequenceClock(time)} of ${sequenceClock(total)}" style="--sequence-progress:${total?time/total*100:0}%">
      ${sequenceTimelineMarkup(clips,total)}
    </section>
    ${sequenceToolMarkup()}
  </section>`;
}

function bindShotSequence() {
  const clips=sequenceClips(),total=clips.reduce((sum,clip)=>sum+clip.duration,0);
  const progress=$("#sequence-progress"),play=$("#sequence-play");
  let playing=false,lastTick=0;
  const stop=()=>{
    clearInterval(shotSequencePlayback);
    playing=false;
    $("#sequence-video")?.pause();
    sequencePreviewAudio?.pause();
    play.innerHTML=icon("play");
    play.setAttribute("aria-label","Play sequence");
  };
  const playVideo=()=>{
    const video=$("#sequence-video");
    if(playing && video) video.play().catch(()=>{stop();showToast("Video could not play. Try again.");});
  };
  const seekVideo=()=>{
    const video=$("#sequence-video");
    if(!video)return;
    const seek=()=>{
      if(!video.isConnected)return;
      const duration=Number.isFinite(video.duration)?video.duration:clips[state.sequenceIndex].duration;
      if(duration>0)video.currentTime=(clips[state.sequenceIndex].edit?.trimStart||0)+(state.sequenceTime-clips[state.sequenceIndex].start)%duration;
      playVideo();
    };
    if(video.readyState>=2)seek();
    else video.addEventListener("loadeddata",seek,{once:true});
    const source=video.dataset.demoSrc;
    if(source && !video.src){
      if(!shotDemoClips.has(source))shotDemoClips.set(source,fetch(source).then(response=>{
        if(!response.ok)throw new Error("Preview clip unavailable");
        return response.blob();
      }).then(blob=>URL.createObjectURL(blob)).catch(error=>{shotDemoClips.delete(source);throw error;}));
      shotDemoClips.get(source).then(url=>{if(video.isConnected)video.src=url;}).catch(()=>{
        if(video.isConnected){stop();showToast("Video could not load. Try again.");}
      });
    }
  };
  const update=(time,seek=false)=>{
    state.sequenceTime=Math.max(0,Math.min(total,time));
    const found=clips.findIndex(clip=>state.sequenceTime<clip.start+clip.duration);
    const index=found<0?clips.length-1:found;
    if(index!==state.sequenceIndex){
      $("#sequence-video")?.pause();
      state.sequenceIndex=index;
      $(".sequence-media").innerHTML=sequenceMedia(clips[index]);
      seekVideo();
      $$("[data-sequence-shot]").forEach(button=>button.setAttribute("aria-current",Number(button.dataset.sequenceShot)===index?"step":"false"));
    } else if(seek)seekVideo();
    progress.value=state.sequenceTime;
    progress.style.setProperty("--sequence-progress",`${state.sequenceTime/total*100}%`);
    progress.setAttribute("aria-valuetext",`${sequenceClock(state.sequenceTime)} of ${sequenceClock(total)}`);
    $("#sequence-current-time").textContent=sequenceClock(state.sequenceTime);
    $("#sequence-shot-label").textContent=`${clips[index].id} · ${index+1} / ${clips.length}`;
    if(!timelineScrubbing)$(".sequence-timeline").scrollLeft=state.sequenceTime*24;
    sequenceApplyFrame(clips[index],state.sequenceTime);
  };
  $("#sequence-back").onclick=()=>{
    stop();
    state.view="director";
    render();
    if(shotSequenceReturn){
      $(".keyframe-rail").scrollLeft=shotSequenceReturn.railScroll;
      for(const [selector,scroll] of shotSequenceReturn.scrolls){
        const element=$(selector);
        if(element)element.scrollTop=scroll;
      }
      const video=$("#shot-video");
      if(video){
        const restore=()=>{if(video.isConnected)video.currentTime=shotSequenceReturn.videoTime||0;};
        if(video.readyState>=1)restore();
        else video.addEventListener("loadedmetadata",restore,{once:true});
      }
    }
    saveState();
  };
  $("#sequence-export").onclick=()=>sequencePanel("export");
  $$("[data-sequence-shot]").forEach(button=>button.onclick=()=>{
    stop();
    timelineScrubbing=false;
    update(clips[Number(button.dataset.sequenceShot)].start,true);
    sequenceSelectTools(true);
    saveState();
  });
  progress.addEventListener("input",()=>{stop();update(Number(progress.value),true);});
  progress.addEventListener("change",saveState);
  const timeline=$(".sequence-timeline");
  let timelineScrubbing=false,scrollSave;
  timeline.scrollLeft=state.sequenceTime*24;
  // The native timeline moves beneath a stationary playhead.
  timeline.addEventListener("pointerdown",()=>{stop();timelineScrubbing=true;});
  timeline.addEventListener("wheel",()=>{stop();timelineScrubbing=true;},{passive:true});
  timeline.addEventListener("scroll",()=>{
    if(!timelineScrubbing)return;
    update(timeline.scrollLeft/24,true);
    clearTimeout(scrollSave);
    scrollSave=setTimeout(()=>{timelineScrubbing=false;saveState();},160);
  });
  play.onclick=()=>{
    if(playing){stop();return;}
    clearTimeout(scrollSave);
    timelineScrubbing=false;
    if(state.sequenceTime>=total)update(0,true);
    timeline.scrollLeft=state.sequenceTime*24;
    playing=true;
    window.swipeGuide?.event("played");
    lastTick=performance.now();
    play.innerHTML=icon("pause");
    play.setAttribute("aria-label","Pause sequence");
    playVideo();
    const music=sequenceComposition().music;
    if(music){
      sequencePreviewAudio=new Audio(music.source);
      sequencePreviewAudio.volume=music.volume;
      sequencePreviewAudio.loop=true;
      sequencePreviewAudio.addEventListener("loadedmetadata",()=>{
        if(!playing)return;
        sequencePreviewAudio.currentTime=state.sequenceTime%sequencePreviewAudio.duration;
        sequencePreviewAudio.play().catch(()=>{stop();showToast("Music could not play.");});
      },{once:true});
    }
    shotSequencePlayback=setInterval(()=>{
      if(state.view!=="sequence"){stop();return;}
      const now=performance.now(),video=$("#sequence-video");
      if(!video || video.readyState>=3)update(state.sequenceTime+(now-lastTick)/1000);
      lastTick=now;
      if(state.sequenceTime>=total){stop();saveState();}
    },50);
  };
  seekVideo();
  sequenceApplyFrame(clips[state.sequenceIndex]);
  sequenceResizeObserver=new ResizeObserver(()=>{if(state.view==="sequence")sequenceApplyFrame(sequenceClips()[state.sequenceIndex]);else sequenceResizeObserver.disconnect();});
  sequenceResizeObserver.observe($(".sequence-media"));
  bindSequenceEditing(stop);
}
let shotPreviewPlan, shotPreviewWaits = 0;
let shotAdopting = false;
const shotVideoFields = ["video", "videoStatus", "videoRequest", "videoPrompt", "videoModel", "videoDuration", "videoExpanded"];

function pairedShotVideoSource(source) {
  const outsider=source.match(/assets\/outsider\/k([1-6])[a-d]\.png$/);
  if(outsider)return `assets/outsider/videos/k${outsider[1]}.mp4`;
  return source.replace(/\.jpg$/, ".webm").replace("zombie-cleaner/", "zombie-cleaner/paired/");
}

function pairedShotVideoDuration(source, fallback = 5) {
  const outsider=source.match(/assets\/outsider\/k([1-6])[a-d]\.png$/);
  return outsider ? OUTSIDER_VIDEO_DURATIONS[Number(outsider[1])-1] : fallback;
}

function ensureShotCards() {
  state.keyframePlan.forEach((frame, index) => {
    if(frame.cardsVersion===1){
      saveShotCard(frame,frame.candidates[state.keyframeIndexes[index]||0]);
      for(const candidate of frame.candidates){
        const card=candidate.videoCard;
        if(card?.video?.demo){
          card.video.source=pairedShotVideoSource(candidateImage(candidate));
          card.video.duration=pairedShotVideoDuration(candidateImage(candidate),card.video.duration);
          card.videoDuration=[5,10,12].includes(card.videoDuration) ? card.videoDuration : ([5,10,12].includes(card.videoRequest?.duration) ? card.videoRequest.duration : 5);
        }
      }
      loadShotCard(frame,frame.candidates[state.keyframeIndexes[index]||0]);
      return;
    }
    frame.candidates.forEach(candidate => {
      candidate.videoCard = { video:null, videoStatus:"idle", videoRequest:null, videoPrompt:frame.videoPrompt, videoModel:state.videoModel || "Seedance 2.0", videoDuration:5, videoExpanded:false };
    });
    const owner = frame.candidates.find(candidate => candidateImage(candidate) === (frame.video?.referenceImage || frame.videoRequest?.referenceImage))
      || frame.candidates[state.keyframeIndexes[index] || 0];
    for (const field of shotVideoFields) if (frame[field] !== undefined) owner.videoCard[field] = frame[field];
    if (frame.directVideo) frame.candidates.forEach(candidate=>{
      const referenceImage = candidateImage(candidate), card = candidate.videoCard;
      card.videoModel = state.videoModel;
      card.video = { source:pairedShotVideoSource(referenceImage),referenceImage,candidateId:candidate.id,duration:pairedShotVideoDuration(referenceImage),confirmed:false,demo:true };
      card.videoDuration=5;
      card.videoStatus = "ready";
      card.videoRequest = {operation:"image_to_video",shotId:frame.id,model:state.videoModel,referenceImage,motionPrompt:card.videoPrompt,duration:5,status:"demo_only",generationType:"video"};
    });
    if (owner.videoCard.video?.demo && owner.videoCard.video.referenceImage) {
      owner.videoCard.video.source = pairedShotVideoSource(owner.videoCard.video.referenceImage);
      owner.videoCard.video.duration=pairedShotVideoDuration(owner.videoCard.video.referenceImage,owner.videoCard.video.duration);
    }
    frame.cardsVersion = 1;
    loadShotCard(frame, frame.candidates[state.keyframeIndexes[index] || 0]);
  });
}

function saveShotCard(frame, candidate) {
  if (!candidate?.videoCard) return;
  for (const field of shotVideoFields) candidate.videoCard[field] = frame[field];
}

function loadShotCard(frame, candidate) {
  for (const field of shotVideoFields) frame[field] = candidate.videoCard[field];
  if (frame.video && frame.video.referenceImage !== candidateImage(candidate)) { frame.video = null; frame.videoStatus = "idle"; }
}

function selectedShotCard(frame, index) {
  const selected = state.keyframeSelections[index];
  const candidate = frame.candidates[selected?.candidateIndex];
  return candidate && candidateImage(candidate) === selected.source ? candidate.videoCard : null;
}

function browseKeyframe(direction) {
  if (shotAdopting) return;
  const frame = currentKeyframe(), index = state.activeKeyframe;
  if (frame.addCandidateOpen) {
    frame.addCandidateOpen = false;
    // Circular ring: the add slot sits between the last and first candidate.
    // Moving forward past it wraps to the first card, moving back wraps to the last.
    state.keyframeIndexes[index] = direction > 0 ? 0 : frame.candidates.length - 1;
    loadShotCard(frame,currentFrameCandidate());
    render();
    return;
  }
  const currentIndex = state.keyframeIndexes[index];
  const atStart = currentIndex === 0 && direction < 0;
  const atEnd = currentIndex === frame.candidates.length - 1 && direction > 0;
  if (frame.face !== "back" && (atStart || atEnd)) {
    frame.addCandidateOpen = true;
    frame.addCandidateEdge = atStart ? "start" : "end";
    frame.morePrompt ??= currentFrameCandidate().draft ?? candidateVersion(currentFrameCandidate())?.prompt ?? currentFrameCandidate().prompt;
    frame.moreModel ??= state.model;
    render();
    return;
  }
  const nextIndex = currentIndex + direction;
  if (nextIndex < 0 || nextIndex >= frame.candidates.length) return;
  saveShotCard(frame, currentFrameCandidate());
  $("#shot-video")?.pause();
  state.keyframeIndexes[index] = nextIndex;
  loadShotCard(frame, currentFrameCandidate());
  render();
  window.swipeGuide?.event("browsed");
}

function moreCandidateGlyph() {
  return `<svg class="shot-more-glyph" viewBox="0 0 40 40" fill="currentColor" aria-hidden="true"><rect x="17.5" y="8" width="5" height="24" rx="2.5"/><rect x="8" y="17.5" width="24" height="5" rx="2.5"/></svg>`;
}

function renderMoreCandidate(frame) {
  return `<section class="shot-more-pane" aria-label="Add image to Shot ${state.keyframePlan.indexOf(frame) + 1}">
    ${renderCandidatesHeading("image")}
    <div class="shot-hint ${state.swipeHintDismissed ? "is-dismissed" : ""}" aria-hidden="true"></div>
    <div class="shot-media-slot"><button class="shot-more-card is-current" id="focus-more-prompt" type="button" aria-label="Add image">${moreCandidateGlyph()}</button></div>
    <form id="more-candidate-form" class="shot-prompt shot-more-sheet frame-editor-form">
      <button class="shot-prompt-handle" id="more-prompt-handle" type="button" aria-label="Expand or collapse image settings" aria-expanded="false" aria-controls="more-candidate-details"><span></span></button>
      <div class="shot-prompt-heading"><strong>Image</strong><span class="shot-more-model-summary">${escapeHtml(getImageModel(frame.moreModel).name)}</span><button id="cancel-more-candidate" type="button" aria-label="Close new image settings">Cancel</button></div>
      <p class="shot-more-prompt-preview">${escapeHtml(frame.morePrompt || "")}</p>
      <div class="shot-more-details" id="more-candidate-details">
      <label>Image model</label>
      <div class="ai-video-model-strip" role="radiogroup" aria-label="New image model">${IMAGE_MODELS.map(model=>`<button type="button" data-more-model="${model.id}" role="radio" aria-checked="${frame.moreModel===model.id}" aria-label="${model.name}"><span class="ai-video-model-tile">${renderImageModelMark(model)}</span><strong>${model.name}</strong></button>`).join("")}</div>
      <label for="more-candidate-prompt">Prompt</label>
      <textarea id="more-candidate-prompt" rows="3" required autocomplete="off" spellcheck="false">${escapeHtml(frame.morePrompt || "")}</textarea>
      </div>
      <p class="shot-demo-note" id="more-candidate-status" role="status"></p>
      <button class="frame-primary" type="submit" ${shotMoreGenerating.has(frame) ? "disabled" : ""}>${shotMoreGenerating.has(frame) ? "Generating…" : "Generate image"}</button>
    </form>
  </section>`;
}

function bindMoreCandidate() {
  const form=$("#more-candidate-form");
  if (!form) return;
  const frame=currentKeyframe(), input=$("#more-candidate-prompt"), promptPreview=$(".shot-more-prompt-preview",form);
  const resizePrompt=()=>{input.style.height="auto";input.style.height=`${Math.max(90,input.scrollHeight)}px`;};
  input.addEventListener("input",resizePrompt);
  input.addEventListener("focus",resizePrompt);
  const close=()=>{ frame.addCandidateOpen=false; render(); };
  $("#cancel-more-candidate").onclick=close;
  input.addEventListener("input",()=>{frame.morePrompt=input.value;promptPreview.textContent=input.value;saveState();});
  input.addEventListener("keydown",event=>{if((event.metaKey||event.ctrlKey)&&event.key==="Enter"){event.preventDefault();form.requestSubmit();}});
  $$("[data-more-model]").forEach(button=>button.onclick=()=>{
    frame.moreModel=button.dataset.moreModel;
    $(".shot-more-model-summary").textContent=getImageModel(frame.moreModel).name;
    $$("[data-more-model]").forEach(option=>option.setAttribute("aria-checked",String(option===button)));
    saveState();
  });
  let start,dx=0,dy=0,moved=false,gesture;
  const moreCard=$(".shot-more-card");
  const neighbor=document.createElement("div");
  neighbor.className="shot-more-neighbor";
  neighbor.setAttribute("aria-hidden","true");
  moreCard.parentElement.append(neighbor);
  const reset=()=>{
    moreCard.style.transform="";moreCard.style.opacity="";
    neighbor.style.opacity="0";neighbor.style.transform="";
  };
  const finish=async event=>{
    if(!start)return;
    start=null;gesture?.abort();
    if(moreCard.hasPointerCapture(event.pointerId))moreCard.releasePointerCapture(event.pointerId);
    if(event.type!=="pointercancel" && Math.abs(dx)>Math.abs(dy) && Math.abs(dx)>60){
      const direction=dx<0?1:-1;
      if(!matchMedia("(prefers-reduced-motion: reduce)").matches){
        const timing={duration:220,easing:"cubic-bezier(.32,.72,0,1)",fill:"forwards"};
        moreCard.animate([{transform:moreCard.style.transform,opacity:moreCard.style.opacity},{transform:`translateX(${-direction*125}%) scale(.76)`,opacity:0}],{...timing,duration:180});
        await neighbor.animate([{transform:neighbor.style.transform,opacity:neighbor.style.opacity},{transform:"translateX(0) perspective(700px) rotateY(0deg) scale(1)",opacity:1}],{...timing,delay:40}).finished;
      }
      if(moreCard.isConnected)browseKeyframe(direction);
      return;
    }
    if(moved && !matchMedia("(prefers-reduced-motion: reduce)").matches)moreCard.animate([{transform:moreCard.style.transform,opacity:moreCard.style.opacity},{transform:"none",opacity:1}],{duration:180,easing:"cubic-bezier(.32,.72,0,1)"});
    reset();
    if(event.type!=="pointercancel" && Math.abs(dy)>Math.abs(dx) && Math.abs(dy)>60)form.setExpanded(dy<0);
  };
  moreCard.addEventListener("pointerdown",event=>{
    if(event.button!==0)return;
    moreCard.getAnimations().forEach(animation=>animation.cancel());
    start={x:event.clientX,y:event.clientY};dx=dy=0;moved=false;
    moreCard.setPointerCapture(event.pointerId);
    gesture=new AbortController();
    window.addEventListener("pointerup",finish,{signal:gesture.signal});
    window.addEventListener("blur",()=>{start=null;reset();gesture.abort();},{signal:gesture.signal});
  });
  moreCard.addEventListener("pointermove",event=>{
    if(!start)return;
    if(event.pointerType==="mouse" && !event.buttons){finish({type:"pointercancel",pointerId:event.pointerId});return;}
    dx=event.clientX-start.x;dy=event.clientY-start.y;
    if(Math.max(Math.abs(dx),Math.abs(dy))<8)return;
    moved=true;
    const horizontal=Math.abs(dx)>Math.abs(dy),progress=Math.min(1,Math.abs(horizontal?dx:dy)/240);
    const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
    moreCard.style.transform=horizontal
      ? `translateX(${dx*1.15}px) perspective(700px) rotateY(${reduced?0:Math.sign(dx)*progress*22}deg) scale(${1-progress*.22})`
      : `translateY(${dy*.65}px) perspective(700px) rotateX(${reduced?0:-Math.sign(dy)*progress*24}deg) scale(${1-progress*.04})`;
    moreCard.style.opacity=String(1-progress*.15);
    if(horizontal){
      const direction=dx<0?1:-1;
      const candidate=frame.addCandidateEdge==="start"?frame.candidates[0]:frame.candidates.at(-1);
      const source=candidateImage(candidate);
      if(neighbor.dataset.source!==source){
        neighbor.dataset.source=source;
        fillShotNeighbor(neighbor,candidate);
      }
      neighbor.style.width=`${moreCard.offsetWidth}px`;
      neighbor.style.height=`${moreCard.offsetHeight}px`;
      const arrival=Math.max(0,(progress-.22)/.78);
      neighbor.style.opacity=String(Math.min(1,arrival*2));
      neighbor.style.transform=`translateX(${direction*(1-arrival)*112}%) perspective(700px) rotateY(${reduced?0:-direction*(1-arrival)*22}deg) scale(${.92+arrival*.08})`;
    }else neighbor.style.opacity="0";
  });
  moreCard.addEventListener("pointerup",finish);
  moreCard.addEventListener("pointercancel",finish);
  moreCard.addEventListener("lostpointercapture",()=>{if(start){start=null;reset();gesture?.abort();}});
  moreCard.addEventListener("click",event=>{if(moved){event.preventDefault();moved=false;}else form.setExpanded(true);});
  bindShotPrompt(false,true);
  const expand=form.setExpanded;
  form.setExpanded=(open)=>{expand(open);if(open)resizePrompt();};
  $("#more-prompt-handle").addEventListener("click",()=>{if(form.classList.contains("is-expanded"))resizePrompt();});
  form.addEventListener("submit",async event=>{
    event.preventDefault();
    const prompt=input.value.trim(), button=form.querySelector("[type=submit]");
    if (!prompt || button.disabled || shotMoreGenerating.has(frame)) return;
    shotMoreGenerating.add(frame);
    button.disabled=true;button.textContent="Generating…";
    $("#more-candidate-status").textContent="Preparing demo preview…";
    const original=currentFrameCandidate();
    const request={operation:"text_to_image",keyframeId:frame.id,model:frame.moreModel,prompt,status:"demo_only"};
    const demo=DEMO_SHOTS[state.keyframePlan.indexOf(frame)%DEMO_SHOTS.length];
    const sample=demo.candidates.find(item=>!frame.candidates.some(candidate=>candidate.source===item.source)) || demo.candidates[frame.candidates.length%demo.candidates.length];
    try {
      const image=new Image();
      await Promise.all([new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=sample.source;}),new Promise(resolve=>setTimeout(resolve,500))]);
      if (!state.keyframePlan.includes(frame)) return;
      const candidate={...structuredClone(frame.candidates[0]),id:`${frame.id}-extra-${Date.now()}`,source:sample.source,prompt,draft:null,versions:[],activeVersion:-1,strokes:[],change:"",request:null,generationRequest:request};
      candidate.videoCard={video:null,videoStatus:"idle",videoRequest:null,videoPrompt:frame.videoPrompt,videoModel:state.videoModel||"Seedance 2.0",videoDuration:5,videoExpanded:false};
      saveShotCard(frame,original);
      const frameIndex = state.keyframePlan.indexOf(frame);
      if (frame.addCandidateEdge === "start") {
        frame.candidates.unshift(candidate);
        if (state.keyframeSelections[frameIndex]) state.keyframeSelections[frameIndex].candidateIndex += 1;
        state.keyframeIndexes[frameIndex] = 0;
      } else {
        frame.candidates.push(candidate);
        state.keyframeIndexes[frameIndex] = frame.candidates.length - 1;
      }
      loadShotCard(frame,candidate);
      shotMoreGenerating.delete(frame);
      frame.addCandidateOpen=false;
      if(currentKeyframe()===frame)frame.face="front";
      render();
      window.swipeGuide?.event("added");
    } catch {
      shotMoreGenerating.delete(frame);
      if(!form.isConnected)return;
      button.disabled=false;button.textContent="Try again";
      $("#more-candidate-status").textContent="Preview could not load. Your settings are saved.";
    }
  });
}

function prepareShotPreview(candidate) {
  if (shotPreviewPlan !== state.keyframePlan) {
    shotPreviewPlan = state.keyframePlan;
    shotPreviewWaits = 0;
  }
  const source = candidateImage(candidate);
  let load = shotPreviewLoads.get(candidate);
  if (load?.source === source) return load;
  load = { source, ready: false, failed: false };
  const image = new Image();
  const decoded = new Promise(resolve => {
    image.onload = async () => {
      try { await image.decode(); } catch {}
      resolve();
    };
    image.onerror = () => { load.failed = true; resolve(); };
    image.src = source;
  });
  shotPreviewWaits += 1;
  load.promise = decoded.then(() => { load.ready = true; });
  shotPreviewLoads.set(candidate, load);
  return load;
}

function fillShotNeighbor(neighbor,candidate) {
  const source=candidateImage(candidate),load=prepareShotPreview(candidate);
  const reveal=()=>{
    if(!neighbor.isConnected || neighbor.dataset.source!==source)return;
    neighbor.innerHTML=load.failed
      ? `<div class="shot-video-empty"><span>Preview unavailable</span></div>`
      : `<img src="${escapeHtml(source)}" alt="" style="${candidateStyle(candidate)}">`;
  };
  if(load.ready)reveal();
  else {
    neighbor.innerHTML=`<div class="shot-preview-loading" role="status" aria-label="Loading preview">${capcutLoadingMark()}<span>Loading preview…</span></div>`;
    load.promise.then(reveal);
  }
}

function shotRingOffset(candidateIndex, activeIndex) {
  return candidateIndex - activeIndex;
}

function shotRingTransform(position, step, centered = false) {
  const distance = Math.min(2.4, Math.abs(position));
  const scale = Math.max(.72, 1 - distance * .14);
  const angle = Math.max(-34, Math.min(34, position * 26));
  const depth = -Math.min(150, distance * 72);
  const center = centered ? "translate(-50%,-50%) " : "";
  return `${center}translate3d(${position * step}px,0,${depth}px) rotateY(${angle}deg) scale(${scale})`;
}

function shotRingOpacity(position) {
  return String(Math.max(.2, 1 - Math.abs(position) * .22));
}

function positionShotRingCard(card, position, step) {
  card.style.transform = shotRingTransform(position, step, true);
  card.style.opacity = shotRingOpacity(position);
  card.style.zIndex = String(Math.max(1, 4 - Math.round(Math.abs(position) * 2)));
}

function renderShotRing(frame, activeIndex, videoSide = false) {
  const frameIndex = state.keyframePlan.indexOf(frame);
  const selected = state.keyframeSelections[frameIndex];
  const cards = frame.candidates.map((candidate, index) => {
    if (index === activeIndex) return "";
    const offset = shotRingOffset(index, activeIndex);
    const videoCard = candidate.videoCard;
    const isSelected = !videoSide && selected?.source === candidateImage(candidate);
    const media = !videoSide
      ? `<img src="${escapeHtml(candidateImage(candidate))}" alt="" style="${candidateStyle(candidate)}">`
      : videoCard?.videoStatus === "generating"
        ? `<div class="shot-video-empty"><span>Generating video…</span></div>`
        : videoCard?.video
          ? `<img src="${escapeHtml(candidateImage(candidate))}" alt="" style="${candidateStyle(candidate)}">`
          : `<div class="shot-video-empty shot-video-source"><img src="${escapeHtml(candidateImage(candidate))}" alt="" style="${candidateStyle(candidate)}"><span>Generate video from this image</span></div>`;
    return `<div class="shot-carousel-card ${videoSide ? "is-video" : ""} ${isSelected ? "is-selected" : ""}" data-carousel-offset="${offset}" data-candidate-id="${candidate.id}" aria-hidden="true">${media}<span class="shot-carousel-index">${index + 1}</span>${isSelected ? `<span class="shot-selected-marker">${icon("check")}<span>Selected</span></span>` : ""}</div>`;
  });
  if (!videoSide && (activeIndex === 0 || activeIndex === frame.candidates.length - 1)) {
    const offset = activeIndex === 0 && frame.candidates.length > 1 ? -1 : 1;
    cards.push(`<div class="shot-carousel-card is-add is-add-peek" data-carousel-offset="${offset}" aria-hidden="true"></div>`);
  }
  return cards.join("");
}

function animateShotCandidateFan(originRect) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const screen = $(".shot-studio");
  const stage = $(currentKeyframe().face === "back" ? ".shot-video-stage" : ".shot-image-stage");
  if (!screen || !stage) return;
  const allCards = [stage, ...stage.parentElement.querySelectorAll(":scope > .shot-carousel-card")];
  const cards = allCards.filter(card => !card.classList.contains("is-add"));
  allCards.forEach(card => { card.style.opacity = "0"; });
  screen.classList.add("is-dealing-candidates");
  screen.inert = true;
  requestAnimationFrame(() => {
    const originX = originRect.left + originRect.width / 2;
    const originY = originRect.bottom;
    const animations = cards.map((card, index) => {
      const rect = card.getBoundingClientRect();
      const dx = originX - (rect.left + rect.width / 2);
      const dy = originY - (rect.top + rect.height / 2);
      const finalOpacity = card === stage ? 1 : Number(shotRingOpacity(Number(card.dataset.carouselOffset)));
      return card.animate([
        { translate:`${dx}px ${dy}px`, scale:.78, opacity:0, offset:0 },
        { translate:`${dx}px ${dy + 4}px`, scale:.8, opacity:.42, offset:.18 },
        { translate:`${dx * .12}px ${dy * .12}px`, scale:.97, opacity:Math.min(1, finalOpacity + .08), offset:.78 },
        { translate:"0 0", scale:1, opacity:finalOpacity }
      ], {
        duration:440,
        delay:index * 34,
        easing:"cubic-bezier(.22,.75,.18,1)",
        fill:"forwards"
      });
    });
    Promise.all(animations.map(animation => animation.finished.catch(() => {}))).finally(() => {
      if (!screen.isConnected) return;
      animations.forEach(animation => animation.cancel());
      allCards.forEach(card => { card.style.opacity = ""; });
      screen.classList.remove("is-dealing-candidates");
      screen.inert = false;
    });
  });
}

function centerActiveShotAndDeal(animate = true) {
  cancelAnimationFrame(shotRailMotion);
  const rail = $(".keyframe-rail");
  const button = $(`[data-keyframe="${state.activeKeyframe}"]`);
  const screen = $(".shot-studio");
  if (!rail || !button || !screen) return;
  const firstShot = state.activeKeyframe === 0;
  const desired = firstShot
    ? button.offsetLeft - 14
    : button.offsetLeft + button.offsetWidth / 2 - rail.clientWidth / 2;
  const target = Math.max(0, Math.min(
    rail.scrollWidth - rail.clientWidth,
    desired
  ));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!animate || reduced) {
    rail.style.scrollSnapType = firstShot ? "none" : "";
    rail.scrollLeft = target;
    state.keyframeRailScroll = target;
    return;
  }
  const start = rail.scrollLeft;
  const distance = target - start;
  rail.style.scrollSnapType = "none";
  screen.classList.add("is-awaiting-candidates");
  screen.inert = true;
  const finish = () => {
    if (!screen.isConnected) return;
    rail.scrollLeft = target;
    state.keyframeRailScroll = target;
    rail.style.scrollSnapType = firstShot ? "none" : "";
    const origin = button.getBoundingClientRect();
    screen.inert = false;
    animateShotCandidateFan(origin);
    screen.classList.remove("is-awaiting-candidates");
  };
  if (Math.abs(distance) < 1) {
    requestAnimationFrame(finish);
    return;
  }
  const started = performance.now();
  const duration = Math.min(420, 340 + Math.abs(distance) * .45);
  const step = now => {
    if (!rail.isConnected) return;
    const progress = Math.min(1, (now - started) / duration);
    const eased = .5 - Math.cos(Math.PI * progress) / 2;
    rail.scrollLeft = start + distance * eased;
    if (progress < 1) shotRailMotion = requestAnimationFrame(step);
    else finish();
  };
  shotRailMotion = requestAnimationFrame(step);
}

function prepareShotRail(frame, intro) {
  let load = shotRailLoads.get(frame);
  if (load) return load;
  load = { ready:false, failed:false };
  const image = new Image();
  const decoded = new Promise(resolve => {
    image.onload = resolve;
    image.onerror = () => { load.failed = true; resolve(); };
    image.src = candidateImage(frame.candidates[0]);
  });
  const index = state.keyframePlan.indexOf(frame);
  const stagger = index === 0 ? 0 : 1800 + index * 850;
  load.promise = Promise.all([decoded, intro.promise.then(() => new Promise(resolve => setTimeout(resolve, stagger)))]).then(() => { load.ready = true; });
  shotRailLoads.set(frame, load);
  return load;
}

function bindShotMediaSize() {
  const slots = $$(".shot-media-slot"), image = $("#flip-card img"), video = $("#shot-video");
  const size = () => {
    if (!image?.isConnected) { observer.disconnect(); return; }
    for (const slot of slots) {
      const stage = slot.querySelector(":scope > .shot-image-stage,:scope > .shot-video-stage,:scope > .shot-more-card");
      if (!stage) continue;
      const ratio = stage.classList.contains("shot-video-stage") && video?.videoWidth
        ? video.videoWidth / video.videoHeight
        : image.naturalWidth && image.naturalHeight ? image.naturalWidth / image.naturalHeight : 16/9;
      const candidateGutter = slot.closest(".keyframe-front,.keyframe-back") ? 48 : 0;
      const width = Math.min(Math.max(0, slot.clientWidth - candidateGutter),slot.clientHeight*ratio);
      stage.style.width = `${width}px`;
      stage.style.height = `${width/ratio}px`;
      const carouselStep = slot.clientWidth / 2 - 3 + width * .39;
      slot.dataset.carouselStep = String(carouselStep);
      const neighbor = slot.querySelector(":scope > .shot-image-neighbor,:scope > .shot-video-neighbor");
      if (neighbor) { neighbor.style.width = stage.style.width; neighbor.style.height = stage.style.height; }
      slot.querySelectorAll(":scope > .shot-carousel-card").forEach(card => {
        card.style.width = stage.style.width;
        card.style.height = stage.style.height;
        positionShotRingCard(card, Number(card.dataset.carouselOffset), carouselStep);
      });
    }
  };
  const observer = new ResizeObserver(size);
  slots.forEach(slot=>{
    const neighbor = slot.querySelector(".shot-image-neighbor,.shot-video-neighbor");
    if (neighbor) slot.append(neighbor);
  });
  slots.forEach(slot=>observer.observe(slot));
  image?.addEventListener("load",size);
  video?.addEventListener("loadedmetadata",size);
  size();
  $(".shot-video-stage")?.parentElement.addEventListener("click",event=>{
    if (event.target === event.currentTarget && currentKeyframe().face === "back" && !shotAdopting) setShotFace("front");
  });
}

function bindShotPreview() {
  const candidate = currentFrameCandidate(), load = prepareShotPreview(candidate);
  const stage = $(".shot-image-stage"), button = $("#flip-card");
  const reveal = () => {
    if (!stage.isConnected) return;
    const wasLoading = stage.classList.contains("is-loading");
    stage.classList.remove("is-loading");
    stage.querySelector(".shot-preview-loading")?.remove();
    button.disabled = load.failed;
    $("#open-retouch").disabled = load.failed;
    $("#go-generate-video").disabled = load.failed;
    if (load.failed) {
      button.innerHTML = "<span>Preview unavailable</span>";
      stage.classList.add("has-error");
    } else if (wasLoading && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      button.animate([{opacity:0},{opacity:1}], {duration:180,easing:"ease-out"});
    }
  };
  if (load.ready) reveal();
  else load.promise.then(reveal);
  $$("[data-keyframe]").forEach((thumb, index) => {
    const railLoad = prepareShotRail(state.keyframePlan[index], load);
    railLoad.promise.then(() => {
      const placeholder = thumb.querySelector(".shot-preimage");
      if (!thumb.isConnected || !placeholder) return;
      placeholder.classList.remove("is-preparing");
      placeholder.innerHTML = `<span class="shot-ready">${railLoad.failed ? "Retry" : "Ready"}</span>`;
      thumb.setAttribute("aria-label", `Shot ${index + 1}, ${railLoad.failed ? "preview unavailable" : "ready to edit"}`);
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) placeholder.animate([{opacity:.3},{opacity:1}],{duration:180});
    });
  });
}

function shotVideoReady(frame, index = state.keyframePlan.indexOf(frame)) {
  const candidate = frame.candidates[state.keyframeIndexes[index] || 0];
  return frame.videoStatus !== "generating" && !!frame.video && candidateImage(candidate) === frame.video.referenceImage;
}

function shotStatus(frame, index) {
  const card = selectedShotCard(frame, index);
  if (card?.videoStatus === "generating") return "generating";
  if (card?.video) return card.video.confirmed ? "video_confirmed" : "video_ready";
  return state.keyframeSelections[index] ? "image_selected" : "choosing";
}

function syncKeyframeShots() {
  state.shotPlan = state.keyframePlan.map((frame, index) => {
    const selected = state.keyframeSelections[index];
    const card = selectedShotCard(frame, index);
    return {
      id: frame.id, title: frame.title, objective: DEMO_SHOTS[index]?.description || frame.title,
      image: selected?.source || frame.image,
      referenceImage: selected?.source || frame.image,
      video: card?.video?.source || null, duration: card?.video ? card.video.duration || card.videoDuration || 5 : 3, beatIndex: index,
      status: shotStatus(frame, index)
    };
  });
  state.selections = [...state.keyframeSelections];
  state.duration = state.shotPlan.reduce((total,shot) => total+shot.duration,0);
}

function renderCandidatesHeading(side) {
  const id = `candidates-help-${side}`;
  const shotLabel = `Shot ${state.activeKeyframe + 1}`;
  return `<div class="shot-candidates-meta">
    <strong>${shotLabel} candidates</strong>
    <button class="shot-candidates-help" type="button" data-candidates-help aria-label="Explain ${shotLabel} candidates" aria-expanded="false" aria-controls="${id}"><span aria-hidden="true">?</span></button>
    <div class="shot-candidates-popover" id="${id}" role="note" hidden>
      Swipe to browse. Swipe up to choose.
    </div>
  </div>`;
}

function renderKeyframeDirector() {
  ensureKeyframeState();
  ensureShotCards();
  state.keyframePlan.forEach((frame,i) => saveShotCard(frame,frame.candidates[state.keyframeIndexes[i] || 0]));
  syncKeyframeShots();
  const frame = currentKeyframe(), candidate = currentFrameCandidate();
  frame.videoModel ??= "Seedance 2.0";
  if(![5,10,12].includes(frame.videoDuration))frame.videoDuration=5;
  const index = state.activeKeyframe, option = state.keyframeIndexes[index];
  const back = frame.face === "back";
  const selected = state.keyframeSelections[index];
  const candidateSelected = selected?.source === candidateImage(candidate);
  const videoMatches = shotVideoReady(frame, index);
  const preview = prepareShotPreview(candidate);
  return `<section class="screen screen--dark screen--creator director-workbench keyframe-workbench shot-studio" aria-label="Shot choices">
    ${statusBar()}
    <header class="app-header creator-header director-workbench-header">
      <button class="header-action" id="director-back" type="button" aria-label="Back to story input">${capcutIcon("nav-back")}</button>
      <button class="shot-preview-entry ${shotSequenceComplete() ? "" : "is-incomplete"}" id="preview-sequence" type="button">Next</button>
    </header>
    <div class="shot-keyframes-label">Shots</div>
    <nav class="v32-story-rail director-shot-rail keyframe-rail" aria-label="Shots">${state.keyframePlan.map((item, i) => {
      const chosen = state.keyframeSelections[i];
      const railLoad = prepareShotRail(item, preview);
      const status = shotStatus(item, i);
      const label = {generating:"Generating video", video_ready:"Video ready to confirm",video_confirmed:"Video confirmed",image_selected:"Image confirmed",choosing:"Choose image"}[status];
      return `<button class="v32-rail-item ${chosen ? "is-selected" : ""}" data-keyframe="${i}" data-shot-status="${status}" type="button" aria-label="Shot ${i + 1}, ${label}" aria-current="${i === index ? "step" : "false"}">
        ${chosen ? generatedImage(chosen.source, "", true, chosen.style) : `<div class="shot-preimage ${railLoad.ready ? "" : "is-preparing"}" style="--loading-phase:-${i * .37}s" aria-hidden="true">${railLoad.ready ? `<span class="shot-ready">${railLoad.failed ? "Retry" : "Ready"}</span>` : '<span class="shot-preimage-glyph"></span>'}</div>`}<span>Shot ${i + 1}</span><i>${status === "video_confirmed" ? icon("check") : status === "video_ready" ? icon("play") : status === "generating" ? icon("refresh-cw") : chosen ? "IMG" : ""}</i>
      </button>`;
    }).join("")}<button class="shot-add" id="add-keyframe" type="button" aria-label="Add shot" ${state.keyframeCount >= 12 ? "disabled" : ""}>${icon("plus")}</button></nav>
    <div class="director-body director-swipe-body keyframe-body">
      <div class="candidate-stage">
        <article id="candidate-card" class="candidate-card keyframe-card ${back ? "is-flipped" : ""}">
          <div class="keyframe-turn">
            <section class="keyframe-front ${frame.addCandidateOpen ? "has-more-pane" : ""}" ${back ? 'inert aria-hidden="true"' : ""}>
              ${frame.addCandidateOpen ? "" : renderCandidatesHeading("image")}
              <div class="shot-hint ${state.swipeHintDismissed ? "is-dismissed" : ""}" id="shot-hint">${icon("chevron-up")}<span>上滑确认图片</span></div>
              <div class="shot-media-slot">
                ${renderShotRing(frame, option)}
                <div class="shot-image-stage ${preview.ready ? "" : "is-loading"} ${candidateSelected ? "is-selected" : ""}" data-candidate-id="${candidate.id}">
                <span class="shot-media-label">Image</span>
                <button class="shot-image-current" id="flip-card" type="button" aria-label="Open video side" aria-describedby="shot-gestures" ${preview.ready ? "" : "disabled"}>${generatedImage(candidateImage(candidate), frame.title, true, candidateStyle(candidate))}</button>
                ${preview.ready ? "" : `<div class="shot-preview-loading" role="status" aria-label="Loading preview">${capcutLoadingMark()}<span>Loading preview…</span></div>`}
                <span class="card-count" aria-label="Candidate ${option + 1}">${option + 1}</span>
                ${candidateSelected ? `<span class="shot-selected-marker">${icon("check")}<span>Selected</span></span>` : ""}
              </div></div>
              <form id="frame-prompt-form" class="shot-prompt frame-editor-form ${state.promptExpanded ? "is-expanded" : ""}">
                <button class="shot-prompt-handle" id="prompt-handle" type="button" aria-label="Expand or collapse prompt" aria-expanded="${!!state.promptExpanded}" aria-controls="frame-prompt"><span></span></button>
                <div class="shot-prompt-heading"><label for="frame-prompt">Prompt</label><button id="open-retouch" type="button" ${preview.ready ? "" : "disabled"}>Edit area</button></div>
                <div class="shot-text-fade"><textarea id="frame-prompt" rows="3" autocomplete="off" spellcheck="false">${escapeHtml(candidate.draft ?? candidateVersion(candidate)?.prompt ?? candidate.prompt)}</textarea></div>
                <div class="shot-regenerate-model"><span>Image model</span><div class="ai-video-model-strip" role="radiogroup" aria-label="Image model">${IMAGE_MODELS.map(model=>`<button type="button" data-regenerate-model="${model.id}" role="radio" aria-checked="${(candidate.imageModel||state.model)===model.id}" aria-label="${model.name}"><span class="ai-video-model-tile">${renderImageModelMark(model)}</span><strong>${model.name}</strong></button>`).join("")}</div></div>
                <div class="shot-front-actions">
                  <button class="frame-secondary" type="submit">Regenerate image</button>
                  <button class="frame-primary" id="go-generate-video" type="button" ${preview.ready && !preview.failed ? "" : "disabled"}>Go generate video</button>
                </div>
                ${candidate.request ? renderFrameRequest(candidate) : ""}
              </form>
              ${frame.addCandidateOpen ? renderMoreCandidate(frame) : ""}
            </section>
            <section class="keyframe-back ${videoMatches ? "shot-video-ready" : ""}" ${back ? "" : 'inert aria-hidden="true"'}>
              ${renderCandidatesHeading("video")}
              <div id="shot-video-hint" class="shot-hint shot-video-caption ${(videoMatches ? state.videoSwipeHintDismissed : state.swipeHintDismissed) ? "is-dismissed" : ""}">${videoMatches ? `${icon("chevron-up")}<span>上滑确认视频</span>` : ""}</div>
              <div class="shot-media-slot">
                ${renderShotRing(frame, option, true)}
                <div class="shot-video-stage" data-candidate-id="${candidate.id}" aria-describedby="shot-gestures">
                <span class="shot-media-label">Video</span>
                <div class="shot-video-content">${videoMatches ? `<video id="shot-video" ${frame.video.demo ? `data-demo-src="${frame.video.source}"` : `src="${frame.video.source}"`} playsinline muted autoplay loop preload="metadata" poster="${candidateImage(candidate)}"></video>` : frame.videoStatus === "generating" ? `<div class="shot-video-pending is-generating" role="status"><span class="shot-video-spinner" aria-hidden="true"></span><span>Generating video…</span></div>` : `<div class="shot-video-empty shot-video-source" role="status"><img src="${escapeHtml(candidateImage(candidate))}" alt="" style="${candidateStyle(candidate)}"><span>Generate video from this image</span></div>`}</div>
                ${videoMatches ? `<input id="shot-video-progress" class="shot-video-progress" type="range" min="0" max="1000" value="0" aria-label="Video progress" aria-valuetext="0 seconds">` : ""}
                <span class="card-count" aria-label="Candidate ${option + 1}">${option + 1}</span>
                <button id="flip-back" class="shot-video-back" type="button" aria-label="Back to image"></button>
              </div></div>
              <form id="shot-video-form" class="shot-prompt shot-video-sheet frame-editor-form ${frame.videoExpanded ? "is-expanded" : ""}">
                <button class="shot-prompt-handle" id="video-prompt-handle" type="button" aria-label="Expand or collapse video settings" aria-expanded="${!!frame.videoExpanded}" aria-controls="shot-video-details"><span></span></button>
                <div class="shot-prompt-heading"><span>Video</span><span class="shot-video-summary">${escapeHtml(frame.videoModel)} · ${frame.videoDuration}s</span></div>
                ${videoMatches ? `<p class="shot-video-instruction">${frame.video.confirmed ? "Video confirmed" : "Swipe up to use this video"}</p>` : ""}
                <p id="video-prompt-preview" class="shot-more-prompt-preview">${escapeHtml(frame.videoPrompt)}</p>
                <div id="shot-video-details" class="shot-video-details">
                  <label for="shot-video-prompt">Motion & camera</label>
                  <div class="shot-text-fade"><textarea id="shot-video-prompt" rows="3">${escapeHtml(frame.videoPrompt)}</textarea></div>
                  <div class="shot-video-options">
                    <div class="shot-video-models"><span>Video model</span><div class="ai-video-model-strip" role="radiogroup" aria-label="Video model">${["Seedance 2.0","Seedance 1.5 Pro"].map(model=>`<button type="button" data-shot-video-model="${model}" role="radio" aria-checked="${frame.videoModel===model}" aria-label="${model}" ${frame.videoStatus === "generating" ? "disabled" : ""}><span class="ai-video-model-tile"><span class="image-model-mark"><img src="assets/capcut/seedance-transparent.png" alt=""></span></span><strong>${model}</strong></button>`).join("")}</div></div>
                    <div class="shot-duration-setting"><span>Duration</span><div class="shot-duration-options" role="group" aria-label="Video duration">${[5,10,12].map(duration=>`<button type="button" data-shot-video-duration="${duration}" aria-pressed="${frame.videoDuration===duration}" ${frame.videoStatus === "generating" ? "disabled" : ""}>${duration}s</button>`).join("")}</div></div>
                  </div>
                  <p class="shot-demo-note">${frame.videoStatus === "generating" ? "Preparing demo clip…" : "视频 API 未接通，当前为演示生成。"}</p>
                </div>
                <button class="frame-primary" type="submit" ${frame.videoStatus === "generating" ? "disabled" : ""}>${frame.videoStatus === "generating" ? "Preparing…" : videoMatches ? "Regenerate video" : "Generate video"}</button>
              </form>
            </section>
          </div>
        </article>
      </div>
    </div>
    <span id="shot-gestures" class="frame-sr-only">Left and right browse image and video pairs on either side. Up confirms the image on the front, or the generated video on the back. Tap image for video. Arrow keys provide the same actions.</span>
    ${frame.retouchOpen ? `<div class="shot-retouch-overlay"><button class="shot-retouch-backdrop" id="retouch-backdrop" type="button" aria-label="Close area editor"></button><section class="shot-retouch-panel" role="dialog" aria-modal="true" aria-label="Edit image area"><header class="keyframe-back-header"><h3>Edit area</h3><button id="close-retouch" type="button" aria-label="Close area editor">${icon("x")}</button></header><div class="keyframe-editor-scroll">${renderKeyframeTool(candidate, frame, keyframeTool = "region")}</div></section></div>` : ""}
  </section>`;
}

function requestShotVideoPlay({ toast = true } = {}) {
  const video = $("#shot-video");
  if (!video || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  video.muted = true;
  video.playsInline = true;
  const play = async () => {
    if (!video.isConnected) return;
    video.muted = true;
    video.playsInline = true;
    try {
      await video.play();
    } catch {
      if (toast) showToast("Video could not play. Try again.");
    }
  };
  if (video.readyState >= 2) requestAnimationFrame(play);
  else video.addEventListener("canplay", play, { once:true });
}

function setShotFace(face) {
  const frame = currentKeyframe();
  if (frame.face === face) return;
  const previous = $(frame.face === "back" ? ".shot-video-stage" : ".shot-image-stage");
  let ghost;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced && previous) {
    const box=previous.getBoundingClientRect();
    ghost=previous.cloneNode(true);
    ghost.removeAttribute("id");
    ghost.querySelectorAll("[id]").forEach(node=>node.removeAttribute("id"));
    const clip=ghost.querySelector("video");
    if (clip) { const poster=new Image(); poster.src=candidateImage(currentFrameCandidate()); poster.style.cssText="width:100%;height:100%;object-fit:contain"; clip.replaceWith(poster); }
    const phone=$(".device"),origin=phone.getBoundingClientRect();
    ghost.style.cssText=`position:absolute;left:${box.x-origin.x-phone.clientLeft}px;top:${box.y-origin.y-phone.clientTop}px;width:${box.width}px;height:${box.height}px;z-index:110;pointer-events:none;margin:0;`;
    phone.append(ghost);
    ghost.animate([{transform:"perspective(900px) rotateY(0deg)"},{transform:"perspective(900px) rotateY(90deg)"}],{duration:120,easing:"cubic-bezier(.4,0,.6,1)",fill:"forwards"}).finished.then(()=>ghost.remove());
  }
  if (face === "front") $("#shot-video")?.pause();
  frame.face = face;
  keyframeFace = face;
  $("#candidate-card")?.classList.toggle("is-flipped", face === "back");
  $(".keyframe-front").inert = face === "back";
  $(".keyframe-back").inert = face !== "back";
  $(".keyframe-front").setAttribute("aria-hidden", String(face === "back"));
  $(".keyframe-back").setAttribute("aria-hidden", String(face !== "back"));
  if (!reduced) $(face === "back" ? ".shot-video-stage" : ".shot-image-stage")?.animate([{transform:"perspective(900px) rotateY(-90deg)",opacity:0},{transform:"perspective(900px) rotateY(0deg)",opacity:1}],{duration:140,delay:120,easing:"cubic-bezier(.32,.72,0,1)",fill:"backwards"});
  if (face === "back") setTimeout(() => requestShotVideoPlay(), reduced ? 0 : 140);
  saveState();
  window.swipeGuide?.event("face", face);
}

function bindKeyframeDirector() {
  const frame = currentKeyframe();
  const candidate = currentFrameCandidate();
  const persistVideoCard = () => { saveShotCard(frame,candidate); saveState(); };
  const rail = $(".keyframe-rail");
  if (state.activeKeyframe === 0 && rail?.scrollLeft < 1 && (state.keyframeRailScroll ?? 0) < 1) {
    centerActiveShotAndDeal(false);
  }
  $("#preview-sequence")?.addEventListener("click",()=>{
    if(!shotSequenceComplete()){
      showToast("Confirm all shots to preview.");
      return;
    }
    saveShotCard(frame,candidate);
    shotSequenceReturn={
      railScroll:$(".keyframe-rail").scrollLeft,
      videoTime:$("#shot-video")?.currentTime||0,
      scrolls:["#frame-prompt-form","#shot-video-form","#more-candidate-form"].map(selector=>[selector,$(selector)?.scrollTop||0])
    };
    $("#shot-video")?.pause();
    syncKeyframeShots();
    state.view="sequence";
    saveState();
    render();
  });
  if(state.sequenceReplacement)bindSequenceReplacement();
  bindShotPreview();
  bindShotMediaSize();
  $$("[data-regenerate-model]").forEach(button=>button.addEventListener("click",()=>{
    candidate.imageModel=button.dataset.regenerateModel;
    $$("[data-regenerate-model]").forEach(option=>option.setAttribute("aria-checked",String(option===button)));
    saveState();
  }));
  bindMoreCandidate();
  bindShotPrompt();
  bindShotPrompt(true);
  bindShotVideoPlayer();
  const closeCandidateHelp = except => {
    $$(".shot-candidates-help").forEach(button => {
      if (button === except) return;
      button.setAttribute("aria-expanded","false");
      $(`#${button.getAttribute("aria-controls")}`).hidden = true;
    });
  };
  $$("[data-candidates-help]").forEach(button => button.addEventListener("click",event => {
    event.stopPropagation();
    const popover = $(`#${button.getAttribute("aria-controls")}`);
    const open = button.getAttribute("aria-expanded") !== "true";
    closeCandidateHelp(button);
    button.setAttribute("aria-expanded",String(open));
    popover.hidden = !open;
  }));
  $(".shot-studio").addEventListener("click",event => {
    if (!event.target.closest(".shot-candidates-meta")) closeCandidateHelp();
  });
  $(".shot-studio").addEventListener("keydown",event => {
    if (event.key === "Escape") closeCandidateHelp();
  });
  $("#go-generate-video").addEventListener("click",() => {
    const form = $("#shot-video-form");
    form.setExpanded(false);
    setShotFace("back");
    window.swipeGuide?.event("videoOpened");
    const expand = () => {
      if (form.isConnected && currentKeyframe() === frame && frame.face === "back") form.setExpanded(true);
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) expand();
    else setTimeout(expand,260);
  });
  $("#flip-card").addEventListener("click", () => setShotFace("back"));
  $("#flip-back").addEventListener("click", () => setShotFace("front"));
  $(".shot-video-stage").addEventListener("click", event => {
    const stage = event.currentTarget;
    if (stage.swipeMoved || stage.classList.contains("is-swiping") || shotAdopting || event.target.closest("#shot-video-progress")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    setShotFace("front");
  }, true);
  $$("[data-keyframe]").forEach((button) => button.addEventListener("click", () => {
    if (shotAdopting) return;
    $("#shot-video")?.pause();
    const nextIndex = Number(button.dataset.keyframe);
    const nextFrame = state.keyframePlan[nextIndex];
    const nextCandidate = nextFrame.candidates[state.keyframeIndexes[nextIndex] || 0];
    const nextCard = nextCandidate?.videoCard;
    shotAutoPlayRequested = !!nextCard?.video
      && nextCard.videoStatus !== "generating"
      && nextCard.video.referenceImage === candidateImage(nextCandidate);
    if (shotAutoPlayRequested) nextFrame.face = "back";
    state.activeKeyframe = nextIndex;
    render();
    centerActiveShotAndDeal();
  }));
  $("#add-keyframe").addEventListener("click", () => changeKeyframeCount(1));
  bindKeyframeReorder();
  $("#open-retouch").addEventListener("click", () => {
    frame.retouchOpen = true; render();
    window.swipeGuide?.event("retouchOpened");
    const overlay = $(".shot-retouch-overlay");
    const sheet = $(".shot-retouch-panel"), backdrop = $("#retouch-backdrop");
    sheet.style.transition = backdrop.style.transition = "none";
    overlay.classList.add("is-entering");
    // Establish the offscreen start before removing the class; otherwise the
    // browser can coalesce both states and show the sheet fully open.
    void sheet.getBoundingClientRect();
    requestAnimationFrame(() => {
      sheet.style.transition = backdrop.style.transition = "";
      overlay.classList.remove("is-entering");
    });
    $("#close-retouch")?.focus({ preventScroll:true });
  });
  const closeRetouch = () => {
    const overlay = $(".shot-retouch-overlay");
    overlay.classList.add("is-closing");
    const finish = () => {
      if (!overlay.isConnected) return;
      frame.retouchOpen = false; render(); $("#open-retouch")?.focus();
      window.swipeGuide?.event("retouchClosed");
    };
    setTimeout(finish, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 260);
  };
  $("#close-retouch")?.addEventListener("click", closeRetouch);
  $("#retouch-backdrop")?.addEventListener("click", closeRetouch);
  const panel = $(".shot-retouch-panel");
  if (panel) {
    const image = panel.querySelector(".frame-mask-stage img"), canvas = $("#frame-mask");
    const fitMask = () => {
      if (!canvas.isConnected || !image.naturalWidth) return;
      const stage = image.parentElement;
      const scale = Math.min(stage.clientWidth / image.naturalWidth, stage.clientHeight / image.naturalHeight);
      const width = image.naturalWidth * scale, height = image.naturalHeight * scale;
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      Object.assign(canvas.style, { inset:"auto", left:`${(stage.clientWidth-width)/2}px`, top:`${(stage.clientHeight-height)/2}px`, width:`${width}px`, height:`${height}px` });
      drawFrameMask();
    };
    image.addEventListener("load", fitMask);
    requestAnimationFrame(fitMask);
    for (const child of $(".shot-studio").children) if (!child.contains(panel)) child.inert = true;
    panel.addEventListener("keydown", event => {
      if (event.key === "Escape") { event.stopPropagation(); closeRetouch(); }
      if (event.key !== "Tab") return;
      const controls = [...panel.querySelectorAll("button:not(:disabled),textarea,input,[tabindex='0']")];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
  }
  $("#shot-video-prompt").addEventListener("input", (event) => { frame.videoPrompt = event.target.value; persistVideoCard(); });
  const updateVideoSummary = () => { $(".shot-video-summary").textContent = `${frame.videoModel} · ${frame.videoDuration}s`; };
  $$("[data-shot-video-model]").forEach(button=>button.addEventListener("click",()=>{
    frame.videoModel=button.dataset.shotVideoModel;
    $$("[data-shot-video-model]").forEach(option=>option.setAttribute("aria-checked",String(option===button)));
    updateVideoSummary();persistVideoCard();
  }));
  $$("[data-shot-video-duration]").forEach(button=>button.addEventListener("click",()=>{
    frame.videoDuration=Number(button.dataset.shotVideoDuration);
    $$("[data-shot-video-duration]").forEach(option=>option.setAttribute("aria-pressed",String(option===button)));
    updateVideoSummary();persistVideoCard();syncKeyframeShots();saveState();
  }));
  $("#shot-video-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (frame.videoStatus === "generating") return;
    if (!frame.videoPrompt.trim()) { showToast("Describe movement and camera."); return; }
    const candidate = currentFrameCandidate();
    if (candidate.versions.length || !DEMO_HAS_VIDEO) {
      frame.videoRequest = { operation: "image_to_video", shotId: frame.id, model:frame.videoModel, referenceImage: candidateImage(candidate), motionPrompt: frame.videoPrompt, duration: frame.videoDuration, status: "awaiting_provider" };
      saveShotCard(frame,candidate);
      saveState();
      render();
      showToast("Video service is not connected. Request saved.");
      return;
    }
    state.keyframeSelections[state.activeKeyframe] = { candidateIndex: state.keyframeIndexes[state.activeKeyframe], source: candidateImage(candidate), style: candidateStyle(candidate) };
    frame.videoRequest = { operation: "image_to_video", shotId: frame.id, model:frame.videoModel, referenceImage: candidateImage(candidate), imagePrompt: candidate.draft ?? candidate.prompt, motionPrompt: frame.videoPrompt, duration: frame.videoDuration, aspectRatio: state.ratio, status: "demo_only" };
    frame.videoStatus = "generating";
    if (frame.video) frame.video.confirmed = false;
    frame.videoExpanded = false;
    $("#shot-video")?.pause();
    const ref = candidateImage(candidate), target = frame, card = candidate.videoCard;
    saveShotCard(frame,candidate);
    const request = structuredClone(card.videoRequest);
    const pendingRequest = card.videoRequest;
    render();
    const timer = setTimeout(() => {
      shotVideoTimers.delete(candidate);
      if (!state.keyframePlan.includes(target) || candidateImage(candidate) !== ref || card.videoRequest !== pendingRequest) return;
      card.video = { source:pairedShotVideoSource(ref), referenceImage: ref, candidateId:candidate.id, duration:pairedShotVideoDuration(ref,request.duration), confirmed:false, demo: true };
      card.videoDuration=request.duration;
      card.videoStatus = "ready";
      const currentIndex = state.keyframePlan.indexOf(target);
      if (target.candidates[state.keyframeIndexes[currentIndex]] === candidate) loadShotCard(target,candidate);
      syncKeyframeShots();
      render();
      window.swipeGuide?.event("videoReady");
    }, 500);
    shotVideoTimers.set(candidate, timer);
  });
  for (const id of ["frame-prompt", "shot-video-prompt"]) {
    const input = $(`#${id}`);
    input.addEventListener("focus", () => {
      input.setSelectionRange(input.value.length, input.value.length);
    });
  }
  bindFrameEditor(currentFrameCandidate());
  bindKeyframeSwipe();
  bindKeyframeSwipe(true);
}

function changeKeyframeCount(delta) {
  if ((delta > 0 && state.keyframeCount >= 12) || (delta < 0 && state.keyframeCount <= 2)) return;
  if (delta > 0) {
    const index = state.keyframePlan.length;
    const demo = DEMO_SHOTS[index % DEMO_SHOTS.length];
    const frame = structuredClone(state.keyframePlan[0]);
    Object.assign(frame, {
      id: `K${index + 1}`, title: demo.title, image: demo.candidates[0].source,
      face: "front", video: null, videoStatus: "idle", videoRequest: null, retouchOpen: false,
      videoPrompt: demo.description, directVideo:state.generationType === "video" && DEMO_HAS_VIDEO
    });
    frame.candidates = demo.candidates.slice(0,state.candidatesPerKeyframe || 3).map((candidate, i) => ({
      ...structuredClone(state.keyframePlan[0].candidates[0]),
      id: `${frame.id}-${i}`, source: candidate.source, prompt: candidate.prompt,
      draft: null, change: "", strokes: [], versions: [], activeVersion: -1, request: null
    }));
    frame.cardsVersion = 0;
    frame.face = frame.directVideo ? "back" : "front";
    state.keyframePlan.push(frame);
    state.keyframeSelections.push(null);
    state.keyframeIndexes.push(0);
    state.activeKeyframe = index;
  } else {
    const removed = state.keyframePlan[state.activeKeyframe];
    removed.candidates.forEach(candidate => { clearTimeout(shotVideoTimers.get(candidate)); shotVideoTimers.delete(candidate); });
    state.keyframePlan.splice(state.activeKeyframe, 1);
    state.keyframeSelections.splice(state.activeKeyframe, 1);
    state.keyframeIndexes.splice(state.activeKeyframe, 1);
    state.activeKeyframe = Math.min(state.activeKeyframe, state.keyframePlan.length - 1);
  }
  state.keyframeCount = state.keyframePlan.length;
  state.keyframePlan.forEach((frame, index) => {
    frame.id = `K${index + 1}`;
    frame.candidates.forEach((candidate, i) => { candidate.id = `${frame.id}-${i}`; });
  });
  state.history = [];
  syncKeyframeShots();
  render();
  $(`[data-keyframe="${state.activeKeyframe}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
}

function decideKeyframe(adopt, animateNext = true) {
  const frame = currentKeyframe();
  if (shotAdopting || frame.retouchOpen) return;
  if (frame.face === "back") {
    if (!adopt || !shotVideoReady(frame)) return;
    $("#shot-video")?.pause();
    frame.video.confirmed = true;
    state.keyframeSelections[state.activeKeyframe] = { candidateIndex:state.keyframeIndexes[state.activeKeyframe],source:candidateImage(currentFrameCandidate()),style:candidateStyle(currentFrameCandidate()),version:currentFrameCandidate().activeVersion };
    saveShotCard(frame,currentFrameCandidate());
    state.videoSwipeHintDismissed = true;
    syncKeyframeShots();
    advanceShot(true, animateNext);
    return;
  }
  if (!prepareShotPreview(currentFrameCandidate()).ready || prepareShotPreview(currentFrameCandidate()).failed) return;
  if (!adopt) { browseKeyframe(1); return; }
  state.swipeHintDismissed = true;
  const candidate = currentFrameCandidate(), index = state.activeKeyframe;
  const source = candidateImage(candidate);
  if (frame.video && frame.video.referenceImage !== source) {
    frame.video = null;
    frame.videoStatus = "idle";
  }
  state.keyframeSelections[index] = { candidateIndex: state.keyframeIndexes[index], source, style: candidateStyle(candidate), version: candidate.activeVersion };
  saveShotCard(frame,candidate);
  syncKeyframeShots();
  advanceShot(false, animateNext);
  window.swipeGuide?.event("chosen");
}

function advanceShot(video, animate = true) {
  const index = state.activeKeyframe;
  state.activeKeyframe = index < state.keyframeCount - 1 ? index + 1 : video
    ? state.keyframePlan.findIndex((frame, i) => shotStatus(frame, i) !== "video_confirmed")
    : state.keyframeSelections.findIndex((entry) => !entry);
  if (state.activeKeyframe < 0) state.activeKeyframe = index;
  render();
  centerActiveShotAndDeal(animate);
}

function handleKeyframeKey(event) {
  if (!state.keyframePlan) return false;
  if (shotAdopting) return true;
  if (event.key === "Escape") {
    currentKeyframe().addCandidateOpen = false;
    currentKeyframe().retouchOpen = false;
    currentKeyframe().face = "front";
    render();
    return true;
  }
  if (currentKeyframe().retouchOpen) return true;
  if (currentKeyframe().addCandidateOpen) {
    if(event.key==="ArrowLeft"){event.preventDefault();browseKeyframe(-1);}
    if(event.key==="ArrowRight"){event.preventDefault();browseKeyframe(1);}
    return true;
  }
  if (currentKeyframe().face === "back") {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); browseKeyframe(event.key === "ArrowRight" ? 1 : -1); }
    if (event.key === "ArrowUp") { event.preventDefault(); decideKeyframe(true, false); }
    return true;
  }
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); browseKeyframe(event.key === "ArrowRight" ? 1 : -1); }
  if (event.key === "ArrowUp") { event.preventDefault(); decideKeyframe(true, false); }
  return true;
}

function bindKeyframeSwipe(videoSide = false) {
  const stage = $(videoSide ? ".shot-video-stage" : ".shot-image-stage"), button = stage;
  const content = $(videoSide ? ".shot-video-content" : "#flip-card");
  const carouselCards = [...stage.parentElement.querySelectorAll(":scope > .shot-carousel-card")];
  const screen = $(".shot-studio");
  const hint = $(videoSide ? "#shot-video-hint" : "#shot-hint");
  const hintText = videoSide ? "上滑确认视频" : "上滑确认图片";
  let start = null, dx = 0, dy = 0, axis = null, moved = false, settling = false, gesture;
  const carouselStep = () => Number(stage.parentElement.dataset.carouselStep) || stage.clientWidth + 10;
  const setRingPosition = (dragX) => {
    const step = carouselStep(), delta = dragX / step;
    button.style.transform = shotRingTransform(delta, step);
    button.style.opacity = shotRingOpacity(delta);
    button.style.zIndex = "3";
    carouselCards.forEach(card => positionShotRingCard(card, Number(card.dataset.carouselOffset) + delta, step));
  };
  button.addEventListener("click", (event) => { if (moved) { event.preventDefault(); event.stopImmediatePropagation(); moved = false; button.swipeMoved = false; } }, true);
  button.addEventListener("pointerdown", (event) => {
    if (shotAdopting || settling || (currentKeyframe().face === "back") !== videoSide || event.button !== 0) return;
    if (event.target.closest("#shot-video-progress")) return;
    if (!videoSide && $("#flip-card").disabled) return;
    button.swipeMoved = false;
    gesture?.abort();
    gesture=new AbortController();
    window.addEventListener("pointerup",finish,{signal:gesture.signal});
    window.addEventListener("blur",()=>{start=null;reset();gesture.abort();},{signal:gesture.signal});
    const box = button.getBoundingClientRect();
    start = { x: event.clientX, y: event.clientY, centerX:box.x+box.width/2, centerY:box.y+box.height/2 }; dx = dy = 0; axis = null; moved = false;
  });
  button.addEventListener("dragstart", (event) => event.preventDefault());
  const target = $(`[data-keyframe="${state.activeKeyframe}"]`);
  const reset = () => {
    button.style.transform = ""; button.style.opacity = ""; button.style.zIndex = "";
    content.style.transform = ""; content.style.opacity = "";
    button.classList.remove("is-swiping"); screen.classList.remove("is-adopting-media");
    const step = carouselStep();
    carouselCards.forEach(card => positionShotRingCard(card, Number(card.dataset.carouselOffset), step));
    target.classList.remove("is-adopt-target", "is-adopt-ready"); target.style.removeProperty("--adopt-progress");
    hint.classList.remove("is-dragging"); if (hint.querySelector("span")) hint.querySelector("span").textContent = hintText;
  };
  button.addEventListener("pointermove", (event) => {
    if (!start) return;
    if(event.pointerType==="mouse" && event.buttons===0){start=null;reset();gesture?.abort();return;}
    dx = event.clientX - start.x; dy = event.clientY - start.y;
    if (!axis && Math.max(Math.abs(dx), Math.abs(dy)) > 8) { axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y"; moved = true; button.swipeMoved = true; button.setPointerCapture(event.pointerId); }
    if (axis === "x") {
      button.classList.add("is-swiping");
      setRingPosition(dx);
    } else if (axis === "y" && (!videoSide || shotVideoReady(currentKeyframe()))) {
      const adopting = dy < -8;
      button.classList.toggle("is-swiping",adopting);
      screen.classList.toggle("is-adopting-media",adopting);
      const progress = Math.min(1,Math.max(0,-dy)/240);
      const tx = Math.max(-18,Math.min(18,dx*.25));
      const ty = dy < 0 ? dy*.85 : dy*.25;
      const tilt = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : progress*24;
      button.style.transform = `translate(${tx}px,${ty}px) perspective(700px) rotateX(${tilt}deg) scale(${1-progress*.04})`;
      button.style.opacity = String(1-progress*.15);
      target.classList.toggle("is-adopt-target", dy < -8);
      target.classList.toggle("is-adopt-ready", dy < -74);
      target.style.setProperty("--adopt-progress", String(Math.min(1, Math.max(0, -dy / 74))));
      hint.classList.add("is-dragging"); if (hint.querySelector("span")) hint.querySelector("span").textContent = dy < -74 ? "松开确认" : hintText;
    }
  });
  const finish = async (event) => {
    if (!start) return;
    start = null;
    gesture?.abort();
    if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
    if (event.type === "pointercancel") { reset(); return; }
    if (axis === "x" && Math.abs(dx) >= 60) {
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const direction = dx < 0 ? 1 : -1;
      if (!reduced) {
        settling = true;
        const step = carouselStep();
        const timing = { duration:220, easing:"cubic-bezier(.32,.72,0,1)", fill:"forwards" };
        const animations = [
          button.animate([
            { transform:button.style.transform, opacity:button.style.opacity },
            { transform:shotRingTransform(-direction, step), opacity:shotRingOpacity(-direction) }
          ], timing).finished,
          ...carouselCards.map(card => {
            const endPosition = Number(card.dataset.carouselOffset) - direction;
            return card.animate([
              { transform:card.style.transform, opacity:card.style.opacity },
              { transform:shotRingTransform(endPosition, step, true), opacity:shotRingOpacity(endPosition) }
            ], timing).finished;
          })
        ];
        await Promise.all(animations);
      }
      if (!button.isConnected) return;
      browseKeyframe(direction);
    } else if (axis === "y" && dy < -74 && (!videoSide || shotVideoReady(currentKeyframe()))) await animateShotAdoption(button, target);
    else {
      if (moved && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const timing = {duration:180,easing:"cubic-bezier(.22,.8,.2,1)"};
        button.animate([{transform:button.style.transform || "none",opacity:button.style.opacity || 1},{transform:"none",opacity:1}],timing);
        content.animate([{transform:content.style.transform || "none",opacity:content.style.opacity || 1},{transform:"none",opacity:1}],timing);
        const step = carouselStep();
        carouselCards.forEach(card => {
          const position = Number(card.dataset.carouselOffset);
          card.animate([
            {transform:card.style.transform,opacity:card.style.opacity},
            {transform:shotRingTransform(position,step,true),opacity:shotRingOpacity(position)}
          ],timing);
        });
      }
      reset();
    }
  };
  button.addEventListener("pointerup", finish);
  button.addEventListener("pointercancel", finish);
  button.addEventListener("lostpointercapture",()=>{if(start){start=null;reset();gesture?.abort();}});
}

function animateShotArrival() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const stage = $(currentKeyframe().face === "back" ? ".shot-video-stage" : ".shot-image-stage");
  if (stage && !stage.classList.contains("is-loading")) stage.animate([{opacity:.3,transform:"translateY(8px)"},{opacity:1,transform:"translateY(0)"}],{duration:180,easing:"ease-out"});
}

async function animateShotAdoption(button, target) {
  if (shotAdopting) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { decideKeyframe(true); return; }
  const frame = currentKeyframe(), screen = $(".shot-studio");
  shotAdopting = true;
  const box = button.getBoundingClientRect(), dest = target.getBoundingClientRect();
  const {width,height,x,y} = box;
  const ghost = button.cloneNode(true);
  ghost.querySelectorAll(".shot-media-label,.card-count,.shot-video-progress,.shot-video-back,.shot-image-neighbor,.shot-video-neighbor").forEach(node=>node.remove());
  ghost.querySelectorAll("[id]").forEach(node=>node.removeAttribute("id"));
  ghost.removeAttribute("id");
  const liveVideo = button.querySelector("video"), ghostVideo = ghost.querySelector("video");
  if (ghostVideo) {
    const still = document.createElement("canvas");
    still.width = liveVideo.videoWidth || 640; still.height = liveVideo.videoHeight || 360;
    if (liveVideo.readyState >= 2) still.getContext("2d").drawImage(liveVideo,0,0,still.width,still.height);
    ghostVideo.replaceWith(still);
  }
  ghost.querySelectorAll("img").forEach(image => { image.removeAttribute("onload"); image.removeAttribute("onerror"); });
  ghost.className = "shot-adopt-ghost";
  const phone=$(".device"),origin=phone.getBoundingClientRect();
  ghost.style.cssText = `position:absolute;left:${x-origin.x-phone.clientLeft}px;top:${y-origin.y-phone.clientTop}px;width:${width}px;height:${height}px;overflow:hidden;border-radius:16px;background:${getComputedStyle(button).backgroundImage};transform-origin:0 0;opacity:${button.style.opacity || 1}`;
  phone.append(ghost);
  button.style.opacity = "0";
  screen.inert = true;
  try {
    const landing = `translate(${dest.x-x}px,${dest.y-y}px) scale(${dest.width/width},${dest.height/height})`;
    await ghost.animate([
      {transform:"translate(0,0) scale(1)",opacity:Number(ghost.style.opacity),offset:0},
      {transform:`translate(${(dest.x-x)*.8}px,${(dest.y-y)*.8}px) scale(${1+(dest.width/width-1)*.8},${1+(dest.height/height-1)*.8})`,opacity:.85,offset:.7},
      {transform:landing,opacity:0,offset:1}
    ],{duration:260,easing:"cubic-bezier(.32,.72,0,1)",fill:"forwards"}).finished;
    shotAdopting = false;
    if (!button.isConnected || currentKeyframe() !== frame) return;
    const adoptedIndex = state.activeKeyframe;
    decideKeyframe(true);
    const thumbnail = $(`[data-keyframe="${adoptedIndex}"]`);
    thumbnail?.animate([{transform:"scale(1.06)"},{transform:"scale(1)"}],{duration:180,easing:"cubic-bezier(.32,.72,0,1)"});
    if (thumbnail) {
      const flash = document.createElement("span");
      flash.className = "shot-adopt-flash";
      thumbnail.append(flash);
      flash.animate([{opacity:.22},{opacity:0}],{duration:220,easing:"ease-out"}).finished.then(()=>flash.remove());
    }
  } finally {
    ghost.remove();
    screen.inert = false;
    shotAdopting = false;
  }
}

function bindShotVideoPlayer() {
  const video = $("#shot-video"), progress = $("#shot-video-progress");
  const autoPlay = shotAutoPlayRequested || currentKeyframe()?.face === "back";
  shotAutoPlayRequested = false;
  if (!video) return;
  if (autoPlay) requestShotVideoPlay();
  // Static preview servers may omit byte-range support. A local Blob makes
  // the complete demo clip seekable without changing the stored media source.
  if (video.dataset.demoSrc) {
    const source = video.dataset.demoSrc;
    if (progress) progress.disabled = true;
    if (!shotDemoClips.has(source)) shotDemoClips.set(source,fetch(source).then(response => {
      if (!response.ok) throw new Error("Demo clip unavailable");
      return response.blob();
    }).then(blob => URL.createObjectURL(blob)).catch(error => { shotDemoClips.delete(source); throw error; }));
    shotDemoClips.get(source).then(url => {
      if (video.isConnected) video.src = url;
    }).catch(() => {
      if (video.isConnected) { video.src = source; showToast("Demo clip could not fully load."); }
    });
    video.addEventListener("canplay",() => { if (progress) progress.disabled = false; },{once:true});
  }
  const update = () => {
    if (!progress) return;
    progress.value = Number.isFinite(video.duration) && video.duration > 0 ? Math.round(video.currentTime/video.duration*1000) : 0;
    progress.style.setProperty("--progress",`${Number(progress.value)/10}%`);
    progress.setAttribute("aria-valuetext",`${Math.round(video.currentTime)} of ${Math.round(video.duration || 0)} seconds`);
  };
  progress?.addEventListener("input",() => {
    if (Number.isFinite(video.duration)) video.currentTime = Number(progress.value)/1000*video.duration;
    update();
  });
  for (const event of ["play","pause","timeupdate","loadedmetadata","ended"]) video.addEventListener(event,update);
  update();
}

function bindShotPrompt(videoSide = false, more = false) {
  const frame = currentKeyframe();
  const form = $(more ? "#more-candidate-form" : videoSide ? "#shot-video-form" : "#frame-prompt-form"), handle = $(more ? "#more-prompt-handle" : videoSide ? "#video-prompt-handle" : "#prompt-handle"), input = $(more ? "#more-candidate-prompt" : videoSide ? "#shot-video-prompt" : "#frame-prompt");
  const front = $(videoSide ? ".keyframe-back" : ".keyframe-front"), stage = $(more ? ".shot-more-card.is-current" : videoSide ? ".shot-video-stage" : ".shot-image-stage");
  if (!form || !handle) return;
  const isOpen = () => more ? !!frame.moreExpanded : videoSide ? !!frame.videoExpanded : !!state.promptExpanded;
  const compact = () => 196;
  const expanded = () => Math.max(compact(),Math.min(360,front.clientHeight*.70));
  const setHeight = height => { form.style.height = `${height}px`; };
  const settle = (open, animate = true) => {
    const before = form.getBoundingClientRect(), imageBefore = stage.getBoundingClientRect();
    if (more) frame.moreExpanded = open;
    else if (videoSide) frame.videoExpanded = open;
    else state.promptExpanded = open;
    form.classList.toggle("is-expanded",open);
    handle.setAttribute("aria-expanded",String(open));
    for (const control of more ? form.querySelectorAll(".shot-more-details textarea,.shot-more-details button") : videoSide ? form.querySelectorAll("textarea,select") : [input]) control.tabIndex = open ? 0 : -1;
    if (!open && form.contains(document.activeElement) && document.activeElement !== handle) document.activeElement.blur();
    setHeight(open ? expanded() : compact());
    const after = form.getBoundingClientRect(), imageAfter = stage.getBoundingClientRect();
    if (animate && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      form.animate([{transform:`translateY(${before.y-after.y}px)`},{transform:"translateY(0)"}],{duration:240,easing:"cubic-bezier(.22,.8,.2,1)"});
      stage.animate([{transform:`translateY(${imageBefore.y+imageBefore.height/2-imageAfter.y-imageAfter.height/2}px)`},{transform:"translateY(0)"}],{duration:240,easing:"cubic-bezier(.22,.8,.2,1)"});
    }
    if (videoSide) saveShotCard(frame,currentFrameCandidate());
    saveState();
  };
  let drag = null, suppressClick = false;
  handle.addEventListener("pointerdown",event => {
    if (event.button !== 0) return;
    drag = {y:event.clientY,height:form.offsetHeight}; suppressClick = false;
    handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener("pointermove",event => {
    if (!drag) return;
    const dy = event.clientY-drag.y;
    if (Math.abs(dy)>5) suppressClick = true;
    if (dy < -12) form.classList.add("is-expanded");
    setHeight(Math.max(compact(),Math.min(expanded(),drag.height-dy)));
  });
  const finish = event => {
    if (!drag) return;
    const delta = drag.y-event.clientY; drag = null;
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    settle(event.type === "pointercancel" ? isOpen() : Math.abs(delta)>24 ? delta>0 : isOpen());
  };
  handle.addEventListener("pointerup",finish);
  handle.addEventListener("pointercancel",finish);
  handle.addEventListener("click",() => { if (suppressClick) { suppressClick=false; return; } settle(!isOpen()); });
  input.addEventListener("focus",() => settle(true));
  form.setExpanded = settle;
  settle(isOpen(),false);
}

function reorderKeyframe(from, to) {
  if (from === to) return;
  const active = state.keyframePlan[state.activeKeyframe];
  for (const list of [state.keyframePlan, state.keyframeSelections, state.keyframeIndexes]) {
    list.splice(to, 0, list.splice(from, 1)[0]);
  }
  state.activeKeyframe = state.keyframePlan.indexOf(active);
  state.keyframePlan.forEach((frame, index) => {
    frame.id = `K${index + 1}`;
    frame.candidates.forEach((candidate, i) => { candidate.id = `${frame.id}-${i}`; });
  });
  syncKeyframeShots();
  render();
}

function bindKeyframeReorder() {
  const rail = $(".keyframe-rail");
  const buttons = $$("[data-keyframe]");
  let timer, drag, ghost, scrolling, lastX, suppressClick = false;
  const clearMenu = () => $(".shot-frame-menu")?.remove();
  const showMenu = (button) => {
    clearMenu();
    const menu = document.createElement("div");
    menu.className = "shot-frame-menu";
    menu.setAttribute("role", "group");
    menu.setAttribute("aria-label", "Shot actions");
    const r = button.getBoundingClientRect(), screen = $(".shot-studio").getBoundingClientRect();
    const left = Math.max(8, Math.min(screen.width - 84, r.left - screen.left + r.width / 2 - 38));
    menu.style.left = `${left}px`;
    menu.style.setProperty("--arrow-left", `${Math.max(10, Math.min(66, r.left - screen.left + r.width / 2 - left))}px`);
    menu.style.top = `${r.bottom - screen.top + 8}px`;
    menu.innerHTML = `<button id="delete-keyframe" type="button" ${state.keyframeCount <= 2 ? "disabled" : ""}>Delete</button>`;
    menu.firstChild.addEventListener("click", () => {
      state.activeKeyframe = Number(button.dataset.keyframe);
      changeKeyframeCount(-1);
    });
    $(".shot-studio").append(menu);
  };
  const updateTarget = (x) => {
    lastX = x;
    if (!drag || !ghost) return;
    const phone=$(".device");
    ghost.style.left = `${x - phone.getBoundingClientRect().left - phone.clientLeft - drag.width / 2}px`;
    const candidates = buttons.filter(b => b !== drag.button);
    let before = candidates.find(b => x < b.getBoundingClientRect().left + b.offsetWidth / 2);
    buttons.forEach(b => b.classList.remove("is-drop-target"));
    (before || candidates.at(-1))?.classList.add("is-drop-target");
    drag.to = before ? Number(before.dataset.keyframe) - (Number(before.dataset.keyframe) > drag.from ? 1 : 0) : buttons.length - 1;
  };
  const autoScroll = () => {
    if (!drag || !ghost) return;
    const r = rail.getBoundingClientRect();
    if (lastX < r.left + 32) rail.scrollLeft -= 7;
    else if (lastX > r.right - 32) rail.scrollLeft += 7;
    updateTarget(lastX);
    scrolling = requestAnimationFrame(autoScroll);
  };
  buttons.forEach(button => {
    button.addEventListener("contextmenu", e => { e.preventDefault(); showMenu(button); });
    button.addEventListener("click", e => {
      if (suppressClick) { e.stopImmediatePropagation(); e.preventDefault(); suppressClick = false; return; }
      clearMenu();
    }, true);
    button.addEventListener("keydown", e => {
      const from = Number(button.dataset.keyframe);
      if (e.altKey && ["ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        reorderKeyframe(from, Math.max(0, Math.min(buttons.length - 1, from + (e.key === "ArrowLeft" ? -1 : 1))));
        $(`[data-keyframe="${state.activeKeyframe}"]`)?.focus({ preventScroll: true });
      }
      if (e.key === "Delete") { e.preventDefault(); state.activeKeyframe = from; changeKeyframeCount(-1); }
    });
    button.addEventListener("pointerdown", e => {
      if (e.button !== 0) return;
      clearMenu();
      const start = { x:e.clientX, y:e.clientY };
      const startScroll = rail.scrollLeft;
      button.setPointerCapture(e.pointerId);
      timer = setTimeout(() => {
        const r = button.getBoundingClientRect();
        drag = { button, from:Number(button.dataset.keyframe), to:Number(button.dataset.keyframe), start, width:r.width };
        button.setPointerCapture(e.pointerId);
        button.classList.add("is-held");
        rail.classList.add("is-reordering");
        showMenu(button);
        suppressClick = true;
      }, 450);
      button.onpointermove = event => {
        if(event.pointerType==="mouse" && event.buttons===0){finish({...event,type:"pointercancel",pointerId:e.pointerId});return;}
        if (!drag) {
          if (Math.hypot(event.clientX-start.x,event.clientY-start.y)>8) {
            clearTimeout(timer);
            rail.scrollLeft = startScroll - (event.clientX - start.x);
            suppressClick = true;
          }
          return;
        }
        event.preventDefault();
        if (!ghost && Math.abs(event.clientX-start.x)>6) {
          clearMenu();
          ghost = button.cloneNode(true);
          ghost.className = "shot-drag-ghost";
          ghost.removeAttribute("data-keyframe");
          const phone=$(".device"),origin=phone.getBoundingClientRect();
          ghost.style.cssText = `position:absolute;top:${rTop(button)-origin.top-phone.clientTop}px;width:${drag.width}px;height:${button.offsetHeight}px`;
          phone.append(ghost);
          lastX = event.clientX;
          autoScroll();
        }
        if (ghost) updateTarget(event.clientX);
      };
      const finish = event => {
        clearTimeout(timer);
        cancelAnimationFrame(scrolling);
        button.onpointermove=null;
        button.onpointerup=null;
        button.onpointercancel=null;
        button.onlostpointercapture=null;
        if (!drag) {
          if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
          return;
        }
        if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
        const { from, to } = drag;
        button.classList.remove("is-held");
        rail.classList.remove("is-reordering");
        buttons.forEach(b => b.classList.remove("is-drop-target"));
        const moved = !!ghost;
        ghost?.remove(); ghost = null; drag = null;
        if (moved && event.type !== "pointercancel") reorderKeyframe(from, to);
        if (event.type === "pointercancel") clearMenu();
      };
      button.onpointerup = finish;
      button.onpointercancel = finish;
      button.onlostpointercapture = event=>finish({...event,type:"pointercancel",pointerId:e.pointerId});
      const fallback=new AbortController();
      window.addEventListener("pointerup",event=>{if(button.onpointerup)finish(event);fallback.abort();},{signal:fallback.signal});
      window.addEventListener("blur",()=>{if(button.onpointercancel)finish({type:"pointercancel",pointerId:e.pointerId});fallback.abort();},{signal:fallback.signal});
    });
  });
  function rTop(button) { return button.getBoundingClientRect().top; }
}
