var ffmpeg = require('fluent-ffmpeg');
var childProcess = require('child_process');
var Path = require('path');
var _ = require('lodash');

function minimumTrackInformation(track, index){
	var tags = track.tags || {};
	var disposition = track.disposition || {};
	return {
		index : index, //for mplayer
		streamId: track.index, //stream id for extraction using ffmpeg
		codec : track.codec_name,
		language: tags.language,
		name: tags.title,
		default: disposition.default === 1 ? true : false
	};
}

//returns sub grouped by codec type (es subtitle)
function streamsInFile(videoPath, cb){
	ffmpeg.ffprobe(videoPath, function(err, data){
		if(err) return cb(err);
		var streams = _.groupBy(data.streams, 'codec_type');
		var subs = streams.subtitle || [];
		var audio = streams.audio || [];
		var video = streams.video || [];
		subs = subs.map(minimumTrackInformation);
		audio = audio.map(minimumTrackInformation);
		video = video.map(minimumTrackInformation);
		return cb(null, video, audio, subs);
	});
}

function extractSubtitle(videoPath, trackId, codec, outputPath, cb){
	var option = '-map 0:s:' + trackId +' ';
	var ffmpegString = 'ffmpeg -i "' + videoPath + '" -vn -an ' + option + ' "' + outputPath + '"';
	console.log('executing' , ffmpegString);
	childProcess.exec(ffmpegString, function(error, stdout, stderr){
		if(error) console.error("error " , error);
		console.log('stderr', stderr);
		cb(error, outputPath);
	});
}

function videoFileIsValid(fileName){
	var validExtnames = [".avi", ".mkv", ".mp4"];
	var extname = Path.extname(fileName);
	return validExtnames.indexOf(extname) !== -1;
}

exports.videoFileIsValid = videoFileIsValid;
exports.streamsInFile = streamsInFile;
exports.extractSubtitle = extractSubtitle;
