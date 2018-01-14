import { Selector } from 'testcafe';

const orgchart = Selector('.orgchart');

export default class Page {
  constructor () {
    this.chart = orgchart;
  }
}