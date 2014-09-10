/*jshint -W079 */

var Promise = require('bluebird');
var VideoUtils =  Promise.promisifyAll(require('./videoUtils'));
var Temp = Promise.promisifyAll(require('temp'));
var Path = require('path');
var parser = Promise.promisifyAll(require('./subparser'));
var _ = require('lodash');

var videoPath = process.argv[2];
console.log(videoPath);

//Temp.track();

var tmpdir = Temp.mkdirSync('subplayer');

//TODO USARE PROMISE.PROPS di corsa
var subInfos = VideoUtils.streamsInFileAsync(videoPath)
  .spread(function(video, audio, subs){
    console.log(subs);
    return subs;
  });

var parsedSubs = subInfos.map(function(sub){
    var outputName = "" + sub.index + "." + sub.codec;
    var outputPath = Path.join(tmpdir, outputName);
    console.log(outputPath);
    var output = VideoUtils.extractSubtitleAsync(videoPath, sub.index , sub.codec, outputPath);
    var lines = output.then(function(output){
      return parser.parseSubAsync(output, sub.codec);
    });
    return Promise.props({info:sub, path: output, lines: lines});
  }, {concurrency:1});

parsedSubs
  .then(function(subs){
    console.log(subs[1]);
  });
  /*
  .catch(function(ex){
    console.error("error",ex, ex.stack);
  }); */
