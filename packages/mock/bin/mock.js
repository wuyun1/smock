#!/usr/bin/env node
/* eslint-disable */
const fs = require("fs")
var program = require('commander');
const path = require("path")
const execa = require("execa")
const _ = require('lodash')

const cwd = process.cwd()

console.log('开始运行mock工具...')
async function kill(child, callback) {
  if (process.platform === "win32") {
    const _child = execa('taskkill /pid ' + child.pid + ' /T /F', [], {
      shell: true,
      cwd
    });
    try {
      await _child;
    } catch (e) {
      console.log('error: ', e);
    }
    callback();
  } else {
    child.kill();
    callback();
  }
}

program
.version(require('../package.json').version)
.usage('<command> [options]')

program
  .option('-p --port <port>', 'mock服务运行的端口')

program.parse(process.argv);

let port = program.port || 4000;
if (port) {
  port = Number(port);
}
const watchPath = path.resolve(cwd, "live-mock")
const args = ["--port", port]
const scriptPath = path.resolve(__dirname, "./start.js")
let child

function startMock() {
  console.log('启动Mock服务...')
  child = execa(`node ${scriptPath}`, args, {
    shell: true,
    cwd
  })
  child.stdout.on("data", buf => console.log(buf.toString()))
  child.stderr.on("data", buf => console.log(buf.toString()))
  child.catch(e => {console.log()});
}

const restart = _.debounce(() => {
  console.log('准备重启中...')
  kill(child,  () => {
    startMock()
  })
}, 500)

fs.watch(watchPath, restart);

process.on("SIGINT", () => {
  kill(child, () => {
    process.exit();
  })
})

process.on('SIGHUP', () => {
  kill(child, () => {
    process.exit();
  })
});

startMock()
