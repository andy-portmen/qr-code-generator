var storage, popup, window, Deferred, tab, notification, version;

/**** wrapper (start) ****/
if (typeof require !== 'undefined') { //Firefox
  var firefox = require("./firefox/firefox.js");
  ["storage", "notification", "popup", "window", "tab", "version", "Deferred"].forEach(function (id) {
    this[id] = firefox[id];
  });
}
else if (typeof safari !== 'undefined') {  // Safari
  ["storage", "notification", "popup", "tab", "version"].forEach(function (id) {
    this[id] = _safari[id];
  });
  Deferred = task.Deferred;
}
else {  //Chrome
  ["storage", "notification", "popup", "tab", "version"].forEach(function (id) {
    this[id] = _chrome[id];
  });
  Deferred = task.Deferred;
}
/**** wrapper (end) ****/

if (storage.read("version") != version()) {
  storage.write("version", version());
  tab.open("http://add0n.com/send-to-myphone.html?version=" + version());
}

popup.receive("init", function () {
  tab.list().then(function (tabs) {
    console.error(tabs);

    popup.send("list-update", tabs);
  });
});
