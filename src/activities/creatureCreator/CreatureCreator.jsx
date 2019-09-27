import React from 'react';
import sketch, {CreatureType} from './sketches';
import Button from 'react-bootstrap/lib/Button';
const P5 = require('./loadP5');

const CANVAS_ID = 'p5-canvas';

export default class CreatureCreator extends React.Component {
  componentDidMount() {
    this.p5 = new P5(sketch, CANVAS_ID);
  }

  setCreature = type => {
    if (!Object.values(CreatureType).includes(type)) {
      console.error('Unknown CreatureType!');
      return;
    }

    this.p5.setCreature(type);
  };

  download = () => {
    this.p5.download(CANVAS_ID);
  };

  render() {
    return (
      <div>
        <h4>Click a button to generate a good or bad creature.</h4>
        <Button onClick={() => this.setCreature(CreatureType.Good)}>
          Good
        </Button>
        <Button onClick={() => this.setCreature(CreatureType.Bad)}>Bad</Button>
        <br />
        <br />
        <div id={CANVAS_ID} />
        <br />
        <br />
        <Button onClick={() => this.download()}>Download as .png</Button>
      </div>
    );
  }
}
