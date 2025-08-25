// Content script for ANDI extension
// This script runs on every page to enable ANDI functionality

// This content script is minimal since the main functionality
// is handled by the background script injecting the ANDI loader directly
// The content script exists to ensure the extension has proper access to pages

// Listen for messages from the background script if needed
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkANDI') {
    // Check if ANDI is already running
    const andiExists = document.getElementById('ANDI508') !== null;
    sendResponse({ andiRunning: andiExists });
  }
  return true; // Keep the message channel open for async response
});

// Optional: Log that the content script is loaded
console.log('ANDI extension content script loaded');