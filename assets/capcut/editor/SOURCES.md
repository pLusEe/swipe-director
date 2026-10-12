# CapCut editor reference

Source: installed CapCut Android app (`com.lemon.lvoverseas`) on emulator-5554, inspected on 2026-10-11.

Native toolbar glyphs were extracted from independent ADB screenshots of the default editor, selected clip toolbar, and horizontally scrolled clip toolbar. Background pixels were converted to transparency; no replacement glyphs were drawn.

- `audio.png`, `text.png`, `edit.png`, `transition.png`, `undo.png`: default editor.
- `timing.png`, `remove.png`, `back.png`: selected clip.
- `crop.png`: selected clip toolbar after horizontal scroll.

Replace, order and format reuse the prototype's existing SVG icon library. Layout follows the observed native hierarchy, adapted to the existing iOS device shell and the prototype's supported functions. It is not a complete reproduction of CapCut.

Observed states: continuous filmstrip timeline, central stationary playhead, audio/text lanes, one bottom icon-and-label toolbar, contextual toolbar replacing global tools, white selected clip boundary and trim handles, dedicated full-screen crop preview.
