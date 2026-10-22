# NOVA visual refresh — 2026-10-23

## Scope

- Replaced the landing experience with a navy/blue visual system, original shield artwork, animated orbits, a floating shield, and scroll reveals.
- Retained the existing accounts, reports, community, chat, AI, and staff routes and server implementations.
- Removed the branded entrance overlay and sidebar full-page reload timer. Added grouped navigation and a mobile bottom dock; the closed mobile drawer is inert.
- Scoped the site's layout away from the nested AI workspace to remove inherited sidebar offsets.
- Motion can be disabled on the home page or in display settings. System reduced-motion preference takes precedence. Hero animation pauses when offscreen or the document is hidden.

## Tutorial

`public/media/smai-guide-he.mp4` is a locally edited video made from real, manually captured site screenshots. It is not a continuous screen recording. It includes a moving pointer, subtle zoom, fades, Hebrew synthetic narration, captions, a transcript, and chapter navigation.

The 13 chapters cover harassment, account compromise, SMAI AI, report navigation, platform/category choice, information to include, review, tracking, staff assistance, and emergencies. No real report or AI request was submitted for the demonstration. Screenshots use demonstration content; the account header and tracking history are excluded.

The tutorial is loaded only after the home-page button is pressed. There is no audio autoplay. Closing the dialog stops playback and restores focus.

Source captures are local under `.local/tutorial-frames` and are not committed. `scripts/create-tutorial.mjs` renders the video with Sharp, ffmpeg, and the macOS Carmit Hebrew voice. `SHARP_MODULE_PATH`, `FFMPEG_BIN`, and `FFPROBE_BIN` can select installed binaries. macOS speech-service access is required.

Safety references:

- https://www.gov.il/he/Departments/Units/105_call_center
- https://www.isoc.org.il/digital-literacy/online-safety-guides/guides-users/guide-prevention-of-online-vulnerabilities

The tutorial does not promise account recovery, removal of content, or emergency intervention. It directs immediate danger in Israel to 100 and online harm involving minors to 105. It tells users not to send passwords, verification codes, or intimate content.

## Original artwork

Asset: `public/assets/sentinel-core.webp` (1024×1024, approximately 75 KB).
Tool: `image_gen.imagegen`, then local WebP encoding.
Prompt:

> Use case: stylized-concept. Asset type: original premium website hero artwork for SMAI Sentinel, a digital safety community. Create a cinematic studio 3D render of one monumental sculptural protective shield made of smoked cobalt glass and brushed titanium, hollow geometric shield outline with a luminous blue core. Three thin elliptical orbital rings weave around it with tiny cyan points, precision engineered, elegant not busy. Deep almost-black midnight navy background #080d18, subtle blue atmosphere, clean edges fading into the same dark background. Object centered, occupying 65% of frame with generous margins, square composition. Electric blue rim light, fine metallic reflections, editorial product photography, extremely polished high end technology brand. No text, no letters, no logos, no UI, no watermarks, no people, no padlock, no robot, no purple. Designed for a website: dramatic readable silhouette at 450px, dark image blends with dark page.

## Verification

- Focused automated suite: home-design, ai-ui, ai-agent, api.
- Production build using `node scripts/build.mjs`.
- Browser checks: desktop 1440×980; mobile 390×844; landscape 844×390. Home, report, community, navigation, AI workspace, tutorial load/play/seek/close.
- Existing Chrome extension work in the worktree is deliberately excluded from this release.

This release changes the frontend and static media; it does not deploy or reconfigure the backend and does not claim to fix every existing server issue.
