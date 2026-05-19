import Animation from '../base/animation';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

const BODY_IMG_SRC = 'images/bbfc/xwz.jpg';
const FACE_IMG_SRC = 'images/bbfc/piaopiao.jpg';
const CHAR_WIDTH  = 80;
const CHAR_HEIGHT = 140;

// Shared layout constants (relative to this.y, top of character)
const FACE_R    = 26;           // face circle radius
const FACE_CY   = FACE_R;      // face center Y offset from top = 26
const BODY_W    = 64;
const BODY_H    = 80;
const BODY_TOP  = FACE_CY + FACE_R - 8; // body starts slightly overlapping face bottom
const BODY_CX   = CHAR_WIDTH / 2;
const LEG_TOP   = BODY_TOP + BODY_H - 10; // legs emerge from body bottom
const LEG_LEN   = 30;
const ARM_TOP   = BODY_TOP + 18; // arms from upper body sides
const ARM_LEN   = 22;

export default class Player extends Animation {
  constructor() {
    super(BODY_IMG_SRC, CHAR_WIDTH, CHAR_HEIGHT);

    // Load face image separately
    this.faceImg = wx.createImage();
    this.faceImg.src = FACE_IMG_SRC;

    this.init();
    this.initEvent();
  }

  init() {
    this.x = SCREEN_WIDTH / 2 - CHAR_WIDTH / 2;
    this.y = SCREEN_HEIGHT - CHAR_HEIGHT - 15;
    this.direction = 'idle';
    this.moving    = false;
    this.vx        = 0;
    this._hasTouch = false;
    this.isActive  = true;
    this.visible   = true;
    this.heartParticles = Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.6,
      speed: 0.9 + Math.random() * 0.9,
      size:  0.18 + Math.random() * 0.16,
    }));
    this.initHeartAnimation();
  }

  initHeartAnimation() {
    if (this.imgList && this.imgList.length > 0) return;
    this.count = 40;
    this.imgList = new Array(40).fill(null);
    GameGlobal.databus.animations.push(this);
  }

  aniRender(ctx) {
    if (this.index < 0 || this.index >= this.count) return;
    const progress = this.index / (this.count - 1);
    const cx = this.x + CHAR_WIDTH / 2;
    const cy = this.y + CHAR_HEIGHT / 2;
    const maxDist = CHAR_WIDTH * 2.2;

    ctx.save();
    ctx.globalAlpha = 1 - progress;
    ctx.fillStyle = '#FF1493';

    for (const p of this.heartParticles) {
      const dist = progress * maxDist * p.speed;
      const hx = cx + Math.cos(p.angle) * dist;
      const hy = cy + Math.sin(p.angle) * dist + progress * progress * 30;
      const s  = CHAR_WIDTH * p.size * (0.3 + progress * 0.7);

      ctx.beginPath();
      ctx.moveTo(hx, hy + s * 0.95);
      ctx.bezierCurveTo(hx - s * 0.5, hy + s * 0.6, hx - s * 1.25, hy - s * 0.2, hx, hy - s * 0.5);
      ctx.bezierCurveTo(hx + s * 1.25, hy - s * 0.2, hx + s * 0.5, hy + s * 0.6, hx, hy + s * 0.95);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  initEvent() {
    // No onTouchStart — wx.onTouchStart replaces handlers (GameInfo owns it).
    // Derive everything from onTouchMove using absolute finger position.
    wx.onTouchMove((e) => {
      if (GameGlobal.databus.isGameOver) return;
      const fx   = e.touches[0].clientX;
      const newX = Math.max(0, Math.min(fx - CHAR_WIDTH / 2, SCREEN_WIDTH - CHAR_WIDTH));
      this.vx        = newX - this.x;  // velocity = actual position change this event
      this.x         = newX;
      this._hasTouch = true;
      this.moving    = Math.abs(this.vx) > 0.3;
      this.direction = this.vx > 0.3 ? 'right' : this.vx < -0.3 ? 'left' : this.direction;
    });

    wx.onTouchEnd(()    => { this._hasTouch = false; });
    wx.onTouchCancel(() => { this._hasTouch = false; });
  }

  update() {
    if (GameGlobal.databus.isGameOver) return;

    // Finger lifted — coast with momentum then friction to a stop
    if (!this._hasTouch) {
      if (Math.abs(this.vx) > 0.15) {
        this.x  = Math.max(0, Math.min(this.x + this.vx, SCREEN_WIDTH - CHAR_WIDTH));
        this.vx *= 0.88;
        this.moving    = Math.abs(this.vx) > 0.3;
        this.direction = this.vx > 0 ? 'right' : 'left';
      } else {
        this.vx    = 0;
        this.moving = false;
      }
    }
  }

  render(ctx) {
    if (!this.visible) return;

    const left  = this.x;
    const top   = this.y;
    const cx    = left + BODY_CX;
    const frame = GameGlobal.databus.frame;

    // Swing values — legs opposite each other, arms opposite same-side leg
    const swing    = this.moving ? Math.sin(frame * 0.38) * 13 : 0;
    const lLeg     = this.direction === 'right' ? -swing :  swing;
    const rLeg     = this.direction === 'right' ?  swing : -swing;
    const lArm     = -lLeg * 0.7;
    const rArm     = -rLeg * 0.7;

    // 1. Legs (drawn first so body image covers their tops)
    ctx.save();
    ctx.strokeStyle = '#C68642';
    ctx.lineCap     = 'round';
    ctx.lineWidth   = 8;
    ctx.beginPath();
    ctx.moveTo(cx - 10, top + LEG_TOP);
    ctx.lineTo(cx - 10 + lLeg, top + LEG_TOP + LEG_LEN);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 10, top + LEG_TOP);
    ctx.lineTo(cx + 10 + rLeg, top + LEG_TOP + LEG_LEN);
    ctx.stroke();
    ctx.restore();

    // 2. Body image (xwz.PNG) — drawn centred, covers leg tops
    ctx.drawImage(
      this.img,
      cx - BODY_W / 2,
      top + BODY_TOP,
      BODY_W,
      BODY_H
    );

    // 3. Arms (over body image so they look attached)
    ctx.save();
    ctx.strokeStyle = '#C68642';
    ctx.lineCap     = 'round';
    ctx.lineWidth   = 6;
    ctx.beginPath();
    ctx.moveTo(cx - BODY_W / 2 + 4, top + ARM_TOP);
    ctx.lineTo(cx - BODY_W / 2 + 4 + lArm - 6, top + ARM_TOP + ARM_LEN);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + BODY_W / 2 - 4, top + ARM_TOP);
    ctx.lineTo(cx + BODY_W / 2 - 4 + rArm + 6, top + ARM_TOP + ARM_LEN);
    ctx.stroke();
    ctx.restore();

    // 4. Face circle — piaopiao.jpg clipped to circle at head position
    const faceCX = cx;
    const faceCY = top + FACE_CY;

    ctx.save();
    ctx.beginPath();
    ctx.arc(faceCX, faceCY, FACE_R, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(this.faceImg, faceCX - FACE_R, faceCY - FACE_R, FACE_R * 2, FACE_R * 2);
    ctx.restore();

  }

  destroy() {
    this.isActive = false;
    this.playAnimation();
    GameGlobal.musicManager.playExplosion();
    wx.vibrateShort({ type: 'medium' });
  }
}
