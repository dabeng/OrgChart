const { defineConfig } = require("cypress");
const { readdirSync } = require('node:fs');
const path = require('node:path');

module.exports = defineConfig({
  screenshotsFolder: "test/cypress/screenshots",
  videosFolder: "test/cypress/videos",
  numTestsKeptInMemory: 0,
  manageBrowserMemory: true,
  expose: {
    chartDemoPages: readdirSync(path.join(__dirname, 'demo'))
      .filter((name) => name.endsWith('.html') && name !== 'index.html').sort()
  },
  e2e: {
    supportFile: "test/cypress/support/e2e.{js,jsx,ts,tsx}",
    specPattern: "test/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
