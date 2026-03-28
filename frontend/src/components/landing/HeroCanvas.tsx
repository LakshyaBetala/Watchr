import { useEffect, useRef } from "react";

const SPACING = 80;
const DOT_RADIUS = 2;
const DOT_COLOR = [0, 255, 136]; // RGB for #FFFFFF
const SCAN_LINE_COUNT = 4;
const PULSE_CYCLE = 4000; // ms
const SCAN_SPEED = 8000; // ms per full sweep
const MAX_PARALLAX = 20;
const LERP_FACTOR = 0.06;

const HeroCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMouse = useRef({ x: 0, y: 0 });
  const isMobile = useRef(false);
  const rafId = useRef(0);
  const isVisible = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isMobile.current = window.innerWidth < 768;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      isMobile.current = window.innerWidth < 768;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isMobile.current) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = (e.clientY - rect.top) / rect.height;
    };

    const onVisibility = () => {
      isVisible.current = !document.hidden;
    };

    const draw = (time: number) => {
      rafId.current = requestAnimationFrame(draw);
      if (!isVisible.current) return;

      const parent = canvas.parentElement;
      if (!parent) return;
      const W = parent.clientWidth;
      const H = parent.clientHeight;

      ctx.clearRect(0, 0, W, H);

      // Lerp parallax
      if (!isMobile.current) {
        smoothMouse.current.x += (mouseRef.current.x - 0.5 - smoothMouse.current.x) * LERP_FACTOR;
        smoothMouse.current.y += (mouseRef.current.y - 0.5 - smoothMouse.current.y) * LERP_FACTOR;
      } else {
        smoothMouse.current.x = 0;
        smoothMouse.current.y = 0;
      }

      const offsetX = smoothMouse.current.x * MAX_PARALLAX;
      const offsetY = smoothMouse.current.y * MAX_PARALLAX;

      const cols = Math.ceil(W / SPACING) + 2;
      const rows = Math.ceil(H / SPACING) + 2;

      const pulsePhase = (time % PULSE_CYCLE) / PULSE_CYCLE;

      // Draw connecting lines
      ctx.strokeStyle = `rgba(${DOT_COLOR[0]},${DOT_COLOR[1]},${DOT_COLOR[2]},0.05)`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * SPACING + offsetX;
          const y = r * SPACING + offsetY;
          // Horizontal line
          if (c < cols - 1) {
            const nx = (c + 1) * SPACING + offsetX;
            ctx.moveTo(x, y);
            ctx.lineTo(nx, y);
          }
          // Vertical line
          if (r < rows - 1) {
            const ny = (r + 1) * SPACING + offsetY;
            ctx.moveTo(x, y);
            ctx.lineTo(x, ny);
          }
        }
      }
      ctx.stroke();

      // Draw dots with diagonal wave pulse
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * SPACING + offsetX;
          const y = r * SPACING + offsetY;

          // Diagonal wave: normalize position along diagonal
          const diagNorm = (c + r) / (cols + rows);
          const wave = Math.sin((pulsePhase - diagNorm) * Math.PI * 2);
          const alpha = 0.08 + 0.12 * Math.max(0, wave);

          ctx.beginPath();
          ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${DOT_COLOR[0]},${DOT_COLOR[1]},${DOT_COLOR[2]},${alpha})`;
          ctx.fill();
        }
      }

      // Scan lines
      for (let i = 0; i < SCAN_LINE_COUNT; i++) {
        const lineOffset = i / SCAN_LINE_COUNT;
        const scanY = ((time / SCAN_SPEED + lineOffset) % 1) * H;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(W, scanY);
        ctx.strokeStyle = `rgba(${DOT_COLOR[0]},${DOT_COLOR[1]},${DOT_COLOR[2]},0.04)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    resize();
    rafId.current = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default HeroCanvas;
