/*jshint -W079 */

var Promise = require('bluebird');
var VideoUtils =  Promise.promisifyAll(require('./videoUtils'));
var Temp = Promise.promisifyAll(require('temp'));
var Path = require('path');
var parser = Promise.promisifyAll(require('./subparser'));
var _ = require('lodash');

Temp.track();

function parseSubsFromVideoAsync(videoPath){
  var tmpdir = Temp.mkdirSync('subplayer');

  var subInfos = VideoUtils.streamsInFileAsync(videoPath)
    .spread(function(video, audio, subs){
      console.log(subs);
      return subs;
    });

  var parsedSubs = subInfos.map(function(sub){
      var outputName = "" + sub.index + "." + sub.codec;
      var outputPath = Path.join(tmpdir, outputName);
      var output = VideoUtils.extractSubtitleAsync(videoPath, sub.index , sub.codec, outputPath);
      var lines = output.then(function(output){
        return parser.parseSubAsync(output, sub.codec);
      });
      return Promise.props({info:sub, path: output, lines: lines});
    }, {concurrency:1});

  return parsedSubs;
}

function parseSubsFromExternalFileAsync(filePath){
  var codec = Path.extname(filePath).slice(1);
  var lines = parser.parseSubAsync(filePath, codec);
  return lines.then(function(lines){
    return {
      info: null,
      path: filePath,
      lines: lines
    };
  });
}

exports.parseSubsFromVideoAsync = parseSubsFromVideoAsync;
exports.parseSubsFromExternalFileAsync = parseSubsFromExternalFileAsync;
