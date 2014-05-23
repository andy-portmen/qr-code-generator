var background = {};
/**** wrapper (start) ****/
if (typeof chrome !== 'undefined') {  // Chrome
  background.send = function (id, data) {
    chrome.extension.sendRequest({method: id, data: data});
  }
  background.receive = function (id, callback) {
    chrome.extension.onRequest.addListener(function(request, sender, callback2) {
      if (request.method == id) {
        callback(request.data);
      }
    });
  }
  window.setTimeout(function () {
    init(); 
  }, 100);
}
else if (typeof safari !== 'undefined') { // Safari
  background = (function () {
    var callbacks = {};
    return {
      send: function (id, data) {
        safari.extension.globalPage.contentWindow.popup.dispatchMessage(id, data);
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
  var doResize = function () {
    safari.self.width = document.body.getBoundingClientRect().width + 10;
    safari.self.height = document.body.getBoundingClientRect().height + 10;
  }
  window.addEventListener("resize", doResize, false);
  safari.application.addEventListener("popover", function () {
    window.setTimeout(function () {
        init();
    }, 100);
  }, false);
}
else {  // Firefox
  background.send = function (id, data) {
    self.port.emit(id, data);
  }
  background.receive = function (id, callback) {
    self.port.on(id, callback);
  }
  var doResize = function () {
    self.port.emit("resize", {
      w: document.body.getBoundingClientRect().width,
      h: document.body.getBoundingClientRect().height
    });
  }
  window.addEventListener("resize", doResize, false);
  self.port.on("show", function () {
    init();
  });
}
/**** wrapper (end) ****/


function $ (id) {
  return document.getElementById(id);
}

function init() {
  background.send("init");
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
  
function gen() {
  var url = $('url-select').children[$('url-select').selectedIndex].value;
  qr.image({
    image: $("qr-image"), 
    foreground : "#000000",
    background : "#F5F5F5",
    size: 7,
    value: url
  }); 
}

$('url-select').addEventListener("change", gen, false);

background.receive("list-update", function (tabs) {
  var urlSelect = $("url-select");
  while (urlSelect.firstChild) {urlSelect.removeChild(urlSelect.firstChild);}
  for (var i = 0; i < tabs.length; i++) {addNewItem(urlSelect, tabs[i][0], tabs[i][1]);}
  if (!tabs.length) {addNewItem(urlSelect, '');}
  gen();
});