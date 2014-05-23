var _chrome = {
  
  storage: {
    read: function (id) {
      return localStorage[id] || null;
    },
    write: function (id, data) {
      localStorage[id] = data + "";
    }
  },
  
  popup: {
    send: function (id, data) {
      chrome.extension.sendRequest({method: id, data: data});
    },
    receive: function (id, callback) {
      chrome.extension.onRequest.addListener(function(request, sender, callback2) {
        if (request.method == id && !sender.tab) {
          callback(request.data);
        }
      });
    }
  },
  
  tab: {
    open: function (url) {
      chrome.tabs.create({url: url});
    },
    openOptions: function () {
      chrome.tabs.create({url: "./data/options/options.html"});
    },
    list: function () {
      var deferred = new task.Deferred();
      chrome.tabs.query({currentWindow: true}, function(tabs) {
        var tabs1 = tabs.filter(function (tab) {
          return tab.active;
        });
        var tabs2 = tabs.filter(function (tab) {
          return !tab.active;
        });
        var tabs3 = tabs1.concat(tabs2);
        deferred.resolve(tabs3.map(function (tab) {
          return [tab.title, tab.url];
        }));
      });
      return deferred.promise;
    }
  },
  
  version: function () {
    return chrome[chrome.runtime && chrome.runtime.getManifest ? "runtime" : "extension"].getManifest().version;
  }
}