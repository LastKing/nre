#!/usr/bin/env node
/**
 * 需要注意
 * 1.如果是作为命令行工具 ，需要第一行 类似 shell声明的语句
 * 2.在 package.json中 对包的类型  进行声明
 *    默认一般库为  main :  index.js
 *    命令行工具库  bin  : ./index.js
 * Created by toonew on 2017/3/22.
 */
const path = require('path');
const fs = require('fs');

const npm = require('npm');

const program = require('commander');//最重要的 命令行扩展工具
const extend = require('extend');
const ini = require('ini');

const PKG = require('./package.json');
const registries = require('./registries.json');
const NRERC = path.join(process.env.HOME, '.nrerc');

program
  .version(PKG.version); //输出版本信息

program
  .command('ls')
  .description('List all the registries')    //help 显示用的数据
  .action(onList);      //显示所有能更换的源

program
  .command('current')
  .description('Show current registry name')
  .action(showCurrent); //显示当前的源是xxx

program
  .command('use <registry>')
  .description('Change registry to registry')
  .action(onUse);       //更换源

program
  .command('help')
  .description('Print this help')
  .action(function () {
    program.outputHelp();
  });

program
  .parse(process.argv);

if (process.argv.length === 2) {
  program.outputHelp();
}

/*//////////////// cmd methods /////////////////*/
function onList() {
  getCurrentRegistry(function (cur) {
    var info = [''];
    var allRegistries = getAllRegistry();

    Object.keys(allRegistries).forEach(function (key) {
      var item = allRegistries[key];
      var prefix = item.registry === cur ? '* ' : '  ';
      info.push(prefix + key + line(key, 8) + item.registry);
    });

    info.push('');
    printMsg(info);
  });
}

function showCurrent() {
  getCurrentRegistry(function(cur) {
    var allRegistries = getAllRegistry();
    Object.keys(allRegistries).forEach(function(key) {
      var item = allRegistries[key];
      if (item.registry === cur) {
        printMsg([key]);
        return;
      }
    });
  });
}

/**
 * 更换源的操作
 * @param name 更换的源的名字
 */
function onUse(name) {
  var allRegistries = getAllRegistry();
  if (allRegistries.hasOwnProperty(name)) {
    var registry = allRegistries[name];
    npm.load(function (err) {
      if (err) return exit(err);
      npm.commands.config(['set', 'registry', registry.registry], function (err, data) {
        if (err) return exit(err);
        console.log('                        ');
        var newR = npm.config.get('registry');
        printMsg([
          '', '   Registry has been set to: ' + newR, ''
        ]);
      })
    });
  } else {
    printMsg([
      '', '   Not find registry: ' + name, ''
    ]);
  }
}


/*//////////////// helper methods /////////////////*/

/*
 * 获取当前的源地址 get current registry
 */
function getCurrentRegistry(cbk) {
  npm.load(function (err, conf) {
    if (err) return exit(err);
    cbk(npm.config.get('registry')); //这里 如果直接写conf,会多出来两个undefined  。。不明白
  });
}

function getCustomRegistry() {
  //这里 是增加自定义的源，但是我没有自定义源 ，所以暂时无用
  return fs.existsSync(NRERC) ? ini.parse(fs.readFileSync(NRERC, 'utf-8')) : {};
}

function getAllRegistry() {
  return extend({}, registries, getCustomRegistry());
}


function printErr(err) {
  console.error('an error occured: ' + err);
}

function printMsg(infos) {
  infos.forEach(function(info) {
    console.log(info);
  });
}

/*
 * print message & exit
 */
function exit(err) {
  printErr(err);
  process.exit(1);
}

function line(str, len) {
  var line = new Array(Math.max(1, len - str.length)).join('-');
  return ' ' + line + ' ';
}