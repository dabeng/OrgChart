import { Selector } from 'testcafe';
import Page from './page-model';

fixture `Refresh orgchart with new options`
  .page `../../../demo/reload-data.html`;

const page = new Page();
const loadChart1 = page.loadChart1;
const loadChart2 = page.loadChart2;
const loadChart3 = page.loadChart3;

test('load chart2', async t => {
  await t
      .click(loadChart2)
      .expect(Selector('.node').count).eql(3);
});

test('load chart3', async t => {
  await t
      .click(loadChart3)
      .expect(Selector('.node').count).eql(4);
});

test('load chart1', async t => {
  await t
      .click(loadChart1)
      .expect(Selector('.node').count).eql(9);
});