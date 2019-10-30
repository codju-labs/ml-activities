import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import {fishData, FishBodyPart} from '../utils/fishData';
import constants from './constants';
import {
  bodyAnchorFromType,
  colorForFishPart,
  randomInt,
  clamp
} from './helpers';
import {imagePaths} from '../utils/trashImages';
import _ from 'lodash';

let fishPartImages = {};
let trashImages = {};
let intermediateCanvas;
let tmpCanvas;
let intermediateCtx;
let mobilenet;

// Load a single fish part image.
const loadImage = data => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', e => resolve({img, data}));
    img.addEventListener('error', () => {
      reject(new Error(`failed to load image at ${data.src}`));
    });
    img.src = data.src;
  });
};

// Load all fish part images, and store them in fishPartImages.
export const loadAllFishPartImages = () => {
  intermediateCanvas = document.createElement('canvas');
  intermediateCtx = intermediateCanvas.getContext('2d');
  intermediateCanvas.width = constants.fishCanvasWidth;
  intermediateCanvas.height = constants.fishCanvasHeight;
  tmpCanvas = document.createElement('canvas');

  let fishPartImagesToLoad = [];
  Object.keys(fishData)
    .filter(partName => partName !== 'colorPalettes')
    .forEach((partName, partIndex) => {
      Object.keys(fishData[partName]).forEach(variationName => {
        const partData = {
          partIndex: fishData[partName][variationName].type,
          variationIndex: fishData[partName][variationName].index,
          src: fishData[partName][variationName].src
        };
        fishPartImagesToLoad.push(partData);
      });
    });
  return Promise.all(fishPartImagesToLoad.map(loadImage)).then(results => {
    results.forEach(result => {
      if (fishPartImages[result.data.partIndex] === undefined) {
        fishPartImages[result.data.partIndex] = {};
      }
      fishPartImages[result.data.partIndex][result.data.variationIndex] =
        result.img;
    });
  });
};

export const initMobilenet = () => {
  return mobilenetModule.load(1, 0.25).then(res => (mobilenet = res));
};

export const loadAllTrashImages = () => {
  const loadImagePromises = imagePaths.map((src, idx) => {
    return loadImage({src, idx});
  });
  return Promise.all(loadImagePromises).then(results => {
    results.forEach(result => {
      trashImages[result.data.idx] = result.img;
    });
  });
};

export const generateOceanObject = (allowedClasses, id) => {
  const idx = Math.floor(Math.random() * allowedClasses.length);
  const newOceanObject = new allowedClasses[idx](id);
  newOceanObject.randomize();
  return newOceanObject;
};

export class OceanObject {
  constructor(id) {
    this.id = id;
    this.knnData = null;
    this.logits = null;
    this.result = null;
  }
  randomize() {
    throw 'Not yet implemented!';
  }
  drawToCanvas(canvas, generateLogits = true) {
    throw 'Not yet implemented!';
  }
  getId() {
    return this.id;
  }
  getKnnData() {
    if (mobilenet) {
      if (!this.logits) {
        console.log('get knnData without logits');
        this.drawToCanvas(tmpCanvas, false);
        this.generateLogits(tmpCanvas);
      }
      return this.logits;
    } else {
      return this.knnData;
    }
  }
  setResult(result) {
    this.result = result;
  }
  getResult() {
    return this.result;
  }
  setXY(xy) {
    this.xy = xy;
  }
  getXY() {
    return this.xy;
  }

  async generateLogitsAsync(canvas) {
    this.generateLogits(canvas);
  }

  generateLogits(canvas) {
    if (mobilenet && !this.logits) {
      const image = tf.fromPixels(canvas);
      const infer = () => mobilenet.infer(image, 'conv_preds');
      this.logits = infer();
    }
  }
}

export class FishOceanObject extends OceanObject {
  constructor(id) {
    super(id);
    const fish = fishData;
    this.bodies = Object.values(fish.bodies);
    this.eyes = Object.values(fish.eyes);
    this.mouths = Object.values(fish.mouths);
    this.pectoralFinsFront = Object.values(fish.pectoralFinsFront);
    this.pectoralFinsBack = Object.values(fish.pectoralFinsBack);
    this.dorsalFins = Object.values(fish.dorsalFins);
    this.tails = Object.values(fish.tails);
    this.colorPalettes = Object.values(fish.colorPalettes);
  }

  randomize() {
    const body = this.bodies[Math.floor(Math.random() * this.bodies.length)];
    const eye = this.eyes[Math.floor(Math.random() * this.eyes.length)];
    const mouth = this.mouths[Math.floor(Math.random() * this.mouths.length)];
    const finIdx = Math.floor(Math.random() * this.pectoralFinsFront.length);
    const pectoralFinFront = this.pectoralFinsFront[finIdx];
    const pectoralFinBack = this.pectoralFinsBack[finIdx];
    const dorsalFin = this.dorsalFins[
      Math.floor(Math.random() * this.dorsalFins.length)
    ];
    const tail = this.tails[Math.floor(Math.random() * this.tails.length)];
    this.colorPalette = this.colorPalettes[
      Math.floor(Math.random() * this.colorPalettes.length)
    ];
    this.knnData = tf.tensor([
      ...body.knnData,
      ...eye.knnData,
      ...mouth.knnData,
      ...pectoralFinFront.knnData,
      ...dorsalFin.knnData,
      ...tail.knnData,
      ...this.colorPalette.knnData
    ]);
    this.parts = [
      body,
      eye,
      mouth,
      pectoralFinFront,
      pectoralFinBack,
      dorsalFin,
      tail
    ];
  }

  getColorPalette() {
    return this.colorPalette;
  }

  drawToCanvas(fishCanvas, generateLogits = true) {
    const ctx = fishCanvas.getContext('2d');
    ctx.translate(constants.fishCanvasWidth, 0);
    ctx.scale(-1, 1);
    const body = this.parts.find(part => part.type === FishBodyPart.BODY);
    const bodyAnchor = bodyAnchorFromType(body, body.type);
    const parts = _.orderBy(this.parts, ['type']);

    parts.forEach((part, partIndex) => {
      intermediateCtx.clearRect(
        0,
        0,
        constants.fishCanvasWidth,
        constants.fishCanvasHeight
      );

      let anchor = [0, 0];
      if (part.type !== FishBodyPart.BODY) {
        const bodyAnchor = bodyAnchorFromType(body, part.type);
        anchor[0] = bodyAnchor[0];
        anchor[1] = bodyAnchor[1];
      }

      const img = fishPartImages[part.type][part.index];

      if (part.type === FishBodyPart.TAIL) {
        anchor[1] -= img.height / 2;
      }

      const xPos = bodyAnchor[0] + anchor[0];
      const yPos = bodyAnchor[1] + anchor[1];

      intermediateCtx.drawImage(img, xPos, yPos);
      const rgb = colorForFishPart(this.colorPalette, part);

      if (rgb) {
        // Add some random tint to the RGB value.
        const tintAmount = 20;
        let newRgb = [];
        newRgb[0] = clamp(rgb[0] + randomInt(-tintAmount, tintAmount), 0, 255);
        newRgb[1] = clamp(rgb[1] + randomInt(-tintAmount, tintAmount), 0, 255);
        newRgb[2] = clamp(rgb[2] + randomInt(-tintAmount, tintAmount), 0, 255);

        let imageData = intermediateCtx.getImageData(
          xPos,
          yPos,
          img.width,
          img.height
        );
        let data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          // Tint any visible pixels
          if (data[i + 3] > 0) {
            data[i] = newRgb[0];
            data[i + 1] = newRgb[1];
            data[i + 2] = newRgb[2];
          }
        }

        intermediateCtx.putImageData(imageData, xPos, yPos);
      }
      ctx.drawImage(
        intermediateCanvas,
        constants.fishCanvasWidth / 2 - intermediateCanvas.width / 2,
        constants.fishCanvasHeight / 2 - intermediateCanvas.height / 2,
        constants.fishCanvasWidth,
        constants.fishCanvasHeight
      );
      this.generateLogitsAsync(fishCanvas);
    });
  }
}

export class TrashOceanObject extends OceanObject {
  randomize() {
    const idx = Math.floor(Math.random() * imagePaths.length);
    this.image = trashImages[idx];
  }
  drawToCanvas(canvas, generateLogits = true) {
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.random() * 2 * Math.PI);
    const xpos = (-1 * this.image.width) / 2;
    const ypos = (-1 * this.image.height) / 2;
    ctx.drawImage(this.image, xpos, ypos);
    this.generateLogitsAsync(canvas);
  }
}
