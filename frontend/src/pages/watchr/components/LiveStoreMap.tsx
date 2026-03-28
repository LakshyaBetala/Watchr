import { useEffect, useRef, useState } from "react";

// ─── Sprite Sheet Constants (from pixel-agents repo) ─────────────────────────
// Each char_N.png is 112×96px
// 3 rows (down, up, right) × 7 frames, each frame = 16×32 px
const FRAME_W = 16;
const FRAME_H = 32;
const FRAMES_PER_ROW = 7;
// Direction row indices
const DIR_DOWN  = 0;
const DIR_UP    = 1;
const DIR_RIGHT = 2;

// Render scale — multiply logical 16×32 by this for canvas drawing
const SPRITE_SCALE = 1.8;
const DRAW_W = FRAME_W * SPRITE_SCALE; // ~28.8px
const DRAW_H = FRAME_H * SPRITE_SCALE; // ~57.6px

// Movement speed in logical canvas units/sec
const SPEED = 28;

// ─── Zone Definitions ─────────────────────────────────────────────────────────
interface Zone {
  x: number; y: number; w: number; h: number;
  color: string; label: string; emoji: string;
}

const ZONES: Record<string, Zone> = {
  shelf:    { x: 30,  y: 30,  w: 300, h: 160, color: "#c6f135", label: "Shelf Area",     emoji: "📦" },
  billing:  { x: 470, y: 30,  w: 300, h: 160, color: "#4ade80", label: "Billing Counter", emoji: "💳" },
  entrance: { x: 30,  y: 230, w: 220, h: 140, color: "#9CA3AF", label: "Entrance",        emoji: "🚪" },
  exit:     { x: 550, y: 230, w: 220, h: 140, color: "#6b6b6b", label: "Exit",            emoji: "🚶" },
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Character {
  id: string;
  role: "customer" | "staff";
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  currentZone: string;
  spriteIndex: number;   // which char_N.png to use (0–5)
  frameIndex: number;
  frameTimer: number;
  direction: "left" | "right" | "up" | "down";
  isMoving: boolean;
  idleTimer: number;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  radius: number;
  opacity: number;
  color: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function randomInZone(zoneKey: string, margin = 30): { x: number; y: number } {
  const z = ZONES[zoneKey];
  return {
    x: z.x + margin + Math.random() * (z.w - margin * 2),
    y: z.y + margin + Math.random() * (z.h - margin * 2),
  };
}

function clampToZone(x: number, y: number, zoneKey: string) {
  const z = ZONES[zoneKey];
  const margin = 25;
  return {
    x: Math.max(z.x + margin, Math.min(z.x + z.w - margin, x)),
    y: Math.max(z.y + margin, Math.min(z.y + z.h - margin, y)),
  };
}

function pickCustomerZone(): string {
  const r = Math.random();
  if (r < 0.45) return "shelf";
  if (r < 0.75) return "billing";
  if (r < 0.90) return "entrance";
  return "exit";
}

function pickStaffZone(): string {
  return Math.random() < 0.85 ? "billing" : "shelf";
}

// ─── Rounded rect helper ──────────────────────────────────────────────────────
function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
  fillColor?: string, strokeColor?: string, strokeWidth = 1
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fillColor) { ctx.fillStyle = fillColor; ctx.fill(); }
  if (strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = strokeWidth; ctx.stroke(); }
}

// ─── Draw a sprite frame ──────────────────────────────────────────────────────
function drawSprite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  directionRow: number,
  frameIdx: number,
  destX: number, destY: number,
  flipH: boolean
) {
  const srcX = frameIdx * FRAME_W;
  const srcY = directionRow * FRAME_H;

  ctx.save();
  if (flipH) {
    ctx.translate(destX + DRAW_W / 2, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img, srcX, srcY, FRAME_W, FRAME_H, -DRAW_W / 2, destY, DRAW_W, DRAW_H);
  } else {
    ctx.drawImage(img, srcX, srcY, FRAME_W, FRAME_H, destX - DRAW_W / 2, destY, DRAW_W, DRAW_H);
  }
  ctx.restore();
}

// ─── Draw fallback character (canvas shapes) ──────────────────────────────────
function drawFallbackChar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  color: string,
  label: string
) {
  const hw = 9, bh = 13;

  // Shadow
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.ellipse(x, y + 2, hw, 3.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();

  // Legs
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.7;
  drawRoundRect(ctx, x - 6, y - bh * 0.3, 5,  8, 2, color);
  drawRoundRect(ctx, x + 1, y - bh * 0.3, 5,  8, 2, color);
  ctx.globalAlpha = 1;

  // Body
  drawRoundRect(ctx, x - hw, y - bh - 4, hw * 2, bh, 4, color);

  // Head
  ctx.beginPath();
  ctx.arc(x, y - bh - 12, 8, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Eyes
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath(); ctx.arc(x - 2.5, y - bh - 13, 1.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 2.5, y - bh - 13, 1.3, 0, Math.PI * 2); ctx.fill();

  // Label tag
  const tagW = 32, tagH = 13;
  drawRoundRect(ctx, x - tagW / 2, y - bh - 30, tagW, tagH, 3, "rgba(28,31,42,0.9)");
  ctx.fillStyle = color;
  ctx.font = "bold 8px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x, y - bh - 24);
}

// ─── Draw name tag ────────────────────────────────────────────────────────────
function drawNameTag(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  label: string, color: string
) {
  const tw = ctx.measureText(label).width + 10;
  const th = 13;
  const tx = x - tw / 2;
  const ty = y - DRAW_H - 18;

  drawRoundRect(ctx, tx, ty, tw, th, 4, "rgba(19, 22, 30, 0.9)");

  ctx.fillStyle = color;
  ctx.font = "bold 9px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x, ty + th / 2);
}

// ─── Static floor canvas (drawn once) ────────────────────────────────────────
function drawStaticLayer(
  offscreen: HTMLCanvasElement,
  w: number, h: number,
  dpr: number
) {
  offscreen.width  = w * dpr;
  offscreen.height = h * dpr;
  const ctx = offscreen.getContext("2d")!;
  ctx.scale(dpr, dpr);

  // Background
  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(0, 0, w, h);

  // Grid
  ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
  ctx.lineWidth = 0.5;
  for (let gx = 0; gx <= w; gx += 32) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
  }
  for (let gy = 0; gy <= h; gy += 32) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
  }

  // Store border
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 4]);
  drawRoundRect(ctx, 12, 12, w - 24, h - 24, 14, undefined, "rgba(255,255,255,0.06)", 1.5);
  ctx.setLineDash([]);

  // Walk corridors
  ctx.fillStyle = "rgba(255,255,255,0.018)";
  // horizontal corridor between shelf/billing
  ctx.fillRect(340, 30, 120, 160);
  // vertical corridors
  ctx.fillRect(255, 200, 80, 60);
  ctx.fillRect(460, 200, 80, 60);

  // Zones
  for (const [, z] of Object.entries(ZONES)) {
    const fill = z.color + "14";
    const stroke = z.color + "55";
    drawRoundRect(ctx, z.x, z.y, z.w, z.h, 14, fill, stroke, 1.5);

    // Top edge highlight
    ctx.strokeStyle = z.color + "60";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(z.x + 20, z.y); ctx.lineTo(z.x + z.w - 20, z.y);
    ctx.stroke();

    // TL corner bracket
    ctx.strokeStyle = z.color + "C0";
    ctx.lineWidth = 1.5;
    ctx.strokeRect; // manual bracket
    ctx.beginPath();
    ctx.moveTo(z.x + 4, z.y + 16); ctx.lineTo(z.x + 4, z.y + 4); ctx.lineTo(z.x + 16, z.y + 4);
    ctx.stroke();
    // BR corner bracket
    ctx.beginPath();
    ctx.moveTo(z.x + z.w - 16, z.y + z.h - 4);
    ctx.lineTo(z.x + z.w - 4, z.y + z.h - 4);
    ctx.lineTo(z.x + z.w - 4, z.y + z.h - 16);
    ctx.stroke();

    // Furniture in each zone
    if (z.label === "Shelf Area") {
      // 3 shelf units
      for (let si = 0; si < 3; si++) {
        const sx = z.x + 20 + si * 90;
        const sy = z.y + 50;
        drawRoundRect(ctx, sx, sy, 70, 80, 4, "#14172280", z.color + "30", 1);
        // Shelf lines
        for (let li = 0; li < 3; li++) {
          ctx.strokeStyle = z.color + "50";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(sx + 6, sy + 22 + li * 22);
          ctx.lineTo(sx + 64, sy + 22 + li * 22);
          ctx.stroke();
        }
      }
      ctx.fillStyle = z.color + "70";
      ctx.font = "bold 8px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SHELVES", z.x + z.w / 2, z.y + 46);
    }

    if (z.label === "Billing Counter") {
      // Counter desk
      drawRoundRect(ctx, z.x + 20, z.y + 90, z.w - 40, 42, 5, "#0e2218CC", z.color + "50", 1.2);
      // Counter highlight line
      ctx.strokeStyle = z.color + "80";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(z.x + 30, z.y + 90); ctx.lineTo(z.x + z.w - 30, z.y + 90);
      ctx.stroke();
      ctx.fillStyle = z.color + "70";
      ctx.font = "bold 8px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("COUNTER", z.x + z.w / 2, z.y + 87);
    }

    if (z.label === "Entrance") {
      // Door frame
      ctx.strokeStyle = z.color + "90";
      ctx.lineWidth = 2;
      ctx.strokeRect(z.x + z.w / 2 - 20, z.y + 20, 40, 50);
      // Door arrow
      ctx.fillStyle = z.color + "80";
      ctx.font = "18px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("→", z.x + z.w / 2, z.y + 55);
    }

    if (z.label === "Exit") {
      ctx.strokeStyle = z.color + "90";
      ctx.lineWidth = 2;
      ctx.strokeRect(z.x + z.w / 2 - 20, z.y + 20, 40, 50);
      ctx.fillStyle = z.color + "80";
      ctx.font = "18px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("→", z.x + z.w / 2, z.y + 55);
    }

    // Zone label
    ctx.fillStyle = z.color + "D0";
    ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${z.emoji} ${z.label}`, z.x + 14, z.y + 24);
  }
}

// ─── Build initial character list ─────────────────────────────────────────────
function buildCharacters(): Character[] {
  const defs: Array<{ id: string; role: "customer" | "staff"; zone: string; spriteIndex: number }> = [
    { id: "C-01", role: "customer", zone: "shelf",    spriteIndex: 0 },
    { id: "C-02", role: "customer", zone: "shelf",    spriteIndex: 2 },
    { id: "C-03", role: "customer", zone: "billing",  spriteIndex: 4 },
    { id: "C-04", role: "customer", zone: "entrance", spriteIndex: 1 },
    { id: "C-05", role: "customer", zone: "entrance", spriteIndex: 3 },
    { id: "Staff", role: "staff",   zone: "billing",  spriteIndex: 5 },
    { id: "Staff", role: "staff",   zone: "billing",  spriteIndex: 5 },
  ];

  return defs.map((d, i) => {
    const pos = randomInZone(d.zone);
    return {
      ...d,
      x: pos.x, y: pos.y,
      targetX: pos.x, targetY: pos.y,
      currentZone: d.zone,
      frameIndex: 0,
      frameTimer: 0,
      direction: "down" as const,
      isMoving: false,
      idleTimer: i * 1.2,
    };
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LiveStoreMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const rafRef       = useRef<number>(0);
  const lastTimeRef  = useRef<number>(0);

  // Mutable game state (no re-renders)
  const charsRef   = useRef<Character[]>(buildCharacters());
  const ripplesRef = useRef<Ripple[]>([]);
  const nextRipple = useRef(0);
  const spritesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const scanRef    = useRef(0); // scan line y position

  const [spritesLoaded, setSpritesLoaded] = useState(false);

  // ── Load sprites ────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const loaded = new Map<number, HTMLImageElement>();
    const promises = Array.from({ length: 6 }, (_, i) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload  = () => { loaded.set(i, img); resolve(); };
        img.onerror = () => resolve(); // fail silently → fallback
        img.src = `/assets/characters/char_${i}.png`;
      });
    });

    Promise.all(promises).then(() => {
      if (!mounted) return;
      spritesRef.current = loaded;
      setSpritesLoaded(true);
    });

    return () => { mounted = false; };
  }, []);

  // ── Game loop ───────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const LOGICAL_W = 800;
    const LOGICAL_H = 400;
    const dpr = window.devicePixelRatio || 1;

    canvas.width  = LOGICAL_W * dpr;
    canvas.height = LOGICAL_H * dpr;
    canvas.style.width  = "100%";
    canvas.style.height = "100%";

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false; // pixel-art crisp

    // Build offscreen static layer
    const offscreen = document.createElement("canvas");
    offscreenRef.current = offscreen;
    drawStaticLayer(offscreen, LOGICAL_W, LOGICAL_H, dpr);

    // ── Game loop ──
    function loop(now: number) {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      // Update scan line
      scanRef.current = (scanRef.current + 60 * dt) % LOGICAL_H;

      // Update characters
      const chars = charsRef.current;
      for (const ch of chars) {
        if (ch.isMoving) {
          // Animate frames every 160ms
          ch.frameTimer += dt * 1000;
          if (ch.frameTimer > 160) {
            ch.frameTimer = 0;
            ch.frameIndex = (ch.frameIndex % (FRAMES_PER_ROW - 1)) + 1; // 1–6
          }

          const dx = ch.targetX - ch.x;
          const dy = ch.targetY - ch.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < SPEED * dt + 1) {
            // Arrived
            ch.x = ch.targetX;
            ch.y = ch.targetY;
            ch.isMoving  = false;
            ch.frameIndex = 0;
            ch.idleTimer = 3 + Math.random() * 5; // 3–8s

            // Ripple on arrival
            const zColor = ZONES[ch.currentZone]?.color ?? "#c6f135";
            ripplesRef.current.push({
              id: nextRipple.current++,
              x: ch.x, y: ch.y,
              radius: 0, opacity: 0.8,
              color: zColor,
            });
          } else {
            ch.x += (dx / dist) * SPEED * dt;
            ch.y += (dy / dist) * SPEED * dt;
            // Clamp within zone
            const clamped = clampToZone(ch.x, ch.y, ch.currentZone);
            ch.x = clamped.x; ch.y = clamped.y;
            // Direction
            if (Math.abs(dx) > Math.abs(dy)) {
              ch.direction = dx > 0 ? "right" : "left";
            } else {
              ch.direction = dy > 0 ? "down" : "up";
            }
          }
        } else {
          // Idle countdown
          ch.idleTimer -= dt;
          if (ch.idleTimer <= 0) {
            const newZone = ch.role === "staff" ? pickStaffZone() : pickCustomerZone();
            ch.currentZone = newZone;
            const pos = randomInZone(newZone);
            ch.targetX = pos.x;
            ch.targetY = pos.y;
            ch.isMoving = true;
          }
        }
      }

      // Update ripples
      ripplesRef.current = ripplesRef.current
        .map(r => ({ ...r, radius: r.radius + 38 * dt, opacity: r.opacity - 1.0 * dt }))
        .filter(r => r.opacity > 0);

      // ── DRAW ──
      ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);

      // Composite static layer
      ctx.drawImage(offscreen, 0, 0, LOGICAL_W * dpr, LOGICAL_H * dpr, 0, 0, LOGICAL_W, LOGICAL_H);

      // Scan line sweep
      const scanGrad = ctx.createLinearGradient(0, scanRef.current - 40, 0, scanRef.current + 40);
      scanGrad.addColorStop(0, "rgba(77,166,255,0)");
      scanGrad.addColorStop(0.5, "rgba(77,166,255,0.04)");
      scanGrad.addColorStop(1, "rgba(77,166,255,0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanRef.current - 40, LOGICAL_W, 80);

      // Ripples
      for (const r of ripplesRef.current) {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = r.opacity;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Characters (sorted by y for pseudo-depth)
      const sorted = [...chars].sort((a, b) => a.y - b.y);
      const sprites = spritesRef.current;

      for (const ch of sorted) {
        const img = sprites.get(ch.spriteIndex);
        const cx = ch.x;
        const cy = ch.y;
        const color = ch.role === "staff" ? "#4ade80" : "#c6f135";

        // Drop shadow
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2, 12, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.fill();
        ctx.restore();

        if (img && img.complete && img.naturalWidth > 0) {
          // Map direction to sprite row
          const dirRow =
            ch.direction === "up"    ? DIR_UP :
            ch.direction === "right" ? DIR_RIGHT :
            ch.direction === "left"  ? DIR_RIGHT :
            DIR_DOWN;

          const flipH = ch.direction === "left";

          if (flipH) {
            ctx.save();
            ctx.translate(cx, 0);
            ctx.scale(-1, 1);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(
              img,
              ch.frameIndex * FRAME_W, dirRow * FRAME_H, FRAME_W, FRAME_H,
              -DRAW_W / 2, cy - DRAW_H, DRAW_W, DRAW_H
            );
            ctx.restore();
          } else {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(
              img,
              ch.frameIndex * FRAME_W, dirRow * FRAME_H, FRAME_W, FRAME_H,
              cx - DRAW_W / 2, cy - DRAW_H, DRAW_W, DRAW_H
            );
          }
        } else {
          // Fallback: canvas shape character
          drawFallbackChar(ctx, cx, cy, color, ch.id);
        }

        // Name tag
        ctx.imageSmoothingEnabled = true;
        const tagColor = ch.role === "staff" ? "#4ade80" : "#c6f135";
        const tagLabel = ch.id;
        const tagW = ctx.measureText(tagLabel).width + 12;
        const tagH = 14;
        const tagX = cx - tagW / 2;
        const tagY = cy - DRAW_H - 18;

        drawRoundRect(ctx, tagX, tagY, tagW, tagH, 4, "rgba(21, 21, 21, 0.9)");
        ctx.fillStyle = tagColor;
        ctx.font = "bold 9px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tagLabel, cx, tagY + tagH / 2);

        // Staff badge
        if (ch.role === "staff") {
          ctx.font = "11px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("👔", cx, tagY - 8);
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spritesLoaded]);

  return (
    <div
      ref={containerRef}
      className="w-full relative overflow-hidden"
      style={{ height: 400, borderRadius: 12, background: "#1e1e1e" }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%", imageRendering: "pixelated" }}
      />

      {/* People count overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          background: "rgba(21, 21, 21, 0.9)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 20,
          padding: "4px 12px",
          color: "#f0f0f0",
          fontSize: 13,
          fontFamily: "'JetBrains Mono', monospace",
          backdropFilter: "blur(4px)",
          userSelect: "none",
        }}
      >
        👥 {charsRef.current.length} inside
      </div>

      {/* Loading shimmer */}
      {!spritesLoaded && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 12,
            background: "rgba(21, 21, 21, 0.9)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 8,
            padding: "4px 10px",
            color: "#6b6b6b",
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          ⏳ Loading sprites...
        </div>
      )}
    </div>
  );
}
