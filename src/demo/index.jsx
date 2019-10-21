import $ from 'jquery';
import constants, {Modes} from './constants';
import {setState} from './state';
import {init as initScene} from './init';

$(document).ready(() => {
  // Set up initial state
  const canvas = document.getElementById('activity-canvas');
  const backgroundCanvas = document.getElementById('background-canvas');
  canvas.width = backgroundCanvas.width = constants.canvasWidth;
  canvas.height = backgroundCanvas.height = constants.canvasHeight;

  setState({
    currentMode: Modes.Words,
    canvas,
    backgroundCanvas,
    uiContainer: document.getElementById('ui-container'),
    headerContainer: document.getElementById('header-container')
  });

  initScene();
});
