const { test, expect } = require("@playwright/test");
test.use({
  viewport: { width: 393, height: 852 },
  reducedMotion: "reduce",
  launchOptions: { executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" }
});

test("sequence edits survive reload; removal is reversible and video seeks inside trim", async ({ page }) => {
  await page.goto("http://127.0.0.1:4330");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.evaluate(() => {
    state.shotPlan = [
      { id: "K1", image: "assets/shot-01-f.jpg", video: null },
      { id: "K2", image: "assets/shot-02-f.jpg", video: "assets/zombie-cleaner/paired/shot-02-2.webm", duration: 5 }
    ];
    state.view = "sequence";
    render();
  });
  await page.locator('[data-sequence-shot="0"]').click();
  await page.locator('[data-sequence-panel="timing"]').click();
  await page.locator('[name="duration"]').fill("1");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page.locator("#sequence-progress")).toHaveAttribute("max", "6");
  await page.locator("#sequence-remove").click();
  await expect(page.locator("[data-sequence-shot]")).toHaveCount(1);
  await page.locator("#sequence-undo").click();
  await expect(page.locator("[data-sequence-shot]")).toHaveCount(2);
  await page.locator('[data-sequence-shot="1"]').click();
  await page.locator('[data-sequence-panel="timing"]').click();
  await page.locator('[name="trimStart"]').fill("1");
  await page.locator('[name="trimEnd"]').fill("2");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await page.waitForFunction(() => Math.abs(document.querySelector("#sequence-video")?.currentTime - 1) < .15);
  await page.reload();
  await expect(page.locator("#sequence-progress")).toHaveAttribute("max", "2");
});

test("complete export produces a playable video", async ({ page }) => {
  await page.goto("http://127.0.0.1:4330");
  await page.evaluate(async () => {
    state.sequenceComposition = null;
    state.shotPlan = [{ id: "K1", image: "assets/shot-01-f.jpg", video: null }];
    state.sequenceTime = 0;
    state.exportQuality = "720P";
    state.view = "sequence";
    render();
    sequenceComposition().edits.K1.duration = 2;
    const result = await renderSequenceVideo(sequenceClips(), () => {}, new AbortController().signal);
    const video = document.createElement("video");
    video.src = URL.createObjectURL(result.blob);
    await mediaLoaded(video);
    if (!video.videoWidth || !video.videoHeight || video.duration < .3) throw new Error("Export is not playable");
    URL.revokeObjectURL(video.src);
  });
});

test("playback resumes timeline movement after dragging against the left boundary", async ({ page }) => {
  await page.goto("http://127.0.0.1:4330");
  await page.evaluate(() => {
    state.sequenceComposition = null;
    state.sequenceTime = 0;
    state.shotPlan = [{ id: "K1", image: "assets/outsider/k1a.png", video: "assets/outsider/videos/k1.mp4", duration: 12.064 }];
    state.view = "sequence";
    render();
  });
  await page.waitForFunction(() => document.querySelector("#sequence-video")?.readyState >= 3);
  const timeline = await page.locator(".sequence-timeline").boundingBox();
  await page.mouse.move(timeline.x + 30, timeline.y + 110);
  await page.mouse.down();
  await page.mouse.move(timeline.x + 90, timeline.y + 110);
  await page.mouse.up();
  await page.getByRole("button", { name: "Play sequence", exact: true }).click();
  await expect.poll(() => page.locator(".sequence-timeline").evaluate(el => el.scrollLeft)).toBeGreaterThan(12);
  const values = await page.evaluate(() => ({ time: state.sequenceTime, scroll: document.querySelector(".sequence-timeline").scrollLeft }));
  expect(Math.abs(values.scroll - values.time * 24)).toBeLessThan(2);
});

test("desktop phone contains edit and export sheets; example tools stay static", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("http://127.0.0.1:4330");
  await page.evaluate(() => {
    state.sequenceComposition = null;
    state.sequenceTime = 0;
    state.sequenceToolsOpen = false;
    state.shotPlan = [{ id: "K1", image: "assets/shot-01-f.jpg", video: null }];
    state.view = "sequence";
    render();
    sequenceComposition().edits.K1.duration = .5;
  });
  const phone = await page.locator(".shot-sequence").boundingBox();
  const toolbar = await page.locator(".sequence-toolbar").boundingBox();
  expect(Math.abs(phone.y + phone.height - toolbar.y - toolbar.height)).toBeLessThan(1);
  for (const name of ["Audio", "Text", "Transition", "Format"]) {
    await expect(page.locator(".sequence-global-tools").getByRole("button", { name, exact: true })).toBeDisabled();
  }
  const insidePhone = async () => {
    const panel = await page.locator(".sequence-dialog").boundingBox();
    expect(panel.x).toBeGreaterThanOrEqual(phone.x - 1);
    expect(panel.x + panel.width).toBeLessThanOrEqual(phone.x + phone.width + 1);
    expect(panel.y + panel.height).toBeLessThanOrEqual(phone.y + phone.height + 1);
  };
  await page.locator("#sequence-edit").click();
  await page.getByRole("button", { name: "Duration", exact: true }).click();
  await insidePhone();
  await page.keyboard.press("Escape");
  await expect(page.locator(".sequence-overlay")).toHaveCount(0);
  const downloaded = page.waitForEvent("download");
  await page.locator("#sequence-export").click();
  await insidePhone();
  await expect(page.locator(".sequence-dialog")).not.toContainText(/ZIP|source materials|Download/i);
  await expect(page.locator(".sequence-native-export h1")).toHaveText("Exporting in 1080p forfree...");
  await expect(page.getByRole("progressbar", { name: "Export progress" })).toBeVisible();
  expect((await downloaded).suggestedFilename()).toMatch(/^swipe-director\.(webm|mp4)$/);
  await expect(page.locator(".sequence-overlay")).toHaveCount(0);
  await expect(page.locator("#sequence-export")).toBeEnabled();
});

test("native export fills the phone and cancellation preserves edits at both mobile widths", async ({ page }) => {
  await page.goto("http://127.0.0.1:4330");
  await page.evaluate(() => {
    state.sequenceComposition = null;
    state.sequenceTime = 0;
    state.shotPlan = [{ id: "K1", image: "assets/outsider/k1a.png", video: null }];
    state.view = "sequence";
    render();
    sequenceComposition().edits.K1.duration = 10;
  });
  for (const width of [393, 320]) {
    await page.setViewportSize({ width, height: 852 });
    await page.locator("#sequence-export").click();
    const screen = await page.locator(".shot-sequence").boundingBox();
    const panel = await page.locator(".sequence-native-export").boundingBox();
    expect(Math.abs(panel.height - screen.height)).toBeLessThan(1);
    for (const selector of [".native-export-thumbnail", ".native-export-note"]) {
      const box = await page.locator(selector).boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(screen.x);
      expect(box.x + box.width).toBeLessThanOrEqual(screen.x + screen.width);
      expect(box.y + box.height).toBeLessThanOrEqual(screen.y + screen.height);
    }
    await expect(page.locator(".native-export-upgrade")).toHaveCount(0);
    await page.getByRole("button", { name: "Cancel export" }).click();
    await expect(page.locator(".sequence-overlay")).toHaveCount(0);
    expect(await page.evaluate(() => sequenceComposition().edits.K1.duration)).toBe(10);
  }
});

test("Preview validation toast stays inside the phone on desktop and narrow screens", async ({ page }) => {
  await page.goto("http://127.0.0.1:4330");
  await page.evaluate(() => {
    state.shotPlan = DEMO_SHOTS.map((shot, index) => ({ id: `K${index + 1}`, image: shot.candidates[0].source, duration: 5 }));
    ensureKeyframeState();
    state.keyframeSelections = [];
    state.view = "director";
    render();
  });
  for (const viewport of [{ width: 1440, height: 1100 }, { width: 320, height: 700 }]) {
    await page.setViewportSize(viewport);
    await page.locator("#preview-sequence").click();
    await expect(page.locator(".device > #toast")).toHaveText("Confirm all shots to preview.");
    await expect(page.locator("#toast")).toHaveCSS("opacity", "1");
    const phone = await page.locator(".device").boundingBox();
    const toast = await page.locator("#toast").boundingBox();
    expect(toast.x).toBeGreaterThan(phone.x);
    expect(toast.y).toBeGreaterThan(phone.y);
    expect(toast.x + toast.width).toBeLessThan(phone.x + phone.width);
    expect(toast.y + toast.height).toBeLessThan(phone.y + phone.height);
  }
});
