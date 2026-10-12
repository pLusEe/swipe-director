/* Sequence edits belong to the composition, independently of candidate browsing. */
let sequenceUndo = [];
let sequenceUndoProject;
let sequenceExportAbort;
let sequencePreviewAudio;
let sequenceStopPlayback = () => {};

function sequenceComposition() {
  if (sequenceUndoProject !== state.keyframePlan) {
    sequenceUndo = [];
    sequenceUndoProject = state.keyframePlan;
  }
  state.sequenceComposition ??= { order: [], edits: {}, ratio: state.ratio || "9:16", transition: "cut", music: null };
  const composition = state.sequenceComposition;
  for (const shot of state.shotPlan) {
    if (!composition.order.includes(shot.id)) composition.order.push(shot.id);
    const edit = composition.edits[shot.id] ??= { duration: 3, trimStart: 0, trimEnd: shot.duration || 5, x: 50, y: 50, fit: "contain", caption: "", removed: false, source: shot.video || shot.image };
    if (edit.source !== (shot.video || shot.image)) {
      edit.source = shot.video || shot.image;
      edit.trimStart = 0;
      edit.trimEnd = shot.duration || 5;
    }
  }
  return composition;
}

function editedSequenceClips() {
  const composition = sequenceComposition();
  const shots = new Map(state.shotPlan.map(shot => [shot.id, shot]));
  let start = 0;
  return composition.order.filter(id => shots.has(id) && !composition.edits[id].removed).map(id => {
    const shot = shots.get(id), edit = composition.edits[id];
    const duration = shot.video ? Math.max(.1, edit.trimEnd - edit.trimStart) : edit.duration;
    const clip = { ...shot, edit, duration, start };
    start += duration;
    return clip;
  });
}

function rememberSequenceEdit() {
  sequenceUndo.push(structuredClone(sequenceComposition()));
  if (sequenceUndo.length > 30) sequenceUndo.shift();
}

function sequenceRefresh(id) {
  const clips = sequenceClips();
  const clip = clips.find(item => item.id === id);
  state.sequenceTime = clip?.start ?? Math.min(state.sequenceTime || 0, clips.reduce((sum, item) => sum + item.duration, 0));
  sequenceStopPlayback();
  render();
}

function sequenceToolMarkup() {
  const tool = (label, glyph, attrs, native = true) => `<button type="button" ${attrs}>${native ? `<img src="assets/capcut/editor/${glyph}.png" alt="">` : icon(glyph)}<span>${label}</span></button>`;
  return `<nav class="sequence-toolbar" aria-label="Editing tools">
    <div class="sequence-tool-row sequence-global-tools" ${state.sequenceToolsOpen ? "hidden" : ""}>
      ${tool("Edit", "edit", 'id="sequence-edit"')}
      ${tool("Audio", "audio", 'disabled')}
      ${tool("Text", "text", 'disabled')}
      ${tool("Transition", "transition", 'disabled')}
      ${tool("Format", "rectangle-horizontal", 'disabled', false)}
    </div>
    <div class="sequence-selected-toolbar" ${state.sequenceToolsOpen ? "" : "hidden"}>
      <button type="button" class="sequence-tools-back" id="sequence-tools-back" aria-label="Back to composition tools"><img src="assets/capcut/editor/back.png" alt=""></button>
      <div class="sequence-tool-row sequence-shot-tools" aria-label="Selected shot tools">
        ${tool("Duration", "timing", 'data-sequence-panel="timing"')}
        ${tool("Delete", "remove", 'id="sequence-remove"')}
      </div>
    </div>
  </nav>`;
}

function sequenceSelectTools(selected) {
  state.sequenceToolsOpen = selected;
  $(".sequence-global-tools").hidden = selected;
  $(".sequence-selected-toolbar").hidden = !selected;
  $(".shot-sequence").classList.toggle("has-selected-clip", selected);
  saveState();
  window.swipeGuide?.update();
}

function sequenceTimelineMarkup(clips, total) {
  const scale = 24;
  return `<div class="sequence-timeline-window">
    <nav class="sequence-timeline" aria-label="Sequence shots">
      <div class="sequence-track-content" style="width:${total * scale}px">
        <div class="sequence-ruler">${Array.from({length: Math.floor(total / 2) + 1}, (_, i) => `<span style="left:${i * 2 * scale}px">${sequenceClock(i * 2)}</span>`).join("")}</div>
        <div class="sequence-filmstrip">${clips.map((item, i) => `<button type="button" data-sequence-shot="${i}" style="width:${item.duration * scale}px" aria-label="${item.id}, ${item.duration} seconds" aria-current="${i === state.sequenceIndex ? "step" : "false"}">
          <span class="sequence-film-images">${Array.from({length:Math.ceil(item.duration * scale / 44)}, () => `<img src="${escapeHtml(item.image)}" alt="" draggable="false">`).join("")}</span>
          <span class="sequence-clip-label">${item.id} · ${Number(item.duration.toFixed(1))}s</span>
          <span class="sequence-trim-handle is-start" data-trim-edge="start" role="slider" tabindex="0" aria-label="Trim start of ${item.id}" aria-valuemin="0" aria-valuemax="${item.video ? item.edit.trimEnd - .1 : 30}" aria-valuenow="${item.video ? item.edit.trimStart : item.duration}"></span>
          <span class="sequence-trim-handle is-end" data-trim-edge="end" role="slider" tabindex="0" aria-label="Trim end of ${item.id}" aria-valuemin="${item.video ? item.edit.trimStart + .1 : .5}" aria-valuemax="${item.video ? state.shotPlan.find(shot => shot.id === item.id).duration : 30}" aria-valuenow="${item.video ? item.edit.trimEnd : item.duration}"></span>
        </button>`).join("")}</div>
        <div class="sequence-lane sequence-audio-lane"><img src="assets/capcut/editor/audio.png" alt="">+ Add audio</div>
        <div class="sequence-lane sequence-text-lane"><img src="assets/capcut/editor/text.png" alt="">+ Add text</div>
      </div>
    </nav>
    <div class="sequence-playhead" aria-hidden="true"></div>
  </div>`;
}

// Non-modal native dialog stays in the phone's stacking context.
// A local overlay supplies the backdrop, focus trap and inert background.
function openSequenceDialog(dialog, dismiss = () => dialog.close()) {
  const screen=$(".shot-sequence"), previous=document.activeElement;
  const overlay=document.createElement("div");
  overlay.className="sequence-overlay";
  const background=[...screen.children].filter(child=>!child.classList.contains("sequence-overlay")).map(child=>[child,child.inert]);
  background.forEach(([child])=>child.inert=true);
  overlay.append(dialog);
  screen.append(overlay);
  dialog.setAttribute("aria-modal","true");
  const nativeClose=dialog.close.bind(dialog);
  let closed=false;
  dialog.close=()=>{
    if(closed)return;
    closed=true;
    nativeClose();
    background.forEach(([child,inert])=>child.inert=inert);
    overlay.remove();
    if(previous?.isConnected)previous.focus({preventScroll:true});
  };
  overlay.addEventListener("click",event=>{if(event.target===overlay)dismiss();});
  dialog.addEventListener("keydown",event=>{
    if(event.key==="Escape"){event.preventDefault();dismiss();return;}
    if(event.key!=="Tab")return;
    const controls=[...dialog.querySelectorAll('button,input,select,textarea,[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);
    if(!controls.length){event.preventDefault();return;}
    const first=controls[0],last=controls.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
  dialog.show();
  dialog.querySelector("button")?.focus({preventScroll:true});
}

function sequencePanel(name) {
  if(name==="export"){void exportSequence();return;}
  if(name!=="timing")return;
  sequenceStopPlayback();
  const clip = sequenceClips()[state.sequenceIndex], composition = sequenceComposition(), edit = clip.edit;
  const input = (label, key, value, attrs = "") => `<label>${label}<input name="${key}" value="${value}" ${attrs}></label>`;
  let content = "", title = "";
  if (name === "timing") {
    title = `${clip.id} · Timing`;
    content = clip.video
      ? `<p>Source: ${state.shotPlan.find(item=>item.id===clip.id)?.duration||5}s</p>${input("Start (seconds)", "trimStart", edit.trimStart, 'type="number" min="0" step="0.1"')}${input("End (seconds)", "trimEnd", edit.trimEnd, 'type="number" min="0.1" step="0.1"')}`
      : input("Hold (seconds)", "duration", edit.duration, 'type="number" min="0.5" max="30" step="0.5"');
  } else if (name === "crop") {
    title = `${clip.id} · Crop`;
    content = `<div class="sequence-crop-preview">${sequenceMedia(clip)}<div class="sequence-crop-grid" aria-hidden="true"></div></div><div class="sequence-fit-options" role="group" aria-label="Frame fit">${["contain","cover"].map(fit=>`<label><input type="radio" name="fit" value="${fit}" ${edit.fit===fit?"checked":""}><span>${fit==="contain"?"Fit":"Fill"}</span></label>`).join("")}</div>${input("Horizontal position", "x", edit.x, 'type="range" min="0" max="100"')}${input("Vertical position", "y", edit.y, 'type="range" min="0" max="100"')}`;
  } else if (name === "caption") {
    title = `${clip.id} · Caption`;
    content = `<label>Text<textarea name="caption" maxlength="180" rows="3" placeholder="Add a caption">${escapeHtml(edit.caption)}</textarea></label><p>Shown for this shot and included in the exported video.</p>`;
  } else if (name === "format") {
    title = "Video format";
    content = `<div class="sequence-ratio-options" role="group" aria-label="Aspect ratio">${["9:16","1:1","3:4","16:9"].map(ratio=>`<label><input type="radio" name="ratio" value="${ratio}" ${composition.ratio===ratio?"checked":""}><span><i style="aspect-ratio:${ratio.replace(":","/")}"></i></span><small>${ratio}</small></label>`).join("")}</div>`;
  } else if (name === "transition") {
    title = "Transition";
    content = `<label>Between shots<select name="transition"><option value="cut" ${composition.transition==="cut"?"selected":""}>Cut</option><option value="fade" ${composition.transition==="fade"?"selected":""}>Fade through black · 0.4s</option></select></label>`;
  } else if (name === "music") {
    title = "Music";
    content = `<label>Audio file<input name="musicFile" type="file" accept="audio/*"></label><p>${escapeHtml(composition.music?.name || "No music added")}</p>${input("Volume", "volume", composition.music?.volume ?? .7, 'type="range" min="0" max="1" step="0.05"')}<label class="sequence-checkbox"><input name="removeMusic" type="checkbox">Remove music</label>`;
  } else if (name === "order") {
    title = `${clip.id} · Order`;
    content = `<label>Position<select name="position">${sequenceClips().map((item,index)=>`<option value="${index}" ${item.id===clip.id?"selected":""}>${index+1} · ${item.id}</option>`).join("")}</select></label><p>You can also hold and drag a shot in the timeline.</p>`;
  }
  const dialog = document.createElement("dialog");
  dialog.className = `sequence-dialog${name==="crop"?" sequence-dialog--crop":""}`;
  dialog.setAttribute("aria-label",title);
  dialog.innerHTML = `<form class="sequence-panel"><div class="sequence-panel-header"><button type="button" id="sequence-panel-close" aria-label="Close">${icon("x")}</button><strong>${title}</strong><button class="sequence-panel-save" type="submit" aria-label="Apply">${icon("check")}</button></div>${content}<p class="sequence-panel-error" role="alert"></p></form>`;
  openSequenceDialog(dialog);
  window.swipeGuide?.update();
  dialog.querySelector("#sequence-panel-close").onclick = () => dialog.close();
  const form = dialog.querySelector("form");
  if (name === "crop") {
    const preview=dialog.querySelector(".sequence-frame");
    preview.style.aspectRatio=composition.ratio.replace(":","/");
    preview.append(dialog.querySelector(".sequence-crop-grid"));
    const media=preview.querySelector("img,video");
    media.style.objectFit=edit.fit;
    media.style.objectPosition=`${edit.x}% ${edit.y}%`;
    if(clip.video){media.removeAttribute("id");media.src=$("#sequence-video")?.src||clip.video;media.currentTime=edit.trimStart;}
  }
  // Position controls preview immediately; Cancel leaves the committed edit intact.
  if (name === "crop") form.addEventListener("input", () => {
    const data = new FormData(form);
    const media = dialog.querySelector(".sequence-frame > img,.sequence-frame > video");
    media.style.objectFit = data.get("fit");
    media.style.objectPosition = `${data.get("x")}% ${data.get("y")}%`;
  });
  dialog.addEventListener("close", () => sequenceApplyFrame(clip));
  form.onsubmit = async event => {
    event.preventDefault();
    const data = new FormData(form);
    const error = message => { form.querySelector(".sequence-panel-error").textContent=message; };
    if (name === "timing") {
      const duration=Number(data.get("duration")),start=Number(data.get("trimStart")),end=Number(data.get("trimEnd"));
      if (!clip.video && (!Number.isFinite(duration)||duration<.5||duration>30))return error("Choose a duration between 0.5 and 30 seconds.");
      if (clip.video && (!Number.isFinite(start)||!Number.isFinite(end)||start<0||end<=start||end>(state.shotPlan.find(item=>item.id===clip.id)?.duration||5)))return error("End must follow start and stay inside the source video.");
    }
    let music;
    if(name==="music" && data.get("musicFile")?.size){
      const file=data.get("musicFile");
      if(file.size>2*1024*1024)return error("Choose an audio file smaller than 2 MB so it can be saved with this demo.");
      try {
        music=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve({name:file.name,source:reader.result,volume:Number(data.get("volume"))});reader.onerror=reject;reader.readAsDataURL(file);});
        const audio=new Audio(music.source);
        await mediaLoaded(audio);
      } catch { return error("This audio file could not be read."); }
    }
    rememberSequenceEdit();
    if (name==="timing") {
      if(clip.video){edit.trimStart=Number(data.get("trimStart"));edit.trimEnd=Number(data.get("trimEnd"));}
      else edit.duration=Number(data.get("duration"));
    }
    if(name==="crop"){edit.fit=data.get("fit");edit.x=Number(data.get("x"));edit.y=Number(data.get("y"));}
    if(name==="caption")edit.caption=data.get("caption").trim();
    if(name==="format")composition.ratio=data.get("ratio");
    if(name==="transition")composition.transition=data.get("transition");
    if(name==="music"){
      if(data.get("removeMusic"))composition.music=null;
      else if(music)composition.music=music;
      else if(composition.music)composition.music.volume=Number(data.get("volume"));
    }
    if(name==="order")moveSequenceShot(clip.id,Number(data.get("position")),false);
    dialog.close();
    sequenceRefresh(clip.id);
    if (name === "timing") window.swipeGuide?.event("timingSaved");
  };
}

function sequenceApplyFrame(clip, time = state.sequenceTime || 0) {
  const frame=$(".sequence-frame");
  if(!frame || !clip)return;
  const [w,h]=sequenceComposition().ratio.split(":").map(Number);
  frame.style.aspectRatio=`${w}/${h}`;
  const area=$(".sequence-media");
  const width=Math.min(area.clientWidth,area.clientHeight*w/h);
  frame.style.width=`${width}px`;
  frame.style.height=`${width*h/w}px`;
  const media=frame.querySelector("img,video");
  if(media){media.style.objectFit=clip.edit.fit;media.style.objectPosition=`${clip.edit.x}% ${clip.edit.y}%`;}
  frame.querySelector(".sequence-caption").textContent=clip.edit.caption;
  let alpha=1;
  if(sequenceComposition().transition==="fade"){
    const local=time-clip.start;
    alpha=Math.max(0,Math.min(1,local/.2,(clip.duration-local)/.2));
  }
  frame.style.opacity=alpha;
}

function moveSequenceShot(id, target, remember = true) {
  const composition=sequenceComposition(), visible=sequenceClips();
  target=Math.max(0,Math.min(visible.length-1,target));
  const from=visible.findIndex(clip=>clip.id===id);
  if(from===target)return;
  if(remember)rememberSequenceEdit();
  composition.order.splice(composition.order.indexOf(id),1);
  const anchor=visible[target].id;
  composition.order.splice(composition.order.indexOf(anchor)+(target>from?1:0),0,id);
}

function bindSequenceEditing(stop) {
  sequenceStopPlayback=stop;
  $$("[data-sequence-panel]").forEach(button=>button.onclick=()=>sequencePanel(button.dataset.sequencePanel));
  $("#sequence-edit").onclick=()=>sequenceSelectTools(true);
  $("#sequence-tools-back").onclick=()=>sequenceSelectTools(false);
  $(".sequence-media").onclick=()=>sequenceSelectTools(false);
  $("#sequence-undo").onclick=()=>{if(!sequenceUndo.length)return;state.sequenceComposition=sequenceUndo.pop();sequenceRefresh();};
  $("#sequence-remove").onclick=()=>{
    const clips=sequenceClips();
    if(clips.length===1){showToast("Keep at least one shot.");return;}
    rememberSequenceEdit();
    sequenceComposition().edits[clips[state.sequenceIndex].id].removed=true;
    sequenceRefresh();
    showToast("Shot removed. Use Undo to restore it.");
  };
  const replace=$("#sequence-replace");
  if(replace)replace.onclick=()=>{
    const clip=sequenceClips()[state.sequenceIndex];
    state.sequenceReplacement={id:clip.id,time:state.sequenceTime};
    stop();
    state.activeKeyframe=state.keyframePlan.findIndex(frame=>frame.id===clip.id);
    const frame=currentKeyframe();
    frame.face="front";
    frame.addCandidateOpen=false;
    renderSequenceReplacement();
  };
  // A hold starts sorting; pointer capture and cancel keep desktop/touch release safe.
  $$("[data-sequence-shot]").forEach(button=>{
    let drag,timer,suppress=false;
    const cleanup=()=>{clearTimeout(timer);drag=null;button.classList.remove("is-sorting");};
    button.addEventListener("pointerdown",event=>{
      if(event.button!==0 || event.target.closest("[data-trim-edge]"))return;
      event.preventDefault();
      suppress=false;
      drag={x:event.clientX,y:event.clientY,target:Number(button.dataset.sequenceShot),active:false,scrolling:false,scroll:$(".sequence-timeline").scrollLeft,centers:$$("[data-sequence-shot]").map(item=>{const box=item.getBoundingClientRect();return box.x+box.width/2;})};
      if(event.pointerType==="touch")button.setPointerCapture(event.pointerId);
      timer=setTimeout(()=>{if(drag){drag.active=true;button.setPointerCapture(event.pointerId);button.classList.add("is-sorting");}},350);
    });
    button.addEventListener("pointermove",event=>{
      if(!drag)return;
      if(!drag.active){
        if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>8){clearTimeout(timer);drag.scrolling=true;suppress=true;}
        if(drag.scrolling)$(".sequence-timeline").scrollLeft=drag.scroll+drag.x-event.clientX;
        return;
      }
      event.preventDefault();
      suppress=true;
      let nearest=0,distance=Infinity;
      drag.centers.forEach((center,index)=>{const d=Math.abs(event.clientX-center);if(d<distance){distance=d;nearest=index;}});
      drag.target=nearest;
      button.style.transform=`translateX(${event.clientX-drag.x}px) scale(1.05)`;
    });
    button.addEventListener("pointerup",()=>{
      const completed=drag;
      button.style.transform="";
      cleanup();
      if(completed?.active && suppress){const clip=sequenceClips()[Number(button.dataset.sequenceShot)];moveSequenceShot(clip.id,completed.target);sequenceRefresh(clip.id);}
    });
    button.addEventListener("pointercancel",()=>{button.style.transform="";cleanup();});
    button.addEventListener("lostpointercapture",()=>{button.style.transform="";cleanup();});
    button.addEventListener("click",event=>{if(suppress){event.stopImmediatePropagation();suppress=false;}},true);
  });
  $$("[data-trim-edge]").forEach(handle=>{
    let drag;
    const button=handle.closest("[data-sequence-shot]");
    const clip=sequenceClips()[Number(button.dataset.sequenceShot)];
    const apply=(delta,initial)=>{
      const edit=clip.edit;
      if(!clip.video)edit.duration=Math.max(.5,Math.min(30,initial.duration+delta));
      else if(handle.dataset.trimEdge==="start")edit.trimStart=Math.max(0,Math.min(edit.trimEnd-.1,initial.trimStart+delta));
      else edit.trimEnd=Math.max(edit.trimStart+.1,Math.min(state.shotPlan.find(item=>item.id===clip.id).duration,initial.trimEnd+delta));
      const duration=clip.video?edit.trimEnd-edit.trimStart:edit.duration;
      button.style.width=`${duration*24}px`;
      button.querySelector(".sequence-clip-label").textContent=`${clip.id} · ${duration.toFixed(1)}s`;
      handle.setAttribute("aria-valuenow",String(clip.video?edit[handle.dataset.trimEdge==="start"?"trimStart":"trimEnd"]:edit.duration));
    };
    handle.addEventListener("pointerdown",event=>{
      event.stopPropagation();event.preventDefault();stop();
      rememberSequenceEdit();
      drag={x:event.clientX,initial:{...clip.edit}};
      handle.setPointerCapture(event.pointerId);
    });
    handle.addEventListener("pointermove",event=>{if(drag){event.stopPropagation();apply((event.clientX-drag.x)/24,drag.initial);}});
    handle.addEventListener("pointerup",event=>{event.stopPropagation();if(drag){drag=null;sequenceRefresh(clip.id);}});
    handle.addEventListener("pointercancel",()=>{if(drag){Object.assign(clip.edit,drag.initial);sequenceUndo.pop();drag=null;sequenceRefresh(clip.id);}});
    handle.addEventListener("click",event=>event.stopPropagation());
    handle.addEventListener("keydown",event=>{
      if(!["ArrowLeft","ArrowRight"].includes(event.key))return;
      event.preventDefault();stop();rememberSequenceEdit();
      apply(event.key==="ArrowRight"?.1:-.1,{...clip.edit});
      sequenceRefresh(clip.id);
    });
  });
}

function renderSequenceReplacement() {
  state.view="director";
  render();
}

function bindSequenceReplacement() {
  const back=$("#director-back"),preview=$("#preview-sequence");
  back.addEventListener("click",event=>{event.stopImmediatePropagation();state.sequenceTime=state.sequenceReplacement.time;state.sequenceReplacement=null;state.view="sequence";render();},{capture:true});
  preview.textContent="Done";
  preview.addEventListener("click",event=>{
    event.stopImmediatePropagation();
    const target=state.sequenceReplacement;
    const index=state.keyframePlan.findIndex(frame=>frame.id===target.id);
    if(!state.keyframeSelections[index]){showToast("Swipe up to confirm a replacement first.");return;}
    syncKeyframeShots();
    state.sequenceTime=target.time;
    state.sequenceReplacement=null;
    state.view="sequence";
    render();
  },{capture:true});
}

function mediaLoaded(media) {
  return new Promise((resolve,reject)=>{
    if(media.readyState>=2 || media.complete&&media.naturalWidth)return resolve(media);
    const done=()=>{clearTimeout(timer);media.removeEventListener("error",fail);resolve(media);};
    const fail=()=>{clearTimeout(timer);reject(new Error("A media file could not load."));};
    const timer=setTimeout(fail,15000);
    media.addEventListener(media instanceof HTMLImageElement?"load":"loadeddata",done,{once:true});
    media.addEventListener("error",fail,{once:true});
  });
}

function downloadSequenceBlob(blob,name) {
  const url=URL.createObjectURL(blob),anchor=document.createElement("a");
  anchor.href=url;anchor.download=name;anchor.click();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
}

async function sourceBlob(source) {
  const response=await fetch(source);
  if(!response.ok)throw new Error("A source file could not load.");
  return response.blob();
}

function drawSequenceImage(ctx,media,clip,width,height,alpha=1) {
  const mw=media.videoWidth||media.naturalWidth,mh=media.videoHeight||media.naturalHeight;
  const scale=clip.edit.fit==="cover"?Math.max(width/mw,height/mh):Math.min(width/mw,height/mh);
  const dw=mw*scale,dh=mh*scale;
  ctx.globalAlpha=alpha;
  ctx.drawImage(media,(width-dw)*clip.edit.x/100,(height-dh)*clip.edit.y/100,dw,dh);
  const caption=clip.edit.caption;
  if(caption){
    const size=Math.round(width/22);
    ctx.font=`500 ${size}px sans-serif`;ctx.textAlign="center";
    const words=caption.split(/\s+/),lines=[];let line="";
    for(const word of words){const next=line?`${line} ${word}`:word;if(ctx.measureText(next).width>width*.86&&line){lines.push(line);line=word;}else line=next;}
    if(line)lines.push(line);
    lines.slice(0,4).forEach((text,index)=>{const y=height-height*.08-(Math.min(lines.length,4)-1-index)*size*1.3;ctx.lineWidth=size*.16;ctx.strokeStyle="rgba(0,0,0,.8)";ctx.strokeText(text,width/2,y,width*.9);ctx.fillStyle="#fff";ctx.fillText(text,width/2,y,width*.9);});
  }
  ctx.globalAlpha=1;
}

async function renderSequenceVideo(clips,onProgress,signal,composition=structuredClone(sequenceComposition())) {
  if(!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream)throw new Error("Use Chrome to export video.");
  const mime=["video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/mp4;codecs=avc1.42001E,mp4a.40.2","video/webm"].find(type=>MediaRecorder.isTypeSupported(type));
  if(!mime)throw new Error("Video encoding is unavailable in this browser.");
  const quality=state.exportQuality||"1080P",long={ "720P":1280,"1080P":1920,"4K":3840 }[quality];
  const [rw,rh]=composition.ratio.split(":").map(Number);
  const canvas=document.createElement("canvas");
  canvas.width=Math.round((rw>=rh?long:long*rw/rh)/2)*2;
  canvas.height=Math.round((rh>=rw?long:long*rh/rw)/2)*2;
  const ctx=canvas.getContext("2d"),urls=[],media=[],stream=canvas.captureStream(30);
  let recorder,audioContext,audio,recordingError;
  const abort=()=>{throw new DOMException("Export cancelled.","AbortError");};
  try{
    for(const clip of clips){
      if(signal.aborted)abort();
      const element=clip.video?document.createElement("video"):new Image();
      if(clip.video){const url=URL.createObjectURL(await sourceBlob(clip.video));urls.push(url);element.src=url;element.muted=true;element.playsInline=true;element.loop=true;}
      else element.src=clip.image;
      await mediaLoaded(element);media.push(element);
    }
    audioContext=new AudioContext();
    await audioContext.resume();
    const destination=audioContext.createMediaStreamDestination();
    media.forEach(element=>{if(element instanceof HTMLVideoElement)audioContext.createMediaElementSource(element).connect(destination);});
    if(composition.music){
      audio=new Audio(composition.music.source);audio.loop=true;await mediaLoaded(audio);
      const gain=audioContext.createGain();gain.gain.value=composition.music.volume;
      audioContext.createMediaElementSource(audio).connect(gain).connect(destination);
      audio.currentTime=clips[0].start%audio.duration;
    }
    if(composition.music || clips.some(clip=>clip.video))destination.stream.getAudioTracks().forEach(track=>stream.addTrack(track));
    recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:quality==="4K"?24000000:quality==="1080P"?10000000:5000000});
    const chunks=[],finished=new Promise((resolve,reject)=>{recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};recorder.onstop=()=>recordingError?reject(recordingError):resolve(new Blob(chunks,{type:mime}));recorder.onerror=event=>{recordingError=event.error||new Error("Video encoding failed.");};});
    ctx.fillStyle="#000";ctx.fillRect(0,0,canvas.width,canvas.height);
    drawSequenceImage(ctx,media[0],clips[0],canvas.width,canvas.height);
    recorder.start(250);
    if(audio)await audio.play();
    const total=clips.reduce((sum,clip)=>sum+clip.duration,0);let elapsed=0;
    for(let index=0;index<clips.length;index++){
      const clip=clips[index],element=media[index];
      if(signal.aborted)abort();
      if(clip.video){element.currentTime=clip.edit.trimStart;await new Promise(resolve=>{element.addEventListener("seeked",resolve,{once:true});setTimeout(resolve,300);});await element.play();}
      const started=performance.now();
      await new Promise((resolve,reject)=>{
        const frame=()=>{
          if(signal.aborted)return reject(new DOMException("Export cancelled.","AbortError"));
          if(recordingError)return reject(recordingError);
          const local=Math.min(clip.duration,(performance.now()-started)/1000);
          ctx.fillStyle="#000";ctx.fillRect(0,0,canvas.width,canvas.height);
          const alpha=composition.transition==="fade"?Math.max(0,Math.min(1,local/.2,(clip.duration-local)/.2)):1;
          drawSequenceImage(ctx,element,clip,canvas.width,canvas.height,alpha);
          onProgress((elapsed+local)/total);
          if(local>=clip.duration)resolve();else requestAnimationFrame(frame);
        };frame();
      });
      if(clip.video)element.pause();
      elapsed+=clip.duration;
    }
    recorder.stop();
    return {blob:await finished,extension:mime.startsWith("video/mp4")?"mp4":"webm"};
  } finally {
    if(recorder?.state==="recording")recorder.stop();
    media.forEach(element=>element.pause?.());audio?.pause();
    stream.getTracks().forEach(track=>track.stop());
    await audioContext?.close();
    urls.forEach(url=>URL.revokeObjectURL(url));
  }
}

function sequenceZip(entries) {
  const encoder=new TextEncoder(),parts=[],central=[];let offset=0;
  const crc32=bytes=>{let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^(crc&1?0xedb88320:0);}return (crc^0xffffffff)>>>0;};
  entries.forEach(({name,bytes})=>{
    const filename=encoder.encode(name),crc=crc32(bytes),header=new Uint8Array(30+filename.length),view=new DataView(header.buffer);
    view.setUint32(0,0x04034b50,true);view.setUint16(4,20,true);view.setUint16(6,0x800,true);view.setUint32(14,crc,true);view.setUint32(18,bytes.length,true);view.setUint32(22,bytes.length,true);view.setUint16(26,filename.length,true);header.set(filename,30);
    const directory=new Uint8Array(46+filename.length),dv=new DataView(directory.buffer);
    dv.setUint32(0,0x02014b50,true);dv.setUint16(4,20,true);dv.setUint16(6,20,true);dv.setUint16(8,0x800,true);dv.setUint32(16,crc,true);dv.setUint32(20,bytes.length,true);dv.setUint32(24,bytes.length,true);dv.setUint16(28,filename.length,true);dv.setUint32(42,offset,true);directory.set(filename,46);
    parts.push(header,bytes);central.push(directory);offset+=header.length+bytes.length;
  });
  const size=central.reduce((sum,item)=>sum+item.length,0),end=new Uint8Array(22),dv=new DataView(end.buffer);
  dv.setUint32(0,0x06054b50,true);dv.setUint16(8,entries.length,true);dv.setUint16(10,entries.length,true);dv.setUint32(12,size,true);dv.setUint32(16,offset,true);
  return new Blob([...parts,...central,end],{type:"application/zip"});
}

async function exportSequence() {
  if(sequenceExportAbort)return;
  sequenceStopPlayback();
  const clips=structuredClone(sequenceClips()),composition=structuredClone(sequenceComposition());
  const dialog=document.createElement("dialog");dialog.className="sequence-dialog sequence-native-export";
  const quality=(state.exportQuality||"1080P").toLowerCase();
  dialog.innerHTML=`
    <button type="button" class="native-export-back" aria-label="Cancel export">${capcutIcon("nav-back")}</button>
    <h1>Exporting in ${escapeHtml(quality)} for<br>free...</h1>
    <p class="native-export-note">Please don’t close CapCut or lock your screen.</p>
    <div class="native-export-thumbnail" style="aspect-ratio:${composition.ratio.replace(":","/")}">
      <img src="${escapeHtml(clips[0].image)}" alt="Video preview">
      <svg class="native-export-border" aria-hidden="true">
        <path class="native-export-border-track" fill="none" stroke="#383838" stroke-width="5"/>
        <path class="native-export-border-progress" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="butt" visibility="hidden"/>
      </svg>
      <span class="native-export-percent" role="progressbar" aria-label="Export progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">0.0%</span>
    </div>`;
  const controller=new AbortController();sequenceExportAbort=controller;
  dialog.setAttribute("aria-label","Export progress");
  openSequenceDialog(dialog,()=>controller.abort());
  window.swipeGuide?.event("exportStart");
  dialog.querySelector(".native-export-back").onclick=()=>controller.abort();
  dialog.addEventListener("cancel",event=>{event.preventDefault();controller.abort();});
  const progress=value=>{
    const percent=Math.max(0,Math.min(100,value*100));
    const label=dialog.querySelector(".native-export-percent");
    label.textContent=`${percent.toFixed(1)}%`;
    label.setAttribute("aria-valuenow",percent.toFixed(1));
    // Use screen pixels for both geometry and dashes. Normalized pathLength
    // combined with non-scaling strokes can repeat the dash after SVG scaling.
    const border=dialog.querySelector(".native-export-border");
    const {width,height}=border.getBoundingClientRect();
    const inset=2.5,perimeter=2*(width+height-4*inset);
    const path=`M ${inset} ${inset} H ${width-inset} V ${height-inset} H ${inset} Z`;
    border.setAttribute("viewBox",`0 0 ${width} ${height}`);
    border.querySelector(".native-export-border-track").setAttribute("d",path);
    const line=border.querySelector(".native-export-border-progress");
    line.setAttribute("d",path);
    line.setAttribute("stroke-dasharray",`${perimeter} ${perimeter}`);
    line.setAttribute("stroke-dashoffset",perimeter*(1-percent/100));
    line.setAttribute("visibility",percent>0?"visible":"hidden");
  };
  progress(0);
  try{
    const result=await renderSequenceVideo(clips,progress,controller.signal,composition);
    downloadSequenceBlob(result.blob,`swipe-director.${result.extension}`);
    showToast("Video exported.");
    window.swipeGuide?.event("exportDone");
  }catch(error){
    showToast(error.name==="AbortError"?"Export cancelled.":error.message);
    window.swipeGuide?.event("exportCancelled");
  }
  finally{sequenceExportAbort=null;dialog.close();dialog.remove();}
}
