import { Live2DModel } from './Live2DModel';
import { EventEmitter } from '@pixi/utils';
import { draggable } from './dragging';
import { settings } from '@pixi/settings';
import { Renderer } from '@pixi/core';
import { Extract } from '@pixi/extract';
import * as Filter from "./Filter";
import { ModelLoadingState } from './ModelLoadingState.js';
import { Live2DFactory } from 'pixi-live2d-display';

// 1x1 green image
const THUMBNAIL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mMU22h6EgADqAHHuWdgTgAAAABJRU5ErkJggg==';

let uid = 1;

export class ModelEntity extends EventEmitter {

    id = (uid += 1);

    url = '';

    thumbnail = '';

    aspectRatio = 1;

    name = 'New Model';

    visible = true;

    _scaleX = 1;

    _scaleY = 1;

    _rotation = 0;

    _zIndex = 0;

    filters = [];

    loadingState = new ModelLoadingState();

    error = '';

    pixiModel;

    constructor(source, renderer) {
        super();

        this.loadModel(source).then();
    }

    async loadModel(source) {
        if (typeof source === 'string') {
            this.url = source;
        } else {
            this.url = '(Local files)';
        }

        // don't use Live2DModel.fromSync() because when loading from local files,
        // the "settingsJSONLoaded" and "settingsLoaded" events will be emitted before
        // we're able to listen to the Live2DModel instance
        // TODO: (plugin) improve model creation?
        const pixiModel = new Live2DModel();
        this.loadingState.watch(pixiModel);
        try {
            await Live2DFactory.setupLive2DModel(pixiModel, source);
            this.modelLoaded(pixiModel);
            this.emit('modelLoaded', pixiModel);
        } catch (e) {
            console.warn(e);

            this.error = e instanceof Error ? e.message : e + '';
        }
    }

    modelLoaded(pixiModel) {
        this.pixiModel = pixiModel;
        this.name = pixiModel.internalModel.settings.name;
        this.thumbnail = THUMBNAIL;
        this.aspectRatio = pixiModel.width / pixiModel.height;
        this.updateFilters();

        draggable(pixiModel);
    }

    initThumbnail(renderer) {
        const pixiModel = this.pixiModel;
        settings.RESOLUTION = 0.2;

        const hitAreaFramesVisible = pixiModel.hitAreaFrames.visible;
        const backgroundVisible = pixiModel.backgroundVisible;
        pixiModel.hitAreaFrames.visible = false;
        pixiModel.backgroundVisible = false;

        try {
            const canvas = (renderer.plugins.extract).canvas(pixiModel);

            canvas.toBlob(blob => this.thumbnail = URL.createObjectURL(blob), 'image/webp', 0.01);
        } catch (e) {
            console.warn(e);
        }

        settings.RESOLUTION = 1;
        pixiModel.hitAreaFrames.visible = hitAreaFramesVisible;
        pixiModel.backgroundVisible = backgroundVisible;
    }

    fit(width, height) {
        if (this.pixiModel) {
            let scale = Math.min(width / this.pixiModel.width, height / this.pixiModel.height);

            scale = Math.round(scale * 10) / 10;

            this.scale(scale, scale);
        }
    }

    scale(scaleX, scaleY) {
        this._scaleX = scaleX ?? this._scaleX;
        this._scaleY = scaleY ?? this._scaleY;

        if (this.pixiModel) {
            this.pixiModel.scale.set(this._scaleX, this._scaleY);
        }
    }

    rotate(rotation) {
        this._rotation = rotation;

        if (this.pixiModel) {
            this.pixiModel.rotation = rotation;
        }
    }

    setZIndex(zIndex) {
        this._zIndex = zIndex;

        if (this.pixiModel) {
            this.pixiModel.zIndex = zIndex;
        }
    }

    setVisible(visible) {
        this.visible = visible;

        if (this.pixiModel) {
            this.pixiModel.visible = visible;
        }
    }

    updateFilters() {
        if (this.pixiModel) {
            Filter.set(this.pixiModel, this.filters);
        }
    }

    destroy() {
        if (this.pixiModel) {
            this.pixiModel.destroy({ children: true });
            this.pixiModel = undefined;

            URL.revokeObjectURL(this.thumbnail);
        }
    }

    get zIndex() {
        return this._zIndex;
    }

    set zIndex(value) {
        this.setZIndex(value);
    }

    get rotation() {
        return this._rotation;
    }

    set rotation(value) {
        this.rotate(value);
    }

    get scaleY() {
        return this._scaleY;
    }

    set scaleY(value) {
        this.scale(undefined, value);
    }

    get scaleX() {
        return this._scaleX;
    }

    set scaleX(value) {
        this.scale(value, value);
    }
}
