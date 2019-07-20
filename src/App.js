import React, { Component } from 'react';
import './App.scss';
import Button from '@material-ui/core/Button';
// import Fab from '@material-ui/core/Fab';
import { makeStyles } from '@material-ui/core/styles';
// import Icon from '@material-ui/core/Icon';
import Input from '@material-ui/core/Input';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FilledInput from '@material-ui/core/FilledInput';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import NativeSelect from '@material-ui/core/NativeSelect';
import Webcam from "react-webcam";
import { CameraFeed } from './components/CameraFeed';

import happyIcon from './assets/images/happy.png';
import sadIcon from './assets/images/sad.png';
import surprisedcon from './assets/images/surprised.png';
import neutralIcon from './assets/images/neutral.png';
import angryIcon from './assets/images/angry.png';
import { throwStatement } from '@babel/types';

let SAMPLES = {
  0: 0,
  1: 0,
  2: 0,
  3: 0,
  4: 0
}

const TOTAL_CATEGORIES = 5;
const PREDICT_MAX = 1000;
const MODELNAME = "mobilenet";
const CATEGORIES = {
  0: "happy",
  1: "sad",
  2: "angry",
  3: "surprised",
  4: "neutral"
}

class App extends Component {
  constructor(){
    super();
    this.state = {
      learningRate: 0,
      batchSize: 0,
      epochs: 0,
      units:0,
      predictCount: 0,
      isWebcamOn: false,
      extractor: null,
      classifier: null,
      xs: null,
      ys: null,
      stream: null,
    }
  }

  async componentDidMount() {
  }
  
  accessCamera = async () => {
    this.setState({ isWebcamOn : true });
    const cameras = await navigator.mediaDevices.enumerateDevices();
    await this.setDevice(cameras);
  }

  stopCamera = () => {
    this.setState({ isWebcamOn : false });
    let stream = this.state.stream;
    stream.getVideoTracks()[0].stop();
    
  }

  uploadImage = async file => {
    const formData = new FormData();
    formData.append('file', file);
  };

  async setDevice(device) {
      const { deviceId } = device;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { deviceId } });
      this.setState({ stream });
      this.videoPlayer.srcObject = stream;
      this.videoPlayer.play();
  }


  takePhoto = () => {
      const { sendFile } = this.props;
      const context = this.canvas.getContext('2d');
      context.drawImage(this.videoPlayer, 0, 0, 680, 360);
      this.canvas.toBlob(sendFile);
  };

  render(){
    const handleChange = name => event => {
      this.setState({
        ...this.state,
        [name]: event.target.value,
      });
    };

    let happySampleCount=0, angrySampleCount=0, sadSampleCount=0, surprisedSampleCount=0,neutralSampleCount=0;
    return (
      <div className="App">
        <h3>Face Expression Detector</h3>
        <Button variant="contained" className="btn btn-add" onClick={this.accessCamera}>Start</Button>
        <div className="emotions">
          <div className="emoji-icon" id="happy">
            <img id="happy" src={happyIcon} alt="happy-icon"/>
            {/* <Fab color="primary" aria-label="Add">
              <Icon>add</Icon>
            </Fab> */}
            <Button variant="contained" className="btn btn-add">
              Add sample
            </Button>
            <p className="sample">{happySampleCount} samples</p>
            <div className="sampleImg">
              <img id="happySampleImg" alt="Happy sample"/>
            </div>
          </div>

          <div className="emoji-icon"id="sad">
            <img id="sad" src={sadIcon} alt="sad-icon"/>
            <Button variant="contained" className="btn btn-add">
              Add sample
            </Button>
            <p className="sample">{sadSampleCount} samples</p>
            <div className="sampleImg">
              <img id="sadSampleImg" alt="Sad sample"/>
            </div>
          </div>

          <div className="emoji-icon"id="angry">
            <img id="angry" src={angryIcon} alt="angry-icon"/>
            <Button variant="contained" className="btn btn-add">
              Add sample
            </Button>
            <p className="sample">{angrySampleCount} samples</p>
            <div className="sampleImg">
              <img id="angrySampleImg" alt="Angry sample"/>
            </div>
          </div>

          <div className="emoji-icon"id="surprised">
            <img id="surprised" src={surprisedcon} alt="surprised-icon"/>
            <Button variant="contained" className="btn btn-add">
              Add sample
            </Button>
            <p className="sample">{surprisedSampleCount} samples</p>
            <div className="sampleImg">
              <img id="surprisedSampleImg" alt="Surprised sample"/>
            </div>
          </div>

          <div className="emoji-icon" id="neutral">
            <img id="neutral" src={neutralIcon} alt="happy-icon"/>
            <Button variant="contained" className="btn btn-add">
              Add sample
            </Button>
            <p className="sample">{neutralSampleCount} samples</p>
            <div className="sampleImg">
              <img id="neutralSampleImg" alt="Neutral sample"/>
            </div>
          </div>

        </div>

        <div className="camera">
          <video id="live-camera" width="300px" height="300px" ref={ref => (this.videoPlayer = ref)} />
        </div>

        {/* <div className="tuner">
          <FormControl>
            <InputLabel htmlFor="learning-rate" className="learningRate">Learning Rate</InputLabel>
            <Select
              native
              value={this.state.learningRate}
              onChange={handleChange('learningRate')}
              inputProps={{
                name: 'learningRate',
                id: 'learning-rate',
              }}
            >
              <option value="" />
              <option value={0.00001}>0.00001</option>
              <option value={0.0001}>0.0001</option>
              <option value={0.001}>0.001</option>
              <option value={0.003}>0.003</option>
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel htmlFor="learning-rate" className="selectList">Learning Rate</InputLabel>
            <Select
              native
              value={this.state.learningRate}
              onChange={handleChange('learningRate')}
              inputProps={{
                name: 'learningRate',
                id: 'learning-rate',
              }}
            >
              <option value="" />
              <option value={0.00001}>0.00001</option>
              <option value={0.0001}>0.0001</option>
              <option value={0.001}>0.001</option>
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel htmlFor="batch-size" className="selectList">Learning Rate</InputLabel>
            <Select
              native
              value={this.state.learningRate}
              onChange={handleChange('learningRate')}
              inputProps={{
                name: 'learningRate',
                id: 'learning-rate',
              }}
            >
              <option value="" />
              <option value={0.00001}>0.00001</option>
              <option value={0.0001}>0.0001</option>
              <option value={0.001}>0.001</option>
              <option value={0.003}>0.003</option>
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel htmlFor="learning-rate" className="selectList">Learning Rate</InputLabel>
            <Select
              native
              value={this.state.learningRate}
              onChange={handleChange('learningRate')}
              inputProps={{
                name: 'learningRate',
                id: 'learning-rate',
              }}
            >
              <option value="" />
              <option value={0.00001}>0.00001</option>
              <option value={0.0001}>0.0001</option>
              <option value={0.001}>0.001</option>
              <option value={0.003}>0.003</option>
            </Select>
          </FormControl>
        </div> */}
        <div style={{margin: '10px'}}>
          <Button variant="contained" className="btn btn-train">Train model</Button>
        </div>
        <div style={{margin: '10px'}}>
          <Button variant="contained" className="btn btn-play">Play</Button>
        </div>
        <div style={{margin: '10px'}}>
          <Button variant="contained" className="btn btn-stop" onClick={this.stopCamera}>Stop</Button>
        </div>
      </div>
    );
  }
}

export default App;