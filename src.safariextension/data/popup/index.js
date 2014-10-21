var background = {}, manifest = {},
  isFirefox = typeof self !== 'undefined' && self.port,
  isSafari = typeof safari !== 'undefined',
  isOpera = typeof chrome !== 'undefined' && navigator.userAgent.indexOf("OPR") !== -1,
  isChrome = typeof chrome !== 'undefined' && navigator.userAgent.indexOf("OPR") === -1;

/**** wrapper (start) ****/
if (isChrome || isOpera) {
  background.send = function (id, data) {
    chrome.extension.sendRequest({method: id, data: data});
  }
  background.receive = function (id, callback) {
    chrome.extension.onRequest.addListener(function(request, sender, c) {
      if (request.method == id) {
        callback(request.data);
      }
    });
  }
  window.addEventListener("load", function () {
    init();
  });
}
if (isSafari) {
  background = (function () {
    var callbacks = {};
    return {
      send: function (id, data) {
        safari.extension.globalPage.contentWindow.app.popup.dispatchMessage(id, data);
      },
      receive: function (id, callback) {
        callbacks[id] = callback;
      },
      dispatchMessage: function (id, data) {
        if (callbacks[id]) {
          callbacks[id](data);
        }
      }
    }
  })();
  safari.application.addEventListener("popover", function () {
    init();
  }, true);
}
if (isFirefox) {
  background.send = self.port.emit;
  background.receive = self.port.on;
  self.port.on("show", function () {
    init();
  })
}
/**** wrapper (end) ****/
background.receive("resize", function (o) {
  if (isChrome || isOpera) {
    document.body.style.width = o.width + "px";
    document.body.style.height =
    document.querySelector("html").style.height = (o.height - 30) + "px";
  }
});
background.send("resize");

function $ (id) {
  return document.getElementById(id);
}


function prepare (size) {
  $('textarea').value = $('url-select').children[$('url-select').selectedIndex].value;
  gen(size);
}

function init() {
  background.send("show");
}

function addNewItem(urlSelect, title, url) {
  var option = document.createElement("option");
  if (url.length > 0) {
    option.textContent = title;
    option.setAttribute("value", url);
    urlSelect.appendChild(option);
  } else {
    option.textContent = "Open a new website";
    option.setAttribute("disabled", true);
    urlSelect.appendChild(option);
  }
 }

function gen(size) {
  if (size) {
    gen.size = size;
  }
  else {
    size = gen.size;
  }
  var txt =
    $('textarea').value;
  var img = qr.image({
    image: $("qr-image"),
    foreground : "#000000",
    background : "#FFF",
    size: size,
    value: txt
  });

  $("td-qr").style.minWidth = (size * 25 + 40) + "px";

}

$('url-select').addEventListener("change", function () {
  prepare();
}, false);
$('url-select').addEventListener("click", function () {
  prepare();
}, false);

$('textarea').addEventListener("keyup", function () {
  gen()
}, false);
$('settings').addEventListener("click", function () {
  background.send("settings");
}, false);

background.receive("list-update", function (obj) {
  var tabs = obj.tabs;
  var urlSelect = $("url-select");
  while (urlSelect.firstChild) {
    urlSelect.removeChild(urlSelect.firstChild);
  }
  for (var i = 0; i < tabs.length; i++) {
    addNewItem(urlSelect, tabs[i][0], tabs[i][1]);
  }
  if (!tabs.length) {
    addNewItem(urlSelect, '');
  }
  prepare(obj.size);
});
