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
import model from './assets/model.json';
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
const CATEGORIES = {
  0: "happy",
  1: "sad",
  2: "angry",
  3: "surprised",
  4: "neutral"
}
let extractor, xs, ys, classifier;
let isPredicting = false;

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
      lossRate: null,
      predictedClass: null,
      isMobile: false,
    }
    this.captureSample = this.captureSample.bind(this);
    this.train = this.train.bind(this);
    this.predictPlay = this.predictPlay.bind(this);
  }

  async componentDidMount() {
    await this.loadExtractor();
    this.checkIsMobile();
  }

  async loadExtractor() {
    const mobilenet = await tf.loadLayersModel("https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json");
    const feature_layer = mobilenet.getLayer("conv_pw_13_relu");
    extractor = tf.model({inputs: mobilenet.inputs, outputs: feature_layer.output});
  }

  checkIsMobile() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    this.setState({ isMobile : check });
  };
  
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
      lossRate: null,
      predictedClass: null,
    });
    isPredicting = false;
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
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.drawImage(this.videoPlayer, 0, 0, this.videoPlayer.width, this.videoPlayer.height);
    const tfImage = this.preprocessImage(canvas);
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
      const tensor_image = canvasObj.canvasTensor;

      // const imgId = id.replace('sample', 'image');
      // const imgId = id + 'sampleImg';
      // var img    = document.getElementById(`${id}SampleImg`);
		  // img.src    = canvas.toDataURL();
      // console.log(img);
		  // add the sample to the training tensor
	  	this.addSampleToTensor(extractor.predict(tensor_image), label);

      // const context = this.canvas.getContext('2d');
      // context.drawImage(this.videoPlayer, 0, 0, 150, 150);
        
      // this.canvas.toBlob((file) => {
      //     const formData = new FormData();
      //     formData.append('file', file);
      // });

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
    }
    else {
      alert('Please press START to turn on Webcam.');
    }
  }

  addSampleToTensor = (sample, label) => {
    const y = tf.tidy(
      () => tf.oneHot(tf.tensor1d([label]).toInt(), TOTAL_CATEGORIES));
    if(xs == null) {
      xs = tf.keep(sample);
      ys = tf.keep(y);
    } else {
      const oldX = xs;
      xs = tf.keep(oldX.concat(sample, 0));
      const oldY = ys;
      ys = tf.keep(oldY.concat(y, 0));
      oldX.dispose();
      oldY.dispose();
      y.dispose();
    }
  }

  async train() {
    // var selectLearningRate = document.getElementById("emotion-learning-rate");
    // const learningRate     = selectLearningRate.options[selectLearningRate.selectedIndex].value;
    // var selectBatchSize    = document.getElementById("emotion-batch-size");
    // const batchSizeFrac    = selectBatchSize.options[selectBatchSize.selectedIndex].value;
    
    // var selectEpochs       = document.getElementById("emotion-epochs");
    // const epochs           = selectEpochs.options[selectEpochs.selectedIndex].value;
    
    // var selectHiddenUnits  = document.getElementById("emotion-hidden-units");
    // const hiddenUnits      = selectHiddenUnits.options[selectHiddenUnits.selectedIndex].value;
    
    const learningRate = 0.0001;
    const batchSizeFrac = 0.4
    const epochs = 20;
    const hiddenUnits = 100;

    if(xs == null) {
      alert("Please add some samples before training!");
    } else {
      classifier = tf.sequential({
        layers: [
          tf.layers.flatten({inputShape: [7, 7, 256]}),
          tf.layers.dense({
            units: parseInt(hiddenUnits),
            activation: "relu",
            kernelInitializer: "varianceScaling",
            useBias: true
          }),
          tf.layers.dense({
            units: parseInt(TOTAL_CATEGORIES),
            kernelInitializer: "varianceScaling",
            useBias: false,
            activation: "softmax"
          })
        ]
      });
      const optimizer = tf.train.adam(learningRate);
      classifier.compile({optimizer: optimizer, loss: "categoricalCrossentropy"});
  
      const batchSize = Math.floor(xs.shape[0] * parseFloat(batchSizeFrac));
      if(!(batchSize > 0)) {
        alert("Please choose a non-zero fraction for batchSize!");
      }
      
      // create loss visualization
      // var lossTextEle = document.getElementById("emotion-loss");
      // if (typeof(lossTextEle) != 'undefined' && lossTextEle != null) {
      //   lossTextEle.innerHTML = "";
      // } else {
      //   var lossText = document.createElement("P");
      //   lossText.setAttribute("id", "emotion-loss");
      //   lossText.classList.add('emotion-loss');
      //   document.getElementById("emotion-controller").insertBefore(lossText, document.getElementById("emotion-controller").children[1]);
      //   var lossTextEle = document.getElementById("emotion-loss");
      // }
  
      classifier.fit(xs, ys, {
        batchSize,
        epochs: parseInt(epochs),
        callbacks: {
          onBatchEnd: async (batch, logs) => {
            if(logs && logs.loss){
              this.setState({ lossRate : logs.loss.toFixed(5)})
            }
            // lossTextEle.innerHTML = "Loss: " + logs.loss.toFixed(5);
            await tf.nextFrame();
          }
        }
      });
    }
  }


  async predictPlay() {
    isPredicting = true;
    while (isPredicting) {
      const predictedClass = tf.tidy(() => {
        let canvasObj = this.captureWebcam();
        const img = canvasObj.canvasTensor;
        const features = extractor.predict(img);
        const predictions = classifier.predict(features);
        return predictions.as1D().argMax();
      });

      const classId = (await predictedClass.data())[0];
      predictedClass.dispose();
      this.setState({ predictedClass: classId });
      await tf.nextFrame();
    }
  }

  highlightTile(classId) {
    var tile_play    = document.getElementById(TOTAL_CATEGORIES[classId].replace("emoticon", "emotion"));	

    var tile_plays = document.getElementsByClassName("emotion-kit-comps");
    for (var i = 0; i < tile_plays.length; i++) {
      tile_plays[i].style.borderColor     = "#e9e9e9";
      tile_plays[i].style.backgroundColor = "#ffffff";
      tile_plays[i].style.transform       = "scale(1.0)";
    }

    tile_play.style.borderColor     = "#e88139";
    tile_play.style.backgroundColor = "#ff9c56";
    tile_play.style.transform       = "scale(1.1)";
  }

  render(){
    const { happySampleCount, sadSampleCount, angrySampleCount, neutralSampleCount, surprisedSampleCount, isMobile } = this.state;
    return (
      <div className="App">
        <div className="container">
          <h1>Face Expression Detector</h1>
          <Button variant="contained" className="btn btn-add" onClick={this.accessCamera}>Start</Button>
          <div className="emotions">

            <div className="emoji-icon">
              <img className="icon" 
              predicted={(this.state.predictedClass === 0)? 'true': 'false'}
              src={happyIcon} alt="happy-icon"/>
              {/* <Fab color="primary" aria-label="Add">
                <Icon>add</Icon>
              </Fab> */}
              <Button 
                variant="contained" 
                className="btn btn-add"
                onClick={() => this.captureSample('happy', 0)}
              >
                {isMobile? 'Add' : 'Add sample'}
              </Button>
              <p className="sample">{happySampleCount} samples</p>
              <div className="sampleImg">
                {this.state.happySampleImg && 
                  <img alt="Happy sample" src={this.state.happySampleImg}
                  ismobile={isMobile? 'true': 'false'}/>
                }
              </div>
            </div>

            <div className="emoji-icon">
              <img className="icon" 
              predicted={(this.state.predictedClass === 1)? 'true': 'false'}
              src={sadIcon} alt="sad-icon"/>
              <Button 
                variant="contained" 
                className="btn btn-add"
                onClick={() => this.captureSample('sad', 1)}
              >
                {isMobile? 'Add' : 'Add sample'}
              </Button>
              <p className="sample">{sadSampleCount} samples</p>
              <div className="sampleImg">
                {this.state.sadSampleImg && 
                  <img alt="Sad sample" src={this.state.sadSampleImg}
                  ismobile={isMobile? 'true': 'false'}/>
                }
              </div>
            </div>

            <div className="emoji-icon">
              <img className="icon" 
              predicted={(this.state.predictedClass === 2)? 'true': 'false'} 
              src={angryIcon} alt="angry-icon"/>
              <Button 
                variant="contained" 
                className="btn btn-add"
                onClick={() => this.captureSample('angry', 2)}
              >
                {isMobile? 'Add' : 'Add sample'}
              </Button>
              <p className="sample">{angrySampleCount} samples</p>
              <div className="sampleImg">
                {this.state.angrySampleImg &&
                  <img src={this.state.angrySampleImg} alt="Angry sample"
                  ismobile={isMobile? 'true': 'false'}/>
                }
              </div>
            </div>

            <div className="emoji-icon" >
              <img className="icon" predicted={(this.state.predictedClass === 3)? 'true': 'false'} src={surprisedcon} alt="surprised-icon"/>
              <Button 
                variant="contained" 
                className="btn btn-add"
                onClick={() => this.captureSample('surprised', 3)}
              >
                {isMobile? 'Add' : 'Add sample'}
              </Button>
              <p className="sample">{surprisedSampleCount} samples</p>
              <div className="sampleImg">
                {this.state.surprisedSampleImg && 
                  <img src={this.state.surprisedSampleImg} alt="Surprised sample"
                  ismobile={isMobile? 'true': 'false'}/>
                }
              </div>
            </div>

            <div className="emoji-icon" 
              isMobile={isMobile? 'true': 'false'}>
              <img className="icon" predicted={(this.state.predictedClass === 4)? 'true': 'false'} src={neutralIcon} alt="happy-icon"/>
              <Button 
                variant="contained" 
                className="btn btn-add"
                onClick={() => this.captureSample('neutral', 4)}
              >
                {isMobile? 'Add' : 'Add sample'}
              </Button>
              <p className="sample">{neutralSampleCount} samples</p>
              <div className="sampleImg">
                {this.state.neutralSampleImg &&
                  <img src={this.state.neutralSampleImg} alt="Neutral sample"
                  ismobile={isMobile? 'true': 'false'}/>  
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
            <Button variant="contained" className="btn btn-train" onClick={this.train}>Train model</Button>
            {this.state.lossRate && <p>Loss: {this.state.lossRate}</p>}
          </div>
          <div style={{margin: '10px'}}>
            <Button variant="contained" className="btn btn-play" onClick={this.predictPlay}>Play</Button>
          </div>
          <div style={{margin: '10px'}}>
            <Button variant="contained" className="btn btn-stop" onClick={this.stopCamera}>Stop</Button>
          </div>

          {/* <CameraFeed sendFile={this.uploadImage} /> */}
          <div className="footer">
            <p>Compatible with Chrome, FireFox, Safari, Android</p>
            <p>
              Icons made by 
              <a href="https://www.flaticon.com/authors/pixel-perfect" 
                title="Pixel perfect"> Pixel perfect</a> from 
              <a href="https://www.flaticon.com/"         
                title="Flaticon"> www.flaticon.com</a> is licensed by 
              <a href="http://creativecommons.org/licenses/by/3.0/" 
                title="Creative Commons BY 3.0" target="_blank"> CC 3.0 BY</a>

            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default App;