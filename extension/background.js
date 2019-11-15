"use strict"

let count = 0

chrome.tabs.onCreated.addListener(tab => {
  console.log("tab created")
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.status === "complete" &&
    tab.active
  ) {
    // send a message to content.js to add event handlers to DOM
    // wait for message saying that it was successful
    // now everytime a tab is done loading, the DOM will have onload and onblur handlers
    // possible to assign the two functions to ref of capture_tab?
    console.log(`done loading tab #${++count}`)
    captureTab()
  }
})

function captureTab() {
  console.log("inside capturetab")
  chrome.tabs.captureVisibleTab(
    chrome.windows.WINDOW_ID_CURRENT,
    { format: "png" },
    dataURI => {
      console.log("captured tab")
      if (chrome.runtime.lastError) {
        return
      }
      chrome.storage.local.get({ captured: [] }, s => {
        if (dataURI !== undefined) {
          s.captured.push(dataURI)
          console.log(`dataURI: ${dataURI}`)
          console.log(`uint8array: ${convertDataURIToBinary(dataURI)}`)
          chrome.storage.local.set({ captured: s.captured }, () => {
            console.log("pushed to local storage")
          })
        } else {
          console.info("dataURI undefined")
        }
      })
    }
  )
}

function debugChangeInfo(changeInfo) {
  console.log("==== changeInfo details ====")
  for (let prop in changeInfo) console.log(prop, changeInfo[prop])
  console.log("============================")
}

function convertDataURIToBinary(dataURI) {
  let BASE64_MARKER = ";base64,"
  let base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length
  let base64 = dataURI.substring(base64Index)
  let raw = window.atob(base64)
  let rawLength = raw.length
  let array = new Uint8Array(new ArrayBuffer(rawLength))

  for (let i = 0; i < rawLength; i++) array[i] = raw.charCodeAt(i)

  return array
}
