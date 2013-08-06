var dgram = require('dgram');
var async = require('async');
var request = require('request');
var SSDP = require('ssdp');
var url = require('url');
var xml = require('libxml-to-js');

module.exports = function(cb) {

  var client = new SSDP;
  var found = [];

  var handleUDPResponse = function(msg, rinfo) {
    if(msg.toString().indexOf('uuid:Socket') == -1) return;

    var regex = new RegExp('location: (.*?)\\r\\n','i')
    var location = regex.exec(msg.toString());
    var wemo = location && location[1] || undefined;

    if (wemo && found.indexOf(wemo)===-1) {
      found.push(wemo);
    }
  };

  var handleSearchResults = function(){
    
    async.map(found,wemoFinder,function(err,results) {
      cb(results.filter(function(item,index,arr) {
        found = [];
        return item;
      }));
    });
  };

  client.on('response',handleUDPResponse);
  client.search('ssdp:all');

  //handle results faster yet still support a timeout.
  var searcher = setInterval(handleSearchResults,100);
  setTimeout(function(){
    clearInterval(searcher);
  }, 5000);
};

function wemoFinder(wemo,cb) {

  request(wemo,function(e,r,b) {

    xml(b, function (error, result) {
        if (error) {
          return cb(error);
        }
        else{
          return cb (null,{location:url.parse(wemo),info:result});
        }
    });

  });
};