const { defineConfig } = require("cypress");

module.exports = defineConfig({
  screenshotsFolder: "test/cypress/screenshots",
  videosFolder: "test/cypress/videos",
  e2e: {
    supportFile: "test/cypress/support/e2e.{js,jsx,ts,tsx}",
    specPattern: "test/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
