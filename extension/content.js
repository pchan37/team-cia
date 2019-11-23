"use strict";

console.log('from content.js!');

const port = chrome.runtime.connect();

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
    if (message.action === 'Fetch origin') {
      let origin = window.location.origin;
      console.log(origin);
      sendOrigin(origin, message.tabId);
    }
  });
});
