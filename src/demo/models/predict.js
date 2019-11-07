import 'idempotent-babel-polyfill';
import {getState, setState} from '../state';
import {generateOcean} from '../../utils/generateOcean';

export const init = () => {
  const state = getState();
  state.trainer.train();
  let fishData = [];
  if (state.appMode === 'creaturesvtrashdemo') {
    fishData = fishData.concat(generateOcean(4, true, true, false));
    fishData = fishData.concat(generateOcean(3, false, false, true, 4));
  } else {
    fishData = generateOcean(100);
  }
  setState({fishData});
};

export const predictFish = (state, idx) => {
  return new Promise(resolve => {
    const fish = state.fishData[idx];

    var predictionPromise;
    if (state.appMode === 'long') {
      predictionPromise = state.trainer.predictFromExample(fish.knnData);
    } else {
      predictionPromise = state.trainer.predictFromTensor(fish.getTensor());
    }

    predictionPromise.then(prediction => {
      fish.setResult(prediction);
      resolve(prediction);
    });
  });
};
