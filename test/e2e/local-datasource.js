import { Selector } from 'testcafe';

fixture `Getting Started`
  .page `localhost:3000/local-datasource.html`;

test('My first test', async t => {
  await t
      .hover(Selector('#n1'))
      .click(Selector('#n1').find('.bottomEdge'))
      .expect(Selector('#n3').visible).notOk();
});