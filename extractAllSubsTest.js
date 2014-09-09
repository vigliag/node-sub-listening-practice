/*jshint -W079 */

var Promise = require('bluebird');
var VideoUtils =  Promise.promisifyAll(require('./videoUtils'));
var Temp = Promise.promisifyAll(require('temp'));
var Path = require('path');

var videoPath = process.argv[2];
console.log(videoPath);

//Temp.track();

var tmpdir = Temp.mkdirSync('subplayer');

VideoUtils.streamsInFileAsync(videoPath)
  .spread(function(video, audio, subs){
    return subs;
  })
  .map(function(sub){
    var outputName = "" + sub.index + "." + sub.codec;
    var outputPath = Path.join(tmpdir, outputName);
    console.log(outputPath);
    return VideoUtils.extractSubtitleAsync(videoPath, sub.streamId, sub.codec, outputPath);
  }, {concurrency:1})
  .then(function(outputs){
    console.log(outputs);
  })
  .catch(function(ex){
    console.error(ex);
  });
