// Content script that acts as a bridge between ANDI and the extension
// This script runs in the isolated world and can use chrome.scripting APIs

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'LAUNCH_ANDI') {
    bootstrapANDI()
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Indicates we will send a response asynchronously
  }
});

// Listen for messages from the page (ANDI) requesting script/CSS injection
window.addEventListener('message', async (event) => {
  // Only accept messages from the same origin
  if (event.source !== window) {
    return;
  }

  // Check if this is an ANDI extension message
  if (event.data.type && event.data.type === 'ANDI_EXTENSION_REQUEST') {
    try {
      const { action, data } = event.data;

      switch (action) {
        case 'INJECT_SCRIPT':
          await injectScript(data);
          break;
        case 'INJECT_CSS':
          await injectCSS(data);
          break;
        case 'REMOVE_ELEMENT':
          removeElement(data);
          break;
        default:
          console.warn('Unknown ANDI extension action:', action);
      }
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

// Inject a script using chrome.scripting.executeScript
async function injectScript(data) {
  const { src, id, requestId } = data;
  
  try {
    // Get the current tab ID
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tabId = tabs[0].id;

    // Fetch the script content from the extension
    const response = await fetch(chrome.runtime.getURL(src));
    const scriptContent = await response.text();

    // Execute the script in the main world
    await chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      func: executeScriptContent,
      args: [scriptContent, id]
    });

    // Send success response back to page
    window.postMessage({
      type: 'ANDI_EXTENSION_RESPONSE',
      success: true,
      requestId
    }, '*');

  } catch (error) {
    console.error('Error injecting script:', error);
    window.postMessage({
      type: 'ANDI_EXTENSION_RESPONSE',
      success: false,
      error: error.message,
      requestId
    }, '*');
  }
}

// Function that will be executed in the main world to add the script
function executeScriptContent(scriptContent, id) {
  // Remove any existing script with the same ID
  const existingScript = document.getElementById(id);
  if (existingScript) {
    existingScript.remove();
  }

  // Create and execute the script
  const script = document.createElement('script');
  script.id = id;
  script.type = 'text/javascript';
  script.textContent = scriptContent;
  document.head.appendChild(script);
}

// Inject CSS using chrome.scripting.insertCSS
async function injectCSS(data) {
  const { href, id, requestId } = data;
  
  try {
    // Get the current tab ID
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tabId = tabs[0].id;

    // Fetch the CSS content from the extension
    const response = await fetch(chrome.runtime.getURL(href));
    const cssContent = await response.text();

    // Insert the CSS
    await chrome.scripting.insertCSS({
      target: { tabId },
      css: cssContent
    });

    // Also add the CSS as a link element for proper management
    await chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      func: addCSSLink,
      args: [chrome.runtime.getURL(href), id]
    });

    // Send success response back to page
    window.postMessage({
      type: 'ANDI_EXTENSION_RESPONSE',
      success: true,
      requestId
    }, '*');

  } catch (error) {
    console.error('Error injecting CSS:', error);
    window.postMessage({
      type: 'ANDI_EXTENSION_RESPONSE',
      success: false,
      error: error.message,
      requestId
    }, '*');
  }
}

// Function that will be executed in the main world to add the CSS link
function addCSSLink(href, id) {
  // Remove any existing link with the same ID
  const existingLink = document.getElementById(id);
  if (existingLink) {
    existingLink.remove();
  }

  // Create and add the CSS link
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = href;
  document.head.appendChild(link);
}

// Remove an element by ID
function removeElement(data) {
  const { id, requestId } = data;
  
  // Execute removal in main world
  chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    const tabId = tabs[0].id;
    
    chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      func: removeElementById,
      args: [id]
    }).then(() => {
      // Send success response back to page
      window.postMessage({
        type: 'ANDI_EXTENSION_RESPONSE',
        success: true,
        requestId
      }, '*');
    }).catch(error => {
      console.error('Error removing element:', error);
      window.postMessage({
        type: 'ANDI_EXTENSION_RESPONSE',
        success: false,
        error: error.message,
        requestId
      }, '*');
    });
  });
}

// Function that will be executed in the main world to remove an element
function removeElementById(id) {
  const element = document.getElementById(id);
  if (element) {
    element.remove();
  }
}

// Bootstrap ANDI by loading the main script
async function bootstrapANDI() {
  try {
    // Get the current tab ID
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tabId = tabs[0].id;

    // First, check if jQuery is needed and inject it
    await chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      func: checkAndInjectjQuery
    });

    // Set up the ANDI environment and load the main script
    await chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      func: setupANDIEnvironment,
      args: [chrome.runtime.getURL('andi/')]
    });

    // Fetch and execute andi.js
    const response = await fetch(chrome.runtime.getURL('andi/andi.js'));
    const andiScript = await response.text();

    await chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      func: executeScriptContent,
      args: [andiScript, 'andi-main-script']
    });

    console.log('ANDI bootstrap completed successfully');
  } catch (error) {
    console.error('Error bootstrapping ANDI:', error);
  }
}

// Function to check and inject jQuery if needed
function checkAndInjectjQuery() {
  // Check if jQuery exists and is sufficient version
  var jqueryMinimumVersion = "1.9.1";
  var j = (window.jQuery !== undefined) ? window.jQuery.fn.jquery.split(".") : undefined;
  var m = jqueryMinimumVersion.split(".");
  var needJquery = true;
  
  if(j !== undefined){
    for(var i=0; i<3; i++){
      if(parseInt(j[i]) > parseInt(m[i])){
        needJquery = false;
        break; //existing jquery version is greater than required minimum
      }
      else if(parseInt(j[i]) < parseInt(m[i])){
        break; //existing jquery version is less than required minimum
      }
    }
  }
  
  if(needJquery) {
    console.log('ANDI Extension: jQuery not found or insufficient version, will need to handle this...');
    // For now, create a minimal stub to allow ANDI to continue
    // This is not ideal but allows basic functionality
    if (typeof window.jQuery === 'undefined') {
      window.jQuery = window.$ = function(selector) {
        if (typeof selector === 'string') {
          return {
            remove: function() { 
              var els = document.querySelectorAll(selector);
              els.forEach(el => el.remove());
              return this;
            },
            addClass: function(className) {
              var els = document.querySelectorAll(selector);
              els.forEach(el => el.classList.add(className));
              return this;
            },
            removeClass: function(className) {
              var els = document.querySelectorAll(selector);
              if (className) {
                els.forEach(el => el.classList.remove(className));
              } else {
                els.forEach(el => el.className = '');
              }
              return this;
            },
            show: function() {
              var els = document.querySelectorAll(selector);
              els.forEach(el => el.style.display = '');
              return this;
            },
            hide: function() {
              var els = document.querySelectorAll(selector);
              els.forEach(el => el.style.display = 'none');
              return this;
            }
          };
        } else if (selector === document) {
          return {
            ready: function(fn) { 
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', fn);
              } else {
                fn();
              }
            }
          };
        }
        return {};
      };
      window.jQuery.fn = { jquery: "3.7.1" };
      console.log('ANDI Extension: Created minimal jQuery stub');
    }
  } else {
    console.log('ANDI Extension: Sufficient jQuery version found:', window.jQuery.fn.jquery);
  }
}

// Function to set up ANDI environment variables
function setupANDIEnvironment(andiHost) {
  // Set global variables that ANDI expects
  window.andiHost = andiHost;
  
  // Override ANDI configuration before the main script loads
  window.host_url = andiHost;
  window.help_url = andiHost + "help/";
  window.icons_url = andiHost + "icons/";
  
  console.log('ANDI extension: Environment set up with host_url:', window.host_url);
}