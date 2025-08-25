# ANDI - Accessible Name and Description Inspector

ANDI is a web accessibility testing tool, now available as a modern browser extension.

## What does ANDI do?
1.	Automatically detects accessibility issues
2.	Suggests ways to improve accessibility
3.	Reveals what a screen reader should say for interactive elements

## What problem does ANDI solve?

For many web developers, accessibility is an unfamiliar and complex territory and therefore often neglected. ANDI bridges the gap between developers and end users by revealing
where accessibility issues occur on the page. To accomplish this, it analyzes the HTML of the web page being tested and extracts accessibility related markup.

#### Developers like ANDI because:

* It's easy to install, quick to run, and helps satisfy accessibility requirements.

#### Testers like ANDI because:
* It saves them time by automatically finding potential defects and offering solutions.

#### End Users Ultimately Benefit:
* When web pages are accessible, everyone can efficiently perceive, understand, navigate, and interact with the Web.

## Sounds handy! How do I install ANDI?

### Browser Extension (Recommended)

This repository provides ANDI as a modern Manifest v3 browser extension that works with Chrome and Firefox:

1. **Chrome**: Go to `chrome://extensions/`, enable Developer mode, click "Load unpacked", and select this folder
2. **Firefox**: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select `manifest.json`

See [INSTALL.md](INSTALL.md) for detailed installation instructions.

### Traditional Bookmarklet

Users can also visit the [official installation page](https://www.ssa.gov/accessibility/andi/help/install.html) for traditional bookmarklet installation instructions.

If an organization wishes to host its own fork or copy of ANDI, [see this page for alternate hosting instructions](https://www.ssa.gov/accessibility/andi/help/install.html#github).

## How can I make ANDI better?

If you would like to contribute to ANDI's development, some background knowledge of accessibility would certainly be helpful. ANDI is written in javascript, jquery, html, and CSS. Knowledge of javascript optimization and DOM manipulation is crucial to maintaining ANDI's quick agility.

## What areas of accessibility does ANDI cover?

ANDI offers the ability to inspect focusable elements, images, data tables, page structure, color contrast, in-depth link and button analysis, and hidden content detection.

## Who maintains ANDI?

ANDI is maintained by the Accessible Solutions Branch at SSA.
