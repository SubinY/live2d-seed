import { ModelEntity } from "./ModelEntity";
import { ExtendedFileList, SoundManager } from "pixi-live2d-display";
import Stats from "stats.js";
import { PixiApp } from "./PixiApp";

const stats = new Stats();
stats.showPanel(0);
stats.dom.style.left = "";
stats.dom.style.right = "0";

export class App {
  constructor(canvasId) {
    this.canvasDom = document.getElementById(canvasId);
    this.pixiApp = new PixiApp(stats, this.canvasDom);
  }

  models = [];
  

  _volume = SoundManager.volume;

  _showHitAreaFrames = false;

  _showModelFrame = false;

  _showStats = true;

  addModel(source, modelScale) {
    const model = new ModelEntity(source, this.pixiApp.renderer);
    this.initModel(model);
    this.models.push(model);
    this.modelScale = modelScale;

    return model.id;
  }

  getModel(id) {
    return this.models.find((m) => m.id === id);
  }

  initModel(model) {
    model.on("modelLoaded", async (pixiModel) => {
      if (!this.pixiApp.stage.children.includes(pixiModel)) {
        this.pixiApp.stage.addChild(pixiModel);
        // pixiModel.backgroundVisible = true;
        // pixiModel.hitAreaFrames.visible = this.showHitAreaFrames;
        pixiModel.position.set(
          this.pixiApp.renderer.width / 2,
          this.pixiApp.renderer.height / 2
        );

        model.fit(this.pixiApp.renderer.width, this.pixiApp.renderer.height);
        model.initThumbnail(this.pixiApp.renderer);
        model.scaleX = this.modelScale || 0.5;
      }
    });
  }

  removeModel(id) {
    const model = this.models.find((model) => model.id === id);

    if (model) {
      this.models.splice(this.models.indexOf(model), 1);

      if (model.pixiModel) {
        this.pixiApp.stage.removeChild(model.pixiModel);
      }

      model.destroy();
    }
  }

  set showStats(value) {
    this._showStats = value;

    if (value) {
      document.body.appendChild(stats.dom);
    } else {
      stats.dom.parentElement?.removeChild(stats.dom);
    }
  }

  get showStats() {
    return this._showStats;
  }

  set volume(value) {
    this._volume = value;
    SoundManager.volume = value;
  }

  get volume() {
    return this._volume;
  }

  set showModelFrame(value) {
    this._showModelFrame = value;
    for (const model of this.models) {
      if (model?.pixiModel) {
        model.pixiModel.backgroundVisible = value;
      }
    }
  }

  get showModelFrame() {
    return this._showModelFrame;
  }

  set showHitAreaFrames(value) {
    this._showHitAreaFrames = value;

    for (const model of this.models) {
      if (model?.pixiModel) {
        model.pixiModel.hitAreaFrames.visible = value;
      }
    }
  }

  get showHitAreaFrames() {
    return this._showHitAreaFrames;
  }
}
