"use strict";

console.log('from content.js!');

const port = chrome.runtime.connect();

function sendCaptureMsg(tabId) {
  port.postMessage({
    action: 'Capture tab',
    info: {
      tabId: tabId
    }
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
    if (message.action === 'Add resize handler') {
      console.log('resize handler');
      window.addEventListener('resize', () => {
        console.log('resize says that tabid is');
        console.log(message.info.tabId);
        sendCaptureMsg(message.info.tabId);
      });
    };
    if (message.action === 'Add to blacklist') {
      addToBlacklist();
    }
  });
});
