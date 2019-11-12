import 'babel-polyfill';
import $ from 'jquery';
import {queryStrFor} from './helpers';
import {initAll} from './init';

let currentAppMode = queryStrFor('mode') || 'fishvtrash';
let canvas, backgroundCanvas;

function onLevelChange(event) {
  currentAppMode = event.target.id;
  initDemoPage();
}

function initDemoPage() {
  initAll({
    appMode: currentAppMode,
    onContinue,
    canvas,
    backgroundCanvas
  });
}

function onContinue() {
  const nextRadioButton = $(`#${currentAppMode}`).next();
  if (nextRadioButton.length > 0) {
    nextRadioButton.prop('checked', true);
    onLevelChange({
      target: {
        id: nextRadioButton.attr('id')
      }
    });
  }
}

$(document).ready(() => {
  // Set up canvases.
  canvas = document.getElementById('activity-canvas');
  backgroundCanvas = document.getElementById('background-canvas');

  $(`#${currentAppMode}`).prop('checked', true);
  $('.level-radio').change(onLevelChange);

  initDemoPage();
});
