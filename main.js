var childProcess = require('child_process');
var path = require('path');

var videoPath = process.argv[2];
if(!videoPath){
	console.error("file not specified");
	process.exit(-1);
}

console.log("videoPath" ,videoPath);

function onMplayerExit(){
	console.log("Mplayer exited");
}
var mplayer_conf_path = path.join(__dirname, "mplayer_input.conf");
var mplayerString = 'mplayer -slave -msglevel ass=6 -input conf="'+ mplayer_conf_path  + '" ' + videoPath;
var mplayerProcess = childProcess.exec(mplayerString, onMplayerExit);

function sendToMplayer(command){
	mplayerProcess.stdin.write(command + "\n");
}

function pauseMplayer(){
	sendToMplayer("pause");
}

var subEnds = {}; //endTimeMillis -> {start: ,text: , end:}

var subtitleIndex = 1; //todo, parse from info
var canpause = true;
var paused = false;
var lastTime = 0.0;
var lastEvent = null;

var assRegex = /Event at (\d+), \+(\d+):.*,\d*,\d*,\d*,\d+,,(.*)/;
var timeRegex = / V:\s+(\d+\.\d+)/;

mplayerProcess.stderr.pipe(process.stdout);
sendToMplayer("sub_select " + subtitleIndex); 
sendToMplayer("sub_visibility 0"); 
mplayerProcess.stdout.on('data', function(data){
	var result;

	console.log(data);

	if(data.indexOf("repeatsub") == 0){
		if(lastEvent){
			if(data.indexOf("repeatsubenabled") == 0){
				sendToMplayer("sub_visibility 1");
			}
			seekToEvent(lastEvent);
		}
	}

	if(data.indexOf("pause") == 0){
		paused = false;
		sendToMplayer("sub_visibility 0"); 
		sendToMplayer("pause");
	}

	//if time info
	result = timeRegex.exec(data);
	if(result){
		var parsedTime = parseFloat(result[1]) *1000;
		if(parsedTime > lastTime){
			lastTime = parsedTime;
			tick(parsedTime);
		}
	}

	//if subtitle info
	result = assRegex.exec(data);
	if(result){
		var time = parseInt(result[1]);
		var length = parseInt(result[2]);
		var text = result[3];
		console.log('ass: time: ' + time + " length: " + length + " text: " + text );
		schedulePause(new SubEvent(time,length,text));
	}

});

function seekToEvent(subEvent){
	lastTime = 0;
	var s = ("seek " + ((subEvent.start / 1000) - 0.1)) + " 2";
	console.log(s)
	sendToMplayer(s);
	sendToMplayer("pause"); //unpause actually
	paused = false;
	canpause = false;
	setTimeout(function(){canpause=true}, 1000);
}

function tick(currentTimeMillis){
	var t = currentTimeMillis;
	var maybeSubEnd = subEnds[t];
	if(maybeSubEnd){
		if(canpause){
			lastEvent = maybeSubEnd;
			paused = true;
			sendToMplayer("pause");
		}
	}
}

function schedulePause(subEvent){
	var end = subEvent.end;
	var endCents = Math.ceil(end / 100) * 100;
	subEnds[endCents] = subEvent;
	console.log("pause scheduled for " + endCents)
}

function SubEvent(time,length,text){
	this.start = time;
	this.length = length;
	this.end = time+length;
	this.text = text;
}