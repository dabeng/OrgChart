import { Selector } from 'testcafe';

const nodes = Selector('.node');

export default class Page {
  constructor () {
    this.sumiao = nodes.withText('Su Miao');
    this.tiehua = nodes.withText('Tie Hua');
    this.heihei = nodes.withText('Hei Hei');
    this.pangpang = nodes.withText('Pang Pang');
    this.dandan = nodes.withText('Dan Dan');
    this.erdan = nodes.withText('Er Dan');
    this.sandan = nodes.withText('San Dan');
    this.sidan = nodes.withText('Si Dan');
    this.wudan = nodes.withText('Wu Dan');
  }
}