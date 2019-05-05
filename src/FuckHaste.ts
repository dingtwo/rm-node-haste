import assert = require('assert');
import klawSync = require('klaw-sync');
import path = require('path');
import fs = require('fs-extra');
import chalk from 'chalk';
import recast from 'recast';

import {
  getAbslutePath,
  getHasteModuleName,
  checkParentIsImport,
} from './util';

const builders = recast.types.builders;

interface File {
  path: string;
  stats: object;
}

interface Module {
  name: string;
  path: string;
}

export default class FuckHaste {
  _rootPath: string;
  modules: Module[] = [];
  files: File[];

  constructor(rootPath: string) {
    assert(rootPath, '[rootPath]参数为空');
    this._rootPath = getAbslutePath(rootPath);
    this.files = this.getAllFile();
  }

  getAllFile(): File[] {
    return klawSync(this._rootPath).filter(
      ({ stats, path: filePath }) =>
        stats.isFile() && path.extname(filePath) === '.js'
    );
  }

  findAllModule(): void {
    this.files.forEach(file => {
      const sourceCode = fs.readFileSync(file.path).toString();
      const ast = recast.parse(sourceCode, {
        parser: require('@babel/parser'),
      });
      const _this = this;
      recast.visit(ast, {
        visitComment(p) {
          const name = getHasteModuleName(p);
          if (name) {
            _this.modules.push({
              path: file.path,
              name,
            });
          }
          return false;
        },
      });
    });
  }

  replaceAllHaste(): void {
    this.files.forEach(file => {
      const sourceCode = fs.readFileSync(file.path).toString();
      const ast = recast.parse(sourceCode, {
        parser: require('@babel/parser'),
      });
      const _this = this;
      recast.visit(ast, {
        visitLiteral(p) {
          if (checkParentIsImport(p)) {
            _this.modules.forEach(module => {
              if (p.node.value === module.name) {
                const absPath = path.relative(
                  path.dirname(file.path),
                  module.path
                );
                console.log(
                  '即将替换, before: ' +
                    chalk.bgRed.white(p.node.value) +
                    ' after:' +
                    chalk.bgGreen.white(absPath)
                );
                p.replace(builders.literal(absPath));
              }
            });
          }
          return false;
        },
      });
      const resultCode = recast.print(ast).code;
      fs.writeFileSync(file.path, resultCode);
    });
  }
}
