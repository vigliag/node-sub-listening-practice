/** @jsx React.DOM */

var LineDisplayer = React.createClass({
  propTypes: {
      onWordSelected: React.PropTypes.func,
      line: React.PropTypes.string.isRequired
  },
  render: function(){
    var line = this.props.line;
    var onWordSelected = this.props.onWordSelected;
    var selectedWord = this.props.selectedWord || null;
    var words = line.split(" ");
    var clickableWords = words.map(function(word, index){
      return <span
              onClick={onWordSelected}
              key={index}
              className={selectedWord == index ? "selected" : ""}
              >
                {word}
             </span>;
    });
    return (
      <div className="lineDisplayer">
        {clickableWords}
      </div>
    );
  }
});

var WordDefinition = React.createClass({
  propTypes: {
      initialWord: React.PropTypes.string,
      dict: React.PropTypes.string.isRequired
  },
  getInitialState: function(){
    return {word: this.props.initialWord || null};
  },
  componentWillReceiveProps: function(nextProps){
    if(nextProps.initialWord !== null){
      this.setState({word: nextProps.initialWord});
    }
  },
  render: function(){
    var word = this.state.word;
    var dict = this.props.dict;
    var baseUrl = "http://mini.wordreference.com/mini/index.aspx?dict=";
    var url = baseUrl + dict + "&w=" + word;
    return (
      <iframe id="dictIframe"
              src={url}
              name="WRmini">
      </iframe>
      );
  }
});

var WordLookupApp = React.createClass({
  propTypes: {
      line: React.PropTypes.string
  },
  getInitialState: function(){
    return {selectedWord: null};
  },
  componentWillReceiveProps: function(nextProps){
    this.setState({selectedWord: null});
  },
  onWordSelected : function(word){
    this.setState({selectedWord: word});
  },
  render: function(){
    return(
      <div className="WordLookupApp">
      <LineDisplayer
        line={this.props.line || "subs will be shown here"}
        selectedWord={this.state.selectedWord}
        onWordSelected={this.onWordSelected}
      />
      <WordDefinition
        word={this.state.selectedWord}
        dict={'enit'}
      />
      </div>
    );
  }

});


var FileDropperBox = React.createClass({
  handleDrop: function(e){
    e.preventDefault();
    var videoPath = e.dataTransfer.files[0].path;
    if (videoPath !== null) {
      this.props.onVideoFileChosen(videoPath);
    }
  },
  render: function () {
    var text = this.props.loadedFile || this.props.placeHolderText;
    return (
    <div id="holder" className="droppable well" onDrop={this.handleDrop}>
      <p>{text}</p>
    </div>
    );
  }
});

var SubtitleChooser = React.createClass({
  handleChange: function(event){
    this.props.onSubIndex(event.target.value);
  },
  render: function(){
    var options = this.props.subtitles.map(function(sub, index){
      var subInfo = sub.info;
      var text;
      if(subInfo){
        text = subInfo.language + " " + (subInfo.name || "");
      } else {
        text = sub.path;
      }
      return (<option key={index} value={index}>{text}</option>);
    });
    return (
      <select   className={"form-control"}
                disabled={this.props.subtitles.length ===  0}
                onChange={this.handleChange}>
        {options}
      </select>
    );
  }
});
