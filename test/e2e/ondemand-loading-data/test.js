import Page from './page-model';

fixture `Load data on-demand`
  .page `../../../demo/ondemand-loading-data.html`;

const page = new Page();
const sumiao = page.sumiao;
const heihei = page.heihei;

test('load child nodes of hehei', async t => {
  await t
      .hover(heihei)
      .click(heihei.find('.bottomEdge'))
      .expect(heihei.sibling('.nodes').child('.hierarchy').count).eql(2);
});

test('load parent node of sumiao', async t => {
  await t
      .hover(sumiao)
      .click(sumiao.find('.topEdge'))
      .expect(sumiao.parent(1).sibling('.node').withText('Lao Lao').count).eql(1);
});

test('load parent and sibling nodes of sumiao', async t => {
  await t
      .hover(sumiao)
      .click(sumiao.find('.leftEdge'))
      .expect(sumiao.parent(1).sibling('.node').withText('Lao Lao').count).eql(1)
      .expect(sumiao.parent(0).sibling().count).eql(7);
});