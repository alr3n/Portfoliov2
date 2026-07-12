// Shared scroll state — written by the Lenis loop in App.jsx,
// read every frame by the WebGL scene. Avoids React re-renders.
export const scrollState = {
  progress: 0, // 0..1 across the whole page
  velocity: 0,
  pointer: { x: 0, y: 0 } // normalized -1..1
}
