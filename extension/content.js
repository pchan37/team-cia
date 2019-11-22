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

function sendFocusMsg() {
  console.log('in focus');
  port.postMessage({
    action: 'Check if same tab'
  });
}

function sendBlurMsg() {
  console.log('out of focus');
  port.postMessage({
    action: 'Check if same tab',
    from: 'Blur event'
  });
}

chrome.runtime.onConnect.addListener(port => {
  console.log('connected!');
  port.onMessage.addListener(message => {
    if (message.action === 'Add event handlers') {
      console.log(`added event handlers ${++count}`);
      if (document.hasFocus()) {
        console.log('document has focus');
        sendCaptureMsg();
      }
      window.addEventListener('focus', sendCaptureMsg);
      // window.addEventListener('focus', sendFocusMsg);
      console.log('gave focus listener sendcapturemsg');
      window.addEventListener('blur', sendBlurMsg);
      console.log('gave blur listener sendblurmsg');
    }
  });
  port.onDisconnect.addListener(port => {
    console.log(`port ${port} disconnected`);
    console.log(port);
  });
});