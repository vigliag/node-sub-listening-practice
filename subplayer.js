var util = require("util");
var events = require("events");
var Mplayer = require('./mplayer');
var SubClock = require('./subclock');

function SubPlayer(videoPath){
	console.log("ASFAFSWAFW" ,videoPath);
	this.subAlwaysVisible = true;
	this.displaySubsInMplayer = true; //not used

	this.paused = false;
	this.lastTime = -1;
	this.lastLine = null;

	this.subclock = null;
	this.setSub({lines: []});
	this.mplayer = new Mplayer(videoPath);

	var _this = this;

	//this.mplayer.sendCommand("sub_select " + subtitleIndex);
	this.mplayer.subVisibility(this.subAlwaysVisible);

	this.mplayer.on('time', function (t){
		if(t > _this.lastTime){ //note: this way subclock pauses when seeking back
			_this.lastTime = t;
			var current_lines = _this.subclock.tick(t);
			this.emit("current_lines", current_lines); //inefficient
		}
	});

	this.mplayer.on('control', function (key,command){
		if(command == "i_pause"){
			_this.paused = ! _this.paused;
			if(_this.subAlwaysVisible === false){
				_this.mplayer.subVisibility(false);
			}
			_this.mplayer.sendCommand("pause");
		}

		if(command == "i_repeatsub"){
			if( _this.lastLine){
				_this.mplayer.subVisibility(true);
				_this.repeatLastLine();
			}
		}

		if(command == "i_repeat"){
			if( _this.lastLine)
				_this.repeatLastLine();
		}
	});
}

util.inherits(SubPlayer, events.EventEmitter);
var proto = SubPlayer.prototype;

proto.repeatLastLine = function repeatLastLine(){
	this.lastTime = this.lastTime - 110;
	var seekCommand = ("seek " + ((this.lastLine.start / 1000) - 0.1)) + " 2";
	this.mplayer.sendCommand(seekCommand);
	if( this.paused ){
		this.mplayer.sendCommand("pause"); //unpause
		this.paused = false;
	}
};

proto.seekToEvent = function seekToEvent(subEvent){
	console.error("seekToEvent not implemented yet");
};

proto.setSub = function setSub(sub){
	this.subclock = new SubClock(sub.lines);
	if(sub.path){
		this.mplayer.sendCommand("sub_load " + sub.path);
		this.mplayer.sendCommand("sub_select 0");
	}
	var _this = this;

	this.subclock.on('line_end', function(line){
		console.log("line_end " , this.lastLine, this.lastTime);
		_this.lastLine = line;
		_this.paused = true;
		_this.mplayer.sendCommand("pause");
	});
};

proto.getSubLines = function (){
	return this.subclock.lines;
};

module.exports = SubPlayer;
