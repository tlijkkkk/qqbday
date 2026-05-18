import Sprite from '../base/sprite';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

const BACKGROUND_IMAGE_SRC = 'images/bp4.png';
const BACKGROUND_WIDTH = 1024;
const BACKGROUND_HEIGHT = 1024;

export default class BackGround extends Sprite {
  constructor() {
    super(BACKGROUND_IMAGE_SRC, BACKGROUND_WIDTH, BACKGROUND_HEIGHT);
  }

  update() {}

  render(ctx) {
    const scale = SCREEN_WIDTH / this.width;
    const drawH = Math.ceil(this.height * scale);
    let y = 0;
    while (y < SCREEN_HEIGHT) {
      ctx.drawImage(this.img, 0, 0, this.width, this.height, 0, y, SCREEN_WIDTH, drawH);
      y += drawH;
    }
  }
}
