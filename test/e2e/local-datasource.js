import { Selector } from 'testcafe';

fixture `Local Datasource`
  .page `127.0.0.1:3000/local-datasource.html`;

test('bottomEdge of root node works well', async t => {
  await t
      .hover(Selector('#n1'))
      .click(Selector('#n1').find('.bottomEdge'))
      .expect(Selector('#n2').visible).notOk()
      .expect(Selector('#n3').visible).notOk()
      .expect(Selector('#n4').visible).notOk()
      .hover(Selector('#n1'))
      .click(Selector('#n1').find('.bottomEdge'))
      .expect(Selector('#n2').visible).ok()
      .expect(Selector('#n3').visible).ok()
      .expect(Selector('#n4').visible).ok();
});

test('topEdge of sumiao node works well', async t => {
  await t
      .hover(Selector('#n3'))
      .click(Selector('#n3').find('.topEdge'))
      .expect(Selector('#n1').visible).notOk()
      .expect(Selector('#n2').visible).notOk()
      .expect(Selector('#n4').visible).notOk()
      .hover(Selector('#n3'))
      .click(Selector('#n3').find('.topEdge'))
      .expect(Selector('#n1').visible).ok()
      .expect(Selector('#n2').visible).notOk()
      .expect(Selector('#n4').visible).notOk();
});

test('leftEdge of sumiao node works well', async t => {
  await t
      .hover(Selector('#n3'))
      .click(Selector('#n3').find('.leftEdge'))
      .expect(Selector('#n2').visible).notOk()
      .expect(Selector('#n4').visible).notOk()
      .hover(Selector('#n3'))
      .click(Selector('#n3').find('.leftEdge'))
      .expect(Selector('#n2').visible).ok()
      .expect(Selector('#n4').visible).ok();
});

test('rightEdge of sumiao node works well', async t => {
  await t
      .hover(Selector('#n3'))
      .click(Selector('#n3').find('.rightEdge'))
      .expect(Selector('#n4').visible).notOk()
      .expect(Selector('#n4').visible).notOk()
      .hover(Selector('#n3'))
      .click(Selector('#n3').find('.rightEdge'))
      .expect(Selector('#n2').visible).ok()
      .expect(Selector('#n4').visible).ok();
});

test('bottomEdge of sumiao node works well', async t => {
  await t
      .hover(Selector('#n3'))
      .click(Selector('#n3').find('.bottomEdge'))
      .expect(Selector('#n5').visible).notOk()
      .expect(Selector('#n6').visible).notOk()
      .expect(Selector('#n7').visible).notOk()
      .expect(Selector('#n8').visible).notOk()
      .hover(Selector('#n3'))
      .click(Selector('#n3').find('.bottomEdge'))
      .expect(Selector('#n5').visible).ok()
      .expect(Selector('#n6').visible).ok()
      .expect(Selector('#n7').visible).ok();
});

test('topEdge of heihei node works well', async t => {
  await t
      .hover(Selector('#n6'))
      .click(Selector('#n6').find('.topEdge'))
      .expect(Selector('#n1').visible).notOk()
      .expect(Selector('#n2').visible).notOk()
      .expect(Selector('#n3').visible).notOk()
      .expect(Selector('#n4').visible).notOk()
      .expect(Selector('#n5').visible).notOk()
      .expect(Selector('#n7').visible).notOk()
      .hover(Selector('#n6'))
      .click(Selector('#n6').find('.topEdge'))
      .expect(Selector('#n3').visible).ok()
      .expect(Selector('#n1').visible).notOk();
});

test('horizontalEdge of heihei node works well', async t => {
  await t
      .hover(Selector('#n6'))
      .click(Selector('#n6').find('.topEdge'))
      .click(Selector('#n6').find('.leftEdge'))
      .expect(Selector('#n3').visible).ok()
      .expect(Selector('#n5').visible).ok()
      .expect(Selector('#n7').visible).ok()
      .expect(Selector('#n1').visible).notOk();
});

test('horizontalEdge of pangpang node works well', async t => {
  await t
      .hover(Selector('#n7'))
      .click(Selector('#n7').find('.leftEdge'))
      .expect(Selector('#n5').visible).notOk()
      .expect(Selector('#n6').visible).notOk()
      .expect(Selector('#n8').visible).notOk()
      .click(Selector('#n7').find('.leftEdge'))
      .expect(Selector('#n5').visible).ok()
      .expect(Selector('#n6').visible).ok()
});