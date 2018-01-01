import { Selector } from 'testcafe';
import Page from './page-model';

fixture `Edit Chart`
  .page `../../../demo/edit-chart.html`;

const page = new Page();
const editPanel = page.editPanel;
const ballgame = page.ballgame;
const football = page.football;
const viewState = page.viewState;
const editState = page.editState;
const selectedNode = page.selectedNode;
const newNodes = page.newNodes;
const addInput = page.addInput;
const removeInput = page.removeInput;
const parentRel = page.parentRel;
const childRel = page.childRel;
const siblingRel = page.siblingRel;
const addBtn = page.addBtn;
const deleteBtn = page.deleteBtn;
const resetBtn = page.resetBtn;

test('add parent(root) node -- sports', async t => {
  await t
      .click(ballgame)
      .typeText(newNodes.nth(0), 'Sports')
      .click(parentRel)
      .click(addBtn)
      .expect(selectedNode.value).eql('Ball game')
      .expect(ballgame.parent(4).sibling(':first-child').find('.title').textContent).eql('Sports');
});

test('add child nodes -- Futsal and Beach football', async t => {
  await t
      .click(football)
      .typeText(newNodes.nth(0), 'Futsal')
      .click(addInput)
      .typeText(newNodes.nth(1), 'Beach football')
      .click(addInput)
      .typeText(newNodes.nth(2), 'Robot football')
      .click(removeInput)
      .click(childRel)
      .click(addBtn)
      .expect(selectedNode.value).eql('Football')
      .expect(football.parent(1).sibling(':last-child').childElementCount).eql(2)
      .expect(football.parent(1).sibling(':last-child').find('.title').nth(0).textContent).eql('Futsal')
      .expect(football.parent(1).sibling(':last-child').find('.title').nth(1).textContent).eql('Beach football')
      .click(resetBtn)
      .expect(football.hasClass('focused')).notOk()
      .expect(selectedNode.value).eql('')
      .expect(newNodes.count).eql(1)
      .expect(childRel.checked).notOk();
});

test('add sibling node -- Baseball', async t => {
  await t
      .click(football)
      .typeText(newNodes.nth(0), 'Baseball')
      .click(siblingRel)
      .click(addBtn)
      .expect(selectedNode.value).eql('Football')
      .expect(ballgame.parent(1).sibling(':last-child').childElementCount).eql(4)
      .expect(ballgame.parent(1).sibling(':last-child').find('.title').nth(3).textContent).eql('Baseball');
});

test('delete the football node', async t => {
  await t
      .click(football)
      .expect(selectedNode.value).eql('Football')
      .click(deleteBtn)
      .expect(selectedNode.value).eql('')
      .expect(football.exists).notOk();
});