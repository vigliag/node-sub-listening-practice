var Path = require('path');
var util = require("util");
var events = require("events");
var VideoUtils = require('./videoUtils');
var SubProvider = require('./subprovider');

var CurrentMediaStore = function(){
  this.externalSubs = [];
  this.internalSubs = [];
  this.chosenFile = null;
  this.chosenSub = null;
};

util.inherits(CurrentMediaStore, events.EventEmitter);

CurrentMediaStore.prototype.subtitleList = function () {
  return this.internalSubs.concat(this.externalSubs);
};

CurrentMediaStore.prototype.loadVideoFile = function (fileName) {
  var _this = this;
  if (!VideoUtils.videoFileIsValid(fileName)){
    console.error("invalid video file " + fileName);
    return false;
  }
  this.chosenFile = fileName;
  this.chosenSub = 0;
  //TODO Set loading indicator somewhere
  console.log("loading subs from file");

  SubProvider.parseSubsFromVideoAsync(fileName).then(function(subs){
    _this.internalSubs = subs;
    console.log("loaded", subs);
    _this.emit("change", _this);
  });
};

CurrentMediaStore.prototype.setSub = function (id) {
  this.chosenSub = id;
  console.log("chosen "+ id);
};

CurrentMediaStore.prototype.getChosenSub = function(){
  return this.subtitleList()[this.chosenSub];
};

CurrentMediaStore.prototype.loadSubFile = function(fileName){
  SubProvider.parseSubsFromExternalFileAsync(fileName).then(function(sub){
    this.externalSubs.push(sub);
    this.emit("change", this);
  }).catch(function(e){
    console.error("error adding external subtitle" + e.trace);
  });
};

module.exports = CurrentMediaStore;
