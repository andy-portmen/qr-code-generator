var isFirefox = typeof require !== 'undefined';
if (isFirefox) {
  var app = require('./firefox/firefox.js');
  var os = require("sdk/system").platform;
  config = exports;
}
else {
  var config = {};
}

config.popup = {
  get width () {
    var size = this.size + 4;
    return size * 25 * 3;
  },
  get height () {
    var size = this.size + 4;
    return (size * 25) + 120;
  },
  get size () {
    var tmp = app.storage.read("size");
    if (tmp === null) return 4;
    return +tmp;
  },
  set size (val) {
    app.storage.write("size", val);
  }
}

config.misc = {
  get version () {
    return app.storage.read("version");
  },
  set version (val) {
    app.storage.write("version", val);
  },
}

config.times = {
  welcome: 3
}

// Complex get and set
config.get = function (name) {
  return name.split(".").reduce(function(p, c) {
    return p[c]
  }, config);
}
config.set = function (name, value) {
  function set(name, value, scope) {
    name = name.split(".");
    if (name.length > 1) {
      set.call((scope || this)[name.shift()], name.join("."), value)
    }
    else {
      this[name[0]] = value;
    }
  }
  set(name, value, config);
}