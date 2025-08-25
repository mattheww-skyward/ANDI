# ANDI Browser Extension - Installation & Usage Guide

## Quick Start

The ANDI (Accessible Name & Description Inspector) browser extension provides the same functionality as the ANDI bookmarklet but as a convenient browser extension that works with both Chrome and Firefox.

## Installation

### Google Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" using the toggle in the top-right corner
3. Click "Load unpacked"
4. Select the `extension` folder from this repository
5. The ANDI extension icon should appear in your browser toolbar

### Mozilla Firefox
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Navigate to the `extension` folder and select `manifest.json`
4. The ANDI extension icon should appear in your browser toolbar

## Usage

1. **Navigate** to any webpage you want to test for accessibility
2. **Click** the ANDI extension icon in your browser toolbar
3. **Wait** for ANDI to load and overlay its interface on the page
4. **Use** ANDI's tools to inspect the accessibility features of page elements

## Features

- ✅ **Chrome & Firefox Compatible**: Works with both major browsers
- ✅ **Manifest v3**: Uses the latest extension standard  
- ✅ **Complete ANDI Suite**: Includes all ANDI modules (fANDI, gANDI, hANDI, etc.)
- ✅ **No Source Modifications**: Original ANDI files remain unchanged
- ✅ **Offline Capable**: All ANDI files are bundled with the extension
- ✅ **CSP Handling**: Includes Content Security Policy error detection

## Technical Details

### How It Works

The extension replicates the functionality of the ANDI bookmarklet:

1. **Toolbar Button Click**: User clicks the ANDI extension icon
2. **Script Injection**: Background script injects configuration code into the page
3. **Host Override**: Sets `host_url` to point to the extension's bundled ANDI files
4. **ANDI Loading**: Loads `andi.js` and associated resources from the extension
5. **Interface Display**: ANDI's accessibility testing interface appears on the page

### Files Structure

```
extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (handles toolbar clicks)
├── content.js            # Content script (minimal)
├── README.md             # Documentation
├── icons/                # Extension icons
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-128.png
└── andi/                 # Complete ANDI installation
    ├── andi.js           # Main ANDI script
    ├── andi.css          # Main ANDI styles
    ├── [module].js       # ANDI modules (fandi.js, gandi.js, etc.)
    ├── [module].css      # Module styles
    ├── help/             # Help documentation
    └── icons/            # ANDI UI icons
```

### Browser Compatibility

| Browser | Manifest v3 | Status |
|---------|-------------|--------|
| Chrome 88+ | ✅ Full Support | ✅ Tested |
| Firefox 109+ | ✅ Full Support | ✅ Compatible |
| Edge 88+ | ✅ Full Support | ✅ Should Work |

## Troubleshooting

### ANDI Won't Load
- Check browser console for error messages
- Verify extension is enabled in browser settings
- Try refreshing the page and clicking the extension icon again

### Content Security Policy (CSP) Errors
Some websites block external scripts. If ANDI won't load:
- Check for CSP errors in the browser console
- Consider temporarily disabling CSP for testing (see ANDI FAQ)
- Ask the website owner to whitelist ANDI extension scripts

### Extension Installation Issues
- Ensure you're selecting the correct `extension` folder
- Check that all files are present (run the validation test)
- Try reloading the extension in browser settings

## Development & Testing

To test the extension during development:

```bash
# Run the validation test
node /tmp/test-extension.js

# Start a local web server for testing
cd /path/to/test/pages
python3 -m http.server 8080
```

## License

ANDI is developed by the Social Security Administration and is in the public domain. This extension wrapper maintains the same license status.