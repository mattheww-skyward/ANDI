// Background script for ANDI extension
// Handles toolbar button clicks, content script injection, and chrome.scripting operations

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

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("bg got message", message);
  if (message.type === 'ANDI_CONTENT_SCRIPT_REQUEST') {
    handleContentScriptRequest(message, sender.tab.id)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Indicates we will send a response asynchronously
  }
});

// Handle requests from content script
async function handleContentScriptRequest(message, tabId) {
  console.log("handling content script request");
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

// Bootstrap ANDI by injecting necessary scripts
async function bootstrapANDI(tabId) {
  try {
    // todo: handle jquery
    // doesn't matter for now
    //await chrome.scripting.executeScript({
    //  target: { tabId },
    //  world: 'MAIN',
    //  func: checkAndInjectjQuery
    //});

    // Set up the ANDI environment and load the main script
    await chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      func: setupANDIEnvironment,
      args: [chrome.runtime.getURL('andi/')]
    });

    await chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      files: [
        "andi/andi.js",
      ],
    });

    return { success: true };
  } catch (error) {
    console.error('Error bootstrapping ANDI:', error);
    throw error;
  }
}

// Inject a script using chrome.scripting.executeScript
async function injectScript(tabId, data) {
  const { src, id } = data;
  
  try {
    // Fetch the script content from the extension
    const response = await fetch(chrome.runtime.getURL(src));
    const scriptContent = await response.text();

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
  const { href, id } = data;
  
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

// Remove an element by ID
async function removeElement(tabId, data) {
  const { id } = data;
  
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      func: removeElementById,
    });

    return { success: true };
  } catch (error) {
    console.error('Error removing element:', error);
    throw error;
  }
}

// Function that will be executed in the main world to remove an element
function removeElementById(id) {
  const element = document.getElementById(id);
  if (element) {
    element.remove();
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
    console.log('ANDI Extension: jQuery not found or insufficient version, creating minimal stub...');
    // Create a more comprehensive jQuery stub
    if (typeof window.jQuery === 'undefined') {
      window.jQuery = window.$ = function(selector) {
        var elements = [];
        
        if (typeof selector === 'string') {
          elements = Array.from(document.querySelectorAll(selector));
        } else if (selector === document) {
          return {
            ready: function(fn) { 
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', fn);
              } else {
                fn();
              }
              return this;
            }
          };
        } else if (selector && selector.nodeType) {
          elements = [selector];
        }
        
        return {
          length: elements.length,
          each: function(fn) {
            elements.forEach((el, index) => fn.call(el, index, el));
            return this;
          },
          remove: function() { 
            elements.forEach(el => el.remove());
            return this;
          },
          addClass: function(className) {
            elements.forEach(el => el.classList.add(className));
            return this;
          },
          removeClass: function(className) {
            if (className) {
              elements.forEach(el => el.classList.remove(className));
            } else {
              elements.forEach(el => el.className = '');
            }
            return this;
          },
          show: function() {
            elements.forEach(el => el.style.display = '');
            return this;
          },
          hide: function() {
            elements.forEach(el => el.style.display = 'none');
            return this;
          },
          css: function(prop, value) {
            if (value !== undefined) {
              elements.forEach(el => el.style[prop] = value);
              return this;
            } else if (typeof prop === 'object') {
              elements.forEach(el => {
                for (let key in prop) {
                  el.style[key] = prop[key];
                }
              });
              return this;
            } else {
              return elements[0] ? window.getComputedStyle(elements[0])[prop] : '';
            }
          },
          attr: function(name, value) {
            if (value !== undefined) {
              elements.forEach(el => el.setAttribute(name, value));
              return this;
            } else {
              return elements[0] ? elements[0].getAttribute(name) : '';
            }
          },
          removeAttr: function(name) {
            elements.forEach(el => el.removeAttribute(name));
            return this;
          },
          html: function(content) {
            if (content !== undefined) {
              elements.forEach(el => el.innerHTML = content);
              return this;
            } else {
              return elements[0] ? elements[0].innerHTML : '';
            }
          },
          append: function(content) {
            elements.forEach(el => {
              if (typeof content === 'string') {
                el.insertAdjacentHTML('beforeend', content);
              } else {
                el.appendChild(content);
              }
            });
            return this;
          },
          prepend: function(content) {
            elements.forEach(el => {
              if (typeof content === 'string') {
                el.insertAdjacentHTML('afterbegin', content);
              } else {
                el.insertBefore(content, el.firstChild);
              }
            });
            return this;
          },
          find: function(selector) {
            var found = [];
            elements.forEach(el => {
              found = found.concat(Array.from(el.querySelectorAll(selector)));
            });
            return window.jQuery(found);
          },
          parent: function() {
            var parents = elements.map(el => el.parentNode).filter(p => p);
            return window.jQuery(parents);
          },
          first: function() {
            return window.jQuery(elements[0] || []);
          },
          focus: function() {
            if (elements[0]) elements[0].focus();
            return this;
          },
          click: function(handler) {
            if (handler) {
              elements.forEach(el => el.addEventListener('click', handler));
            } else {
              if (elements[0]) elements[0].click();
            }
            return this;
          },
          on: function(event, handler) {
            elements.forEach(el => el.addEventListener(event, handler));
            return this;
          }
        };
      };
      
      window.jQuery.fn = { jquery: "3.7.1" };
      window.jQuery.extend = function(target, source) {
        for (let key in source) {
          target[key] = source[key];
        }
        return target;
      };
      
      console.log('ANDI Extension: Created comprehensive jQuery stub');
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
