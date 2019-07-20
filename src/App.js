import React, { Component } from 'react';
import './App.css';
import happyIcon from './assets/images/happy.png';
import sadIcon from './assets/images/sad.png';
import surprisedcon from './assets/images/surprised.png';
import neutralIcon from './assets/images/neutral.png';
import angryIcon from './assets/images/angry.png';

class App extends Component {
  render(){
    return (
      <div className="App">
        <h1>Face Expression Detector</h1>
        <div className="emotions">
          <div className="emoji-icon" id="happy">
            <img id="happy" src={happyIcon} alt="happy-icon"/>
          </div>
          <div className="emoji-icon"id="sad">
            <img id="sad" src={sadIcon} alt="happy-icon"/>
          </div>
          <div className="emoji-icon"id="angry">
            <img id="angry" src={angryIcon} alt="happy-icon"/>
          </div>
          <div className="emoji-icon"id="surprised">
            <img id="surprised" src={surprisedcon} alt="happy-icon"/>
          </div>
          <div className="emoji-icon" id="neutral">
            <img id="neutral" src={neutralIcon} alt="happy-icon"/>
          </div>
        </div>

        <div className="camera">
          <video id="live-camera" width="300px" height="300px" style={{background: 'lightgrey'}} ></video>
        </div>

        <div></div>
      </div>
    );
  }
}

export default App;