import Page from './page-model';

fixture `Load data on-demand`
  .page `../../../demo/ondemand-loading-data.html`;

const page = new Page();
const sumiao = page.sumiao;
const heihei = page.heihei;

test('load the descendants of hehei', async t => {
  await t
      .hover(heihei)
      .click(heihei.find('.bottomEdge'))
      .expect(heihei.sibling('.nodes').child('.hierarchy').count).eql(2);
});

test('load the ancestors of sumiao by expanding vertically', async t => {
  await t
      .hover(sumiao)
      .click(sumiao.find('.topEdge'))
      .expect(sumiao.parent(1).sibling('.node').withText('Lao Lao').count).eql(1)
      .expect(sumiao.parent(0).sibling().count).eql(7);
});

test('load the ancestors of sumiao by expanding horizontally', async t => {
  await t
      .hover(sumiao)
      .click(sumiao.find('.leftEdge'))
      .expect(sumiao.parent(1).sibling('.node').withText('Lao Lao').count).eql(1)
      .expect(sumiao.parent(0).sibling().count).eql(7);
});