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

const findNextNode = node => node.parent(3).nextSibling().find('.title').textContent;
const findOnlyChild = node => node.parent(1).sibling(':last-child').find('.title').textContent;
const getChildrenCount = node => node.parent(1).sibling(':last-child').childElementCount;
const getDescendantsCount = node => node.parent(1).sibling(':last-child').find('.node').count;

test('drag lixin onto hongmiao', async t => {
  await t
      .dragToElement(lixin, hongmiao)
      .expect(hongmiao.parent(1).sibling().count).eql(3)
      .expect(findOnlyChild(hongmiao)).eql('Li Xin')
      .expect(bomiao.parent(1).sibling().count).eql(0);
});

test('drag lixin onto heihei', async t => {
  await t
      .dragToElement(lixin, heihei)
      .expect(getChildrenCount(heihei)).eql(3)
      .expect(findNextNode(dandan)).eql('Li Xin')
      .expect(bomiao.parent(1).sibling().count).eql(0);
});

test('heihei onto hongmiao', async t => {
  await t
      .dragToElement(heihei, hongmiao)
      .expect(getDescendantsCount(hongmiao)).eql(3)
      .expect(findOnlyChild(hongmiao)).eql('Hei Hei')
      .expect(findOnlyChild(sumiao)).eql('Tie Hua');
});

test('heihei onto bomiao', async t => {
  await t
      .dragToElement(heihei, bomiao)
      .expect(getDescendantsCount(bomiao)).eql(4)
      .expect(findNextNode(lixin)).eql('Hei Hei')
      .expect(findOnlyChild(sumiao)).eql('Tie Hua');
});

test('pangpang onto heihei', async t => {
  await t
      .dragToElement(pangpang, heihei)
      .expect(getChildrenCount(heihei)).eql(2)
      .expect(findNextNode(dandan)).eql('Pang Pang');
});

test('dandan onto heihei', async t => {
  await t
      .dragToElement(dandan, heihei)
      .expect(getChildrenCount(heihei)).eql(2)
      .expect(findNextNode(pangpang)).eql('Dan Dan');
});

// test('hongmiao onto lixin', async t => {
//   await t
//       .dragToElement(hongmiao, lixin, { speed: 1 })
//       .expect(sumiao.parent(3).nextSibling().find('.title').textContent).eql('Hong Miao')
//       .expect(lixin.parent(1).sibling().count).eql(0);
// });