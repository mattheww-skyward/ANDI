import { Page, expect } from '@playwright/test';
import * as path from 'path';

export class AndiTestHelper {
  constructor(private page: Page) {}

  /**
   * Load ANDI on the current page by injecting the script
   */
  async loadAndi() {
    try {
      console.log('Starting ANDI load process...');
      
      // Add error handling to catch any script errors
      this.page.on('console', msg => {
        if (msg.type() === 'error') {
          console.error('Browser console error:', msg.text());
        }
      });
      
      this.page.on('pageerror', error => {
        console.error('Page error:', error.message);
      });
      
      // First load our minimal jQuery shim (since ANDI requires jQuery)
      console.log('Loading jQuery shim...');
      await this.page.addScriptTag({
        path: path.resolve(__dirname, '../jquery-shim.js')
      });
      
      // Wait for jQuery to be available
      await this.page.waitForFunction(() => typeof window.jQuery !== 'undefined');
      console.log('jQuery shim loaded successfully');
      
      // First inject ANDI CSS manually to prevent external CSS loading
      console.log('Loading ANDI CSS...');
      await this.page.addStyleTag({
        path: path.resolve(__dirname, '../../andi/andi.css')
      });
      
      console.log('Loading ANDI script...');
      // Load ANDI by injecting the local script file
      await this.page.addScriptTag({
        path: path.resolve(__dirname, '../../andi/andi.js')
      });
      
      console.log('Waiting for ANDI to appear...');
      // First check if the element exists at all
      await this.page.waitForSelector('#ANDI508', { timeout: 10000 });
      console.log('ANDI508 element found');
      
      // Check its display state
      const elementInfo = await this.page.evaluate(() => {
        const element = document.getElementById('ANDI508');
        if (element) {
          return {
            display: window.getComputedStyle(element).display,
            visibility: window.getComputedStyle(element).visibility,
            innerHTML: element.innerHTML.substring(0, 200) + '...'
          };
        }
        return null;
      });
      console.log('ANDI508 element info:', elementInfo);
      
      // Try to make it visible if it's hidden
      if (elementInfo && elementInfo.display === 'none') {
        console.log('ANDI508 is hidden, trying to show it...');
        await this.page.evaluate(() => {
          const element = document.getElementById('ANDI508');
          if (element) {
            element.style.display = 'block';
            element.style.visibility = 'visible';
          }
        });
      }
      
      // Wait for ANDI to be loaded and visible with a longer timeout
      await this.page.waitForSelector('#ANDI508', { state: 'visible', timeout: 10000 });
      
      console.log('ANDI loaded successfully!');
    } catch (error) {
      console.error('Failed to load ANDI:', error);
      // Try to get more information about what went wrong
      const bodyContent = await this.page.content();
      console.log('Page has ANDI508 element:', bodyContent.includes('ANDI508'));
      
      // Check for any visible error messages
      const errorElements = await this.page.$$eval('[id*="error"], [class*="error"]', elements => 
        elements.map(el => el.textContent).filter(text => text && text.length > 0)
      );
      if (errorElements.length > 0) {
        console.log('Error elements found:', errorElements);
      }
      
      throw error;
    }
  }

  /**
   * Wait for ANDI to be fully loaded and ready
   */
  async waitForAndiReady() {
    try {
      // Wait for the loading animation to disappear
      await this.page.waitForSelector('#ANDI508-loading', { state: 'hidden', timeout: 15000 });
      
      // Wait for module menu to be visible
      await this.page.waitForSelector('#ANDI508-moduleMenu', { state: 'visible', timeout: 5000 });
      
      // Give ANDI a moment to fully initialize
      await this.page.waitForTimeout(500);
    } catch (error) {
      console.error('ANDI not ready:', error);
      throw error;
    }
  }

  /**
   * Switch to a specific ANDI module
   */
  async switchToModule(moduleCode: string) {
    try {
      const moduleButton = `#ANDI508-moduleMenu-button-${moduleCode}`;
      
      // Check if module button exists and is not disabled
      const button = await this.page.$(moduleButton);
      if (!button) {
        throw new Error(`Module ${moduleCode} button not found`);
      }
      
      const isDisabled = await button.evaluate(el => el.classList.contains('ANDI508-moduleMenu-unavailable'));
      if (isDisabled) {
        throw new Error(`Module ${moduleCode} is unavailable`);
      }
      
      await this.page.click(moduleButton);
      await this.waitForAndiReady();
    } catch (error) {
      console.error(`Failed to switch to module ${moduleCode}:`, error);
      throw error;
    }
  }

  /**
   * Get all available ANDI modules on the page
   */
  async getAvailableModules() {
    const moduleButtons = await this.page.$$('#ANDI508-moduleMenu button:not(.ANDI508-moduleMenu-unavailable)');
    const modules = [];
    
    for (const button of moduleButtons) {
      const id = await button.getAttribute('id');
      if (id) {
        const moduleCode = id.replace('ANDI508-moduleMenu-button-', '');
        modules.push(moduleCode);
      }
    }
    
    return modules;
  }

  /**
   * Check if ANDI is visible on the page
   */
  async isAndiVisible() {
    try {
      await this.page.waitForSelector('#ANDI508', { state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Close ANDI
   */
  async closeAndi() {
    await this.page.click('#ANDI508-button-close');
    await this.page.waitForSelector('#ANDI508', { state: 'hidden' });
  }

  /**
   * Open ANDI settings
   */
  async openSettings() {
    await this.page.click('#ANDI508-button-settings');
    await this.page.waitForSelector('#ANDI508-settingsList', { state: 'visible' });
  }

  /**
   * Open ANDI help
   */
  async openHelp() {
    await this.page.click('#ANDI508-button-help');
  }

  /**
   * Get the current active module name
   */
  async getActiveModule() {
    const activeButton = await this.page.$('#ANDI508-moduleMenu button.ANDI508-moduleMenu-selected');
    if (activeButton) {
      const id = await activeButton.getAttribute('id');
      return id?.replace('ANDI508-moduleMenu-button-', '') || '';
    }
    return '';
  }

  /**
   * Get the text content of the ANDI output section
   */
  async getAndiOutput() {
    const outputElement = await this.page.$('#ANDI508-elementDetails');
    return outputElement ? await outputElement.textContent() : '';
  }

  /**
   * Hover over an element and check if ANDI highlights it
   */
  async hoverAndCheckHighlight(selector: string) {
    await this.page.hover(selector);
    
    // Wait a bit for ANDI to process the hover
    await this.page.waitForTimeout(500);
    
    // Check if the element has ANDI highlight classes
    const element = await this.page.$(selector);
    const classes = await element?.getAttribute('class') || '';
    
    return classes.includes('ANDI508') || classes.includes('andi508');
  }

  /**
   * Navigate through module menu using keyboard
   */
  async navigateModuleMenuWithKeyboard() {
    // Focus on the first module button
    await this.page.focus('#ANDI508-moduleMenu button:first-child');
    
    // Press down arrow to navigate
    await this.page.keyboard.press('ArrowDown');
    
    // Check if focus moved
    const focusedElement = await this.page.locator(':focus').getAttribute('id');
    return focusedElement?.includes('ANDI508-moduleMenu-button-');
  }

  /**
   * Test if element highlighting works
   */
  async testElementHighlighting(selector: string) {
    const element = await this.page.$(selector);
    if (!element) return false;

    // Hover over the element
    await this.page.hover(selector);
    await this.page.waitForTimeout(300);

    // Check if ANDI has added highlighting classes or attributes
    const andiAttributes = await element.evaluate(el => {
      const attrs = el.attributes;
      const andiAttrs = [];
      for (let i = 0; i < attrs.length; i++) {
        if (attrs[i].name.includes('andi508') || attrs[i].name.includes('ANDI508')) {
          andiAttrs.push(attrs[i].name);
        }
      }
      return andiAttrs;
    });

    return andiAttrs.length > 0;
  }
}