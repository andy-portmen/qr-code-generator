/**** wrapper (start) ****/
var isFirefox = typeof require !== 'undefined',
    isSafari  = typeof safari !== 'undefined',
    isOpera   = typeof chrome !== 'undefined' && navigator.userAgent.indexOf("OPR") !== -1,
    isChrome  = typeof chrome !== 'undefined' && navigator.userAgent.indexOf("OPR") === -1;

if (isFirefox) {
  app = require('./firefox/firefox');
  config = require('./config');
}
/**** wrapper (end) ****/

// options
app.options.receive("changed", function (o) {
  config.set(o.pref, o.value);
  app.options.send("set", {
    pref: o.pref,
    value: config.get(o.pref)
  })
});
app.options.receive("get", function (pref) {
  app.options.send("set", {
    pref: pref,
    value: config.get(pref)
  });
});
// popup
app.popup.receive("resize", function () {
  app.popup.send("resize", {
    width: config.popup.width,
    height: config.popup.height
  });
});
app.popup.receive("show", function () {
  app.tab.list().then(function (tabs) {
    app.popup.send("list-update", {
      tabs: tabs.map(function (tab) {
        return [tab.title, tab.url];
      }),
      size: config.popup.size + 4
    });
  });
});
app.popup.receive("settings", function () {
  app.tab.openOptions();
  app.popup.hide();
});
// welcome
(function () {
  var version = app.version();
  if (version !== config.misc.version) {
    app.timer.setTimeout(function () {
      app.tab.open("http://add0n.com/send-to-myphone.html?v=" + version + "&" + (config.misc.version ? "p=" + config.misc.version + "&type=upgrade" : "type=install"));
      config.misc.version = version;
    }, config.times.welcome * 1000);
  }
})();