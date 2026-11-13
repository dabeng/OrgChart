// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

beforeEach(() => {
	cy.intercept('https://cdnjs.cloudflare.com/ajax/libs/es6-promise/**', {
		statusCode: 200, body: '', headers: { 'content-type': 'application/javascript' }
	});
	cy.intercept('https://dabeng.github.io/OrgChart/img/avatar/*.jpg', (request) => {
		const imageName = new URL(request.url).pathname.split('/').pop();
		request.reply({
			fixture: '../../demo/img/avatar/' + imageName,
			headers: { 'access-control-allow-origin': '*' }
		});
	});
	cy.intercept('https://cdnjs.cloudflare.com/ajax/libs/ol3/3.18.2/ol.css', { statusCode: 200, body: '' });
	cy.intercept('https://cdnjs.cloudflare.com/ajax/libs/ol3/3.18.2/ol.js', {
		statusCode: 200,
		headers: { 'content-type': 'application/javascript' },
		body: '(' + function installMapTestDouble() {
			class View {
				constructor(options) { this.center = options.center; }
				getCenter() { return this.center; }
				setCenter(center) { this.center = center; }
				getResolution() { return 1; }
			}
			class Map {
				constructor(options) { this.view = options.view; }
				getView() { return this.view; }
				beforeRender() {}
			}
			window.ol = {
				Map, View, layer: { Tile: class {} }, source: { XYZ: class {} },
				proj: { transform: (coordinates) => coordinates },
				animation: { pan: () => ({}), bounce: () => ({}) }
			};
		}.toString() + ')();'
	});
});

// Alternatively you can use CommonJS syntax:
// require('./commands')