import { Selector } from 'testcafe';

export default class Page {
  constructor () {
    this.loadChart1 = Selector('#btn-chart1');
    this.loadChart2 = Selector('#btn-chart2');
    this.loadChart3 = Selector('#btn-chart3');
  }
}