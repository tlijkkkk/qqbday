import Animation from '../base/animation';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

const ENEMY_IMG_SRC = 'images/enemy.png';
const ENEMY_WIDTH = 60;
const ENEMY_HEIGHT = 60;
const EXPLO_IMG_PREFIX = 'images/explosion';

const ENEMY_TYPES = [
  { color: '#FF3333', scoreValue: -10, isDeadly: false }, // red
  { color: '#33CC33', scoreValue: 10,  isDeadly: false }, // green
  { color: '#FFCC00', scoreValue: 20,  isDeadly: false }, // yellow
  { color: '#111111', scoreValue: 0,   isDeadly: true  }, // black
];

export default class Enemy extends Animation {
  speed = Math.random() * 6 + 3; // 飞行速度

  constructor() {
    super(ENEMY_IMG_SRC, ENEMY_WIDTH, ENEMY_HEIGHT);
  }

  init() {
    this.x = this.getRandomX();
    this.y = -this.height;

    const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
    this.color = type.color;
    this.scoreValue = type.scoreValue;
    this.isDeadly = type.isDeadly;

    this.isActive = true;
    this.visible = true;
    // 设置爆炸动画
    this.initExplosionAnimation();
  }

  render(ctx) {
    if (!this.visible) return;

    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;
    const cx = x + w / 2;

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(cx, y + h);              // 机头（朝下）
    ctx.lineTo(x, y + h * 0.45);       // 左翼尖
    ctx.lineTo(x + w * 0.3, y + h * 0.55);
    ctx.lineTo(cx, y);                  // 机尾
    ctx.lineTo(x + w * 0.7, y + h * 0.55);
    ctx.lineTo(x + w, y + h * 0.45);   // 右翼尖
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 生成随机 X 坐标
  getRandomX() {
    return Math.floor(Math.random() * (SCREEN_WIDTH - ENEMY_WIDTH));
  }

  // 预定义爆炸的帧动画
  initExplosionAnimation() {
    const EXPLO_FRAME_COUNT = 19;
    const frames = Array.from(
      { length: EXPLO_FRAME_COUNT },
      (_, i) => `${EXPLO_IMG_PREFIX}${i + 1}.png`
    );
    this.initFrames(frames);
  }

  // 每一帧更新敌人位置
  update() {
    if (GameGlobal.databus.isGameOver) {
      return;
    }

    this.y += this.speed;

    // 对象回收
    if (this.y > SCREEN_HEIGHT + this.height) {
      this.remove();
    }
  }

  destroy() {
    this.isActive = false;
    // 播放销毁动画后移除
    this.playAnimation();
    GameGlobal.musicManager.playExplosion(); // 播放爆炸音效
    wx.vibrateShort({
      type: 'light'
    }); // 轻微震动
    this.on('stopAnimation', () => this.remove.bind(this));
  }

  remove() {
    this.isActive = false;
    this.visible = false;
    GameGlobal.databus.removeEnemy(this);
  }
}
