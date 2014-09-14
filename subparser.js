var fs = require('fs');
var _ = require('lodash');
var srtparser = require('subtitles-parser');
var libjass = require("./vendor/libjass.js");


function parseSRT(fileName, callback){
	fs.readFile(fileName, {encoding: "utf8"}, function(err,data){
		if(err) return callback(err);
		var parsedlines = srtparser.fromSrt(data, true);
		var lines = parsedlines.map(function(line){
			return {
				id: line.id,
				start : line.startTime,
				length : line.endTime - line.startTime,
				end : line.endTime,
				text : line.text
			};
		});
		callback(null, lines);
	});
}

function parseASS(filePath, cb){
	fs.readFile(filePath, {encoding: 'utf8'}, function (err, data) {
		if (err) return cb(err);

		var parsed = libjass.parser.parse(data, 'assScript');
		var events = parsed.get('Events');
		var dialogues = _(events).where({'type': 'Dialogue'}).pluck('template').value();

		var lines = dialogues.map(function(dialogue, index){

			var start = strToMillis(dialogue.get('Start'));
			var end = strToMillis(dialogue.get('End'));

			return {
				start : start,
				length : end - start,
				end :  end,
				text : dialogue.get('Text').replace(/\r$/, "")
			};
		})
		.filter(function(line){
			return !shouldBeOmitted(line.text);
		});

		cb(null, lines);
	});
}

function strToMillis (str){
	return Math.floor(libjass.Dialogue._toTime(str) * 1000);
}


function shouldBeOmitted(text){
	return text.indexOf('\\move') != -1 || text.indexOf('\\pos') != -1;
	//should omit \\an8 too?
}

function parseSub(filePath, codec, cb){
	if(codec == 'ass'){
		return parseASS(filePath, cb);
	}
	if(codec == 'srt'){
		return parseSRT(filePath,cb);
	}
	return cb(new Error('no codec avaiable for parsing ' + codec));
}

exports.parseSub = parseSub;
exports.parseSRT = parseSRT;
exports.parseASS = parseASS;
exports.strToMillis = strToMillis;
