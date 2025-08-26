# ANDI Demo Pages Tests

This directory contains comprehensive end-to-end tests for the ANDI (Accessible Name and Description Inspector) demo pages. The tests are designed to validate ANDI functionality and ensure compatibility during codebase modernization.

## Test Coverage

### Demo Pages Tests (`demo-pages.spec.ts`)
- **Page Loading**: Tests that ANDI loads successfully on all demo pages
- **Module Functionality**: Tests all ANDI modules (fANDI, gANDI, lANDI, tANDI, sANDI, cANDI, hANDI, iANDI)
- **Element Highlighting**: Validates that elements are properly highlighted and analyzed
- **Navigation**: Tests navigation between demo pages and ANDI UI controls
- **Dynamic Content**: Tests handling of aria-live regions and dynamic updates

### Modernization Compatibility Tests (`modernization.spec.ts`)
- **jQuery Dependency**: Tests jQuery version loading and compatibility features
- **Focus Management**: Validates focus handling and custom pseudo-selectors
- **CSS and Positioning**: Tests layout preservation and z-index management
- **ARIA Attributes**: Ensures ARIA attributes are preserved and handled correctly
- **Legacy Browser Support**: Tests polyfills and compatibility features
- **Error Handling**: Tests robustness and graceful error handling

## Demo Pages Structure

1. **index.html** - Form page with various input types, selects, and buttons
2. **demo2.html** - Page with radio buttons, data table, and navigation controls
3. **demo3.html** - Completion page with image, dynamic content, and aria-live region

## ANDI Modules Tested

- **f** (fANDI) - Focusable elements (default)
- **g** (gANDI) - Graphics/images
- **l** (lANDI) - Links/buttons
- **t** (tANDI) - Tables (available on demo2.html)
- **s** (sANDI) - Structures
- **c** (cANDI) - Color contrast
- **h** (hANDI) - Hidden content
- **i** (iANDI) - Iframes

## Prerequisites

- Node.js (version 14 or higher)
- Playwright browsers installed

## Installation

```bash
cd tests
npm install
npx playwright install
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in headed mode (visible browser)
```bash
npm run test:headed
```

### Run tests in debug mode
```bash
npm run test:debug
```

### Run specific test file
```bash
npx playwright test demo-pages.spec.ts
npx playwright test modernization.spec.ts
```

### Run tests with specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
```

## Test Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## Key Test Features

### AndiTestHelper Class
The tests use a helper class (`andi-helper.ts`) that provides:
- ANDI loading and initialization
- Module switching functionality
- Element highlighting verification
- UI control interaction methods

### Modernization Focus
Tests specifically target features that could break during modernization:
- jQuery dependency management
- Legacy browser compatibility code
- Focus management and custom selectors
- CSS positioning and z-index handling
- ARIA attribute preservation

### Error Detection
Tests monitor for:
- JavaScript errors during ANDI operations
- Console warnings and CSP violations
- Layout disruption
- Focus management issues
- Module switching failures

## Continuous Integration

These tests are designed to be run in CI environments to catch regressions during:
- Dependency updates (especially jQuery)
- Browser compatibility changes
- CSS modernization
- JavaScript refactoring
- Accessibility feature modifications

## Test Data

Tests use the existing demo pages without modification, ensuring they validate real-world ANDI usage scenarios.

## Troubleshooting

### Common Issues

1. **Tests timeout waiting for ANDI**: Check that demo pages are accessible via file:// protocol
2. **Module not available**: Some modules (like tANDI) are only available on pages with relevant content
3. **Flaky highlighting tests**: Element highlighting may need additional wait time for ANDI processing

### Debug Tips

- Use `--headed` mode to visually inspect test execution
- Add `await page.pause()` in tests to debug interactively
- Check browser console for JavaScript errors
- Verify ANDI loads properly before running module tests