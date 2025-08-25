# ANDI Browser Extension

This is a Manifest v3 browser extension that provides the ANDI (Accessible Name & Description Inspector) accessibility testing tool as a browser extension, compatible with both Chrome and Firefox.

## About ANDI

ANDI is an accessibility testing tool that reveals the accessible name and description of elements on a web page. It helps developers and testers identify accessibility issues and ensure their web content is accessible to users with disabilities.

## Installation

### Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `extension` folder
4. The ANDI extension should now appear in your browser toolbar

### Firefox
1. Open Firefox and go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Navigate to the `extension` folder and select the `manifest.json` file
4. The ANDI extension should now appear in your browser toolbar

## Usage

1. Navigate to any web page you want to test for accessibility
2. Click the ANDI extension icon in your browser toolbar
3. ANDI will load and overlay its interface on the current page
4. Use ANDI's tools to inspect accessibility features of page elements

## Features

- Compatible with both Chrome and Firefox
- Works on all websites (subject to Content Security Policy restrictions)
- Includes all ANDI modules and functionality
- No modification of ANDI source files required

## Content Security Policy (CSP)

Some websites have Content Security Policies that may prevent ANDI from loading. If you encounter issues:

1. Check the browser console for CSP errors
2. Consider temporarily disabling CSP for testing (see ANDI help documentation)
3. Or ask the website owner to whitelist ANDI scripts

## Technical Details

This extension:
- Uses Manifest v3 for modern browser compatibility
- Injects ANDI scripts using the browser extension APIs
- Bundles all ANDI files within the extension for offline use
- Maintains compatibility with the original ANDI bookmarklet functionality

## License

ANDI is developed by the Social Security Administration and is in the public domain.