/** @jsx React.DOM */
var gui = require('nw.gui');
var CurrentMediaStore = require('./CurrentMediaStore');
var SubPlayer = require('./subplayer');
var cms = new CurrentMediaStore();
var player = null;

(function(){

function launchPlayer(){
  player = new SubPlayer(cms.chosenFile);
  player.setSub(cms.getChosenSub().lines);
}

function render(){
  React.renderComponent(<MainGUI cms={cms} player={player} onStartPlaying={launchPlayer}/>,document.getElementById('wrapper'));
}

var PlayerGUI = React.createClass({
  render: function(){return <p>Should be playing</p>;}
});

var MainGUI = React.createClass({
  getInitialState: function(){
    return {page: 'filechooser'};
  },
  startPlaying : function(){
    this.props.onStartPlaying();
    this.setState({page: 'playing'});
  },
  render: function(){
    if (this.state.page == 'filechooser'){
      return <FileChooserGUI cms={this.props.cms} goAction={this.startPlaying} />;
    }
    if (this.state.page == 'playing'){
      return <PlayerGUI player={this.props.player}/>;
    }
  }
});

var FileChooserGUI = React.createClass({
  render: function(){
    var cms = this.props.cms;
    console.log(cms);

    return (
      <div id={"chooser"} className={".col-xs-12"}>
      <h3>Choose a video file:</h3>
      <FileDropperBox
        onVideoFileChosen={cms.loadVideoFile.bind(cms)}
        loadedFile={cms.chosenFile}
        placeHolderText={"Drop a video here"} />
      <h3>Choose a subtitle file:</h3>
      <SubtitleChooser
          onSubIndex={cms.setSub}
          subtitles={cms.subtitleList()} />
      <FileDropperBox
        onVideoFileChosen={cms.loadSubFile.bind(cms)}
        loadedFile={null}
        placeHolderText={"Drop additional subtitles here"} />
      <div style={{"text-align" : "right"}}>
      <button type="button"
              id="startPlayingButton"
              className="btn btn-default"
              disabled={cms.chosenFile === null}
              onClick={this.props.goAction}>Play!</button>
      </div>
      </div>
    );
  }
});

if (gui.App.argv[0]) {
  cms.loadVideoFile(gui.App.argv[0]);
}

cms.on("change", render.bind(this, cms));
render();

})();
