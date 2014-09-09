var Mplayer = require('./mplayer');
var SubClock = require('./subclock');

function SubPlayer(videoPath){
	
	this.subAlwaysVisible = false;
	this.displaySubsInMplayer = true; //not used

	this.paused = false;
	this.lastTime = -1;
	this.lastLine = null;

	this.subclock = this.setSub([]);
	this.mplayer = new Mplayer(videoPath);

	var _this = this;


	//this.mplayer.sendCommand("sub_select " + subtitleIndex); 
	this.mplayer.subVisibility(subAlwaysVisible); 

	this.mplayer.on('time', function (t){
		if(t > this.lastTime){ //note: this way subclock pauses when seeking back
			_this.lastTime = t;
			_this.subclock.tick(t);
		}
	});

	this.mplayer.on('control', function (key,command){
		if(command == "i_pause"){
			_this.paused = ! _this.paused;
			_this.mplayer.subVisibility(subAlwaysVisible); 
			_this.mplayer.sendCommand("pause");
		};

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

var proto = SubPlayer.prototype;

proto.repeatLastLine = function repeatLastLine(){
	var seekCommand = ("seek " + ((this.lastLine.start / 1000) - 0.1)) + " 2";
	_this.mplayer.sendCommand(seekCommand);
	if( _this.paused ){
		_this.mplayer.sendCommand("pause"); //unpause
		_this.paused = false;
	}
};

proto.seekToEvent = function seekToEvent(subEvent){
	console.error("seekToEvent not implemented yet");
}

proto.setSub = function setSub(lines){
	this.subclock = new SubClock(lines);
	var _this = this;

	this.subclock.on('line_end', function(line){
		_this.lastLine = line;
		_this.paused = true;
		_this.mplayer.sendCommand("pause");
	});
}

