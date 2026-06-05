import { useEffect, useRef, useState } from "react";
import { useCircleStore } from "../store/useCircleStore";
import { drawConfig } from "../core/renderer/drawConfig";

export function CanvasPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const configs = useCircleStore((s) => s.configs);
  const params = useCircleStore((s) => s.params);
  const duration = useCircleStore((s) => s.gif.duration);

  const [playing, setPlaying] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Keep latest values available to the animation loop without re-subscribing.
  const state = useRef({ configs, params, duration, playing, zoom, pan });
  state.current = { configs, params, duration, playing, zoom, pan };

  useEffect(() => {
    let raf = 0;
    let start = performance.now();
    let lastPhase = 0;

    const render = (now: number) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        const dpr = window.devicePixelRatio || 1;
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
          canvas.width = cw * dpr;
          canvas.height = ch * dpr;
        }
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const cur = state.current;
          const size = cur.params.size;
          const base = Math.min((cw * 0.92) / size, (ch * 0.92) / size);
          const scale = base * cur.zoom * dpr;
          const offX = ((cw - size * base * cur.zoom) / 2 + cur.pan.x) * dpr;
          const offY = ((ch - size * base * cur.zoom) / 2 + cur.pan.y) * dpr;

          if (cur.playing) {
            lastPhase = ((now - start) / (cur.duration * 1000)) % 1;
          }

          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.setTransform(scale, 0, 0, scale, offX, offY);
          drawConfig(ctx, cur.configs, cur.params, { phase: lastPhase });
        }
      }
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onWheel = (e: React.WheelEvent) => {
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    setZoom((z) => Math.min(8, Math.max(0.2, z * factor)));
  };

  const drag = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setPan({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y });
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="preview">
      <div
        ref={containerRef}
        className="preview-stage"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <canvas ref={canvasRef} />
      </div>
      <div className="preview-overlay">
        <button type="button" onClick={() => setPlaying((p) => !p)}>
          {playing ? "Pause" : "Play"}
        </button>
        <button type="button" onClick={resetView}>
          Reset View
        </button>
        <span className="preview-hint">Scroll to zoom, drag to pan</span>
      </div>
    </div>
  );
}
