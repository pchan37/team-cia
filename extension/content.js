"use strict";

console.log('from content.js!');

let count = 0; // for debugging purposes

const port = chrome.runtime.connect({ name: 'port'});

function sendCaptureMsg() {
  port.postMessage({ action: 'Capture tab' });
}

chrome.runtime.onConnect.addListener(port => {
  console.log('connected!');
  // console.assert(port.name === 'port');
  port.onMessage.addListener(message => {
    if (message.action === 'Add event handlers') {
      console.log(`added event handlers ${++count}`);
      if (document.hasFocus()) {
        console.log('document has focus');
        sendCaptureMsg();
      }
      window.addEventListener('focus', sendCaptureMsg);
      console.log('gave focus listener');
    }
  });
  port.onDisconnect.addListener(port => {
    console.log(`port ${port} disconnected`);
    console.log(port);
  });
});