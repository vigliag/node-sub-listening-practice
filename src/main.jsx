/** @jsx React.DOM */

window.ondragover = function(e) {
  e.preventDefault();
  return false;
};
window.ondrop = function(e) {
  e.preventDefault();
  return false;
};

var Path = require('path');
var SubProvider = require('./subprovider');

var gui = require('nw.gui');
var VideoUtils = require('./videoUtils');

var externalSubs = [];
var internalSubs = [];
var chosenFile = null;

if (gui.App.argv[0]) {
  onVideoFileChosen(gui.App.argv[0]);
}

function subtitlesList(){
  return externalSubs.concat(internalSubs);
}

function onSubTitleChosen(id){
  alert("chosen "+ id);
}

function onVideoFileChosen(fileName) {
  if (!VideoUtils.videoFileIsValid(fileName)){
    alert("invalid video file " + fileName);
    return false;
  }
  chosenFile = fileName;
  //TODO Set loading indicator somewhere
  console.log("loading subs from file");

  SubProvider.parseSubsFromVideoAsync(fileName).then(function(subs){
    internalSubs = subs;
    console.log("loaded", subs);
    alert("video file and subs loaded succesfully");
    render();
  });
}

function onSubtitlePathAdded(fileName){
  SubProvider.parseSubsFromExternalFileAsync(fileName).then(function(sub){
    externalSubs.push(sub);
    render();
  }).catch(function(e){
    alert("error adding external subtitle" + e.trace);
  });
}

function render(){
  var component = (
  <div id={"chooser"} className={".col-xs-12"}>
  <h3>Choose a video file:</h3>
  <FileDropperBox
    onVideoFileChosen={onVideoFileChosen}
    loadedFile={chosenFile}
    placeHolderText={"Drop a video here"} />
  <h3>Choose a subtitle file:</h3>
  <SubtitleChooser onSubIndex={onSubTitleChosen} subtitles={subtitlesList()} />
  <FileDropperBox
    onVideoFileChosen={onSubtitlePathAdded}
    loadedFile={null}
    placeHolderText={"Drop additional subtitles here"} />
  <div style={{"text-align" : "right"}}>
  <button type="button"
          id="startPlayingButton"
          className="btn btn-default"
          disabled={chosenFile === null}>Play!</button>
  </div>
  </div>

  );

  React.renderComponent(component,document.getElementById('wrapper'));
}

render();
