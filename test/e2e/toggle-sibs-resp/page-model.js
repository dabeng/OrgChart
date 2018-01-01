import { Selector } from 'testcafe';

const nodes = Selector('.node');

export default class Page {
  constructor () {
    this.bomiao = nodes.withText('Bo Miao');
    this.sumiao = nodes.withText('Su Miao');
    this.hongmiao = nodes.withText('Hong Miao');
    this.renwu = nodes.withText('Ren Wu');
    this.lixin = nodes.withText('Li Xin');
    this.xingan = nodes.withText('Xing An');
    this.yidian = nodes.withText('Yi Dian');
  }
}