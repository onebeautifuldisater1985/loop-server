var conf = require('../loop/config').conf;
var async = require('async');
var redis = require("redis");

var storage = conf.get("storage");

if (storage.engine === "redis") {
  var options = storage.settings;
  var client = redis.createClient(
    options.port,
    options.host,
    options.options
  );
  if (options.db) client.select(options.db);

  client.keys("userRooms.*", function(err, keys){
    if (err) throw err;
    console.log("processing", keys.length, "users");

    var multi = client.multi();
    keys.forEach(function(key) {
      multi.scard(key);
    });
    multi.exec(function(err, results) {
      if (err) throw err;
      var totalRooms = results.reduce(function(total, result) {
        return total + result;
      }, 0);
      process.stdout.write(totalRooms + " rooms for " +
                           keys.length + " users.\nAverage " +
                           (totalRooms / keys.length).toFixed(2) +
                           " rooms per user.\n");
      process.exit(0);
    });
  });
}
