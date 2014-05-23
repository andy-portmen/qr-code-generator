var _safari = {
  storage: {
    read: function (id) {
      return localStorage[id] || null;
    },
    write: function (id, data) {
      localStorage[id] = data + "";
    }
  },

  popup: (function () {
    var callbacks = {};
    return {
      send: function (id, obj) {
        safari.extension.popovers[0].contentWindow.background.dispatchMessage(id, obj)
      },
      receive: function (id, callback) {
        callbacks[id] = callback;
      },
      dispatchMessage: function (id, obj) {
        if (callbacks[id]) {
          callbacks[id](obj);
        }
      }
    }
  })(),

  tab: {
    open: function (url, inBackground, inCurrent) {
      if (inCurrent) {
        safari.application.activeBrowserWindow.activeTab.url = url;
      }
      else {
        safari.application.activeBrowserWindow.openTab(inBackground ? "background" : "foreground").url = url;
      }
    },
    openOptions: function () {
        _safari.notification("Google Translator", "To change Settings go to Safari -> Preferences -> Extensions");
    },
    list: function () {
    }
  },

  version: function () {
    return safari.extension.displayVersion;
  }
}
// Transfer settings
safari.extension.settings.addEventListener("change", function (e) {
  var index = ["isTextSelection", "isDblclick", "enableHistory", "numberHistoryItems"].indexOf(e.key);
  if (index == -1) return;
  _safari.storage.write(e.key, e.newValue);
}, false);
