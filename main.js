var Mplayer = require('./mplayer');

var videoPath = process.argv[2];
if(!videoPath){
	console.error("file not specified");
	process.exit(-1);
}

return;
console.log("videoPath" ,videoPath);
var mplayer = new Mplayer(videoPath);

var subEnds = {}; //endTimeMillis -> {start: ,text: , end:}

var subtitleIndex = 1; //todo, parse from info
var canpause = true;
var paused = false;
var lastTime = 0.0;
var lastEvent = null;

//mplayerProcess.stderr.pipe(process.stdout);
mplayer.sendCommand("sub_select " + subtitleIndex); 
mplayer.sendCommand("sub_visibility 0"); 

mplayer.on('time', function (t){
	if(t > lastTime){
		lastTime = t;
		tick(t);
	}
});

mplayer.on('subtitle', function (subEvent){
	schedulePause(subEvent);
});

mplayer.on('control', function (key,command){
	if(command == "i_pause"){
		paused = false;
		mplayer.sendCommand("sub_visibility 0"); 
		mplayer.sendCommand("pause");
	};

	if(command == "i_repeatsub"){
		if(lastEvent){
			mplayer.sendCommand("sub_visibility 1");
			seekToEvent(lastEvent);
		}
	}

	if(command == "i_repeat"){
		if(lastEvent)
			seekToEvent(lastEvent);
	}
})

function seekToEvent(subEvent){
	lastTime = 0;
	var s = ("seek " + ((subEvent.start / 1000) - 0.1)) + " 2";
	console.log(s)
	mplayer.sendCommand(s);
	mplayer.sendCommand("pause"); //unpause actually
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
			mplayer.sendCommand("pause");
		}
	}
}

function schedulePause(subEvent){
	var end = subEvent.end;
	var endCents = Math.ceil(end / 100) * 100;
	subEnds[endCents] = subEvent;
	console.log("pause scheduled for " + endCents)
}

