import Animation from '../base/animation';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

const ENEMY_WIDTH = 80;
const ENEMY_HEIGHT = 80;
const EXPLO_IMG_PREFIX = 'images/explosion';

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
    this.initExplosionAnimation();
  }

  // 生成随机 X 坐标
  getRandomX() {
    return Math.floor(Math.random() * (SCREEN_WIDTH - ENEMY_WIDTH));
  }

  // 预定义爆炸的帧动画
  initExplosionAnimation() {
    if (this.imgList && this.imgList.length > 0) return; // pool reuse guard
    const EXPLO_FRAME_COUNT = 19;
    const frames = Array.from(
      { length: EXPLO_FRAME_COUNT },
      (_, i) => `${EXPLO_IMG_PREFIX}${i + 1}.png`
    );
    this.initFrames(frames);
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
