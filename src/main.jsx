/** @jsx React.DOM */
/*global React:false, WordLookupApp:false, FileDropperBox:false, SubtitleChooser:false*/

var gui = require('nw.gui');
var CurrentMediaStore = require('./CurrentMediaStore');
var SubPlayer = require('./subplayer');

(function(){

var PlayerGUI = React.createClass({
  propTypes: {
    player: React.PropTypes.object.isRequired
  },
  getInitialState: function(){
    return {playerState: this.props.player.getState()};
  },
  componentDidMount: function(){
    var _this = this;
    this.props.player.on('state', function(state){
      _this.setState({'playerState': state});
    });
  },
  render: function(){
    var line = this.state.playerState.currentLines[0];
    var text = line !== undefined ? line.text : "" ;
    return(
    <div className="playerGUI">
    <h3>Playing</h3>
    <WordLookupApp line={text} />
    </div>
    );
  }
});

var MainGUI = React.createClass({
  propTypes: {
    filename: React.PropTypes.string
  },
  getInitialState: function(){
    var cms = new CurrentMediaStore();
    return {
      page: 'filechooser',
      cms : cms,
      player : null,
      cmsState : cms.getState()
    };
  },
  componentWillMount: function(){
    if(this.props.filename){
      this.state.cms.loadVideoFile(this.props.filename);
    }

    var _this = this;
    this.state.cms.on('state', function(state){
      console.log("UPDATING_CMSSTATE");
      _this.setState({'cmsState': state});
    });
  },
  startPlaying : function(){
    var cmsState = this.state.cmsState;
    console.log("STARTPLAYING", cmsState);
    var player = new SubPlayer(cmsState.chosenFile);
    console.log(cmsState.chosenSub);
    player.setSub(cmsState.chosenSub);
    this.setState({player: player, page: 'playing'});
  },
  render: function(){
    if (this.state.page == 'filechooser'){
      return (
        <FileChooserGUI
          cms={this.state.cms}
          cmsState={this.state.cmsState}
          goAction={this.startPlaying}/>
        );
    }
    if (this.state.page == 'playing'){
      if(this.state.player){
        return <PlayerGUI player={this.state.player}/>;
      } else {
        return <p>This shouldnt be displayed. Player not loaded yet</p>;
      }
    }
  }
});

var FileChooserGUI = React.createClass({
  render: function(){
    var cmsState = this.props.cmsState;
    var cms = this.props.cms;
    console.log(cmsState);

    return (
      <div id={"chooser"} className={".col-xs-12"}>
      <h3>Choose a video file:</h3>
      <FileDropperBox
        onVideoFileChosen={cms.loadVideoFile.bind(cms)}
        loadedFile={cmsState.chosenFile}
        placeHolderText={"Drop a video here"} />
      <h3>Choose a subtitle file:</h3>
      <SubtitleChooser
          onSubIndex={cms.setSub.bind(cms)}
          subtitles={cmsState.subtitleList} />
      <FileDropperBox
        onVideoFileChosen={cms.loadSubFile.bind(cms)}
        loadedFile={null}
        placeHolderText={"Drop additional subtitles here"} />
      <div style={{"text-align" : "right"}}>
      <button type="button"
              id="startPlayingButton"
              className="btn btn-default"
              disabled={cmsState.chosenFile === null}
              onClick={this.props.goAction}>Play!</button>
      </div>
      </div>
    );
  }
});

React.renderComponent(<MainGUI filename={gui.App.argv[0]}/>, document.getElementById('wrapper'));

})();
