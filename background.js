// Background script for ANDI extension
// Handles toolbar button clicks and injects content script

chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Inject the content script first
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content-script.js']
    });

    // Give the content script a moment to set up its message listeners
    setTimeout(() => {
      // Send a message to the content script to launch ANDI
      chrome.tabs.sendMessage(tab.id, {
        type: 'LAUNCH_ANDI',
        extensionUrl: chrome.runtime.getURL('')
      }).catch((error) => {
        console.error('Error communicating with content script:', error);
      });
    }, 100);

  } catch (error) {
    console.error('Error injecting content script or launching ANDI:', error);
  }
});