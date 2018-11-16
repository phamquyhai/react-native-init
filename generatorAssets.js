/* eslint-disable */
/*
 * @author: Pham Quy Hai
 * @version: 1.0
 * @date: July 18, 2018
 * @description: Tool generator static assets for react-native.
 */
const fs = require('fs');

const rootFolder = 'app/assets/';
const blackList = [
  'locales',
  'animations',
  '.DS_Store',
  '.git',
  'generator.js',
  '@2x.',
  '@3x.',
  '.js',
];
const repeatFileTextList = ['SFUIDisplay', 'Roboto', 'SFCompact'];
const fontExts = ['.otf', '.ttc', '.ttf'];
run();

function run() {
  seeDir(rootFolder, 'Assets');
}

function seeDir(dirLocal, dirName) {
  const dirObject = [];
  fs.readdirSync(dirLocal).forEach(file => {
    // console.log(`file ${file} -> ${blackList.indexOf(file)}`);
    const hasBlock = isBlock(file);
    if (!hasBlock) {
      const local = dirLocal + file;
      const isDir = fs.lstatSync(local).isDirectory();
      // console.log(`${local} isDir ${isDir}`);
      const objectName = createObjectName(file, isDir);
      if (isFont(file)) {
        const fontName = file
          .split('.')
          .slice(0, -1)
          .join('.');
        dirObject[`${objectName}`] = `'${fontName}'`;
      } else {
        dirObject[`${objectName}`] = `require('./${file}')${isDir ? '.' + objectName : ''}`;
      }

      if (isDir) {
        seeDir(`${local}/`, file);
      }
    }
  });
  // console.log(dirObject);
  const indexFile = `${dirLocal}index.js`;
  const indexData = renderText(dirName, dirObject);
  fs.writeFileSync(indexFile, indexData);
}

function isFont(file) {
  return fontExts.filter(it => file.indexOf(it) >= 0).length > 0;
}

function isBlock(file) {
  return blackList.filter(it => it === file || file.indexOf(it) >= 0).length > 0;
}

function createObjectName(file, isDir = false) {
  var objectName = file
    .split('_')
    .map(it => it.substr(0, 1).toUpperCase() + it.substr(1, it.length))
    .join('')
    .split('-')
    .map(it => it.substr(0, 1).toUpperCase() + it.substr(1, it.length))
    .join('')
    .replace(/.png|.jpg|.otf/gi, '');
  if (!isDir) {
    repeatFileTextList.forEach(it => (objectName = objectName.replace(it, '')));
  }
  return objectName;
}

function renderText(dir, dirObject) {
  const dirName = dir.substr(0, 1).toUpperCase() + dir.substr(1, dir.length);
  const text = [];
  text.push('exports.' + dirName + ' = {');
  text.push('\n');
  for (const key in dirObject) {
    const value = dirObject[key];
    text.push(`  ${key}: ${value},\n`);
  }
  text.push('};');
  text.push('\n');
  return text.join('');
}
