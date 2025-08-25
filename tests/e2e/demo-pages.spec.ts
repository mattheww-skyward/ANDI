import { test, expect } from '@playwright/test';
import { AndiTestHelper } from './andi-helper';

test.describe('ANDI Demo Pages Tests', () => {
  let andiHelper: AndiTestHelper;

  test.beforeEach(async ({ page }) => {
    andiHelper = new AndiTestHelper(page);
  });

  test.describe('Demo Page 1 (index.html)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('index.html');
    });

    test('should load ANDI successfully', async ({ page }) => {
      await andiHelper.loadAndi();
      
      expect(await andiHelper.isAndiVisible()).toBe(true);
      await andiHelper.waitForAndiReady();
      
      // Check that ANDI title is visible
      await expect(page.locator('#ANDI508-toolName-heading')).toBeVisible();
    });

    test('should show all available modules', async ({ page }) => {
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
      
      const availableModules = await andiHelper.getAvailableModules();
      
      // Should have at least the default modules
      expect(availableModules).toContain('f'); // focusable elements
      expect(availableModules).toContain('g'); // graphics/images  
      expect(availableModules).toContain('l'); // links/buttons
      expect(availableModules).toContain('s'); // structures
      expect(availableModules).toContain('h'); // hidden content
      
      // Should NOT contain tables module on page 1 (no tables)
      expect(availableModules).not.toContain('t');
    });

    test('should default to focusable elements module', async ({ page }) => {
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
      
      const activeModule = await andiHelper.getActiveModule();
      expect(activeModule).toBe('f');
      
      // Check module name display
      await expect(page.locator('#ANDI508-module-name')).toContainText('f');
    });

    test('should allow switching between modules', async ({ page }) => {
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
      
      // Start with focusable elements
      expect(await andiHelper.getActiveModule()).toBe('f');
      
      // Switch to graphics/images
      await andiHelper.switchToModule('g');
      expect(await andiHelper.getActiveModule()).toBe('g');
      
      // Switch to links/buttons
      await andiHelper.switchToModule('l');
      expect(await andiHelper.getActiveModule()).toBe('l');
      
      // Switch to structures
      await andiHelper.switchToModule('s');
      expect(await andiHelper.getActiveModule()).toBe('s');
    });

    test('should highlight form elements when hovered', async ({ page }) => {
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
      
      // Test form input highlighting
      const hasHighlight = await andiHelper.testElementHighlighting('#who');
      expect(hasHighlight).toBe(true);
      
      // Test select element highlighting
      const selectHighlight = await andiHelper.testElementHighlighting('#ra-state');
      expect(selectHighlight).toBe(true);
      
      // Test button highlighting
      const buttonHighlight = await andiHelper.testElementHighlighting('#next1');
      expect(buttonHighlight).toBe(true);
    });

    test('should navigate to demo2 when Next button is clicked', async ({ page }) => {
      // Navigate using the page button (not ANDI)
      await page.click('#next1');
      
      // Should be on demo2.html
      expect(page.url()).toContain('demo2.html');
      
      // Check page content
      await expect(page.locator('h3')).toContainText('Page 2 of 2');
    });
  });

  test.describe('Demo Page 2 (demo2.html)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('demo2.html');
    });

    test('should load ANDI and show table module', async ({ page }) => {
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
      
      const availableModules = await andiHelper.getAvailableModules();
      
      // Should contain tables module on this page (has table)
      expect(availableModules).toContain('t');
    });

    test('should analyze table structure in tANDI module', async ({ page }) => {
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
      
      // Switch to tables module
      await andiHelper.switchToModule('t');
      
      // Check that tANDI is active
      expect(await andiHelper.getActiveModule()).toBe('t');
      
      // Hover over table to trigger analysis
      await page.hover('table');
      await page.waitForTimeout(500);
      
      // Should show table-related information
      const output = await andiHelper.getAndiOutput();
      expect(output).toBeTruthy();
    });

    test('should handle radio button groups correctly', async ({ page }) => {
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
      
      // Stay in focusable elements mode for form controls
      expect(await andiHelper.getActiveModule()).toBe('f');
      
      // Test radio button highlighting
      const radioHighlight = await andiHelper.testElementHighlighting('input[type="radio"]');
      expect(radioHighlight).toBe(true);
    });

    test('should provide navigation to previous and next pages', async ({ page }) => {
      // Test Previous button
      await page.click('#next1'); // Previous button (id naming is confusing)
      expect(page.url()).toContain('index.html');
      
      // Go back to demo2
      await page.goto('demo2.html');
      
      // Test Next button  
      await page.click('#next2');
      expect(page.url()).toContain('demo3.html');
    });
  });

  test.describe('Demo Page 3 (demo3.html)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('demo3.html');
    });

    test('should load ANDI and detect image content', async ({ page }) => {
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
      
      // Switch to graphics/images module
      await andiHelper.switchToModule('g');
      
      // Test image highlighting
      const imageHighlight = await andiHelper.testElementHighlighting('img[alt="superhero"]');
      expect(imageHighlight).toBe(true);
    });

    test('should detect dynamic content with aria-live', async ({ page }) => {
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
      
      // Switch to structures module to see aria-live regions
      await andiHelper.switchToModule('s');
      
      // Test aria-live region highlighting  
      const liveRegionHighlight = await andiHelper.testElementHighlighting('div[aria-live="polite"]');
      expect(liveRegionHighlight).toBe(true);
    });

    test('should handle dynamic text updates', async ({ page }) => {
      // Wait for the dynamic content to start updating
      await page.waitForTimeout(3500); // Script updates every 3 seconds
      
      // Check that the live region has content
      const liveContent = await page.textContent('#live');
      expect(liveContent).toBeTruthy();
      expect(liveContent).not.toBe('');
    });

    test('should navigate back to beginning', async ({ page }) => {
      await page.click('#another');
      expect(page.url()).toContain('index.html');
    });
  });

  test.describe('ANDI UI Controls', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('index.html');
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
    });

    test('should open and close settings panel', async ({ page }) => {
      await andiHelper.openSettings();
      
      // Settings should be visible
      await expect(page.locator('#ANDI508-settingsList')).toBeVisible();
      
      // Close by clicking elsewhere
      await page.click('#ANDI508-header');
      await page.waitForTimeout(500);
      
      // Settings should be hidden
      await expect(page.locator('#ANDI508-settingsList')).toBeHidden();
    });

    test('should navigate module menu with keyboard', async ({ page }) => {
      const canNavigate = await andiHelper.navigateModuleMenuWithKeyboard();
      expect(canNavigate).toBe(true);
    });

    test('should open help in new window', async ({ page, context }) => {
      // Listen for new page creation
      const pagePromise = context.waitForEvent('page');
      
      await andiHelper.openHelp();
      
      const newPage = await pagePromise;
      await newPage.waitForLoadState();
      
      // Check that help page opened
      expect(newPage.url()).toContain('ssa.gov');
      
      await newPage.close();
    });

    test('should close ANDI completely', async ({ page }) => {
      expect(await andiHelper.isAndiVisible()).toBe(true);
      
      await andiHelper.closeAndi();
      
      expect(await andiHelper.isAndiVisible()).toBe(false);
    });

    test('should relaunch ANDI on same page', async ({ page }) => {
      // Close ANDI first
      await andiHelper.closeAndi();
      expect(await andiHelper.isAndiVisible()).toBe(false);
      
      // Relaunch ANDI
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
      
      expect(await andiHelper.isAndiVisible()).toBe(true);
    });
  });

  test.describe('Cross-page ANDI behavior', () => {
    test('should maintain ANDI state when navigating between demo pages', async ({ page }) => {
      // Start on page 1
      await page.goto('index.html');
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
      
      // Switch to a specific module
      await andiHelper.switchToModule('g');
      expect(await andiHelper.getActiveModule()).toBe('g');
      
      // Navigate to page 2 via ANDI (not page navigation)
      await page.goto('demo2.html');
      
      // ANDI should not be loaded on the new page automatically
      expect(await andiHelper.isAndiVisible()).toBe(false);
      
      // Need to load ANDI again
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
      
      // Should start with default module
      expect(await andiHelper.getActiveModule()).toBe('f');
    });
  });

  test.describe('Modernization-sensitive features', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('index.html');
      await andiHelper.loadAndi();
      await andiHelper.waitForAndiReady();
    });

    test('should handle jQuery dependency correctly', async ({ page }) => {
      // Check that jQuery is available and ANDI loaded successfully
      const jqueryExists = await page.evaluate(() => {
        return typeof window.jQuery !== 'undefined' && typeof window.$ !== 'undefined';
      });
      
      expect(jqueryExists).toBe(true);
      expect(await andiHelper.isAndiVisible()).toBe(true);
    });

    test('should manage focus correctly', async ({ page }) => {
      // Focus on an input element
      await page.focus('#who');
      
      // ANDI should detect and highlight the focused element
      await page.waitForTimeout(300);
      
      const focusedElement = await page.evaluate(() => document.activeElement?.id);
      expect(focusedElement).toBe('who');
      
      // ANDI should show information about the focused element
      const output = await andiHelper.getAndiOutput();
      expect(output).toBeTruthy();
    });

    test('should handle CSS positioning without conflicts', async ({ page }) => {
      // Check that ANDI bar is positioned at top
      const andiPosition = await page.locator('#ANDI508').evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          position: style.position,
          top: style.top,
          zIndex: style.zIndex
        };
      });
      
      expect(andiPosition.position).toBe('fixed');
      expect(andiPosition.top).toBe('0px');
      expect(parseInt(andiPosition.zIndex)).toBeGreaterThan(1000);
    });

    test('should preserve ARIA attributes and roles', async ({ page }) => {
      // Check that ANDI doesn't interfere with existing ARIA attributes
      const ariaLabel = await page.getAttribute('main', 'aria-label');
      expect(ariaLabel).toBe('form'); // From index.html
      
      // Check that fieldset and radio group structure is preserved
      const fieldset = await page.locator('fieldset').first();
      await expect(fieldset).toBeVisible();
      
      // Radio buttons should maintain their grouping
      const radioButtons = await page.$$('input[type="radio"][name="hero"]');
      expect(radioButtons.length).toBeGreaterThan(0);
    });

    test('should handle legacy browser compatibility features', async ({ page }) => {
      // Test that ANDI loads without JavaScript errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      // Perform some ANDI operations
      await andiHelper.switchToModule('g');
      await andiHelper.switchToModule('l');
      await page.hover('#who');
      await page.focus('#ra-state');
      
      // Should not have thrown any errors
      const andiErrors = errors.filter(error => 
        error.toLowerCase().includes('andi') || 
        error.toLowerCase().includes('jquery')
      );
      expect(andiErrors).toHaveLength(0);
    });
  });
});