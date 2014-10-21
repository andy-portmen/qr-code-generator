var isFirefox = typeof InstallTrigger !== 'undefined';

function script (src, callback) {
  var head = document.querySelector('head');
  var script = document.createElement('script'); // not being called in Firefox
  script.type = 'text/javascript';
  script.src = src;
  script.onload = callback;
  head.appendChild(script);
}

if (!isFirefox) {
  script('qr.js', function () {
    script('index.js');
  });
}