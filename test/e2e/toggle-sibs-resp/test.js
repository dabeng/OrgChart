import Page from './page-model';

fixture `Toggle sibling nodes respectively`
  .page `../../../demo/toggle-sibs-resp.html`;

const page = new Page();
const laolao = page.laolao;
const bomiao = page.bomiao;
const sumiao = page.sumiao;
const hongmiao = page.hongmiao;
const renwu = page.renwu;
const lixin = page.lixin;
const xingan = page.xingan;
const yidian = page.yidian;

test('toggle the left side sibling nodes of sumiao', async t => {
  await t
      .hover(sumiao)
      .click(sumiao.find('.leftEdge'))
      .expect(bomiao.visible).notOk()
      .expect(renwu.visible).notOk()
      .expect(lixin.visible).notOk()
      .click(sumiao.find('.leftEdge'))
      .expect(bomiao.visible).ok()
      .expect(renwu.visible).notOk()
      .expect(lixin.visible).notOk();
});

test('toggle the right side sibling nodes of sumiao', async t => {
  await t
      .hover(sumiao)
      .click(sumiao.find('.rightEdge'))
      .expect(hongmiao.visible).notOk()
      .expect(xingan.visible).notOk()
      .expect(yidian.visible).notOk()
      .click(sumiao.find('.rightEdge'))
      .expect(hongmiao.visible).ok()
      .expect(xingan.visible).notOk()
      .expect(yidian.visible).notOk();
});