'use strict';

let tabCount = 0; // for debugging purposes
let captureCount = 0; // for debugging purposes
let blacklist = [];

let prevURLTracker = {};
let lastActivatedTabId = null;

const BLACKLIST_ENDPOINT = 'https://stoptabnabbing.online/get_blacklist';

function init() {
  refreshBlacklist();
  // Refresh the blacklist every hour
  setInterval(refreshBlacklist, 1000 * 3600);
}

// Anything that should be run when the extension loads goes in init
init();

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason == 'install') {
    createRestartNotif();
  }
});

chrome.runtime.onConnect.addListener((port) => {
  console.log('[DEBUG] Connected!');
  port.onMessage.addListener((message, messageSender) => {
    console.log(message);
    if (message.action === 'Capture tab') {
      if (message.from === 'resize') {
        const tabId = messageSender.sender.tab.id;
        clearTabIdAndCurrentDataURI(tabId);
        captureTabThenGuardedCompare();
      }
      if (message.from === 'blur') {
        const blurTabId = messageSender.sender.tab.id;
        if (blurTabId === lastActivatedTabId) {
          captureTabThenGuardedCompare();
        }
      }
    }
    if (message.action === 'Clear then capture') {
      const tabId = messageSender.sender.tab.id;
      clearTabIdAndCurrentDataURI(tabId);
      captureTabThenGuardedCompare();
    }
  });
});

// This is reponsible for tab capturing when you switch between tabs.
// It is also responsible for saving the tab url when you open the tab.
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('[DEBUG] On activated triggered.');
  let { tabId } = activeInfo;
  lastActivatedTabId = tabId;
  tabId = tabId.toString();
  chrome.storage.local.get([tabId], (result) => {
    if (result[tabId] !== null && result[tabId] !== undefined) {
      captureTabThenGuardedCompare();
    }
  });
});

// This is responsible for tab capturing when you open up a new tab or
// when the url of the tab has changed.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  let statusComplete = changeInfo.status === 'complete' && tab.status === 'complete';
  if (statusComplete && tab.active) {
    console.log('[DEBUG] On updated triggered.');
    chrome.tabs.get(tabId, (tab) => {
      if (tab !== undefined && prevURLTracker[tabId] !== tab.url) {
        if (inBlacklist(tab.url)) {
          const leave = confirm('Warning! This page is probably malicious\n\
          Do you want to leave?  If yes, press ok.  If no, press cancel.');
          if (leave) {
            chrome.tabs.remove(tabId);
          }
          return;
        }
        prevURLTracker[tabId] = tab.url;
        clearTabIdAndCurrentDataURI(tabId);
      }
      captureTabThenGuardedCompare();
    });
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (tabId in prevURLTracker)
    delete prevURLTracker[tabId];
});

function captureTabThenGuardedCompare() {
  chrome.tabs.captureVisibleTab(chrome.windows.WINDOW_ID_CURRENT, { format: 'png' }, dataURI => {
    // This is not actually something to worry about.  We don't want the extension to error on restricted
    // domains as you would need the activeTab permission (which involves getting the user to click on your
    // extension).
    if (chrome.runtime.lastError) {
      return;
    }
    console.log('[DEBUG] Capturing visible tab.');
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      if (dataURI !== undefined && dataURI !== null) {
        let activeTabId = tabs[0].id.toString();
        chrome.storage.local.get([activeTabId], (result) => {
          if (result[activeTabId] === null || result[activeTabId] === undefined) {
            setTabIdAndCurrentDataURI(activeTabId, dataURI, null);
          } else {
            chrome.storage.local.set({ current: dataURI }, () => {
              guardedCompare(tabs[0].id);
            });
          }
        });
      } else {
        console.log('[INFO] Data URI is undefined.');
      }
    });
  });
}

function guardedCompare(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    let prevURL = prevURLTracker[tabId];
    let currentURL = tab.url;
    if (prevURL === currentURL) {
      console.log('[DEBUG] Put through pixelmatch.');
      chrome.storage.local.get([tabId.toString(), 'current'], (result) => {
        let oldDataURI = result[tabId];
        let newDataURI = result['current'];
        if (newDataURI !== null && newDataURI !== undefined) {
          compare(oldDataURI, newDataURI, tab.url, tabId);
          setTabIdAndCurrentDataURI(tabId, newDataURI, null);
        }
      });
    };
  });
}

/******************************************************************/
/********************** UTILITY FUNCTIONS *************************/
/******************************************************************/

// Retrieves the blacklist from the server
async function refreshBlacklist() {
  blacklist = await fetch(BLACKLIST_ENDPOINT).then(resp => resp.json());
  if (blacklist == null) {
    blacklist = [];
  }
}

// Check if url is in the blacklist
// Returns true if it is and false otherwise
function inBlacklist(url) {
  let blacklisted = false;
  blacklist.forEach((entry) => {
    const httpURL = `http://${entry.url}`;
    const httpsURL = `https://${entry.url}`;
    if (url.startsWith(httpURL) || url.startsWith(httpsURL)) {
      blacklisted = true;
    }
  });
  return blacklisted;
}

// Set the data URI for both the entry associated with the tabId and the entry
// associated with current
function setTabIdAndCurrentDataURI(tabId, tabIdDataURI, currentDataURI) {
  chrome.storage.local.set({
    [tabId.toString()]: tabIdDataURI,
    current: currentDataURI,
  });
}

// Clear the data URI for both the entry associated with the tabId and the entry
// associated with current
function clearTabIdAndCurrentDataURI(tabId) {
  chrome.storage.local.set({
    [tabId.toString()]: null,
    current: null,
  });
}

/******************************************************************/
/***************** COMPARISON CODE STARTS HERE ********************/
/******************************************************************/

// Create a canvas for the image 
function createCanvas(image, width, height) {
  let canvas = document.createElement('canvas');
  canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(image, 0, 0); // Insert image into canvas 

  return canvas;
}

// Compare two images 
function compareImages(image1, image2, width, height, url, tabId) {
  // Create canvas for before and after images 
  const canvas1 = createCanvas(image1, width, height);
  const canvas2 = createCanvas(image2, width, height);

  // Create context from the two canvases 
  const context1 = canvas1.getContext('2d');
  const context2 = canvas2.getContext('2d');

  // Get Image data 
  const imageData1 = context1.getImageData(0, 0, canvas1.width, canvas1.height);
  const imageData2 = context2.getImageData(0, 0, canvas2.width, canvas2.height);

  // Create new image data for the output 
  let outputData = new ImageData(canvas1.width, canvas2.height);

  pixelmatch(imageData1.data, imageData2.data, outputData.data,
    outputData.width, outputData.height,
    { threshold: 0.05, alpha: 0.7, includeAA: true });

  // outputData contains the result from pixelmatch. Show difference in a popup
  showDifferences(canvas1, outputData, url, tabId);
}

// outputData is an ImageData, beforeCanvas is a canvas 
function showDifferences(beforeCanvas, outputData, taburl, tabId) {
  let outputCanvas = document.createElement('canvas'); //  new HTMLCanvasElement();
  outputCanvas.width = outputData.width;
  outputCanvas.height = outputData.height;
  let outputContext = outputCanvas.getContext('2d');
  outputContext.putImageData(outputData, 0, 0);

  // Determine if the output passes threshold 
  if (checkThreshold(outputData)) {
    createChangesDetectedNotif();
    chrome.notifications.onButtonClicked.addListener((notifId, buttonIndex) => {
      if (notifId === 'changesDetectedNotif') {
        if (buttonIndex === 0) {
          // Resize the before and output canvases
          let rescaledBefore = resizeCanvas(beforeCanvas, 0.45);
          let rescaledOutput = resizeCanvas(outputCanvas, 0.45);

          // Create source for the two canvases 
          let url = rescaledOutput.toDataURL('outputImage/png');
          let urlBefore = rescaledBefore.toDataURL('beforeImage/png');
          let popW = rescaledBefore.width * 1.2, popH = rescaledBefore.height * 1.2;

          // Displays difference in new window
          showPopup(popW, popH, urlBefore, url, taburl);
        }
        chrome.notifications.clear(notifId);
      }
    });
  }
}

function createChangesDetectedNotif() {
  chrome.notifications.create('changesDetectedNotif', {
    type: 'basic',
    iconUrl: 'sus_image.png',
    title: 'Changes Detected',
    message: 'Would you like to view the changes?',
    buttons: [
      { title: 'Yes' },
      { title: 'No' }
    ]
  });
}

function createIncompatibleSizesNotif() {
  chrome.notifications.create('incompatibleSizesNotif', {
    type: 'basic',
    iconUrl: 'warning.png',
    title: 'Incompatible Window Sizes',
    message: 'The extension is unable to check for any changes because of different window sizes.'
  });
}

function createRestartNotif() {
  chrome.notifications.create('restartNotif', {
    type: 'basic',
    title: 'Restart Recommended for Full Effect',
    message: 'To restart your browser, go to chrome://restart.',
    iconUrl: 'warning.png',
  });
}

function showPopup(popW, popH, urlBefore, url, taburl) {
  let popup = window.open('', 'popup', 'width=' + popW + ',height=' + popH + ', scrollbars=yes');
  const body = popup.document.querySelector('body');

  while (body.children.length != 0) {
    body.removeChild(body.firstChild);
  }

  popup.document.write("<h1> The below image is the screenshot of your page before you left your tab <br></h1>");
  popup.document.write("<img src='" + urlBefore + "' alt='from canvas'/>");
  popup.document.write("<h1> <br>The below image is the difference between when you left and you came back to your tab. Any red area indicates deviations from the previous image<br></h1>");
  popup.document.write("<img src='" + url + "' alt='from canvas'/>");
  popup.document.title = "Differences for: " + taburl;
  popup.document.write("<h1> <br>Would you like to add this site to the blacklist?<br></h1>");
  popup.document.write("<button id='yes-button' style='margin-right:10px;'>Yes</button>");
  popup.document.write("<button id='no-button'>No</button>");
  const noButton = popup.document.getElementById("no-button");
  const yesButton = popup.document.getElementById('yes-button');
  noButton.addEventListener('click', () => popup.window.close());
  yesButton.addEventListener('click', () => {
    const port = chrome.tabs.connect(tabId);
    port.postMessage({
      action: 'Add to blacklist',
    });
    popup.window.close();
  });
}

function resizeCanvas(oldCanvas, perc) {
  let width = oldCanvas.width;
  let height = oldCanvas.height;
  let rescaledCanvas = document.createElement('canvas');
  rescaledCanvas.width = width * perc;
  rescaledCanvas.height = height * 0.45;
  let rescaledContext = rescaledCanvas.getContext('2d');
  rescaledContext.drawImage(oldCanvas, 0, 0, width, height, 0, 0, width * perc, height * perc);
  return rescaledCanvas;
}

// This will always return true for now 
function checkThreshold(outputData) {
  return true;
}

// Get the dimensions of the images 
async function getDimensions(base64String) {
  let promise = new Promise((resolved) => {
    let i = new Image();
    i.onload = function () {
      resolved({ w: i.width, h: i.height });
    };
    i.src = base64String;
  });
  return await promise;
}

//Inputs are two binary64 strings and the url of the tab
function compare(string1, string2, url, tabId) {
  console.log('[DEBUG] Compare.js called.');
  // console.log(string1);
  // console.log(string2);
  if (string1 !== string2) {
    console.log('[DEBUG] Base64 is not equal. Checking Dimensions.');
    let image1 = new Image();
    image1.src = string1;

    let image2 = new Image();
    image2.src = string2;

    let result1 = getDimensions(string1);
    let result2 = getDimensions(string2);

    Promise.all([result1, result2]).then(function (values) {
      let img1W = (values[0]).w;
      let img1H = (values[0]).h;
      let img2W = (values[1]).w;
      let img2H = (values[1]).h;
      if ((img1W !== img2W) || (img1H !== img2H)) {
        createIncompatibleSizesNotif();
        console.log('[DEBUG] Image different Dimensions. Can not put through pixelmatch.');
      }
      else {
        console.log('[DEBUG] Comparing images.');
        compareImages(image1, image2, img1W, img2H, url, tabId);
      }
    });
  }
  else {
    console.log('[DEBUG] Base64 strings are the same. No need to put through pixelmatch.');
  }
};
/******************************************************************/
/****************** COMPARISON CODE ENDS HERE *********************/
/******************************************************************/



/******************************************************************/
/*********** PIXELMATCH SOURCE CODE STARTS HERE  ******************/
/******************************************************************/

const defaultOptions = {
  threshold: 0.1,         // matching threshold (0 to 1); smaller is more sensitive
  includeAA: false,       // whether to skip anti-aliasing detection
  alpha: 0.1,             // opacity of original image in diff ouput
  aaColor: [255, 255, 0], // color of anti-aliased pixels in diff output
  diffColor: [255, 0, 0],  // color of different pixels in diff output
  diffMask: false         // draw the diff over a transparent background (a mask)
};

function pixelmatch(img1, img2, output, width, height, options) {

  if (!isPixelData(img1) || !isPixelData(img2) || (output && !isPixelData(output)))
    throw new Error('Image data: Uint8Array, Uint8ClampedArray or Buffer expected.');

  if (img1.length !== img2.length || (output && output.length !== img1.length))
    throw new Error('Image sizes do not match.');

  if (img1.length !== width * height * 4) throw new Error('Image data size does not match width/height.');

  options = Object.assign({}, defaultOptions, options);

  // check if images are identical
  const len = width * height;
  const a32 = new Uint32Array(img1.buffer, img1.byteOffset, len);
  const b32 = new Uint32Array(img2.buffer, img2.byteOffset, len);
  let identical = true;

  for (let i = 0; i < len; i++) {
    if (a32[i] !== b32[i]) { identical = false; break; }
  }
  if (identical) { // fast path if identical
    if (output && !options.diffMask) {
      for (let i = 0; i < len; i++) drawGrayPixel(img1, 4 * i, options.alpha, output);
    }
    return 0;
  }

  // maximum acceptable square distance between two colors;
  // 35215 is the maximum possible value for the YIQ difference metric
  const maxDelta = 35215 * options.threshold * options.threshold;

  let diff = 0;
  const [aaR, aaG, aaB] = options.aaColor;
  const [diffR, diffG, diffB] = options.diffColor;

  // compare each pixel of one image against the other one
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {

      const pos = (y * width + x) * 4;

      // squared YUV distance between colors at this pixel position
      const delta = colorDelta(img1, img2, pos, pos);

      // the color difference is above the threshold
      if (delta > maxDelta) {
        // check it's a real rendering difference or just anti-aliasing
        if (!options.includeAA && (antialiased(img1, x, y, width, height, img2) ||
          antialiased(img2, x, y, width, height, img1))) {
          // one of the pixels is anti-aliasing; draw as yellow and do not count as difference
          // note that we do not include such pixels in a mask
          if (output && !options.diffMask) drawPixel(output, pos, aaR, aaG, aaB);

        } else {
          // found substantial difference not caused by anti-aliasing; draw it as red
          if (output) drawPixel(output, pos, diffR, diffG, diffB);
          diff++;
        }

      } else if (output) {
        // pixels are similar; draw background as grayscale image blended with white
        if (!options.diffMask) drawGrayPixel(img1, pos, options.alpha, output);
      }
    }
  }

  // return the number of different pixels
  return diff;
}

function isPixelData(arr) {
  // work around instanceof Uint8Array not working properly in some Jest environments
  return ArrayBuffer.isView(arr) && arr.constructor.BYTES_PER_ELEMENT === 1;
}

// check if a pixel is likely a part of anti-aliasing;
// based on "Anti-aliased Pixel and Intensity Slope Detector" paper by V. Vysniauskas, 2009

function antialiased(img, x1, y1, width, height, img2) {
  const x0 = Math.max(x1 - 1, 0);
  const y0 = Math.max(y1 - 1, 0);
  const x2 = Math.min(x1 + 1, width - 1);
  const y2 = Math.min(y1 + 1, height - 1);
  const pos = (y1 * width + x1) * 4;
  let zeroes = x1 === x0 || x1 === x2 || y1 === y0 || y1 === y2 ? 1 : 0;
  let min = 0;
  let max = 0;
  let minX, minY, maxX, maxY;

  // go through 8 adjacent pixels
  for (let x = x0; x <= x2; x++) {
    for (let y = y0; y <= y2; y++) {
      if (x === x1 && y === y1) continue;

      // brightness delta between the center pixel and adjacent one
      const delta = colorDelta(img, img, pos, (y * width + x) * 4, true);

      // count the number of equal, darker and brighter adjacent pixels
      if (delta === 0) {
        zeroes++;
        // if found more than 2 equal siblings, it's definitely not anti-aliasing
        if (zeroes > 2) return false;

        // remember the darkest pixel
      } else if (delta < min) {
        min = delta;
        minX = x;
        minY = y;

        // remember the brightest pixel
      } else if (delta > max) {
        max = delta;
        maxX = x;
        maxY = y;
      }
    }
  }

  // if there are no both darker and brighter pixels among siblings, it's not anti-aliasing
  if (min === 0 || max === 0) return false;

  // if either the darkest or the brightest pixel has 3+ equal siblings in both images
  // (definitely not anti-aliased), this pixel is anti-aliased
  return (hasManySiblings(img, minX, minY, width, height) && hasManySiblings(img2, minX, minY, width, height)) ||
    (hasManySiblings(img, maxX, maxY, width, height) && hasManySiblings(img2, maxX, maxY, width, height));
}

// check if a pixel has 3+ adjacent pixels of the same color.
function hasManySiblings(img, x1, y1, width, height) {
  const x0 = Math.max(x1 - 1, 0);
  const y0 = Math.max(y1 - 1, 0);
  const x2 = Math.min(x1 + 1, width - 1);
  const y2 = Math.min(y1 + 1, height - 1);
  const pos = (y1 * width + x1) * 4;
  let zeroes = x1 === x0 || x1 === x2 || y1 === y0 || y1 === y2 ? 1 : 0;

  // go through 8 adjacent pixels
  for (let x = x0; x <= x2; x++) {
    for (let y = y0; y <= y2; y++) {
      if (x === x1 && y === y1) continue;

      const pos2 = (y * width + x) * 4;
      if (img[pos] === img[pos2] &&
        img[pos + 1] === img[pos2 + 1] &&
        img[pos + 2] === img[pos2 + 2] &&
        img[pos + 3] === img[pos2 + 3]) zeroes++;

      if (zeroes > 2) return true;
    }
  }

  return false;
}

// calculate color difference according to the paper "Measuring perceived color difference
// using YIQ NTSC transmission color space in mobile applications" by Y. Kotsarenko and F. Ramos

function colorDelta(img1, img2, k, m, yOnly) {
  let r1 = img1[k + 0];
  let g1 = img1[k + 1];
  let b1 = img1[k + 2];
  let a1 = img1[k + 3];

  let r2 = img2[m + 0];
  let g2 = img2[m + 1];
  let b2 = img2[m + 2];
  let a2 = img2[m + 3];

  if (a1 === a2 && r1 === r2 && g1 === g2 && b1 === b2) return 0;

  if (a1 < 255) {
    a1 /= 255;
    r1 = blend(r1, a1);
    g1 = blend(g1, a1);
    b1 = blend(b1, a1);
  }

  if (a2 < 255) {
    a2 /= 255;
    r2 = blend(r2, a2);
    g2 = blend(g2, a2);
    b2 = blend(b2, a2);
  }

  const y = rgb2y(r1, g1, b1) - rgb2y(r2, g2, b2);

  if (yOnly) return y; // brightness difference only

  const i = rgb2i(r1, g1, b1) - rgb2i(r2, g2, b2);
  const q = rgb2q(r1, g1, b1) - rgb2q(r2, g2, b2);

  return 0.5053 * y * y + 0.299 * i * i + 0.1957 * q * q;
}

function rgb2y(r, g, b) { return r * 0.29889531 + g * 0.58662247 + b * 0.11448223; }
function rgb2i(r, g, b) { return r * 0.59597799 - g * 0.27417610 - b * 0.32180189; }
function rgb2q(r, g, b) { return r * 0.21147017 - g * 0.52261711 + b * 0.31114694; }

// blend semi-transparent color with white
function blend(c, a) {
  return 255 + (c - 255) * a;
}

function drawPixel(output, pos, r, g, b) {
  output[pos + 0] = r;
  output[pos + 1] = g;
  output[pos + 2] = b;
  output[pos + 3] = 255;
}

function drawGrayPixel(img, i, alpha, output) {
  const r = img[i + 0];
  const g = img[i + 1];
  const b = img[i + 2];
  const val = blend(rgb2y(r, g, b), alpha * img[i + 3] / 255);
  drawPixel(output, i, val, val, val);
}
/******************************************************************/
/************* PIXELMATCH SOURCE CODE ENDS HERE  ******************/
/******************************************************************/
