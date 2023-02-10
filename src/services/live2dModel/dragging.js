import { Live2DModel } from "./Live2DModel";
import { InteractionEvent } from "@pixi/interaction";

// export interface DraggableLive2DModel extends Live2DModel {
//     dragging: boolean;
//     _pointerX: number;
//     _pointerY: number;
// }

export function draggable(_model) {
  const model = _model;

  model.on("pointerdown", onPointerDown);
  model.on("pointermove", onPointerMove);
  model.on("pointerup", onPointerUp);
  model.on("pointerupoutside", onPointerUp);
}

function onPointerDown(e) {
  this.dragging = true;
  this._pointerX = e.data.global.x - this.x;
  this._pointerY = e.data.global.y - this.y;
}

function onPointerMove(e) {
  if (this.dragging) {
    this.position.x = e.data.global.x - this._pointerX;
    this.position.y = e.data.global.y - this._pointerY;
  }
}

function onPointerUp(e) {
  this.dragging = false;
}
