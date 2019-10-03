const { toMatchImageSnapshot } = require("jest-image-snapshot");

expect.extend({ toMatchImageSnapshot });

describe('orgchart -- visual regression tests', () => {
  beforeAll(async () => {
    await page.goto(
      `file:${require('path').join(__dirname, '../../../demo/pan-zoom.html')}`
    );
  });

  it('zoomin correctly', async () => {
    await page.$eval('#chart-container', el => {
      const syntheticEvent = new WheelEvent('wheel', {
        deltaY: -1,
        deltaMode: 0
      });
      el.dispatchEvent(syntheticEvent);
    });
    const image = await page.screenshot();
    expect(image).toMatchImageSnapshot();
  });

  it('zoomout correctly', async () => {
    await page.reload();
    await page.$eval('#chart-container', el => {
      const syntheticEvent = new WheelEvent('wheel', {
        deltaY: 1,
        deltaMode: 0
      });
      el.dispatchEvent(syntheticEvent);
    });
    const image = await page.screenshot();
    expect(image).toMatchImageSnapshot();
  });
});
