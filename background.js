// Background script for ANDI extension
// Handles toolbar button clicks and communicates with content script

chrome.action.onClicked.addListener((tab) => {
  // Send a message to the content script to launch ANDI
  chrome.tabs.sendMessage(tab.id, {
    type: 'LAUNCH_ANDI',
    extensionUrl: chrome.runtime.getURL('')
  }).catch((error) => {
    console.error('Error communicating with content script:', error);
    // If content script is not ready, try injecting it manually
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content-script.js']
    }).then(() => {
      // Retry sending the message
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'LAUNCH_ANDI',
          extensionUrl: chrome.runtime.getURL('')
        });
      }, 100);
    }).catch((retryError) => {
      console.error('Error injecting content script:', retryError);
    });
  });
});