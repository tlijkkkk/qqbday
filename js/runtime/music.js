let instance;

export default class Music {
  bgmAudio = wx.createInnerAudioContext();

  constructor() {
    if (instance) return instance;
    instance = this;

    this.bgmAudio.loop = true;
    this.bgmAudio.obeyMuteSwitch = false; // play even when iOS silent switch is on
    this.bgmAudio.src = 'audio/bgm.mp3';
    this.bgmAudio.onCanplay(() => {
      if (this._bgmShouldPlay) this.bgmAudio.play();
    });

  }

  playBGM() {
    this._bgmShouldPlay = true;
    this.bgmAudio.play();
  }

  playExplosion() {
    const sfx = wx.createInnerAudioContext();
    sfx.obeyMuteSwitch = false;
    sfx.src = 'audio/boom.mp3';
    sfx.play();
    sfx.onEnded(() => sfx.destroy());
    sfx.onError(() => sfx.destroy());
  }
}
