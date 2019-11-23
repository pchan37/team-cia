"use strict";

console.log('from content.js!');

let count = 0; // for debugging purposes

const port = chrome.runtime.connect();

function sendCaptureMsg() {
  port.postMessage({
    action: 'Capture tab',
    from: 'Focus event'
  });
}

function sendBlurMsg() {
  console.log('out of focus');
  port.postMessage({
    action: 'Check if same tab',
    from: 'Blur event'
  });
}

function sendOrigin(origin, tabId) {
  port.postMessage({
    action: 'Sending origin',
    info: {
      origin: origin,
      tabId: tabId
    }
  });
}

chrome.runtime.onConnect.addListener(port => {
  console.log('connected!');
  port.onMessage.addListener(message => {
    console.log(message);
    if (message.action === 'Add event handlers') {
      console.log(`added event handlers ${++count}`);
      if (document.hasFocus()) {
        console.log('document has focus');
        sendCaptureMsg();
      }
      window.addEventListener('focus', sendCaptureMsg);
      console.log('gave focus listener sendcapturemsg');
      window.addEventListener('blur', sendBlurMsg);
      console.log('gave blur listener sendblurmsg');
    }
    if (message.action === 'Fetch origin') {
      let origin = window.location.origin;
      console.log(origin);
      sendOrigin(origin, message.tabId);
    }
  });
  port.onDisconnect.addListener(port => {
    console.log(`port ${port} disconnected`);
    console.log(port);
  });
});