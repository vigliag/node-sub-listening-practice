var childProcess = require('child_process');
var path = require('path');
var os = require('os');
var util = require("util");
var events = require("events");
var SubEvent = require("./subevent");

function Mplayer(videoPath){
	var _this = this;

	//set custom conf file to obtain pressed keys through stderr
	var mplayer_conf_path = path.join(__dirname, "mplayer_input.conf");
	if(process.platform === 'win32'){
		mplayer_conf_path = mplayer_conf_path.replace(/\\/g,"/" ).slice(2);
	}

	var mplayerString = 'mplayer -slave -noautosub -msglevel ass=6 -input' +
		' conf="' +	 mplayer_conf_path  + '" "' + videoPath + '"';

	this.mplayerProcess = childProcess.exec(mplayerString, function(){
		console.log("Mplayer exited");
	});

	this.mplayerProcess.stdout.on('data', function(data){
		_this.parseLine(data);
	});
	this.mplayerProcess.stderr.on('data', function(data){
		_this.parseLine(data);
	});
}

util.inherits(Mplayer, events.EventEmitter);
var proto = Mplayer.prototype;


var assRegex = /Event at (\d+), \+(\d+):.*,\d*,\d*,\d*,\d+,,(.*)/;
var timeRegex = / V:\s+(\d+\.\d+)/;
var controlRegex = /Invalid command for bound key \'(\w+)\': \'(\w+)\'/;

proto.parseLine = function parseLine(data){
	var result;

	console.log(data);

	result = controlRegex.exec(data);
	if(result){
		var key = result[1];
		var command = result[2];
		this.emit('control', key, command);
		return;
	}

	//if time info
	result = timeRegex.exec(data);
	if(result){
		var parsedTime = parseFloat(result[1]) *1000;
		this.emit('time', parsedTime);
		return;
	}

	//if subtitle info
	result = assRegex.exec(data);
	if(result){
		var time = parseInt(result[1]);
		var length = parseInt(result[2]);
		var text = result[3];
		console.log('ass: time: ' + time + " length: " + length + " text: " + text );
		this.emit('subtitle', new SubEvent(time,length,text));
		return;
	}
};

proto.sendCommand = function sendCommand(command){
	this.mplayerProcess.stdin.write("pausing_keep_force " + command + os.EOL);
	console.log("sent to mpeg:" , command);
};

proto.subVisibility = function subVisibility(value){
	this.sendCommand("sub_visibility " + (value === true ? 1 : 0));
};

module.exports = Mplayer;
