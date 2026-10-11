# Swipe Director

A mobile UI prototype for exploring AI video shots through paired image and video cards.

## Run locally

Requires Python 3. From this directory:

```sh
python3 -m http.server 4330
```

Open http://localhost:4330 in Chrome or another browser.

## Current snapshot

- Six shots, with four image candidates per shot.
- Swipe horizontally to browse candidates, including an additional-image card.
- Swipe upward to confirm an image or a generated video.
- Tap an image to open its video side.
- Image and video settings include model selection and editable prompts.
- Long press shot thumbnails to reorder or remove shots.

This is a prototype. Image and video generation services are not connected. Additional images use local demonstration assets; video generation saves a request. Final video export is not implemented. Prompts for shots K5 and K6 remain unfinished.

The included images and UI assets are part of this demonstration. No license to redistribute third-party assets is implied.
