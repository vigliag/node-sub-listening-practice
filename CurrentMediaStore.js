var Path = require('path');
var util = require("util");
var events = require("events");
var VideoUtils = require('./videoUtils');
var SubProvider = require('./subprovider');

var CurrentMediaStore = function(){
  this.externalSubs = [];
  this.internalSubs = [];
  this.chosenFile = null;
  this.chosenSubId = null;
  this.loading = false;
};

util.inherits(CurrentMediaStore, events.EventEmitter);

CurrentMediaStore.prototype.subtitleList = function () {
  return this.internalSubs.concat(this.externalSubs);
};

CurrentMediaStore.prototype.getState = function () {
  return {
    externalSubs : this.externalSubs,
    internalSubs : this.internalSubs,
    chosenFile : this.chosenFile,
    chosenSubId : this.chosenSubId,
    chosenSub: this.getChosenSub(),
    subtitleList: this.subtitleList(),
    loading: this.loading
  };
};

CurrentMediaStore.prototype.loadVideoFile = function (fileName) {

  if (!VideoUtils.videoFileIsValid(fileName)){
    console.error("invalid video file " + fileName);
    return false;
  }

  this.chosenFile = fileName;
  this.chosenSubId = 0;


  //TODO Set loading indicator somewhere
  this.loading = true;
  this.emit("state", this.getState());
  console.log("loading subs from file");
  
  var _this = this;
  SubProvider.parseSubsFromVideoAsync(fileName).then(function(subs){
    _this.internalSubs = subs;
    _this.loading = false;
    _this.emit("state", _this.getState());
  });
};

CurrentMediaStore.prototype.setSub = function (id) {
  this.chosenSubId = id;
  console.log("chosen "+ this.chosenSubId);
  this.emit("state", this.getState());
};

CurrentMediaStore.prototype.getChosenSub = function(){
  console.log("getChosenSub", this.chosenSubId);
  return this.subtitleList()[this.chosenSubId];
};

CurrentMediaStore.prototype.loadSubFile = function(fileName){
  var _this = this;
  SubProvider.parseSubsFromExternalFileAsync(fileName).then(function(sub){
    _this.externalSubs.push(sub);
    _this.emit('state', _this.getState());
  });
  /*.catch(function(e){
    console.error("error adding external subtitle", e.trace);
  });*/
};

module.exports = CurrentMediaStore;
