/** @jsx React.DOM */

React.renderComponent(
  <h1>Hello, world!</h1>,
  document.getElementById('example')
);

var fileDropperBox = React.createClass({
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
    <div id="holder" className="droppable" onDrop={this.handleDrop}>
      <p>{text}</p>
    </div>
    );
  }
});

var subtitleChooser = React.createClass({
  handleChange: function(event){
    this.props.onSubIndex(event.target.value);
  },
  render: function(){
    var options = this.props.subtitles.map(function(subInfo, index){
      var text = subInfo.language + " " + (subInfo.name || "");
      return (<option value={index}>{}</option>);
    });
    return (<select onChange={this.handleChange}>{options}</select>);
  }
});
