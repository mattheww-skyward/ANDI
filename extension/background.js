// Background script for ANDI extension
// Handles toolbar button clicks and communicates with content script

chrome.action.onClicked.addListener((tab) => {
  // Inject and execute ANDI when the toolbar button is clicked
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: launchANDI,
    args: [chrome.runtime.getURL('')]
  }).catch((error) => {
    console.error('Error launching ANDI:', error);
  });
});

// Function that will be injected and executed in the page context
function launchANDI(extensionUrl) {
  // Set the ANDI host to point to the extension's bundled files
  // Remove the trailing slash to match expected format
  const andiHost = extensionUrl.replace(/\/$/, '') + '/andi/';
  
  // We need to override the host_url variable before andi.js loads
  // Create a script that sets up the environment for ANDI
  const setupScript = document.createElement('script');
  setupScript.text = `
    // Override the default host_url before ANDI loads
    var host_url = "${andiHost}";
    var help_url = host_url + "help/";
    var icons_url = host_url + "icons/";
  `;
  document.head.appendChild(setupScript);
  
  // Create and inject the ANDI script
  const andiScript = document.createElement('script');
  andiScript.src = andiHost + 'andi.js';
  andiScript.onerror = function() {
    console.error('Failed to load ANDI script');
    alert('Failed to load ANDI. Please check that the extension is properly installed.');
  };
  
  // CSP check function - same as in the original bookmarklet
  function andiCSPcheck() {
    if (typeof window.andiVersionNumber === 'undefined') {
      alert('This page has a Content Security Policy that blocks scripts like ANDI. For help, visit the ANDI Help FAQ page.');
      window.open(andiHost + 'help/faq.html#csp');
    }
  }
  
  // Add CSP violation listener
  document.addEventListener('securitypolicyviolation', andiCSPcheck);
  
  // Clean up the listener after a short delay
  setTimeout(function() {
    document.removeEventListener('securitypolicyviolation', andiCSPcheck);
  }, 100);
  
  // Append the script to start ANDI
  document.body.appendChild(andiScript);
}