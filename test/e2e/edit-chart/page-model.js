import { Selector } from 'testcafe';

const nodes = Selector('.node');

export default class Page {
  constructor () {
    this.ballgame = nodes.withText('Ball game');
    this.football = nodes.withText('Football');
    this.viewState = Selector('#rd-view');
    this.editState = Selector('#rd-edit');
    this.selectedNode = Selector('#selected-node');
    this.newNodes = Selector('#new-nodelist');
    this.parentRel = Selector('#rd-parent');
    this.childRel = Selector('#rd-child');
    this.siblingRel = Selector('#rd-sibling');
    this.addBtn = Selector('#btn-add-nodes');
    this.deleteBtn = Selector('#btn-delete-nodes');
    this.resetBtn = Selector('#btn-reset');
  }
}