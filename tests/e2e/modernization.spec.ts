import { test, expect } from '@playwright/test';
import { AndiTestHelper } from './andi-helper';

test.describe('ANDI Modernization Compatibility Tests', () => {
  let andiHelper: AndiTestHelper;

  test.beforeEach(async ({ page }) => {
    andiHelper = new AndiTestHelper(page);
  });

  test.describe('jQuery Dependency Tests', () => {
    test('should load correct jQuery version', async ({ page }) => {
      await page.goto('index.html');
      await andiHelper.loadAndi();
      
      const jqueryVersion = await page.evaluate(() => {
        return window.jQuery?.fn?.jquery;
      });
      
      expect(jqueryVersion).toBeTruthy();
      // Should be at least version 1.9.1 (minimum) or 3.7.1 (preferred)
      const versionParts = jqueryVersion.split('.');
      const majorVersion = parseInt(versionParts[0]);
      expect(majorVersion).toBeGreaterThanOrEqual(1);
    });

    test('should handle jQuery slim compatibility', async ({ page }) => {
      await page.goto('index.html');
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
      
      // Test slideUp/slideDown functions that ANDI polyfills for jQuery slim
      const hasSlideUp = await page.evaluate(() => {
        return typeof window.jQuery?.fn?.slideUp === 'function';
      });
      
      const hasSlideDown = await page.evaluate(() => {
        return typeof window.jQuery?.fn?.slideDown === 'function';
      });
      
      expect(hasSlideUp).toBe(true);
      expect(hasSlideDown).toBe(true);
    });

    test('should define custom jQuery selectors', async ({ page }) => {
      await page.goto('index.html');
      await andiHelper.loadAndi();
      
      // Test :focusable and :tabbable pseudo-selectors
      const customSelectors = await page.evaluate(() => {
        const $ = window.jQuery;
        return {
          focusable: typeof $.expr.pseudos.focusable === 'function',
          tabbable: typeof $.expr.pseudos.tabbable === 'function',
          data: typeof $.expr.pseudos.data === 'function'
        };
      });
      
      expect(customSelectors.focusable).toBe(true);
      expect(customSelectors.tabbable).toBe(true);
      expect(customSelectors.data).toBe(true);
    });
  });

  test.describe('Focus Management Tests', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('demo2.html'); // Page with radio buttons and table
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
    });

    test('should identify focusable elements correctly', async ({ page }) => {
      const focusableElements = await page.evaluate(() => {
        const $ = window.jQuery;
        return $(':focusable').length;
      });
      
      expect(focusableElements).toBeGreaterThan(0);
    });

    test('should identify tabbable elements correctly', async ({ page }) => {
      const tabbableElements = await page.evaluate(() => {
        const $ = window.jQuery;
        return $(':tabbable').length;
      });
      
      expect(tabbableElements).toBeGreaterThan(0);
    });

    test('should handle focus events without interference', async ({ page }) => {
      // Focus on first radio button
      await page.focus('input[type="radio"]:first-of-type');
      
      // Use arrow keys to navigate between radio buttons
      await page.keyboard.press('ArrowDown');
      
      // Check that focus moved correctly
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBe('INPUT');
    });

    test('should maintain tabindex management', async ({ page }) => {
      // Check that ANDI doesn't interfere with existing tabindex values
      const tabindexValues = await page.evaluate(() => {
        const elements = document.querySelectorAll('[tabindex]');
        return Array.from(elements).map(el => ({
          tag: el.tagName,
          tabindex: el.getAttribute('tabindex')
        }));
      });
      
      // Should find elements with appropriate tabindex values
      expect(tabindexValues.length).toBeGreaterThan(0);
    });
  });

  test.describe('CSS and Positioning Tests', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('index.html');
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
    });

    test('should not break existing page layout', async ({ page }) => {
      // Check that main content is still visible and positioned correctly
      const mainElement = await page.locator('main');
      await expect(mainElement).toBeVisible();
      
      const mainBounds = await mainElement.boundingBox();
      expect(mainBounds).toBeTruthy();
      expect(mainBounds!.width).toBeGreaterThan(0);
      expect(mainBounds!.height).toBeGreaterThan(0);
    });

    test('should handle z-index stacking correctly', async ({ page }) => {
      const andiZIndex = await page.locator('#ANDI508').evaluate(el => {
        return parseInt(window.getComputedStyle(el).zIndex);
      });
      
      // ANDI should have a high z-index to appear above page content
      expect(andiZIndex).toBeGreaterThan(1000);
    });

    test('should convert fixed positioning appropriately', async ({ page }) => {
      // ANDI should convert any existing fixed positioning to absolute
      // This is mentioned in the TestPageData.firstLaunchedModulePrep function
      
      // Add a fixed positioned element to test
      await page.evaluate(() => {
        const testEl = document.createElement('div');
        testEl.id = 'test-fixed-element';
        testEl.style.position = 'fixed';
        testEl.style.top = '10px';
        testEl.style.right = '10px';
        testEl.style.width = '100px';
        testEl.style.height = '100px';
        testEl.style.backgroundColor = 'red';
        document.body.appendChild(testEl);
      });
      
      // Reload ANDI to trigger the position conversion
      await andiHelper.closeAndi();
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
      
      // Check if the fixed element's position was converted
      const position = await page.evaluate(() => {
        const el = document.getElementById('test-fixed-element');
        return el ? window.getComputedStyle(el).position : null;
      });
      
      // The position should be converted to absolute by ANDI
      expect(position).toBe('absolute');
    });
  });

  test.describe('ARIA and Accessibility Tests', () => {
    test('should preserve existing ARIA attributes', async ({ page }) => {
      await page.goto('demo2.html');
      
      // Check ARIA attributes before ANDI
      const ariaBeforeAndi = await page.evaluate(() => {
        const elements = document.querySelectorAll('[aria-labelledby]');
        return Array.from(elements).map(el => ({
          tag: el.tagName,
          ariaLabelledby: el.getAttribute('aria-labelledby')
        }));
      });
      
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
      
      // Check ARIA attributes after ANDI
      const ariaAfterAndi = await page.evaluate(() => {
        const elements = document.querySelectorAll('[aria-labelledby]');
        return Array.from(elements).map(el => ({
          tag: el.tagName,
          ariaLabelledby: el.getAttribute('aria-labelledby')
        }));
      });
      
      // ARIA attributes should be preserved
      expect(ariaAfterAndi).toEqual(ariaBeforeAndi);
    });

    test('should handle aria-live regions correctly', async ({ page }) => {
      await page.goto('demo3.html');
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
      
      // Check that aria-live region is detected
      const liveRegion = await page.locator('[aria-live="polite"]');
      await expect(liveRegion).toBeVisible();
      
      // Switch to structures module to see live regions
      await andiHelper.switchToModule('s');
      
      // Hover over the live region
      await andiHelper.testElementHighlighting('[aria-live="polite"]');
    });

    test('should add ANDI attributes without conflicts', async ({ page }) => {
      await page.goto('index.html');
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
      
      // Hover over an element to trigger ANDI analysis
      await page.hover('#who');
      await page.waitForTimeout(500);
      
      // Check for ANDI-specific attributes
      const andiAttributes = await page.evaluate(() => {
        const element = document.getElementById('who');
        const attrs = element?.attributes;
        const andiAttrs = [];
        
        if (attrs) {
          for (let i = 0; i < attrs.length; i++) {
            if (attrs[i].name.includes('andi508') || attrs[i].name.includes('ANDI508')) {
              andiAttrs.push(attrs[i].name);
            }
          }
        }
        
        return andiAttrs;
      });
      
      expect(andiAttributes.length).toBeGreaterThan(0);
    });
  });

  test.describe('Legacy Browser Compatibility', () => {
    test('should handle Array.indexOf polyfill', async ({ page }) => {
      await page.goto('index.html');
      await andiHelper.loadAndi();
      
      // Test Array.indexOf functionality
      const hasIndexOf = await page.evaluate(() => {
        return typeof Array.prototype.indexOf === 'function';
      });
      
      expect(hasIndexOf).toBe(true);
    });

    test('should handle old IE detection', async ({ page }) => {
      await page.goto('index.html');
      await andiHelper.loadAndi();
      
      // Check that ANDI loaded without errors regardless of browser
      expect(await andiHelper.isAndiVisible()).toBe(true);
    });

    test('should load appropriate jQuery version for browser', async ({ page }) => {
      await page.goto('index.html');
      await andiHelper.loadAndi();
      
      const jqueryVersion = await page.evaluate(() => {
        return window.jQuery?.fn?.jquery;
      });
      
      // Should load a compatible jQuery version
      expect(jqueryVersion).toBeTruthy();
      
      // Modern browsers should get the preferred version (3.7.1)
      // This test runs in modern browsers, so should get 3.x
      const majorVersion = parseInt(jqueryVersion.split('.')[0]);
      expect(majorVersion).toBeGreaterThanOrEqual(3);
    });
  });

  test.describe('Error Handling and Robustness', () => {
    test('should handle missing elements gracefully', async ({ page }) => {
      await page.goto('index.html');
      
      // Remove an element that ANDI might try to interact with
      await page.evaluate(() => {
        const element = document.getElementById('who');
        element?.remove();
      });
      
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
      
      // ANDI should still load successfully
      expect(await andiHelper.isAndiVisible()).toBe(true);
    });

    test('should handle CSP restrictions gracefully', async ({ page }) => {
      await page.goto('index.html');
      
      // Monitor for CSP violations
      const cspViolations: string[] = [];
      page.on('console', msg => {
        if (msg.text().includes('Content Security Policy')) {
          cspViolations.push(msg.text());
        }
      });
      
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
      
      // Should not have CSP violations for basic demo pages
      expect(cspViolations).toHaveLength(0);
    });

    test('should handle page refresh and relaunch', async ({ page }) => {
      await page.goto('index.html');
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
      
      // Reload the page
      await page.reload();
      
      // ANDI should be gone after reload
      expect(await andiHelper.isAndiVisible()).toBe(false);
      
      // Should be able to load ANDI again
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
      
      expect(await andiHelper.isAndiVisible()).toBe(true);
    });
  });
});