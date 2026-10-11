状态栏信号、Wi-Fi、电池直接复用本地已有 Figma 导出资产：

`ai-playground/public/demos/live-revenue/source-assets/src/page/viewer_live/assets/figma-live-default/`

保留原始 viewBox、尺寸、路径与电池边框/端帽透明度。它们是设计稿中的 iOS 状态栏资产，Web 原型不是系统原生状态栏。

CapCut loading 原始资源来自已安装 `com.lemon.lvoverseas` 的 base.apk 内 `assets/lv_loading.json`，保存在 `../capcut/lv-loading-source.json`。SVG 保留路径、遮罩、变换、描边、颜色及 96 帧/60fps 的 1.6 秒周期，将 Trim Path 转成循环 dashoffset。没有整块呼吸动画。

模拟器观察录像 `/tmp/loading-final.mp4` 捕获了该标志的加载弹层；当前 Pro 提示会打断生成流程。
