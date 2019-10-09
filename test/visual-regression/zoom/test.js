const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

const config = {
  failureThreshold: 0.02,
  failureThresholdType: 'percent'
};

describe('orgchart -- visual regression tests', () => {
  beforeAll(async () => {
    await page.setViewport({
      width: 1680,
      height: 450,
      deviceScaleFactor: 1,
    });
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
    expect(image).toMatchImageSnapshot(config);
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
    expect(image).toMatchImageSnapshot(config);
  });
});
