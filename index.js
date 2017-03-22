#!/usr/bin/env node
/**
 * Created by toonew on 2017/3/22.
 */
const path = require('path');
const fs = require('fs');

const npm = require('npm');

const extend = require('extend');
const program = require('commander');
const ini = require('ini');

const PKG = require('./package.json');
const registries = require('./registries.json');
const NRMRC = path.join(process.env.HOME, '.nrmrc');

program
  .version(PKG.version);

program
  .command('ls')
  .description('List all the registries')
  .action(onList);

program
  .command('current')
  .description('Show current registry name')
  .action(showCurrent);

program
  .command('use <registry>')
  .description('Change registry to registry')
  .action(onUse);

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
 * get current registry
 */
function getCurrentRegistry(cbk) {
  npm.load(function (err, conf) {
    if (err) return exit(err);
    cbk(npm.config.get('registry'));
  });
}

function getCustomRegistry() {
  return fs.existsSync(NRMRC) ? ini.parse(fs.readFileSync(NRMRC, 'utf-8')) : {};
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