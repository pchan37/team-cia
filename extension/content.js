"use strict";

console.log('from content.js!');

const port = chrome.runtime.connect();

function sendOriginMsg(origin, tabId) {
  port.postMessage({
    action: 'Sending origin',
    info: {
      origin: origin,
      tabId: tabId
    }
  });
}

function sendCaptureMsg(tabId) {
  port.postMessage({
    action: 'Capture tab',
    info: {
      tabId: tabId
    }
  });
}

chrome.runtime.onConnect.addListener(port => {
  console.log('connected!');
  port.onMessage.addListener(message => {
    console.log(message);
    if (message.action === 'Fetch origin') {
      let origin = window.location.origin;
      console.log(origin);
      sendOriginMsg(origin, message.tabId);
    }
    if (message.action === 'Add resize handler') {
      console.log('resize handler');
      window.addEventListener('resize', () => {
        console.log('resize says that tabid is');
        console.log(message.info.tabId);
        sendCaptureMsg(message.info.tabId);
      });
    };
  });
});
