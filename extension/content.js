"use strict";

console.log('from content.js!');

const port = chrome.runtime.connect();

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

chrome.runtime.onConnect.addListener(port => {
  console.log('connected!');
  port.onMessage.addListener(async message => {
    console.log(message);
    if (message.action === 'Add event handlers') {
      console.log('adding both event handlers');
      window.addEventListener('resize', () => {
        sendCaptureMsg('resize');
      });
      window.addEventListener('blur', () => {
        sendCaptureMsg('blur');
      });
    };
    if (message.action === 'Add to blacklist') {
      addToBlacklist();
    }
  });
});
