var util = require("util");
var events = require("events");
var Mplayer = require('./mplayer');
var SubClock = require('./subclock');

function SubPlayer(videoPath){
	console.log("ASFAFSWAFW" ,videoPath);

	this.subAlwaysVisible = false;
	this.displaySubsInMplayer = true; //not used
	this.autoPause = true;

	this.paused = false;
	this.lastTime = -1;
	this.lastLine = null;

	this.subclock = null;
	this.setSub({lines: []});
	this.mplayer = new Mplayer(videoPath);

	this.currentLines = [];
	var _this = this;

	//this.mplayer.sendCommand("sub_select " + subtitleIndex);
	this.mplayer.subVisibility(this.subAlwaysVisible);

	this.mplayer.on('time', function (t){
		if(t > _this.lastTime){ //note: this way subclock pauses when seeking back
			_this.lastTime = t;
			_this.currentLines = _this.subclock.tick(t);
			_this.emit("state", _this.getState());
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

proto.getState = function(){
	return {
		time: this.lastTime,
		paused: this.paused,
		currentLines: this.currentLines,
		autoPause: this.autoPause,
		showSubs: this.subAlwaysVisible
	};
};

proto.setAutoPause = function(value){
	this.autoPause = value;
	this.mplayer.subVisibility(value);
	this.emit('state', this.getState());
};

proto.setShowSubs = function(value){
	this.subAlwaysVisible = value;
	this.mplayer.subVisibility(value);
	this.emit('state', this.getState());
};

proto.repeatLastLine = function(){
	this.lastTime = this.lastTime - 110;
	var seekCommand = ("seek " + ((this.lastLine.start / 1000) - 0.1)) + " 2";
	this.mplayer.sendCommand(seekCommand);
	if( this.paused ){
		this.mplayer.sendCommand("pause"); //unpause
		this.paused = false;
	}
};

proto.seekToEvent = function(subEvent){
	console.error("seekToEvent not implemented yet");
};

proto.setSub = function(sub){
	this.subclock = new SubClock(sub.lines);
	if(sub.path){
		var subLoadCommand = "sub_load " + sub.path;
		this.mplayer.sendCommand(subLoadCommand);
		console.log("SUBLOAD", subLoadCommand);
		this.mplayer.sendCommand("sub_select 0");
	}
	var _this = this;

	this.subclock.on('line_end', function(line){
		console.log("line_end " , _this.lastLine, _this.lastTime);
		_this.lastLine = line;
		if(_this.autoPause){
			_this.paused = true;
			_this.mplayer.sendCommand("pause");
		}
	});
};

proto.getSubLines = function (){
	return this.subclock.lines;
};

module.exports = SubPlayer;
