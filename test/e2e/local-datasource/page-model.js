import { Selector } from 'testcafe';

const nodes = Selector('.node');

export default class Page {
  constructor () {
    this.laolao = nodes.withText('Lao Lao');
    this.bomiao = nodes.withText('Bo Miao');
    this.sumiao = nodes.withText('Su Miao');
    this.hongmiao = nodes.withText('Hong Miao');
    this.tiehua = nodes.withText('Tie Hua');
    this.heihei = nodes.withText('Hei Hei');
    this.pangpang = nodes.withText('Pang Pang');
    this.dandan = nodes.withText('Dan Dan');
  }
}