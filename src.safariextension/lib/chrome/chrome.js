var app = {}

app.Promise = Promise;

app.storage = {
  read: function (id) {
    return localStorage[id] || null;
  },
  write: function (id, data) {
    localStorage[id] = data + "";
  }
}

app.popup = {
  send: function (id, data) {
    chrome.extension.sendRequest({method: id, data: data});
  },
  receive: function (id, callback) {
    chrome.extension.onRequest.addListener(function(request, sender, c) {
      if (request.method == id && !sender.tab) {
        callback(request.data);
      }
    });
  },
  hide: function () {
    var popup = chrome.extension.getViews({type:'popup'})[0];
    if (popup) {
      popup.close();
    }
  }
}

app.tab = {
  open: function (url, inBackground, inCurrent) {
    if (inCurrent) {
      chrome.tabs.update(null, {url: url});
    }
    else {
      chrome.tabs.create({
        url: url,
        active: typeof inBackground == 'undefined' ? true : !inBackground
      });
    }
  },
  openOptions: function () {
    this.open(chrome.extension.getURL('data/options/index.html'));
  },
  list: function () {
    var d = app.Promise.defer();
    chrome.tabs.query({currentWindow: true}, function(tabs) {
      var tabs1 = tabs.filter(function (tab) {
        return tab.active;
      });
      var tabs2 = tabs.filter(function (tab) {
        return !tab.active;
      });
      d.resolve(tabs1.concat(tabs2));
    });
    return d.promise;
  }
}

app.version = function () {
  return chrome[chrome.runtime && chrome.runtime.getManifest ? "runtime" : "extension"].getManifest().version;
}

app.timer = window;

app.options = {
  send: function (id, data) {
    chrome.tabs.query({}, function(tabs) {
      tabs.forEach(function (tab) {
        if (tab.url.indexOf("options/index.html") !== -1) {
          chrome.tabs.sendMessage(tab.id, {method: id, data: data}, function() {});
        }
      });
    });
  },
  receive: function (id, callback) {
    chrome.extension.onRequest.addListener(function(request, sender, c) {
      if (request.method == id && sender.tab && sender.tab.url.indexOf("options/index.html") !== -1) {
        callback(request.data);
      }
    });
  }
}