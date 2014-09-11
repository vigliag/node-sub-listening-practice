/** @jsx React.DOM */

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
