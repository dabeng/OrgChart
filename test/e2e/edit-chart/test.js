import { Selector } from 'testcafe';
import Page from './page-model';

fixture `Edit Chart`
  .page `127.0.0.1:3000/edit-chart.html`;

const page = new Page();

