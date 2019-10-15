import 'babel-polyfill';
import _ from 'lodash';
import constants, {Modes} from './constants';
import {FishBodyPart} from '../utils/fishData';
import {generateRandomFish} from '../utils/generateOcean';
import {getState} from './state';

window.requestAnimFrame = (function() {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(/* function */ callback, /* DOMElement */ element) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

var $time =
  Date.now ||
  function() {
    return +new Date();
  };

let fishes = [],
  currentBackgroundImageName,
  backgroundImage,
  currentModeStartTime,
  canvas,
  canvasCtx;

const FISH_CANVAS_WIDTH = 300;
const FISH_CANVAS_HEIGHT = 200;
const FISH_WIDTH = 150;
const FISH_HEIGHT = 100;

const ROWS = 5;
const COLS = 4;

function getSwayOffsets(fishId) {
  var swayValue = (($time() * 360) / (20 * 1000) + (fishId + 1) * 10) % 360;
  var swayOffsetX = Math.sin(((swayValue * Math.PI) / 180) * 5) * 6;
  var swayOffsetY = Math.sin(((swayValue * Math.PI) / 180) * 6) * 2;

  return {offsetX: swayOffsetX, offsetY: swayOffsetY};
}

function getFishLocation(fishId) {
  let x, y;
  let layout;

  // Determine which layout to use based on mode.
  const currentMode = getState().currentMode;
  if (currentMode === Modes.Training) {
    layout = 'grid';
  } else if (currentMode === Modes.Predicting) {
    layout = 'line';
  } else if (currentMode === Modes.Pond) {
    layout = 'diamondgrid';
  }

  // Generate the location based on the layout.
  if (layout === 'random') {
      x = Math.floor(Math.random() * constants.canvasWidth);
      y = Math.floor(Math.random() * constants.canvasHeight);
  } else if (layout === 'grid') {
    x = (fishId % COLS) * FISH_WIDTH*1.3 + 10;
    y = Math.floor(fishId / COLS) * FISH_HEIGHT*1.1 + 10;
  } else if (layout === 'diamondgrid') {
    x = (fishId % COLS) * FISH_WIDTH + (Math.floor(fishId / COLS) % 2 === 1 ? -100 : 0);
    y = Math.floor(fishId / COLS) * FISH_HEIGHT;
  } else if (layout === 'line') {
    x = fishId * FISH_WIDTH;
    y = 200;
  }

  return {x: x, y: y};
}

function getRandomFish(id) {
  return {
    id: id,
    fish: generateRandomFish(),
    canvas: null
  };
}

function loadImages(fish) {
  return Promise.all(fish.parts.map(bodyPart => loadFishImage(bodyPart)));
}

function drawFish(fish, results, palette, ctx) {
  const body = results.find(
    result => result.fishPart.type === FishBodyPart.BODY
  ).fishPart;
  const bodyAnchor = bodyAnchorFromType(body, body.type);
  results = _.orderBy(results, ['fishPart.type']);

  results.forEach(result => {
    let intermediateCanvas = document.createElement('canvas');
    intermediateCanvas.width = FISH_CANVAS_WIDTH;
    intermediateCanvas.height = FISH_CANVAS_HEIGHT;
    let intermediateCtx = intermediateCanvas.getContext('2d');
    let anchor = [0, 0];
    if (result.fishPart.type !== FishBodyPart.BODY) {
      anchor = bodyAnchorFromType(body, result.fishPart.type);
    }

    const xPos = bodyAnchor[0] + anchor[0];
    const yPos = bodyAnchor[1] + anchor[1];

    intermediateCtx.drawImage(result.img, xPos, yPos);
    const rgb = colorFromType(palette, result.fishPart.type);

    if (rgb) {
      let imageData = intermediateCtx.getImageData(
        xPos,
        yPos,
        result.img.width,
        result.img.height
      );
      let data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255) {
          data[i] = rgb[0];
          data[i + 1] = rgb[1];
          data[i + 2] = rgb[2];
        }
      }

      intermediateCtx.putImageData(imageData, xPos, yPos);
    }

    ctx.drawImage(intermediateCanvas, 0, 0);
  });
}

function drawRenderedFish(fishCanvas, x, y, palette, ctx) {
  ctx.drawImage(fishCanvas, x, y, FISH_WIDTH, FISH_HEIGHT);
}

function loadFishImage(fishPart) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', e => resolve({img, fishPart}));
    img.addEventListener('error', () => {
      reject(new Error(`failed to load image at #{fishPart.src}`));
    });
    img.src = fishPart.src;
  });
}

function bodyAnchorFromType(body, type) {
  switch (type) {
    case FishBodyPart.EYE:
      return body.eyeAnchor;
    case FishBodyPart.MOUTH:
      return body.mouthAnchor;
    case FishBodyPart.DORSAL_FIN:
      return body.dorsalFinAnchor;
    case FishBodyPart.PECTORAL_FIN:
      return body.pectoralFinAnchor;
    case FishBodyPart.TAIL:
      return body.tailAnchor;
    case FishBodyPart.BODY:
      return body.anchor;
    default:
      return [0, 0];
  }
}

function colorFromType(palette, type) {
  switch (type) {
    case FishBodyPart.MOUTH:
      return palette.mouthRgb;
    case FishBodyPart.DORSAL_FIN:
    case FishBodyPart.PECTORAL_FIN:
    case FishBodyPart.TAIL:
      return palette.finRgb;
    case FishBodyPart.BODY:
      return palette.bodyRgb;
    default:
      return null;
  }
}

// Initialize the renderer once.
// This will generate canvases with the fish collection.
// It will start the animation farme callbacks from the browser.
export const init = function(canvasParam) {
  canvas = canvasParam;
  canvasCtx = canvas.getContext('2d');

  for (let i = 0; i < ROWS * COLS; i++) {
    fishes.push(getRandomFish(i));
  }

  fishes.forEach(fish => {
    fish.canvas = document.createElement('canvas');
    fish.canvas.width = FISH_CANVAS_WIDTH;
    fish.canvas.height = FISH_CANVAS_HEIGHT;
    loadImages(fish.fish).then(results =>
      drawFish(
        fish.fish,
        results,
        fish.fish.colorPalette,
        fish.canvas.getContext('2d')
      )
    );
  });

  window.requestAnimFrame(animateScreen);
};

function animateScreen() {
  // Update static screen elements that might change occasionally,
  // e.g. background image.
  updateScreenElements();

  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    backgroundImage,
    0,
    0,
    constants.canvasWidth,
    constants.canvasHeight
  );

  fishes.forEach(fish => {
    const location = getFishLocation(fish.id);
    const offsets = getSwayOffsets(fish.id);
    drawRenderedFish(
      fish.canvas,
      location.x + offsets.offsetX,
      location.y + offsets.offsetY,
      fish.fish.colorPalette,
      ctx
    );
  });

  drawOverlays();

  window.requestAnimFrame(animateScreen);
}

function updateScreenElements() {
  let backgroundImageName;
  const currentMode = getState().currentMode;
  if (currentMode === Modes.Training) {
    backgroundImageName = 'classroom';
  } else if (currentMode === Modes.Predicting) {
    backgroundImageName = 'pipes';
  } else if (currentMode === Modes.Pond) {
    backgroundImageName = 'underwater';
  }

  if (currentBackgroundImageName !== backgroundImageName) {
    backgroundImage = new Image();
    backgroundImage.src = `images/${backgroundImageName}-background.png`;
    currentBackgroundImageName = backgroundImageName;
    currentModeStartTime = $time();
  }
}

function drawOverlays() {
  // update fade
  var duration = $time() - currentModeStartTime;
  var amount = 1 - duration / 800;
  if (amount < 0) {
    amount = 0;
  }
  DrawFade(amount, '#000');
}

function DrawFade(amount, overlayColour) {
  if (amount === 0) {
    return;
  }

  canvasCtx.globalAlpha = amount;
  canvasCtx.fillStyle = overlayColour;
  DrawFilledRect(0, 0, constants.canvasWidth, constants.canvasHeight);
  canvasCtx.globalAlpha = 1;
}

function DrawFilledRect(x, y, w, h) {
  x = Math.floor(x / 1);
  y = Math.floor(y / 1);
  w = Math.floor(w / 1);
  h = Math.floor(h / 1);

  canvasCtx.fillRect(x, y, w, h);
}