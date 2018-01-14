import Page from './page-model';

fixture `Hybrid(horizontal + vertical) Chart`
  .page `../../../demo/vertical-level.html`;

const page = new Page();
const sumiao = page.sumiao;
const tiehua = page.tiehua;
const heihei = page.heihei;
const pangpang = page.pangpang;
const dandan = page.dandan;
const erdan = page.erdan;
const sandan = page.sandan;
const sidan = page.sidan;
const wudan = page.wudan;

test('toggle the vertical nodes', async t => {
  await t
      .click(dandan.find('.toggleBtn'))
      .expect(erdan.visible).ok()
      .expect(sandan.visible).ok()
      .expect(sidan.visible).notOk()
      .expect(wudan.visible).notOk()
      .click(heihei.find('.toggleBtn'))
      .expect(pangpang.visible).notOk()
      .expect(dandan.visible).notOk()
      .expect(erdan.visible).notOk()
      .expect(sandan.visible).notOk()
      .click(heihei.find('.toggleBtn'))
      .expect(pangpang.visible).ok()
      .expect(dandan.visible).ok();
});

test('toggle the vertical nodes by cicking horizontal nodes', async t => {
  await t
      .hover(sumiao)
      .click(sumiao.find('.bottomEdge'))
      .expect(tiehua.visible).notOk()
      .expect(heihei.visible).notOk()
      .expect(pangpang.visible).notOk()
      .expect(dandan.visible).notOk()
      .click(sumiao.find('.bottomEdge'))
      .expect(tiehua.visible).ok()
      .expect(heihei.visible).ok()
      .expect(pangpang.visible).ok()
      .expect(dandan.visible).ok();
});