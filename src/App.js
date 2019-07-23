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
import * as tf from '@tensorflow/tfjs';

import happyIcon from './assets/images/happy.png';
import sadIcon from './assets/images/sad.png';
import surprisedcon from './assets/images/surprised.png';
import neutralIcon from './assets/images/neutral.png';
import angryIcon from './assets/images/angry.png';
import { throwStatement } from '@babel/types';

const SAMPLES = {
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
      happySampleCount : 0,
      sadSampleCount: 0,
      surprisedSampleCount: 0,
      angrySampleCount: 0,
      neutralSampleCount: 0,
      happySampleImg: null,
      sadSampleImg: null,
      angrySampleImg: null,
      surprisedSampleImg: null,
      neutralSampleImg: null,    
      isWebcamOn: false,
      extractor: null,
      classifier: null,
      xs: null,
      ys: null,
      stream: null,
      isPredicting: false,
    }
    this.captureSample = this.captureSample.bind(this);
  }

  async componentDidMount() {
  }
  
  accessCamera = async () => {
    this.setState({ isWebcamOn : true });
    const cameras = await navigator.mediaDevices.enumerateDevices();
    await this.setDevice(cameras);
  }

  stopCamera = () => {
    this.setState({ 
      isWebcamOn : false,
      happySampleCount: 0,
      happySampleImg: null,
      sadSampleCount: 0,
      sadSampleImg: null,
      angrySampleCount: 0,
      angrySampleImg: null,
      surprisedSampleCount: 0,
      surprisedSampleImg: null,
      neutralSampleCount: 0,
      neutralSampleImg: null,
    });
    let stream = this.state.stream;
    stream.getVideoTracks()[0].stop();
  }

  async setDevice(device) {
    const { deviceId } = device;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { deviceId } });
    this.setState({ stream });
    this.videoPlayer.srcObject = stream;
    this.videoPlayer.play();
  }
  
  uploadImage = async file => {
    const formData = new FormData();
    formData.append('file', file);
    // console.log(file);
  };

  preprocessImage = (img) => {
    const tensor = tf.browser.fromPixels(img)
                .resizeNearestNeighbor([224, 224]);
    const croppedTensor = this.cropImage(tensor);
    const batchedTensor = croppedTensor.expandDims(0);
    
    return batchedTensor.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
  }

  cropImage = (img) => {
    const size = Math.min(img.shape[0], img.shape[1]);
    const centerHeight = img.shape[0] / 2;
    const beginHeight = centerHeight - (size / 2);
    const centerWidth = img.shape[1] / 2;
    const beginWidth = centerWidth - (size / 2);
    return img.slice([beginHeight, beginWidth, 0], [size, size, 3]);
  }

  captureWebcam = () => {
    // const { sendFile } = this.props;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.drawImage(this.videoPlayer, 0, 0, this.videoPlayer.width, this.videoPlayer.height);
    // this.canvas.toBlob(sendFile);
    const tfImage = this.preprocessImage(canvas);
    // console.log(tfImage);
    return {
      canvasElement : canvas,
      canvasTensor : tfImage
    }
  };

  captureSample = (id,label) => {
    if(this.state.isWebcamOn) {
      let { happySampleCount, sadSampleCount, angrySampleCount, neutralSampleCount, surprisedSampleCount } = this.state;
      const canvasObj = this.captureWebcam();
      const canvas = canvasObj.canvasElement;
      const tensorImg = canvasObj.tfImage;

      // const imgId = id.replace('sample', 'image');
      // const imgId = id + 'sampleImg';
      // var img    = document.getElementById(`${id}SampleImg`);
		  // img.src    = canvas.toDataURL();
      // console.log(img);
		  // add the sample to the training tensor
	  	// addSampleToTensor(extractor.predict(tensor_image), label);

      // const context = this.canvas.getContext('2d');
      // context.drawImage(this.videoPlayer, 0, 0, 150, 150);
        
      // this.canvas.toBlob((file) => {
      //     const formData = new FormData();
      //     formData.append('file', file);
      // });

      // SAMPLES[label] += 1;
      switch(id) {
        case 'happy':
          happySampleCount += 1; 
          this.setState({
            happySampleCount: happySampleCount,
            happySampleImg: canvas.toDataURL()
          });
          break;
        case 'sad':
          sadSampleCount += 1; 
          this.setState({
            sadSampleCount: sadSampleCount,
            sadSampleImg: canvas.toDataURL()
          });
          break;
        case 'angry':
          angrySampleCount += 1; 
          this.setState({
            angrySampleCount: angrySampleCount,
            angrySampleImg: canvas.toDataURL()
          });
          break;
        case 'surprised':
          surprisedSampleCount += 1; 
          this.setState({
            surprisedSampleCount: surprisedSampleCount,
            surprisedSampleImg: canvas.toDataURL()
          });
          break;
        case 'neutral':
          neutralSampleCount += 1; 
          this.setState({
            neutralSampleCount: neutralSampleCount,
            neutralSampleImg: canvas.toDataURL()
          });
          break;
        default:
          break;
      }
      // if(id==='happy'){
      //   console.log("Co zo day ko")
      //   happySampleCount += 1;
      //   this.setState({
      //     happySampleCount: happySampleCount,
      //     happySampleImg: canvas.toDataURL()
      //   })
      // }
      
      // document.getElementById(`${id}SampleCount`).innerHTML = SAMPLES[label] + " samples";
    }
    // else {
    //   alert('Please press START to turn on Webcam.');
    // }
  }

  render(){
    const { happySampleCount, sadSampleCount, angrySampleCount, neutralSampleCount, surprisedSampleCount } = this.state;
    return (
      <div className="App">
        <h3>Face Expression Detector</h3>
        <Button variant="contained" className="btn btn-add" onClick={this.accessCamera}>Start</Button>
        <div className="emotions">

          <div className="emoji-icon" id="happy">
            <img className="icon" id="happy" src={happyIcon} alt="happy-icon"/>
            {/* <Fab color="primary" aria-label="Add">
              <Icon>add</Icon>
            </Fab> */}
            <Button 
              variant="contained" 
              className="btn btn-add"
              onClick={() => this.captureSample('happy', 0)}
            >
              Add sample
            </Button>
            <p className="sample">{happySampleCount} samples</p>
            <div className="sampleImg">
              {this.state.happySampleImg && 
                <img alt="Happy sample" src={this.state.happySampleImg}/>
              }
            </div>
          </div>

          <div className="emoji-icon">
            <img className="icon" src={sadIcon} alt="sad-icon"/>
            <Button 
              variant="contained" 
              className="btn btn-add"
              onClick={() => this.captureSample('sad', 1)}
            >
              Add sample
            </Button>
            <p className="sample">{sadSampleCount} samples</p>
            <div className="sampleImg">
              {this.state.sadSampleImg &&
                <img alt="Sad sample" src={this.state.sadSampleImg}/>
              }
            </div>
          </div>

          <div className="emoji-icon"id="angry">
            <img className="icon" id="angry" src={angryIcon} alt="angry-icon"/>
            <Button 
              variant="contained" 
              className="btn btn-add"
              onClick={() => this.captureSample('angry', 2)}
            >
              Add sample
            </Button>
            <p className="sample">{angrySampleCount} samples</p>
            <div className="sampleImg">
              {this.state.angrySampleImg && 
                <img src={this.state.angrySampleImg} alt="Angry sample"/>
              }
            </div>
          </div>

          <div className="emoji-icon"id="surprised">
            <img className="icon" id="surprised" src={surprisedcon} alt="surprised-icon"/>
            <Button 
              variant="contained" 
              className="btn btn-add"
              onClick={() => this.captureSample('surprised', 3)}
            >
              Add sample
            </Button>
            <p className="sample">{surprisedSampleCount} samples</p>
            <div className="sampleImg">
              {this.state.surprisedSampleImg && 
                <img src={this.state.surprisedSampleImg} alt="Surprised sample"/>
              }
            </div>
          </div>

          <div className="emoji-icon" id="neutral">
            <img className="icon" id="neutral" src={neutralIcon} alt="happy-icon"/>
            <Button 
              variant="contained" 
              className="btn btn-add"
              onClick={() => this.captureSample('neutral', 4)}
            >
              Add sample
            </Button>
            <p className="sample">{neutralSampleCount} samples</p>
            <div className="sampleImg">
              {this.state.neutralSampleImg &&
                <img src={this.state.neutralSampleImg} alt="Neutral sample"/>             
              }
            </div>
          </div>

        </div>

        <div className="camera">
          <video id="live-camera" width="300px" height="225.5px" ref={ref => (this.videoPlayer = ref)} />
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

        {/* <CameraFeed sendFile={this.uploadImage} /> */}
      </div>
    );
  }
}

export default App;