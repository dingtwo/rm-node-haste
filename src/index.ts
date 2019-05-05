#!/usr/bin/env node
/**
 * 去掉难用的providesModule
 */

const inquirer = require('inquirer');
import FuckHaste from './FuckHaste';
const chalk = require('chalk');

let fuck;
inquirer
  .prompt([
    {
      type: 'input',
      name: 'entryPath',
      message: '输入要查找的目录',
    },
  ])
  .then(({ entryPath }) => {
    fuck = new FuckHaste(entryPath);
    fuck.findAllModule();
    console.log(`共发现${fuck.modules.length}个模块声明`);
    fuck.modules.forEach(m => {
      console.log(chalk.bgRed(m.name));
    });
  })
  .then(() => {
    inquirer
      .prompt({
        type: 'confirm',
        name: 'needReplace',
        message: '是否替换所有模块为相对路径?',
      })
      .then(({ needReplace }) => {
        if (needReplace) {
          fuck.replaceAllHaste();
        }
      });
  })
  .catch(err => {
    console.log(err);
  });
