function SubEvent(time,length,text){
	this.start = time;
	this.length = length;
	this.end = time+length;
	this.text = text;
}

module.exports = SubEvent;