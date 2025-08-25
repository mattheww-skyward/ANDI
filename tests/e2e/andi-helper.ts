import { Page, expect } from '@playwright/test';

export class AndiTestHelper {
  constructor(private page: Page) {}

  /**
   * Load ANDI on the current page by injecting the script
   */
  async loadAndi() {
    // Load ANDI by injecting the script directly
    await this.page.addScriptTag({
      url: 'https://www.ssa.gov/accessibility/andi/andi.js'
    });
    
    // Wait for ANDI to be loaded and visible
    await this.page.waitForSelector('#ANDI508', { state: 'visible', timeout: 10000 });
  }

  /**
   * Wait for ANDI to be fully loaded and ready
   */
  async waitForAndiReady() {
    // Wait for the loading animation to disappear
    await this.page.waitForSelector('#ANDI508-loading', { state: 'hidden', timeout: 10000 });
    
    // Wait for module menu to be visible
    await this.page.waitForSelector('#ANDI508-moduleMenu', { state: 'visible' });
  }

  /**
   * Switch to a specific ANDI module
   */
  async switchToModule(moduleCode: string) {
    const moduleButton = `#ANDI508-moduleMenu-button-${moduleCode}`;
    await this.page.click(moduleButton);
    await this.waitForAndiReady();
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