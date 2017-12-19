import { Selector } from 'testcafe';

fixture `Local Datasource`
  .page `127.0.0.1:3000/local-datasource.html`;

test('bottomEdge of root node', async t => {
  await t
      .hover(Selector('#n1'))
      .click(Selector('#n1').find('.bottomEdge'))
      .expect(Selector('#n3').visible).notOk()
      .hover(Selector('#n1'))
      .click(Selector('#n1').find('.bottomEdge'))
      .expect(Selector('#n3').visible).ok();
});