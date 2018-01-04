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
      .expect(heihei.parent(1).sibling(':last-child').find('.node').count).eql(2);
});

test('load parent node of sumiao', async t => {
  await t
      .hover(sumiao)
      .click(sumiao.find('.topEdge'))
      .expect(sumiao.parent(4).sibling(':first-child').find('.title').textContent).eql('Lao Lao');
});

test('load parent and sibling nodes of sumiao', async t => {
  await t
      .hover(sumiao)
      .click(sumiao.find('.leftEdge'))
      .expect(sumiao.parent(4).sibling(':first-child').find('.title').textContent).eql('Lao Lao')
      .expect(sumiao.parent(3).sibling().count).eql(7);
});