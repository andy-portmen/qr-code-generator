// Load Firefox based resources
var self          = require("sdk/self"),
    data          = self.data,
    sp            = require("sdk/simple-prefs"),
    buttons       = require("sdk/ui/button/action"),
    prefs         = sp.prefs,
    pageMod       = require("sdk/page-mod"),
    tabs          = require("sdk/tabs"),
    loader        = require('@loader/options'),
    windowUtils   = require('sdk/window/utils'),
    unload        = require("sdk/system/unload"),
    timer         = require("sdk/timers"),
    array         = require('sdk/util/array'),
    {Cc, Ci, Cu}  = require('chrome'),
    windows       = {
      get active () { // Chrome window
        return windowUtils.getMostRecentBrowserWindow()
      }
    },
    config        = require("../config");

Cu.import("resource://gre/modules/Promise.jsm");

//toolbar button
exports.button = (function () {
  var button = buttons.ActionButton({
    id: self.name,
    label: "Send to My Phone (QR Code Generator)",
    icon: {
      "16": "./icons/16.png",
      "32": "./icons/32.png"
    },
    onClick: function() {
      popup.show({
        width: config.popup.width,
        height: config.popup.height,
        position: button
      });
    }
  });
  return {
    onCommand: function (c) {
      onClick = c;
    },
    set label (val) {
      button.label = val;
    }
  }
})();

var popup = require("sdk/panel").Panel({
  contentURL: data.url("./popup/index.html"),
  contentScriptFile: [data.url("./popup/qr.js"), data.url("./popup/index.js")],
  contentScriptOptions: {
    base: loader.prefixURI + loader.name + "/"
  }
});
popup.on("show", function () {
  popup.port.emit("show");
});

exports.storage = {
  read: function (id) {
    return (prefs[id] || prefs[id] + "" === "false" || +prefs[id] === 0) ? (prefs[id] + "") : null;
  },
  write: function (id, data) {
    data = data + "";
    if (data === "true" || data === "false") {
      prefs[id] = data === "true" ? true : false;
    }
    else if (parseInt(data) + '' === data) {
      prefs[id] = parseInt(data);
    }
    else {
      prefs[id] = data + "";
    }
  }
}

exports.popup = {
  send: function (id, data) {
    popup.port.emit(id, data);
  },
  receive: function (id, callback) {
    popup.port.on(id, callback);
  },
  hide: function () {
    popup.hide();
  }
}

exports.tab = {
  open: function (url, inBackground, inCurrent) {
    if (inCurrent) {
      tabs.activeTab.url = url;
    }
    else {
      tabs.open({
        url: url,
        inBackground: typeof inBackground == 'undefined' ? false : inBackground
      });
    }
  },
  openOptions: function () {
    this.open(data.url("options/index.html"));
  },
  list: function () {
    var tabs1 = [].filter.call(tabs, function (tab) {
      return tab == tabs.activeTab;
    });
    var tabs2 = [].filter.call(tabs, function (tab) {
      return tab != tabs.activeTab;
    });
    return Promise.resolve(tabs1.concat(tabs2));
  }
}

exports.version = function () {
  return self.version;
}

exports.timer = timer;

exports.options = (function () {
  var workers = [], options_arr = [];
  pageMod.PageMod({
    include: data.url("options/index.html"),
    contentScriptFile: data.url("options/index.js"),
    contentScriptWhen: "start",
    contentScriptOptions: {
      base: loader.prefixURI + loader.name + "/"
    },
    onAttach: function(worker) {
      array.add(workers, worker);
      worker.on('pageshow', (w) => array.add(workers, w));
      worker.on('pagehide', (w) => array.remove(workers, w));
      worker.on('detach', (w) => array.remove(workers, w));

      options_arr.forEach(function (arr) {
        worker.port.on(arr[0], arr[1]);
      });
    }
  });
  return {
    send: function (id, data) {
      workers.forEach(function (worker) {
        if (!worker || !worker.url) return;
        worker.port.emit(id, data);
      });
    },
    receive: (id, callback) => options_arr.push([id, callback])
  }
})();

sp.on("openOptions", function() {
  exports.tab.open(data.url("options/index.html"));
});
unload.when(function () {
  exports.tab.list().then(function (tabs) {
    tabs.forEach(function (tab) {
      if (tab.url === data.url("options/index.html")) {
        tab.close();
      }
    });
  });
})