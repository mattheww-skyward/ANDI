# ANDI Demo Pages Manual Testing Guide

This guide provides instructions for manually testing ANDI functionality on the demo pages, complementing the automated tests.

## Quick Start Manual Testing

### 1. Open Demo Pages
Navigate to each demo page in your browser:
- `andi/help/demo/index.html` - Form page
- `andi/help/demo/demo2.html` - Radio buttons and table page  
- `andi/help/demo/demo3.html` - Completion page with dynamic content

### 2. Load ANDI
On each page, load ANDI by adding this to the browser console:
```javascript
var script = document.createElement('script');
script.src = 'https://www.ssa.gov/accessibility/andi/andi.js';
document.head.appendChild(script);
```

Or use the official ANDI bookmarklet from https://www.ssa.gov/accessibility/andi/help/install.html

### 3. Test Each Module

#### fANDI (Focusable Elements) - Default
- Should be active when ANDI loads
- Hover over form inputs, buttons, selects
- Check that elements are highlighted and show accessibility information
- Tab through form elements and verify focus highlighting

#### gANDI (Graphics/Images)  
- Switch to graphics module
- Test on demo3.html which has the superhero image
- Hover over images to see alt text analysis

#### lANDI (Links/Buttons)
- Switch to links/buttons module
- Test on all pages (footer links, navigation buttons)
- Verify button and link accessibility information

#### tANDI (Tables)
- Switch to tables module on demo2.html
- Should show "Super Hero Availability" table analysis
- Hover over table cells to see header associations
- Check that table structure is properly analyzed

#### sANDI (Structures)
- Switch to structures module
- Check heading structure (h1, h2, h3)
- Test aria-live region on demo3.html
- Verify landmark elements (main, header, footer)

#### cANDI (Color Contrast)
- Switch to color contrast module
- Check text/background color combinations
- Test warning text (red text on demo2.html)

#### hANDI (Hidden Content)
- Switch to hidden content module
- Check for any hidden elements
- Verify screen reader only content

#### iANDI (iframes)
- Should not be available on demo pages (no iframes)
- Module button should be grayed out

## Key Features to Test

### Navigation
- **Module Menu**: Hover to expand, keyboard navigation (arrow keys)
- **Page Navigation**: Use demo page buttons to move between pages
- **Focus Management**: Tab order should be logical and not interrupted by ANDI

### Element Highlighting
- Elements should be highlighted when hovered
- Active element should show border and ANDI information
- Multiple elements can be inspected sequentially

### ANDI UI Controls
- **Settings**: Click gear icon to open/close settings panel
- **Help**: Click help icon to open ANDI help in new window
- **Close**: Click X to remove ANDI from page
- **Relaunch**: ANDI should be removable and re-addable

### Accessibility Features
- ANDI should not interfere with existing page accessibility
- Screen reader announcements should work normally
- Keyboard navigation should remain functional
- Existing ARIA attributes should be preserved

## Expected Results by Page

### index.html (Form Page)
- **Available Modules**: f, g, l, s, c, h (NOT t or i)
- **Key Elements**: Text inputs, select dropdowns, button with accesskey
- **Accessibility Issues**: Some inputs missing proper labels (intentional for demo)

### demo2.html (Table and Radio Page)  
- **Available Modules**: f, g, l, t, s, c, h (NOT i)
- **Key Elements**: Radio button group, data table with headers, navigation buttons
- **Table Analysis**: Should show proper header/cell relationships in tANDI

### demo3.html (Completion Page)
- **Available Modules**: f, g, l, s, c, h (NOT t or i) 
- **Key Elements**: Image with alt text, aria-live region with dynamic updates
- **Dynamic Content**: Status text should update every 3 seconds
- **Live Region**: Should be detected in sANDI module

## Common Issues and Troubleshooting

### ANDI Won't Load
- Check browser console for JavaScript errors
- Verify internet connection (ANDI loads from ssa.gov)
- Try disabling browser extensions that might block scripts
- Check Content Security Policy restrictions

### Module Not Available
- tANDI only appears on pages with tables (demo2.html)
- iANDI only appears on pages with iframes (none in demo)
- cANDI may not be available in old browsers

### Element Not Highlighting
- Ensure ANDI has finished loading (loading animation stopped)
- Some elements may not be in ANDI's scope for the current module
- Try switching to the appropriate module for the element type

### Focus Issues
- ANDI may interfere with complex focus management
- Tab order should generally be preserved
- Use Escape key to return focus to ANDI if needed

## Modernization Testing Checklist

When testing ANDI during codebase modernization, verify:

### jQuery Compatibility
- [ ] ANDI loads with current jQuery version on page
- [ ] ANDI loads when no jQuery is present
- [ ] Custom pseudo-selectors (:focusable, :tabbable) work
- [ ] jQuery slim compatibility (slideUp/slideDown functions)

### Browser Compatibility
- [ ] Works in modern browsers (Chrome, Firefox, Safari, Edge)
- [ ] Handles browser-specific CSS prefixes
- [ ] Polyfills work correctly (Array.indexOf, etc.)

### CSS and Layout
- [ ] ANDI bar stays fixed at top of page
- [ ] Page layout not disrupted
- [ ] High z-index positioning works
- [ ] Fixed positioned elements converted to absolute

### Focus Management
- [ ] Tab order preserved
- [ ] Focus highlighting works
- [ ] Screen reader focus announcements work
- [ ] Keyboard navigation functional

### ARIA and Accessibility
- [ ] Existing ARIA attributes preserved
- [ ] ANDI-added attributes don't conflict
- [ ] Live regions continue working
- [ ] Landmark navigation preserved

This manual testing complements the automated tests and helps ensure ANDI remains functional during modernization efforts.