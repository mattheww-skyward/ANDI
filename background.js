// Background script for ANDI extension
// Handles toolbar button clicks, content script injection, and chrome.scripting operations

chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Inject the content script first
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content-script.js']
    });

  } catch (error) {
    console.error('Error injecting content script or launching ANDI:', error);
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.info("bg got message", message);
  if (message.type === 'ANDI_CONTENT_SCRIPT_REQUEST') {
    handleContentScriptRequest(message, sender.tab.id)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Indicates we will send a response asynchronously
  }
});

// Handle requests from content script
async function handleContentScriptRequest(message, tabId) {
  console.info("handling content script request");
  const { action, data } = message;

  try {
    switch (action) {
      case 'BOOTSTRAP_ANDI':
        return await bootstrapANDI(tabId);
      case 'INJECT_SCRIPT':
        return await injectScript(tabId, data);
      case 'INJECT_CSS':
        return await injectCSS(tabId, data);
      case 'REMOVE_ELEMENT':
        return await removeElement(tabId, data);
      default:
        throw new Error('Unknown action: ' + action);
    }
  } catch (error) {
    console.error('Error handling content script request:', error);
    throw error;
  }
}

// Inject a script using chrome.scripting.executeScript
async function injectScript(tabId, data) {
  const { src } = data;
  
  try {
    // Execute the script in the main world
    await chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      files: [
        src
      ],
    });

    return { success: true };
  } catch (error) {
    console.error('Error injecting script:', error);
    throw error;
  }
}

// Inject CSS using chrome.scripting.insertCSS
async function injectCSS(tabId, data) {
  const { href } = data;
  
  try {
    // Insert the CSS
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: [
        href
      ],
    });

    return { success: true };
  } catch (error) {
    console.error('Error injecting CSS:', error);
    throw error;
  }
}
