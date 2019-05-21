const path = require('path');
import { NodePath } from 'ast-types';
import recast from 'recast';
import chalk from 'chalk';

const {
  types: { namedTypes },
} = recast;

const hasteModuleReg = /@providesModule\s(\w+)/;

export const getAbslutePath = (aPath: string): string => {
  if (!path.isAbsolute(aPath)) {
    console.log(chalk.bgRedBright.bold.whiteBright('请输入绝对路径!'));
    process.exit();
    // return path.join(__dirname, '..', aPath);
  }
  return aPath;
};

/**
 * 从visitComment中找出含有@providesModule的模块
 * @param p {NodePath} visit中的path
 * @returns 返回模块名或false
 */
export const getHasteModuleName = (p: NodePath): string | false => {
  if (p.value && p.value.value) {
    const match = p.value.value.match(hasteModuleReg) as string[];
    if (match && match.length > 1) {
      return match[1];
    }
  }
  return false;
};

/**
 * 校验当前Literal节点的上级节点是否为importDeclaration
 * @param p {NodePath} Literal节点
 * @return {boolean}
 */
export const checkParentIsImport = (p: NodePath): boolean =>
  namedTypes.ImportDeclaration.check(p.parentPath.node);
