import Page from './page-model';

fixture `Local Datasource`
  .page `../../../demo/local-datasource.html`;

const page = new Page();
const laolao = page.laolao;
const bomiao = page.bomiao;
const sumiao = page.sumiao;
const hongmiao = page.hongmiao;
const tiehua = page.tiehua;
const heihei = page.heihei;
const pangpang = page.pangpang;
const dandan = page.dandan;

test('bottomEdge of root node works well', async t => {
  await t
      .hover(laolao)
      .click(laolao.find('.bottomEdge'))
      .expect(bomiao.visible).notOk()
      .expect(sumiao.visible).notOk()
      .expect(hongmiao.visible).notOk()
      .hover(laolao)
      .click(laolao.find('.bottomEdge'))
      .expect(bomiao.visible).ok()
      .expect(sumiao.visible).ok()
      .expect(hongmiao.visible).ok();
});

test('topEdge of sumiao node works well', async t => {
  await t
      .hover(sumiao)
      .click(sumiao.find('.topEdge'))
      .expect(laolao.visible).notOk()
      .expect(bomiao.visible).notOk()
      .expect(hongmiao.visible).notOk()
      .hover(sumiao)
      .click(sumiao.find('.topEdge'))
      .expect(laolao.visible).ok()
      .expect(bomiao.visible).notOk()
      .expect(hongmiao.visible).notOk();
});

test('leftEdge of sumiao node works well', async t => {
  await t
      .hover(sumiao)
      .click(sumiao.find('.leftEdge'))
      .expect(bomiao.visible).notOk()
      .expect(hongmiao.visible).notOk()
      .hover(sumiao)
      .click(sumiao.find('.leftEdge'))
      .expect(bomiao.visible).ok()
      .expect(hongmiao.visible).ok();
});

test('rightEdge of sumiao node works well', async t => {
  await t
      .hover(sumiao)
      .click(sumiao.find('.rightEdge'))
      .expect(hongmiao.visible).notOk()
      .expect(hongmiao.visible).notOk()
      .hover(sumiao)
      .click(sumiao.find('.rightEdge'))
      .expect(bomiao.visible).ok()
      .expect(hongmiao.visible).ok();
});

test('bottomEdge of sumiao node works well', async t => {
  await t
      .hover(sumiao)
      .click(sumiao.find('.bottomEdge'))
      .expect(tiehua.visible).notOk()
      .expect(heihei.visible).notOk()
      .expect(pangpang.visible).notOk()
      .expect(dandan.visible).notOk()
      .hover(sumiao)
      .click(sumiao.find('.bottomEdge'))
      .expect(tiehua.visible).ok()
      .expect(heihei.visible).ok()
      .expect(pangpang.visible).ok();
});

test('topEdge of heihei node works well', async t => {
  await t
      .hover(heihei)
      .click(heihei.find('.topEdge'))
      .expect(laolao.visible).notOk()
      .expect(bomiao.visible).notOk()
      .expect(sumiao.visible).notOk()
      .expect(hongmiao.visible).notOk()
      .expect(tiehua.visible).notOk()
      .expect(pangpang.visible).notOk()
      .hover(heihei)
      .click(heihei.find('.topEdge'))
      .expect(sumiao.visible).ok()
      .expect(laolao.visible).notOk();
});

test('horizontalEdge of heihei node works well', async t => {
  await t
      .hover(heihei)
      .click(heihei.find('.topEdge'))
      /* take into account the transition settings in jquery.orgchart.css
       *  .orgchart .node {
       *    transition: transform 0.3s, opacity 0.3s;
       *  }
       */
      .wait(500)
      .click(heihei.find('.leftEdge'))
      .expect(sumiao.visible).ok()
      .expect(tiehua.visible).ok()
      .expect(pangpang.visible).ok()
      .expect(laolao.visible).notOk();
});

test('horizontalEdge of pangpang node works well', async t => {
  await t
      .hover(pangpang)
      .click(pangpang.find('.leftEdge'))
      .expect(tiehua.visible).notOk()
      .expect(heihei.visible).notOk()
      .expect(dandan.visible).notOk()
      .click(pangpang.find('.leftEdge'))
      .expect(tiehua.visible).ok()
      .expect(heihei.visible).ok()
});