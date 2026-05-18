import Animation from '../base/animation';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

const ENEMY_WIDTH = 80;
const ENEMY_HEIGHT = 80;

const ENEMY_TYPES = [
  { name: 'baobao',  imgSrc: 'images/bbfc/baobao.png',  score: 5,   isRku: false, seqGroup: 'baobao' },
  { name: 'baobao2', imgSrc: 'images/bbfc/baobao2.png', score: 10,  isRku: false, seqGroup: 'baobao' },
  { name: 'fafa',    imgSrc: 'images/bbfc/fafa.png',    score: 5,   isRku: false, seqGroup: 'fafa'   },
  { name: 'fafa2',   imgSrc: 'images/bbfc/fafa2.png',   score: 10,  isRku: false, seqGroup: 'fafa'   },
  { name: 'beibei',  imgSrc: 'images/bbfc/beibei.png',  score: 5,   isRku: false, seqGroup: 'beibei' },
  { name: 'beibei2', imgSrc: 'images/bbfc/beibei2.jpg', score: 10,  isRku: false, seqGroup: 'beibei' },
  { name: 'caicai',  imgSrc: 'images/bbfc/caicai.png',  score: 5,   isRku: false, seqGroup: 'caicai' },
  { name: 'caicai2', imgSrc: 'images/bbfc/caicai2.png', score: 10,  isRku: false, seqGroup: 'caicai' },
  { name: 'rku',     imgSrc: 'images/bbfc/rku.JPG',     score: -50, isRku: true,  seqGroup: null     },
];

export const SEQUENCE = ['baobao', 'beibei', 'fafa', 'caicai'];

export default class Enemy extends Animation {
  speed = Math.random() * 6 + 3;

  constructor() {
    super(ENEMY_TYPES[0].imgSrc, ENEMY_WIDTH, ENEMY_HEIGHT);
  }

  init() {
    this.x = this.getRandomX();
    this.y = -this.height;

    const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
    this.img.src = type.imgSrc;
    this.scoreValue = type.score;
    this.isRku = type.isRku;
    this.seqGroup = type.seqGroup;

    this.isActive = true;
    this.visible = true;
    this.heartParticles = Array.from({ length: 9 }, (_, i) => ({
      angle: (i / 9) * Math.PI * 2 + (Math.random() - 0.5) * 0.7,
      speed: 0.8 + Math.random() * 0.8,
      size:  0.16 + Math.random() * 0.14,
    }));
    this.initHeartAnimation();
  }

  // 生成随机 X 坐标
  getRandomX() {
    return Math.floor(Math.random() * (SCREEN_WIDTH - ENEMY_WIDTH));
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
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const maxDist = this.width * 1.8;

    ctx.save();
    ctx.globalAlpha = 1 - progress;
    ctx.fillStyle = '#FF69B4';

    for (const p of this.heartParticles) {
      const dist = progress * maxDist * p.speed;
      const hx = cx + Math.cos(p.angle) * dist;
      const hy = cy + Math.sin(p.angle) * dist + progress * progress * 25;
      const s  = this.width * p.size * (0.3 + progress * 0.7);

      ctx.beginPath();
      ctx.moveTo(hx, hy + s * 0.95);
      ctx.bezierCurveTo(hx - s * 0.5, hy + s * 0.6, hx - s * 1.25, hy - s * 0.2, hx, hy - s * 0.5);
      ctx.bezierCurveTo(hx + s * 1.25, hy - s * 0.2, hx + s * 0.5, hy + s * 0.6, hx, hy + s * 0.95);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // 每一帧更新敌人位置
  update() {
    if (GameGlobal.databus.isGameOver || !this.isActive) {
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
    this.on('stopAnimation', this.remove.bind(this));
  }

  remove() {
    this.isActive = false;
    this.visible = false;
    GameGlobal.databus.removeEnemy(this);
  }
}
