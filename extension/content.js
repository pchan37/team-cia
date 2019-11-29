'use strict';

console.log('[DEBUG] From content.js!');

const port = chrome.runtime.connect();
let intervalId = null;

init();

chrome.runtime.onConnect.addListener(port => {
  console.log('[DEBUG] Connected to port.');
  port.onMessage.addListener(message => {
    console.log(message);
    if (message.action === 'Add to blacklist') {
      addToBlacklist();
    }
  });
});

function init() {
  initHandlers();
  checkDOMFocus();
}

function checkDOMFocus() {
  if (document.hasFocus()) {
    intervalId = setInterval(() => {
      console.log('[DEBUG] Interval in action.');
      sendClearThenCaptureMsg();
    }, 5000);
  }
}

function initHandlers() {
  window.addEventListener('focus', () => {
    intervalId = setInterval(() => {
      console.log('[DEBUG] Interval in action');
      sendClearThenCaptureMsg();
    }, 5000);
  });
  window.addEventListener('resize', () => {
    sendCaptureMsg('resize');
  });
  window.addEventListener('blur', () => {
    sendCaptureMsg('blur');
    if (intervalId !== null) {
      console.log('[DEBUG] Clearing interval.');
      clearInterval(intervalId);
    }
  });
}

function sendCaptureMsg(fromEvent) {
  port.postMessage({
    action: 'Capture tab',
    from: fromEvent
  });
}

function sendClearThenCaptureMsg() {
  if (port === undefined || port === null) {
    clearInterval(intervalId);
    return;
  }
  port.postMessage({
    action: 'Clear then capture'
  });
}

function addToBlacklist() {
  const url = window.location.host;

  const params = new URLSearchParams();
  params.append('url', url);

  fetch('https://stoptabnabbing.online/add_url', {
    method: 'post',
    body: params,
  });
}
