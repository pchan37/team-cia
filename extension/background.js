"use strict"

let tabCount = 0; // for debugging purposes
let captureCount = 0; // for debugging purposes
let hasHandlerTracker = {};
let prevURLTracker = {};

chrome.runtime.onConnect.addListener(port => {
  console.log('connected!');
  console.assert(port.name === 'port');
  port.onMessage.addListener(message => {
    console.log("i've got a message from content script!");
    if (message.action === 'Capture tab') {
      console.log('heard a capture tab from the content script');
      captureTab();
    }
  });
  port.onDisconnect.addListener(port => {
    console.log(`port ${port} disconnected`);
    console.log(port);
  });
});

chrome.tabs.onCreated.addListener(tab => {
  console.log('tab created');
});

chrome.tabs.onActivated.addListener(activeInfo => {
  console.log('on activated triggered');
  if (chrome.runtime.lastError) {
    return;
  }
  let { tabId } = activeInfo;
  if (!(tabId in hasHandlerTracker)) {
    let port = chrome.tabs.connect(tabId);
    port.postMessage({ action: 'Add event handlers' });
    chrome.tabs.get(tabId, tab => {
      hasHandlerTracker[tabId] = true;
      prevURLTracker[tabId] = tab.url;
    });
  } else {
    chrome.tabs.get(tabId, tab => {
      let prevURL = prevURLTracker[tabId];
      let currentURL = tab.url;
      console.log(`prevURL ${prevURL}`);
      console.log(`currentURL ${currentURL}`);
      if (prevURL === currentURL) {
        console.log('put through pixelmatch');
      }
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  let statusComplete = changeInfo.status === 'complete' && tab.status === 'complete';
  if (statusComplete && tab.active) {
    console.log('on updated triggered');
    chrome.tabs.get(tabId, tab => {
      if (tab !== undefined && prevURLTracker[tabId] !== tab.url) {
        let port = chrome.tabs.connect(tabId);
        port.postMessage({ action: 'Add event handlers' });
      }
    });
    console.log(`done loading tab #${++tabCount}`);
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  console.log('on removed triggered');
  if (tabId in hasHandlerTracker)
    delete hasHandlerTracker[tabId];
  if (tabId in prevURLTracker)
    delete prevURLTracker[tabId];
  console.log(`removed tab#${tabId} from dictionaries`);
});

function captureTab() {
  chrome.tabs.captureVisibleTab(chrome.windows.WINDOW_ID_CURRENT, { format: "png" }, dataURI => {
    if (chrome.runtime.lastError) {
      return;
    }
    chrome.storage.local.get({ captured: [] }, s => {
      if (dataURI !== undefined) {
        s.captured.push(dataURI);
        console.log(dataURI);
        chrome.storage.local.set({ captured: s.captured });
      }
    });
  });
}

function convertDataURIToBinary(dataURI) {
  let BASE64_MARKER = ";base64,";
  let base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  let base64 = dataURI.substring(base64Index);
  let raw = window.atob(base64);
  let rawLength = raw.length;
  let array = new Uint8Array(new ArrayBuffer(rawLength));

  for (let i = 0; i < rawLength; i++) 
    array[i] = raw.charCodeAt(i);

  return array;
}