import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import _ from 'lodash';
import {getState, setState} from './state';
import constants, {AppMode, Modes} from './constants';
import {toMode} from './toMode';
import {
  $time,
  currentRunTime,
  finishMovement,
  resetTraining,
  friendlyNameForFishPart
} from './helpers';
import {onClassifyFish} from './models/train';
import {arrangeFish} from './models/pond';
import colors from './colors';
import aiBotClosed from '../../public/images/ai-bot/ai-bot-closed.png';
import counterIcon from '../../public/images/data.png';
import eraseButton from '../../public/images/erase.png';
import arrowDownImage from '../../public/images/arrow-down.png';
import snail from '../../public/images/seaCreatures/Snail.png';
import Typist from 'react-typist';
import {getCurrentGuide, dismissCurrentGuide} from './models/guide';
import {playSound} from './models/soundLibrary';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faPause,
  faBackward,
  faForward,
  faEraser,
  faCheck,
  faBan,
  faInfo
} from '@fortawesome/free-solid-svg-icons';

const styles = {
  body: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%' // for 16:9
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%'
  },
  // Note that button fontSize and padding are currently set by surrounding HTML for
  // responsiveness.
  button: {
    cursor: 'pointer',
    backgroundColor: colors.white,
    color: colors.grey,
    borderRadius: 8,
    minWidth: 160,
    outline: 'none',
    border: 'none',
    ':focus': {
      outline: `${colors.white} auto 5px`
    }
  },
  continueButton: {
    position: 'absolute',
    bottom: '4%',
    right: '2.25%',
    backgroundColor: colors.orange,
    color: colors.white
  },
  finishButton: {
    backgroundColor: colors.orange,
    color: colors.white
  },
  playAgainButton: {
    backgroundColor: colors.yellowGreen,
    color: colors.white,
    marginBottom: 10
  },
  rightButtons: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'right',
    minWidth: 160
  },
  backButton: {
    position: 'absolute',
    bottom: '4%',
    left: '2.25%',
    backgroundColor: colors.blue,
    color: colors.white
  },
  button2col: {
    width: '20%',
    marginLeft: '14%',
    marginRight: '14%',
    marginTop: '2%'
  },
  button3col: {
    width: '20%',
    marginLeft: '6%',
    marginRight: '6%',
    marginTop: '2%'
  },
  confirmationDialogBackground: {
    backgroundColor: colors.transparentBlack,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 10,
    zPosition: 1
  },
  confirmationDialog: {
    position: 'absolute',
    backgroundColor: colors.white,
    color: colors.darkGrey,
    transform: 'translate(-50%, -50%)',
    top: '50%',
    bottom: 'initial',
    left: '50%',
    padding: 20
  },
  confirmationDialogLeft: {
    float: 'left',
    width: '30%'
  },
  confirmationDialogRight: {
    float: 'right',
    width: '70%'
  },
  confirmationHeader: {
    fontSize: 40,
    lineHeight: '40px',
    color: colors.darkGrey,
    padding: 10,
    textAlign: 'center'
  },
  confirmationText: {
    textAlign: 'center',
    backgroundColor: colors.lightGrey,
    padding: '15px',
    borderRadius: '5px'
  },
  confirmationButtons: {
    display: 'inline-flex',
    justifyContent: 'space-between',
    padding: '10px 0px',
    width: '100%'
  },
  confirmationYesButton: {
    marginLeft: 10,
    backgroundColor: colors.red,
    color: colors.white
  },
  confirmationNoButton: {
    backgroundColor: colors.orange,
    color: colors.white
  },
  activityIntroText: {
    position: 'absolute',
    fontSize: 22,
    lineHeight: '26px',
    top: '20%',
    left: '50%',
    width: '80%',
    transform: 'translateX(-50%)',
    textAlign: 'center'
  },
  trainingIntroBot: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    top: '30%',
    left: '50%'
  },
  activityIntroBot: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    top: '50%',
    left: '50%'
  },
  wordsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 22,
    lineHeight: '26px',
    color: colors.white
  },
  eraseButton: {
    position: 'absolute',
    top: 24,
    right: 22,
    cursor: 'pointer'
  },
  trainQuestionText: {
    position: 'absolute',
    top: '15%',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 32,
    lineHeight: '35px',
    color: colors.white
  },
  trainButtons: {
    position: 'absolute',
    top: '83%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  },
  trainButtonYes: {
    marginLeft: 10,
    ':hover': {
      backgroundColor: colors.green,
      color: colors.white
    },
    ':focus': {
      outline: 'none'
    }
  },
  trainButtonNo: {
    ':hover': {
      backgroundColor: colors.red,
      color: colors.white
    },
    ':focus': {
      outline: 'none'
    }
  },
  trainBot: {
    position: 'absolute',
    height: '40%',
    top: '28%',
    left: '76%'
  },
  counter: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'space-between',
    right: 53,
    top: 24,
    backgroundColor: colors.black,
    opacity: '90%',
    color: colors.neonBlue,
    borderRadius: 33,
    padding: 0,
    width: '8%',
    height: 25
  },
  counterNum: {
    fontSize: 14,
    margin: '4px 7px'
  },
  mediaControls: {
    position: 'absolute',
    width: '100%',
    bottom: 25,
    display: 'flex',
    justifyContent: 'center'
  },
  mediaControl: {
    cursor: 'pointer',
    margin: '0 20px',
    fontSize: 30,
    color: colors.white,
    display: 'flex',
    alignItems: 'center',
    ':hover': {
      color: colors.orange
    },
    ':active': {
      color: colors.orange
    }
  },
  selectedControl: {
    color: colors.orange
  },
  timeScale: {
    width: 40,
    fontSize: 24,
    textAlign: 'center'
  },
  predictSpeech: {
    top: '88%',
    left: '12%',
    width: '65%',
    height: 38
  },
  pondFishDetails: {
    position: 'absolute',
    backgroundColor: colors.transparentWhite,
    padding: '2%',
    borderRadius: 5,
    color: colors.black
  },
  pondBot: {
    position: 'absolute',
    height: '27%',
    top: '59%',
    left: '50%',
    bottom: 0,
    transform: 'translateX(-45%)',
    pointerEvents: 'none'
  },
  pondPanelButton: {
    position: 'absolute',
    top: 24,
    left: 22,
    cursor: 'pointer'
  },
  pondPanelLeft: {
    position: 'absolute',
    width: '30%',
    backgroundColor: colors.transparentBlack,
    color: colors.white,
    borderRadius: 10,
    left: '3%',
    top: '16%',
    padding: 20
  },
  pondPanelRight: {
    position: 'absolute',
    width: '30%',
    backgroundColor: colors.transparentBlack,
    color: colors.white,
    borderRadius: 10,
    right: '3%',
    top: '16%',
    padding: 20
  },
  pondPanelPreText: {
    marginBottom: 20
  },
  pondPanelRow: {
    position: 'relative',
    height: 40
  },
  pondPanelGeneralBar: {
    position: 'absolute',
    top: 0,
    left: '0%',
    height: 30,
    backgroundColor: colors.green
  },
  pondPanelGeneralBarText: {
    position: 'absolute',
    top: 4,
    left: '3%',
    textAlign: 'right'
  },
  pondPanelGreenBar: {
    position: 'absolute',
    top: 0,
    left: '50%',
    height: 30,
    backgroundColor: colors.green
  },
  pondPanelGreenBarText: {
    position: 'absolute',
    top: 4,
    left: '53%'
  },
  pondPanelRedBar: {
    position: 'absolute',
    top: 0,
    right: '50%',
    height: 30,
    backgroundColor: colors.red
  },
  pondPanelRedBarText: {
    position: 'absolute',
    top: 4,
    width: '47%',
    textAlign: 'right'
  },
  pondPanelPostText: {
    marginTop: 20
  },
  recallContainer: {
    position: 'absolute',
    top: '4%',
    right: '2.25%',
    color: colors.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  recallIcon: {
    width: 30,
    height: 30,
    border: `5px solid ${colors.white}`,
    borderRadius: 50,
    padding: 6,
    marginLeft: 8,
    backgroundColor: colors.lightGrey
  },
  bgNeonBlue: {
    backgroundColor: colors.neonBlue
  },
  bgRed: {
    backgroundColor: colors.red
  },
  bgGreen: {
    backgroundColor: colors.green
  },
  pill: {
    display: 'flex',
    alignItems: 'center'
  },
  pillIcon: {
    width: 19,
    padding: 10,
    borderRadius: 33
  },
  pillText: {
    color: colors.black,
    padding: '10px 30px',
    borderRadius: 33,
    marginLeft: -18
  },
  count: {
    position: 'absolute',
    top: '3%'
  },
  noCount: {
    right: '9%'
  },
  yesCount: {
    right: 0
  },
  guide: {
    position: 'absolute',
    backgroundColor: colors.transparentBlack,
    color: colors.white,
    lineHeight: '140%',
    borderRadius: 5,
    maxWidth: '80%',
    bottom: '4%',
    left: '50%',
    transform: 'translateX(-50%)'
  },
  guideLeft: {
    float: 'left'
  },
  guideRight: {
    float: 'right',
    position: 'relative'
  },
  guideImage: {
    paddingTop: 20,
    paddingLeft: 20,
    maxWidth: '90%'
  },
  guideHeading: {
    fontSize: 40,
    lineHeight: '40px',
    color: colors.darkGrey,
    padding: 20
  },
  guideTypingText: {
    position: 'absolute',
    padding: 20
  },
  guideFinalTextContainer: {},
  guideFinalTextInfoContainer: {
    backgroundColor: colors.lightGrey,
    borderRadius: 10
  },
  guideFinalText: {
    padding: 20,
    opacity: 0
  },
  guideBackground: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 10
  },
  guideBackgroundHidden: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none'
  },
  guideArrow: {
    position: 'absolute'
  },
  guideInfo: {
    backgroundColor: colors.white,
    color: colors.darkGrey,
    transform: 'translate(-50%, -50%)',
    top: '50%',
    bottom: 'initial',
    left: '50%',
    padding: 20
  },
  guideCenter: {
    top: '50%',
    left: '50%',
    bottom: 'initial',
    maxWidth: '47%',
    transform: 'translate(-50%, -50%)'
  },
  arrowBotRight: {
    top: '15%',
    right: '14.5%'
  },
  arrowLowerLeft: {
    bottom: '17%',
    left: '6%'
  },
  arrowLowerRight: {
    bottom: '17%',
    right: '6%'
  },
  arrowLowishRight: {
    bottom: '25%',
    right: '5%'
  },
  arrowLowerCenter: {
    bottom: '25%',
    left: '50%',
    transform: 'translateX(-50%)'
  }
};

function Collide(x1, y1, w1, h1, x2, y2, w2, h2) {
  // Detect a non-collision.
  if (
    x1 + w1 - 1 < x2 ||
    x1 > x2 + w2 - 1 ||
    y1 + h1 - 1 < y2 ||
    y1 > y2 + h2 - 1
  ) {
    return false;
  }

  // Otherwise we have a collision.
  return true;
}

class Body extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func
  };

  render() {
    return (
      <div style={styles.body} onClick={this.props.onClick}>
        {this.props.children}
        <Guide />
      </div>
    );
  }
}

class Content extends React.Component {
  static propTypes = {
    children: PropTypes.node
  };

  render() {
    return <div style={styles.content}>{this.props.children}</div>;
  }
}

let Button = class Button extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node,
    onClick: PropTypes.func,
    sound: PropTypes.string
  };

  onClick(event) {
    dismissCurrentGuide();
    const clickReturnValue = this.props.onClick(event);

    if (clickReturnValue !== false) {
      if (this.props.sound && clickReturnValue !== false) {
        playSound(this.props.sound);
      } else {
        playSound('other');
      }
    }
  }

  render() {
    return (
      <button
        type="button"
        className={this.props.className}
        style={[styles.button, this.props.style]}
        onClick={event => this.onClick(event)}
      >
        {this.props.children}
      </button>
    );
  }
};
Button = Radium(Button);

let ConfirmationDialog = class ConfirmationDialog extends React.Component {
  static propTypes = {
    onYesClick: PropTypes.func,
    onNoClick: PropTypes.func
  };

  render() {
    return (
      <div style={styles.confirmationDialogBackground}>
        <div style={styles.confirmationDialog}>
          <img src={snail} style={styles.confirmationDialogLeft} />
          <div style={styles.confirmationDialogRight}>
            <div
              style={styles.confirmationHeader}
              className="confirmation-text"
            >
              Are you sure?
            </div>
            <div style={styles.confirmationText}>
              Erasing AI's data will permanently delete all training. Is that
              what you want to do?
            </div>
          </div>
          <div style={styles.confirmationButtons}>
            <Button
              onClick={this.props.onYesClick}
              style={styles.confirmationYesButton}
              className="dialog-button"
            >
              <FontAwesomeIcon icon={faEraser} /> Erase
            </Button>
            <Button
              onClick={this.props.onNoClick}
              style={styles.confirmationNoButton}
              className="dialog-button"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }
};
ConfirmationDialog = Radium(ConfirmationDialog);

const wordSet = {
  short: {
    text: ['What type of fish do you want to train A.I. to detect?'],
    choices: [['Blue', 'Green', 'Red'], ['Triangle', 'Round', 'Square']],
    style: styles.button2col
  },
  long: {
    text: ['Choose a new word to teach A.I.'],
    choices: [
      [
        'Fierce',
        'Fresh',
        'Glitchy',
        'Glossy',
        'Hungry',
        'Playful',
        'Scaly',
        'Scrappy',
        'Silly',
        'Sparkly',
        'Spiky',
        'Squirmy',
        'Tropical',
        'Wacky',
        'Wild'
      ]
    ],
    style: styles.button3col
  }
};

class Words extends React.Component {
  constructor(props) {
    super(props);

    // Randomize word choices in each set, merge the sets, and set as state.
    const appMode = getState().appMode;
    const appModeWordSet = wordSet[appMode].choices;
    let choices = [];
    let maxSize = 0;
    // Each subset represents a different column, so merge the subsets
    // Start by shuffling the subsets and finding the max length
    for (var i = 0; i < appModeWordSet.length; ++i) {
      appModeWordSet[i] = _.shuffle(appModeWordSet[i]);
      if (appModeWordSet[i].length > maxSize) {
        maxSize = appModeWordSet[i].length;
      }
    }
    // Iterate through each subset and add those elements to choices
    for (i = 0; i < maxSize; ++i) {
      appModeWordSet.forEach(col => {
        if (col[i]) {
          choices.push(col[i]);
        }
      });
    }

    this.state = {choices};
  }

  onChangeWord(itemIndex) {
    const word = this.state.choices[itemIndex];
    setState({
      word,
      trainingQuestion: `Is this fish ${word.toUpperCase()}?`
    });
    toMode(Modes.Training);
  }

  render() {
    const state = getState();

    return (
      <Body>
        <Content>
          {wordSet[state.appMode].text && (
            <div style={styles.wordsText}>
              {wordSet[state.appMode].text.map((text, i) => (
                <div key={i}>{text}</div>
              ))}
            </div>
          )}
          {this.state.choices.map((item, itemIndex) => (
            <Button
              key={itemIndex}
              className="words-button"
              style={wordSet[state.appMode].style}
              onClick={() => this.onChangeWord(itemIndex)}
            >
              {item}
            </Button>
          ))}
        </Content>
      </Body>
    );
  }
}

let Train = class Train extends React.Component {
  render() {
    const state = getState();
    const yesButtonText =
      state.appMode === AppMode.CreaturesVTrash ? 'Yes' : state.word;
    const noButtonText =
      state.appMode === AppMode.CreaturesVTrash ? 'No' : `Not ${state.word}`;
    const resetTrainingFunction = () => {
      resetTraining(state);
      setState({showConfirmationDialog: false});
    };

    return (
      <Body>
        <img
          src={eraseButton}
          style={styles.eraseButton}
          onClick={() => {
            setState({
              showConfirmationDialog: true,
              confirmationDialogOnYes: resetTrainingFunction
            });
          }}
        />
        <div style={styles.trainQuestionText}>{state.trainingQuestion}</div>
        <img style={styles.trainBot} src={aiBotClosed} />

        <div style={styles.counter}>
          <img src={counterIcon} />
          <span style={styles.counterNum}>
            {Math.min(999, state.yesCount + state.noCount)}
          </span>
        </div>
        <div style={styles.trainButtons}>
          <Button
            style={styles.trainButtonNo}
            onClick={() => {
              return onClassifyFish(false);
            }}
            sound={'no'}
          >
            {noButtonText}
          </Button>
          <Button
            style={styles.trainButtonYes}
            onClick={() => {
              return onClassifyFish(true);
            }}
            sound={'yes'}
          >
            {yesButtonText}
          </Button>
        </div>
        <Button
          style={styles.continueButton}
          onClick={() => toMode(Modes.Predicting)}
        >
          Continue
        </Button>
      </Body>
    );
  }
};
Train = Radium(Train);

const defaultTimeScale = 1;
const timeScales = [1, 2];
const MediaControl = Object.freeze({
  Rewind: 'rewind',
  Play: 'play',
  FastForward: 'fast-forward'
});

let Predict = class Predict extends React.Component {
  state = {
    displayControls: false,
    timeScale: defaultTimeScale
  };

  onRun = () => {
    const state = setState({isRunning: true, runStartTime: $time()});
    if (state.appMode !== AppMode.CreaturesVTrashDemo) {
      this.setState({displayControls: true});
    }
  };

  onContinue = () => {
    const state = getState();
    if (state.appMode === AppMode.CreaturesVTrashDemo && state.onContinue) {
      state.onContinue();
    } else {
      toMode(Modes.Pond);
    }
  };

  finishMovement = () => {
    const state = getState();

    const t = currentRunTime(state);
    if (state.rewind) {
      finishMovement(state.lastPauseTime - t);
    } else {
      finishMovement(state.lastPauseTime + t);
    }
  };

  onPressPlay = () => {
    const state = getState();
    this.finishMovement();
    setState({
      isRunning: !state.isRunning,
      isPaused: !state.isPaused,
      rewind: false,
      moveTime: constants.defaultMoveTime / defaultTimeScale
    });
    this.setState({timeScale: defaultTimeScale});
  };

  onScaleTime = rewind => {
    this.finishMovement();
    const nextIdx = timeScales.indexOf(this.state.timeScale) + 1;
    const timeScale =
      nextIdx > timeScales.length - 1 ? timeScales[0] : timeScales[nextIdx];

    setState({
      rewind,
      isRunning: true,
      isPaused: false,
      moveTime: constants.defaultMoveTime / timeScale
    });
    this.setState({timeScale});
  };

  render() {
    const state = getState();
    let selectedControl;
    if (state.isRunning && state.rewind) {
      selectedControl = MediaControl.Rewind;
    } else if (
      state.isRunning &&
      !state.rewind &&
      this.state.timeScale !== defaultTimeScale
    ) {
      selectedControl = MediaControl.FastForward;
    } else {
      selectedControl = MediaControl.Play;
    }

    return (
      <Body>
        {this.state.displayControls && (
          <div style={styles.mediaControls}>
            <span
              onClick={() => this.onScaleTime(true)}
              style={[
                styles.mediaControl,
                selectedControl === MediaControl.Rewind &&
                  styles.selectedControl
              ]}
              key={MediaControl.Rewind}
            >
              <span style={styles.timeScale}>
                {selectedControl === MediaControl.Rewind &&
                  this.state.timeScale !== defaultTimeScale &&
                  `x${this.state.timeScale}`}
              </span>
              <FontAwesomeIcon icon={faBackward} />
            </span>
            <span
              onClick={this.onPressPlay}
              style={[
                styles.mediaControl,
                selectedControl === MediaControl.Play && styles.selectedControl
              ]}
              key={MediaControl.Play}
            >
              <FontAwesomeIcon icon={state.isRunning ? faPause : faPlay} />
            </span>
            <span
              onClick={() => this.onScaleTime(false)}
              style={[
                styles.mediaControl,
                selectedControl === MediaControl.FastForward &&
                  styles.selectedControl
              ]}
              key={MediaControl.FastForward}
            >
              <FontAwesomeIcon icon={faForward} />
              <span style={styles.timeScale}>
                {selectedControl === MediaControl.FastForward &&
                  this.state.timeScale !== defaultTimeScale &&
                  `x${this.state.timeScale}`}
              </span>
            </span>
          </div>
        )}
        {!state.isRunning && !state.isPaused && (
          <Button style={styles.continueButton} onClick={this.onRun}>
            Run
          </Button>
        )}
        {(state.isRunning || state.isPaused) && state.canSkipPredict && (
          <Button style={styles.continueButton} onClick={this.onContinue}>
            Continue
          </Button>
        )}
      </Body>
    );
  }
};
Predict = Radium(Predict);

class PondPanel extends React.Component {
  render() {
    const state = getState();

    const maxExplainValue = state.showRecallFish
      ? state.pondRecallFishMaxExplainValue
      : state.pondFishMaxExplainValue;

    return (
      <div>
        {!state.pondClickedFish && (
          <div style={styles.pondPanelLeft}>
            {state.pondExplainGeneralSummary && (
              <div>
                <div style={styles.pondPanelPreText}>
                  These were the most important fish parts:
                </div>
                {state.pondExplainGeneralSummary.slice(0, 5).map((f, i) => (
                  <div key={i}>
                    {f.importance > 0 && (
                      <div style={styles.pondPanelRow}>
                        &nbsp;
                        <div
                          style={{
                            ...styles.pondPanelGeneralBar,
                            width:
                              (Math.abs(f.importance) /
                                state.pondExplainGeneralSummary[0].importance) *
                                100 +
                              '%'
                          }}
                        >
                          &nbsp;
                        </div>
                        <div style={styles.pondPanelGeneralBarText}>
                          {friendlyNameForFishPart(f.partType)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div style={styles.pondPanelPostText}>
                  Click individual fish to see their information.
                </div>
              </div>
            )}
          </div>
        )}
        {state.pondClickedFish && (
          <div
            style={
              state.pondPanelSide === 'left'
                ? styles.pondPanelLeft
                : styles.pondPanelRight
            }
          >
            {state.pondExplainFishSummary && (
              <div>
                <div style={styles.pondPanelPreText}>
                  These were the most important fish parts in determining
                  whether this fish was{' '}
                  <span style={{color: colors.green}}>{state.word}</span> or{' '}
                  <span style={{color: colors.red}}>not {state.word}</span>.
                </div>
                {state.pondExplainFishSummary.slice(0, 4).map((f, i) => (
                  <div key={i}>
                    {f.impact < 0 && (
                      <div style={styles.pondPanelRow}>
                        &nbsp;
                        <div
                          style={{
                            ...styles.pondPanelGreenBar,
                            width:
                              ((Math.abs(f.impact) / maxExplainValue) * 100) /
                                2 +
                              '%'
                          }}
                        >
                          &nbsp;
                        </div>
                        <div style={styles.pondPanelGreenBarText}>
                          {friendlyNameForFishPart(f.partType)}
                        </div>
                      </div>
                    )}
                    {f.impact > 0 && (
                      <div style={styles.pondPanelRow}>
                        &nbsp;
                        <div
                          style={{
                            ...styles.pondPanelRedBar,
                            width:
                              ((Math.abs(f.impact) / maxExplainValue) * 100) /
                                2 +
                              '%'
                          }}
                        >
                          &nbsp;
                        </div>
                        <div style={styles.pondPanelRedBarText}>
                          {friendlyNameForFishPart(f.partType)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

let Pond = class Pond extends React.Component {
  constructor(props) {
    super(props);
    setState({pondExplainGeneralSummary: null, pondExplainFishSummary: null});
  }

  toggleRecall = e => {
    const state = getState();
    const showRecallFish = !state.showRecallFish;
    const fish = showRecallFish ? state.recallFish : state.pondFish;

    // Don't call arrangeFish if fish have already been arranged.
    if (fish.length > 0 && !fish[0].getXY()) {
      arrangeFish(fish);
    }

    setState({showRecallFish, pondClickedFish: null});

    e.stopPropagation();
  };

  onPondClick = e => {
    // Don't allow pond clicks if a Guide is currently showing.
    if (getCurrentGuide()) {
      return;
    }

    const state = getState();
    const clickX = e.nativeEvent.offsetX;
    const clickY = e.nativeEvent.offsetY;

    const boundingRect = e.target.getBoundingClientRect();
    const pondWidth = boundingRect.width;
    const pondHeight = boundingRect.height;

    // Scale the click to the pond canvas dimensions.
    const normalizedClickX = (clickX / pondWidth) * constants.canvasWidth;
    const normalizedClickY = (clickY / pondHeight) * constants.canvasHeight;

    const fishCollection = state.showRecallFish
      ? state.recallFish
      : state.pondFish;

    if (state.pondFishBounds) {
      let fishClicked = false;
      // Look through the array in reverse so that we click on a fish that
      // is rendered topmost.
      _.reverse(state.pondFishBounds).forEach(fishBound => {
        // If we haven't already clicked on a fish in this current iteration,
        // and we're not clicking on a fish that is already actively clicked,
        // and we have a collision, then we have clicked on a new fish!
        if (
          !fishClicked &&
          !(
            state.pondClickedFish &&
            fishBound.fishId === state.pondClickedFish.id
          ) &&
          Collide(
            fishBound.x,
            fishBound.y,
            fishBound.w,
            fishBound.h,
            normalizedClickX,
            normalizedClickY,
            1,
            1
          )
        ) {
          setState({
            pondClickedFish: {
              id: fishBound.fishId,
              x: fishBound.x,
              y: fishBound.y
            }
          });
          fishClicked = true;
          playSound('yes');

          if (
            state.appMode === AppMode.FishShort ||
            state.appMode === AppMode.FishLong
          ) {
            const clickedFish = fishCollection.find(
              f => f.id === fishBound.fishId
            );
            setState({
              pondExplainFishSummary: state.trainer.explainFish(clickedFish)
            });
            if (normalizedClickX < constants.canvasWidth / 2) {
              setState({pondPanelSide: 'right'});
            } else {
              setState({pondPanelSide: 'left'});
            }
          }
        }
      });

      if (!fishClicked) {
        setState({pondClickedFish: null});
        playSound('no');
      }
    }
  };

  onPondPanelButtonClick(e) {
    const state = getState();

    // If there are no fish in the pond at all, don't do anything.
    if (state.fishData.length === 0) {
      return;
    }

    if (
      state.appMode === AppMode.FishShort ||
      state.appMode === AppMode.FishLong
    ) {
      setState({
        pondPanelShowing: !state.pondPanelShowing,
        pondClickedFish: null
      });

      // Since we aren't guaranteed that pondFish or recallFish will have fish
      // in them, go to the complete set of 100 fishData.
      const firstFishFieldInfos = state.fishData[0].fieldInfos; //state.pondFish[0].fieldInfos;
      setState({
        pondExplainGeneralSummary: state.trainer.summarize(firstFishFieldInfos)
      });
    }

    e.stopPropagation();
  }

  render() {
    const state = getState();

    return (
      <Body onClick={e => this.onPondClick(e)}>
        <div style={styles.recallContainer}>
          {(state.appMode === AppMode.FishShort ||
            state.appMode === AppMode.FishLong) && (
            <FontAwesomeIcon
              icon={faInfo}
              style={{
                ...styles.recallIcon,
                ...(!state.pondPanelShowing ? styles.bgNeonBlue : {})
              }}
              onClick={this.onPondPanelButtonClick}
            />
          )}
          <FontAwesomeIcon
            icon={faCheck}
            style={{
              ...styles.recallIcon,
              ...(!state.showRecallFish ? styles.bgGreen : {})
            }}
            onClick={this.toggleRecall}
          />
          <FontAwesomeIcon
            icon={faBan}
            style={{
              ...styles.recallIcon,
              ...(state.showRecallFish ? styles.bgRed : {})
            }}
            onClick={this.toggleRecall}
          />
        </div>
        <img style={styles.pondBot} src={aiBotClosed} />
        {state.pondPanelShowing && <PondPanel />}
        {state.canSkipPond && (
          <div>
            {state.appMode === AppMode.FishLong ? (
              <div style={styles.rightButtons}>
                <Button
                  style={styles.playAgainButton}
                  onClick={() => {
                    resetTraining(state);
                    toMode(Modes.Words);
                  }}
                >
                  Play Again
                </Button>
                <Button
                  style={styles.finishButton}
                  onClick={state.onContinue()}
                >
                  Finish
                </Button>
              </div>
            ) : (
              <Button
                style={styles.continueButton}
                onClick={() => state.onContinue()}
              >
                Continue
              </Button>
            )}
            <div>
              <Button
                style={styles.backButton}
                onClick={() => {
                  toMode(Modes.Training);
                  setState({pondClickedFish: null, pondPanelShowing: false});
                }}
              >
                Train More
              </Button>
            </div>
          </div>
        )}
      </Body>
    );
  }
};
Pond = Radium(Pond);

class Guide extends React.Component {
  onShowing() {
    setState({guideShowing: true});
  }

  dismissGuideClick() {
    const dismissed = dismissCurrentGuide();
    if (dismissed) {
      playSound('other');
    }
  }

  render() {
    const currentGuide = getCurrentGuide();

    // We migth show an image on the left and text on the right.  If there's
    // no image, it's all right.
    let leftWidth, rightWidth;
    if (currentGuide && currentGuide.image) {
      leftWidth = '30%';
      rightWidth = '70%';
    } else {
      rightWidth = '100%';
    }

    return (
      <div>
        {!!currentGuide && (
          <div>
            <div
              key={currentGuide.id}
              style={
                currentGuide.noDimBackground
                  ? styles.guideBackgroundHidden
                  : styles.guideBackground
              }
              onClick={this.dismissGuideClick}
            >
              <div
                style={{
                  ...styles.guide,
                  ...styles[`guide${currentGuide.style}`]
                }}
              >
                {currentGuide.image && (
                  <div style={{...styles.guideLeft, width: leftWidth}}>
                    <img src={currentGuide.image} style={styles.guideImage} />
                  </div>
                )}

                <div style={{...styles.guideRight, width: rightWidth}}>
                  {currentGuide.heading && (
                    <div style={styles.guideHeading}>
                      {currentGuide.heading}
                    </div>
                  )}
                  <div style={styles.guideTypingText}>
                    <Typist
                      avgTypingDelay={0}
                      stdTypingDelay={0}
                      //avgTypingDelay={35}
                      //stdTypingDelay={15}
                      cursor={{show: false}}
                      onTypingDone={this.onShowing}
                    >
                      {currentGuide.textFn
                        ? currentGuide.textFn(getState())
                        : currentGuide.text}
                    </Typist>
                  </div>
                  <div
                    style={
                      currentGuide.style === 'Info'
                        ? styles.guideFinalTextInfoContainer
                        : styles.guideFinalTextContainer
                    }
                  >
                    <div style={styles.guideFinalText}>
                      {currentGuide.textFn
                        ? currentGuide.textFn(getState())
                        : currentGuide.text}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {currentGuide.arrow && (
              <img
                src={arrowDownImage}
                style={{
                  ...styles.guideArrow,
                  ...styles[`arrow${currentGuide.arrow}`]
                }}
              />
            )}
          </div>
        )}
      </div>
    );
  }
}

export default class UI extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const state = getState();
    const currentMode = getState().currentMode;

    return (
      <div>
        {currentMode === Modes.Words && <Words />}
        {currentMode === Modes.Training && <Train />}
        {currentMode === Modes.Predicting && <Predict />}
        {currentMode === Modes.Pond && <Pond />}
        {state.showConfirmationDialog && (
          <ConfirmationDialog
            onYesClick={state.confirmationDialogOnYes}
            onNoClick={() => setState({showConfirmationDialog: false})}
          />
        )}
      </div>
    );
  }
}
