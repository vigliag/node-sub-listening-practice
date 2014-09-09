var fs = require('fs');
var _ = require('lodash');
var srt = require('srt');
var libjass = require("./vendor/libjass.js");


function parseSRT(filename, cb){
	srt(fileName, "en", function (err, data) {

		if(err) return cb(err);

		var lines = data.map(function(line){
			return {
				start : line.startTime,
				length : line.endTime - line.startTime,
				end : line.endTime,
				text : line.languages.en
			};
		});

		cb(null, lines);
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
				length : length,
				end :  end - start,
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

exports.parseSRT = parseSRT;
exports.parseASS = parseASS;
exports.strToMillis = strToMillis;
