/** @jsx React.DOM */
var gui = require('nw.gui');
var CurrentMediaStore = require('./CurrentMediaStore');
var SubPlayer = require('./subplayer');
var cms = new CurrentMediaStore();
var player = null;

(function(){

function launchPlayer(){
  player = new SubPlayer(cms.chosenFile);
  player.setSub(cms.getChosenSub());
}

function render(){
  React.renderComponent(<MainGUI cms={cms} player={player} onStartPlaying={launchPlayer}/>,document.getElementById('wrapper'));
}

var PlayerGUI = React.createClass({
  propTypes: {
    player: React.PropTypes.object.isRequired
  },
  getInitialState: function(){
    return {currentLine: null};
  },
  componentDidMount: function(){
    var _this = this;
    this.props.player.on('current_line', function(line){
      _this.setState({currentLine: line });
    });
  },
  render: function(){
    return(
    <div className="playerGUI">
    <p>Should be playing</p>
    <WordLookupApp line={this.state.currentLine} />
    </div>
    );
  }
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
          onSubIndex={cms.setSub.bind(cms)}
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
