"use strict";

// This doesn't work when document is interactive.
// document.addEventListener("DOMContentLoaded", event => {
//     let focusCapture, refocusCapture, blurCapture;
//     console.log("The DOM is fully loaded.");
// });

// if (document.readyState === "interactive" || document.readyState === "complete") {
//     console.log("The DOM is ready!");
// }

console.log("From content.js!");

window.onfocus = focusFunction;
window.onblur = blurFunction;

function focusFunction() {
  console.log("I'm in focus.");
}

function blurFunction() {
  console.log("I'm blurred.");
}
