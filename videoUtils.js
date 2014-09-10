var ffmpeg = require('fluent-ffmpeg');
var childProcess = require('child_process');
var path = require('path');
var _ = require('lodash');

function minimumTrackInformation(track, index){
	return {
		index : index, //for mplayer
		streamId: track.index, //stream id for extraction using ffmpeg
		codec : track.codec_name,
		language: track.tags.language,
		name: track.tags.title,
		default: track.disposition.default === 1 ? true : false
	};
}

//returns sub grouped by codec type (es subtitle)
function streamsInFile(videoPath, cb){
	ffmpeg.ffprobe(videoPath, function(err, data){
		if(err) return cb(err);
		var streams = _.groupBy(data.streams, 'codec_type');
		var subs = streams.subtitle.map(minimumTrackInformation);
		var audio = streams.audio.map(minimumTrackInformation);
		var video = streams.video.map(minimumTrackInformation);
		return cb(null, video, audio, subs);
	});
}

function extractSubtitle(videoPath, trackId, codec, outputPath, cb){
	var option = '-map 0:s:' + trackId +' ';
	var ffmpegString = 'ffmpeg -i "' + videoPath + '" -vn -an ' + option + ' "' + outputPath + '"';
	console.log('executing' , ffmpegString);
	childProcess.exec(ffmpegString, function(error, stdout, stderr){
		if(error) console.error("error " , error);
		console.log('stdout', stdout);
		console.log('stderr', stderr);
		cb(error, outputPath);
	});
}

exports.streamsInFile = streamsInFile;
exports.extractSubtitle = extractSubtitle;
