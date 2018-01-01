import { Selector } from 'testcafe';

const nodes = Selector('.node');

export default class Page {
  constructor () {
    this.editPanel = Selector('#edit-panel');
    this.ballgame = nodes.withText('Ball game');
    this.football = nodes.withText('Football');
    this.viewState = Selector('#rd-view');
    this.editState = Selector('#rd-edit');
    this.selectedNode = Selector('#selected-node');
    this.newNodes = Selector('#new-nodelist').find('.new-node');
    this.addInput = Selector('#btn-add-input');
    this.removeInput = Selector('#btn-remove-input');
    this.parentRel = Selector('#rd-parent');
    this.childRel = Selector('#rd-child');
    this.siblingRel = Selector('#rd-sibling');
    this.addBtn = Selector('#btn-add-nodes');
    this.deleteBtn = Selector('#btn-delete-nodes');
    this.resetBtn = Selector('#btn-reset');
  }
}