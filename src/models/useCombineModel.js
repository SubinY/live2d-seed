import { useState, useCallback, useRef } from "react";
import { App } from "./../services/live2dModel/App";
import { PixiApp } from "./../services/live2dModel/PixiApp";

export default function useCombineModel() {
  /* ---------------- 强制刷新 start ---------------- */
  const [, setFlag] = useState();
  const update = () => {
    setFlag(Date.now());
  };
  /* ---------------- 强制刷新 end ---------------- */
  const [canvasModel, setCanvasModel] = useState({
    personUrl: "./biaoqiang/biaoqiang.model3.json",
    backgroundUrl: "bg1.jpg",
    caption: {},
    wavBlob: null,
  });
  const [modelIns, setModelIns] = useState();
  const [live2DModelIns, setLive2DModel] = useState();

  const init = useCallback(
    (canvasId, personScale) => {
      initPerson(canvasId, personScale);
      setTimeout(() => {
        update();
      }, 1000);
    },
    [initPerson, update, canvasModel]
  );

  const initPerson = useCallback(
    (canvasId, personScale = 0.7) => {
      const live2DModel = new App(canvasId);

      // ctx.drawImage('./bg1.jpg', 0, 0, this.width, this.height)
      setLive2DModel(live2DModel);
      const modelId = live2DModel.addModel(canvasModel?.personUrl, personScale);
      live2DModel.showModelFrame = true;
      setModelIns(live2DModel.getModel(modelId));
    },
    [canvasModel, setModelIns]
  );

  const resetPersonPos = useCallback(() => {
    if (live2DModelIns) {
      modelIns?.pixiModel.position.set(
        live2DModelIns?.pixiApp.renderer.width / 2,
        live2DModelIns?.pixiApp.renderer.height / 2
      );
    }
  }, [modelIns]);

  return { canvasModel, setCanvasModel, init, modelIns, resetPersonPos };
}
