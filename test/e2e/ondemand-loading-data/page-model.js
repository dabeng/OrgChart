import { Selector } from 'testcafe';

const nodes = Selector('.node');

export default class Page {
  constructor () {
    this.sumiao = nodes.withText('Su Miao');
    this.heihei = nodes.withText('Hei Hei');
  }
}