import 'babel-polyfill';
import $ from 'jquery';
import './assetPath';
import {queryStrFor} from './helpers';
import {initAll} from './init';
import Sounds from './Sounds';
import {getState} from './state';

let currentAppMode = queryStrFor('mode') || 'fishvtrash';
let canvas, backgroundCanvas;

function onLevelChange(event) {
  // Stop any typing sounds.  (Don't modify state, though, since that would
  // callback into our renderer again.)
  const existingTypingTimer = getState().guideTypingTimer;
  if (existingTypingTimer) {
    clearInterval(existingTypingTimer);
  }

  currentAppMode = event.target.id;
  initDemoPage();
}

function initDemoPage() {
  const sounds = new Sounds();

  initAll({
    appMode: currentAppMode,
    onContinue,
    canvas,
    backgroundCanvas,
    playSound: sounds.play.bind(sounds),
    registerSound: sounds.register.bind(sounds)
  });
}

function onContinue() {
  messageData = {
    type: 'ACTIVITY_COMPLETION',
    data: {
      success: false
    }
  };
  // window.parent.postMessage(messageData);
  console.log('when is this called?');
}

$(document).ready(() => {
                          // Set up canvases.
                          canvas = document.getElementById(
                            'activity-canvas'
                          );
                          backgroundCanvas = document.getElementById(
                            'background-canvas'
                          );

                          initDemoPage();
                        });
