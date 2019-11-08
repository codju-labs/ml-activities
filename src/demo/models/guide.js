import {getState, setState} from '../state';
import {Modes} from '../constants';

const guides = [
  {
    id: 'fishvtrash-training-init',
    text: 'Welcome to the tutorial!',
    when: {appMode: 'fishvtrash', currentMode: Modes.Training},
    style: 'TopLeft'
  },
  {
    id: 'fishvtrash-training-init2',
    text: 'Use these two buttons to train A.I.!',
    when: {appMode: 'fishvtrash', currentMode: Modes.Training},
    style: 'BottomMiddle'
  },
  {
    id: 'fishvtrash-predicting-init',
    text: "Does A.I. know what a fish looks like?  Let's see!",
    when: {appMode: 'fishvtrash', currentMode: Modes.Predicting},
    style: 'BottomMiddle'
  }
];

export function getCurrentGuide() {
  const state = getState();

  for (const guide of guides) {
    // If the current state matches the guide's requirements...
    if (
      Object.keys(guide.when).every(key => {
        return guide.when[key] === state[key];
      })
    ) {
      // And if we haven't already dismissed this particular guide...
      if (! (state.guideDismissals && state.guideDismissals.includes(guide.id))) {
        return guide;
      }
    }
  }

  return null;
}

export function dismissGuide(id) {
  const state = getState();
  const currentGuideDismissals = state.guideDismissals;
  let newGuideDismissals = [...currentGuideDismissals];
  newGuideDismissals.push(id);
  setState({guideDismissals: newGuideDismissals});
}
