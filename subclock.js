var util = require("util");
var events = require("events");

function SubClock(subEvents, granularity){
	this.granularity = granularity || 0.1; //granularity in fraction of a second
	this.lines = subEvents;

	this.startMap = {};
	this.endMap = {}; //{ endTimeMillis : {start: , text: , end: } }
	this.lines.forEach(this.mapLine, this);
	console.log("ENDMAP", this.endMap);
	this.currentLines = [];
}

util.inherits(SubClock, events.EventEmitter);
var proto = SubClock.prototype;

proto.isCurrent = function(line, time){
	return line.start <= time && line.end > time;
};

proto.tick = function(time) {
	var atime = this.approx(time);
	console.log("time", time, atime);
	var endingLine = this.endMap[atime];
	if(endingLine){
		console.log("emitting line_end", endingLine);
		this.emit('line_end', endingLine);
	}

	var _this = this;
	this.currentLines = this.currentLines.filter(function(line){
		return _this.isCurrent(line,time);
	});

	var startingLine = this.startMap[atime];
	if(startingLine){
		this.emit('line_start', startingLine);
		this.currentLines.push(startingLine);
	}

	return this.currentLines;

};

proto.seek = function(time){
	this.currentLines = this.linesAt(time);
	return this.currentLines;
};

proto.linesAt = function(time){
	//TODO: can be surely made more efficient
	return this.lines.filter(function(line){
		return this.isCurrent(line,time);
	});
};

proto.approx = function(time){
	var approxv = 1000 / (1 / this.granularity);
	return Math.floor(time / approxv) * approxv;
};

proto.mapLine = function(line){
	var astart = this.approx(line.start);
	var aend = this.approx(line.end) - 100;
	this.startMap[astart] = line;
	this.endMap[aend] = line;
};

module.exports = SubClock;
