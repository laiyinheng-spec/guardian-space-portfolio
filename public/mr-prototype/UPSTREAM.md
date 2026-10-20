# Prototype provenance

Original standalone HTML/CSS/JavaScript and all 62 assets were copied from
https://github.com/laiyinheng-spec/guardian-space-prototype
at commit `d5dc49748c3b310c6221f642d6b43d9d773e84b6`.

This is a same-origin standalone copy served with the portfolio so its real
camera/gesture document can own Close, Escape, asynchronous teardown, and a
reliable explicit return URL. The CTA still opens a separate tab. The external
Vercel deployment has not been changed or deployed by this change.

All asset bytes are unchanged. Changes to the original source are limited to
exit navigation, lifecycle cancellation/late-result guards, and reserving space
for the Close button above the existing gesture-room controls. Dog behaviors,
gesture thresholds, scene flows, shaders and original visual assets are retained.
Existing Three.js and MediaPipe CDN imports remain as in the original source.
