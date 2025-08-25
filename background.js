// Background script for ANDI extension
// Handles toolbar button clicks and injects ANDI using MAIN world to bypass CSP

chrome.action.onClicked.addListener((tab) => {
  // Inject and execute ANDI when the toolbar button is clicked
  // Using world: "main" to bypass CSP restrictions
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    world: "MAIN",
    func: launchANDI,
    args: [chrome.runtime.getURL('')]
  }).catch((error) => {
    console.error('Error launching ANDI:', error);
  });
});

// Function that will be injected and executed in the main page context
function launchANDI(extensionUrl) {
  // Set the ANDI host to point to the extension's bundled files
  // Remove the trailing slash to match expected format
  const andiHost = extensionUrl.replace(/\/$/, '') + '/andi/';
  
  // Create a comprehensive script that completely replaces the ANDI environment
  // This script will be inserted before andi.js loads
  const setupScript = document.createElement('script');
  setupScript.text = `
    // Set global variables that ANDI expects
    window.andiHost = "${andiHost}";
    
    // Override ANDI configuration before the main script loads
    // These will be available when andi.js executes
    var host_url = "${andiHost}";
    var help_url = host_url + "help/";
    var icons_url = host_url + "icons/";
    
    console.log('ANDI extension: host_url set to ' + host_url);
  `;
  document.head.appendChild(setupScript);
  
  // Small delay to ensure the setup script executes first
  setTimeout(function() {
    // Create and inject the ANDI script
    const andiScript = document.createElement('script');
    andiScript.src = andiHost + 'andi.js';
    andiScript.onload = function() {
      console.log('ANDI extension: Successfully loaded ANDI script');
    };
    andiScript.onerror = function() {
      console.error('ANDI extension: Failed to load ANDI script from ' + andiHost + 'andi.js');
      alert('Failed to load ANDI. Please check that the extension is properly installed.');
    };
    
    // Append the script to start ANDI
    document.body.appendChild(andiScript);
  }, 10);
}