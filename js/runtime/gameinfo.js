import Emitter from '../libs/tinyemitter';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

const atlas = wx.createImage();
atlas.src = 'images/Common.png';

export default class GameInfo extends Emitter {
  constructor() {
    super();

    this.btnArea = {
      startX: SCREEN_WIDTH / 2 - 40,
      startY: SCREEN_HEIGHT / 2 - 100 + 180,
      endX: SCREEN_WIDTH / 2 + 50,
      endY: SCREEN_HEIGHT / 2 - 100 + 255,
    };

    this.effects = [];
    this.showTutorial = true;

    wx.onTouchStart(this.touchEventHandler.bind(this))
  }

  addEffect(text, color = '#FFD700') {
    this.effects.push({
      text,
      color,
      x: SCREEN_WIDTH / 2,
      y: SCREEN_HEIGHT / 2,
      alpha: 1.0,
    });
  }


  setFont(ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
  }

  render(ctx) {
    if (this.showTutorial) {
      this.renderTutorial(ctx);
      return;
    }

    this.renderGameScore(ctx, GameGlobal.databus.score);

    if (GameGlobal.databus.isGameOver) {
      this.renderGameOver(ctx, GameGlobal.databus.score);
    }

    this.renderEffects(ctx);
  }

  renderTutorial(ctx) {
    const cx = SCREEN_WIDTH / 2;

    ctx.save();

    // Dimmed background panel
    ctx.fillStyle = 'rgba(0,0,0,0.78)';
    const panelW = SCREEN_WIDTH - 40;
    const panelH = SCREEN_HEIGHT * 0.72;
    const panelX = 20;
    const panelY = SCREEN_HEIGHT * 0.1;
    const r = 16;
    ctx.beginPath();
    ctx.moveTo(panelX + r, panelY);
    ctx.arcTo(panelX + panelW, panelY,     panelX + panelW, panelY + panelH, r);
    ctx.arcTo(panelX + panelW, panelY + panelH, panelX,     panelY + panelH, r);
    ctx.arcTo(panelX,          panelY + panelH, panelX,     panelY,          r);
    ctx.arcTo(panelX,          panelY,          panelX + panelW, panelY,     r);
    ctx.closePath();
    ctx.fill();

    let y = panelY + 44;

    // Title
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 26px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('💕 游戏玩法 💕', cx, y);
    y += 44;

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX + 20, y - 10);
    ctx.lineTo(panelX + panelW - 20, y - 10);
    ctx.stroke();

    // Rules
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '17px Arial';
    ctx.textAlign = 'left';
    const left = panelX + 20;
    const lines = [
      ['🕹️ 操作方式', true],
      ['左右滑动屏幕移动角色', false],
      ['', false],
      ['🎯 得分规则', true],
      ['按顺序碰触角色完成一组序列', false],
      ['可获得奖励 +100 分！', false],
      ['', false],
      ['📋 序列顺序', true],
      ['宝宝 → 贝贝 → 发发 → 财财', false],
      ['（每种碰任意一个即可）', false],
      ['', false],
      ['⚠️ 危险角色', true],
      ['碰到 RKU 扣 50 分', false],
      ['碰到 RKU 三次游戏结束！', false],
      ['', false],
      ['🎁 隐藏奖励', true],
      ['突破500分有大奖！', false],
    ];

    for (const [text, isHeader] of lines) {
      if (isHeader) {
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 17px Arial';
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '17px Arial';
      }
      ctx.fillText(text, left, y);
      y += text === '' ? 8 : 28;
    }

    // Tap to start
    y = panelY + panelH - 30;
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('点击任意位置开始游戏', cx, y);

    ctx.restore();
  }

  renderEffects(ctx) {
    this.effects = this.effects.filter(e => e.alpha > 0);
    this.effects.forEach((e) => {
      ctx.save();
      ctx.globalAlpha = e.alpha;
      ctx.fillStyle = e.color;
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(e.text, e.x, e.y);
      ctx.restore();
      e.y -= 2;
      e.alpha -= 0.02;
    });
  }

  renderGameScore(ctx, score) {
    ctx.save();
    this.setFont(ctx);
    ctx.textAlign = 'left';
    ctx.fillText(score, 10, 30);
    ctx.restore();
  }

  renderGameOver(ctx, score) {
    this.drawGameOverImage(ctx);
    this.drawGameOverText(ctx, score);
    this.drawRestartButton(ctx);
  }

  drawGameOverImage(ctx) {
    ctx.drawImage(
      atlas,
      0,
      0,
      119,
      108,
      SCREEN_WIDTH / 2 - 150,
      SCREEN_HEIGHT / 2 - 100,
      300,
      300
    );
  }

  drawGameOverText(ctx, score) {
    this.setFont(ctx);
    ctx.fillText(
      '游戏结束',
      SCREEN_WIDTH / 2 - 40,
      SCREEN_HEIGHT / 2 - 100 + 50
    );
    ctx.fillText(
      `得分: ${score}`,
      SCREEN_WIDTH / 2 - 40,
      SCREEN_HEIGHT / 2 - 100 + 130
    );
  }

  drawRestartButton(ctx) {
    ctx.drawImage(
      atlas,
      120,
      6,
      39,
      24,
      SCREEN_WIDTH / 2 - 60,
      SCREEN_HEIGHT / 2 - 100 + 180,
      120,
      40
    );
    ctx.fillText(
      '重新开始',
      SCREEN_WIDTH / 2 - 40,
      SCREEN_HEIGHT / 2 - 100 + 205
    );
  }

  touchEventHandler(event) {
    const { clientX, clientY } = event.touches[0];

    if (this.showTutorial) {
      this.showTutorial = false;
      this.emit('startGame');
      return;
    }

    if (GameGlobal.databus.isGameOver) {
      if (
        clientX >= this.btnArea.startX &&
        clientX <= this.btnArea.endX &&
        clientY >= this.btnArea.startY &&
        clientY <= this.btnArea.endY
      ) {
        this.emit('restart');
      }
    }
  }
}
