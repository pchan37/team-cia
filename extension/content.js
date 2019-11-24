"use strict";

console.log('from content.js!');

const port = chrome.runtime.connect();
let intervalId = null;

function sendCaptureMsg(fromEvent) {
  port.postMessage({
    action: 'Capture tab',
    from: fromEvent
  });
}

async function addToBlacklist() {
  const url = window.location.host;

  const params = new URLSearchParams();
  params.append('url', url);

  fetch('https://stoptabnabbing.online/add_url', {
    method: 'post',
    body: params,
  });

}

window.addEventListener('focus', () => {
  intervalId = setInterval(() => {
    console.log('interval in action');
    sendClearThenCaptureMsg();
  }, 10000);
});

function sendClearThenCaptureMsg() {
  port.postMessage({
    action: 'Clear then capture'
  });
}

window.addEventListener('resize', () => {
  sendCaptureMsg('resize');
});

window.addEventListener('blur', () => {
  sendCaptureMsg('blur');
  if (intervalId !== null) {
    console.log('clearing interval');
    clearInterval(intervalId);
  }
});

if (document.hasFocus()) {
  intervalId = setInterval(() => {
    console.log('interval in action');
    sendClearThenCaptureMsg();
  }, 5000);
}

chrome.runtime.onConnect.addListener(port => {
  console.log('connected!');
  port.onMessage.addListener(async message => {
    console.log(message);
    if (message.action === 'Add to blacklist') {
      addToBlacklist();
    }
  });
});
