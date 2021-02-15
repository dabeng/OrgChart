import { Selector } from 'testcafe';
import Page from './page-model';

fixture `Drag & Drop`
  .page `../../../demo/drag-drop.html`;

const page = new Page();
const laolao = page.laolao;
const bomiao = page.bomiao;
const sumiao = page.sumiao;
const hongmiao = page.hongmiao;
const lixin = page.lixin;
const tiehua = page.tiehua;
const heihei = page.heihei;
const pangpang = page.pangpang;
const dandan = page.dandan;

test('drag lixin onto hongmiao', async t => {
  await t
    .dragToElement(lixin, hongmiao)
    .expect(hongmiao.sibling('.nodes').count).eql(1)
    .expect(hongmiao.sibling('.nodes').find('.node').withText('Li Xin').count).eql(1)
    .expect(bomiao.sibling('.nodes').count).eql(0);
});

test('drag lixin onto heihei', async t => {
  await t
    .dragToElement(lixin, heihei)
    .expect(heihei.sibling('.nodes').child('.hierarchy').count).eql(3)
    .expect(heihei.sibling('.nodes').find('.node').withText('Li Xin').count).eql(1)
    .expect(bomiao.sibling('.nodes').count).eql(0);
});

test('heihei onto hongmiao', async t => {
  await t
    .dragToElement(heihei, hongmiao)
    .expect(hongmiao.sibling('.nodes').count).eql(1)
    .expect(hongmiao.sibling('.nodes').find('.node').count).eql(3)
    .expect(hongmiao.sibling('.nodes').child('.hierarchy').withText('Hei Hei').count).eql(1)
    .expect(sumiao.sibling('.nodes').find('.node').withText('Tie Hua').count).eql(1);
});

test('heihei onto bomiao', async t => {
  await t
    .dragToElement(heihei, bomiao)
    .expect(bomiao.sibling('.nodes').find('.node').count).eql(4)
    .expect(bomiao.sibling('.nodes').child('.hierarchy').withText('Hei Hei').count).eql(1)
    .expect(sumiao.sibling('.nodes').child('.hierarchy').withText('Tie Hua').count).eql(1);
});

test('pangpang onto heihei', async t => {
  await t
    .dragToElement(pangpang, heihei)
    .expect(heihei.sibling('.nodes').child('.hierarchy').count).eql(2)
    .expect(heihei.sibling('.nodes').child('.hierarchy').withText('Pang Pang').count).eql(1);
});

test('dandan onto heihei', async t => {
  await t
    .dragToElement(dandan, heihei)
    .expect(heihei.sibling('.nodes').child('.hierarchy').count).eql(2)
    .expect(heihei.sibling('.nodes').child('.hierarchy').withText('Dan Dan').count).eql(1);
});

test('pangpang onto dandan', async t => {
  await t
    .dragToElement(pangpang, dandan)
    .expect(heihei.sibling('.nodes').child('.hierarchy').count).eql(1)
    .expect(heihei.sibling('.nodes').child('.hierarchy').withText('Dan Dan').count).eql(1)
    .expect(dandan.sibling('.nodes').child('.hierarchy').count).eql(1)
    .expect(dandan.sibling('.nodes').child('.hierarchy').withText('Pang Pang').count).eql(1);
});

test('heihei onto pangpang', async t => {
  await t
    .dragToElement(heihei, pangpang)
    .expect(heihei.sibling('.nodes').child('.hierarchy').count).eql(2)
    .expect(heihei.sibling('.nodes').child('.hierarchy').withText('Pang Pang').count).eql(1)
    .expect(heihei.sibling('.nodes').child('.hierarchy').withText('Dan Dan').count).eql(1);
});

// test('hongmiao onto lixin', async t => {
//   await t
//       .dragToElement(hongmiao, lixin, { speed: 1 })
//       .expect(sumiao.parent(3).nextSibling().find('.title').textContent).eql('Hong Miao')
//       .expect(lixin.parent(1).sibling().count).eql(0);
// });