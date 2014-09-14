/** @jsx React.DOM */
/*global React:false*/

var LineDisplayer = React.createClass({
  propTypes: {
      onWordSelected: React.PropTypes.func,
      line: React.PropTypes.string.isRequired,
      selectedWord: React.PropTypes.any
  },
  onWordSelected: function(index){
    this.props.onWordSelected(index);
  },
  render: function(){
    var line = this.props.line;
    var selectedWord = this.props.selectedWord;
    var words = line.split(" ");

    var _this= this;
    var clickableWords = words.map(function(word, index){
      return <span
              onClick={_this.onWordSelected.bind(_this, word)}
              key={index}
              className={selectedWord == word ? "selected" : ""}
              >
                {word + " "}
             </span>;
    });
    return (
      <div className="lineDisplayer well">
        <div>
        {clickableWords}
        </div>
      </div>
    );
  }
});

var WordDefinition = React.createClass({
  propTypes: {
      word: React.PropTypes.string,
      dict: React.PropTypes.string.isRequired
  },
  render: function(){
    var word = this.props.word;
    var dict = this.props.dict;
    var baseUrl = "http://wordreference.com/";
    if(word){
      word = word.toLowerCase().replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
      var url = baseUrl + dict + "/" + word;
      return (
        <iframe className="dictIframe"
              src={url}>
        </iframe>
      );
    } else {
      return <p>{"Click on a word to get its definition"}</p>;
    }
  }
});

var WordLookupApp = React.createClass({
  propTypes: {
      line: React.PropTypes.string
  },
  getInitialState: function(){
    return {selectedWord: null};
  },
  onWordSelected : function(word){
    this.setState({selectedWord: word});
  },
  render: function(){
    return(
      <div className="WordLookupApp">
      <LineDisplayer
        line={this.props.line || ""}
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
