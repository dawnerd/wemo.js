var WeMo = require('./lib/WeMo');

exports.discover = require('./lib/Discoverer');

exports.createClient = function(config, cb) {
  cb = cb || function() {}; 
  return new WeMo(config, cb);
};