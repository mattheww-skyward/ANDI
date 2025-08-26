// Content script that acts as a bridge between ANDI and the extension
// This script runs in the isolated world and forwards requests to background script

// Listen for messages from the page (ANDI) requesting script/CSS injection
window.addEventListener('message', async (event) => {
  console.log("content script got message", event);
  // Only accept messages from the same origin
  if (event.source !== window) {
    return;
  }

  // Check if this is an ANDI extension request
  if (event.data.type && event.data.type === 'ANDI_EXTENSION_REQUEST') {
    try {
      const { action, data } = event.data;
      console.log("forwarding request to bg script");

      // Forward the request to the background script
      const response = await chrome.runtime.sendMessage({
        type: 'ANDI_CONTENT_SCRIPT_REQUEST',
        action: action,
        data: data
      });

      // Send the response back to the page
      window.postMessage({
        type: 'ANDI_EXTENSION_RESPONSE',
        success: response.success,
        error: response.error,
        requestId: event.data.requestId
      }, '*');

    } catch (error) {
      console.error('Error handling ANDI extension request:', error);
      // Send error back to page
      window.postMessage({
        type: 'ANDI_EXTENSION_RESPONSE',
        success: false,
        error: error.message,
        requestId: event.data.requestId
      }, '*');
    }
  }
});

// Bootstrap ANDI by loading the main script
async function bootstrapANDI() {
  try {
    // Request background script to inject jQuery check and ANDI setup
    await chrome.runtime.sendMessage({
      type: 'ANDI_CONTENT_SCRIPT_REQUEST',
      action: 'INJECT_SCRIPT',
      data: {
        src: "/andi/andi.js",
      },
    });

    console.log('ANDI bootstrap completed successfully');
  } catch (error) {
    console.error('Error bootstrapping ANDI:', error);
    throw error;
  }
}
bootstrapANDI();
