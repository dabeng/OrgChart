import { Selector } from 'testcafe';
import Page from './page-model';

fixture `Pan & Zoom`
  .page `../../../demo/pan-zoom.html`;

const page = new Page();
const chart = page.chart;

test('drag the chart to the top', async t => {
  await t
      .drag(chart, 0, -200, { offsetX: 10, offsetY: 300 })
      // .expect(chart.style).contains({transform: 'matrix(1, 0, 0, 1, 0, -200)'});
      .expect(chart.getAttribute('style')).contains('transform: matrix(1, 0, 0, 1, 0, -200)');
});

test('drag the chart to the bottom', async t => {
  await t
      .drag(chart, 0, 200, { offsetX: 10, offsetY: 10 })
      .expect(chart.getAttribute('style')).contains('transform: matrix(1, 0, 0, 1, 0, 200)');
});

test('drag the chart to the left', async t => {
  await t
      .drag(chart, -200, 0, { offsetX: 300, offsetY: 10 })
      .expect(chart.getAttribute('style')).contains('transform: matrix(1, 0, 0, 1, -200, 0)');
});

test('drag the chart to the right', async t => {
  await t
      .drag(chart, 200, 0, { offsetX: 10, offsetY: 10 })
      .expect(chart.getAttribute('style')).contains('transform: matrix(1, 0, 0, 1, 200, 0)');
});