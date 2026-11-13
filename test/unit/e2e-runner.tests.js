const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

describe('E2E build gate', function () {
  function runner(result) {
    const tasks = {};
    const gulp = {
      task: (name, task) => { tasks[name] = task; },
      series: (...steps) => steps
    };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../gulpfile.js'), 'utf8'), {
      require: (name) => name === 'gulp' ? gulp
        : name === 'cypress' ? { run: async () => result } : require(name),
      process, console
    });
    return tasks['e2e-tests'][1];
  }

  it('rejects failed browser tests', async function () {
    await assert.rejects(runner({ status: 'finished', totalFailed: 1 }), /E2E tests failed: 1/);
  });

  it('rejects Cypress startup failures', async function () {
    await assert.rejects(runner({ status: 'failed', message: 'Browser did not start' }), /Browser did not start/);
  });

  it('accepts a fully passing run', async function () {
    await runner({ status: 'finished', totalFailed: 0 })();
  });
});