const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'node_modules', 'typescript', 'lib');
const targetFile = path.join(targetDir, 'typescript.js');

const code = `import fs from 'fs';
import path from 'path';
import os from 'os';

export const version = '7.0.2';
export const versionMajorMinor = '7.0';

export const ScriptTarget = {
  ES3: 0,
  ES5: 1,
  ES2015: 2,
  ES2016: 3,
  ES2017: 4,
  ES2018: 5,
  ES2019: 6,
  ES2020: 7,
  ES2021: 8,
  ES2022: 9,
  ESNext: 99,
  JSON: 100,
  Latest: 99,
};

export const ModuleKind = {
  None: 0,
  CommonJS: 1,
  AMD: 2,
  UMD: 3,
  System: 4,
  ES2015: 5,
  ES2020: 6,
  ES2022: 7,
  ESNext: 99,
  Node16: 100,
  NodeNext: 101,
};

export const ModuleResolutionKind = {
  Classic: 1,
  NodeJs: 2,
  Node16: 3,
  NodeNext: 4,
  Bundler: 100,
};

export const JsxEmit = {
  None: 0,
  Preserve: 1,
  React: 2,
  ReactNative: 3,
  ReactJSX: 4,
  ReactJSXDev: 5,
};

export const sys = {
  getCurrentDirectory: () => process.cwd(),
  readFile: (p) => fs.readFileSync(p, 'utf8'),
  fileExists: (p) => fs.existsSync(p),
  directoryExists: (p) => fs.statSync(p, { throwIfNoEntry: false })?.isDirectory() ?? false,
  readDirectory: () => [],
  useCaseSensitiveFileNames: true,
  newLine: os.EOL,
};

export function readConfigFile(fileName, readFile) {
  try {
    const text = readFile(fileName);
    const config = JSON.parse(text);
    return { config };
  } catch (err) {
    return { error: err };
  }
}

export function parseJsonConfigFileContent(json, host, basePath) {
  const compilerOptions = json?.compilerOptions || {};
  return {
    options: {
      ...compilerOptions,
      moduleResolution: ModuleResolutionKind.Bundler,
      paths: compilerOptions.paths || {},
    },
    fileNames: [],
    raw: {
      ...json,
      compilerOptions: {
        ...compilerOptions,
        moduleResolution: 'bundler',
      },
    },
    errors: [],
  };
}

export function formatDiagnostic(diagnostic) {
  return diagnostic?.messageText || String(diagnostic);
}

const ts = {
  version,
  versionMajorMinor,
  ScriptTarget,
  ModuleKind,
  ModuleResolutionKind,
  JsxEmit,
  sys,
  readConfigFile,
  parseJsonConfigFileContent,
  formatDiagnostic,
};

export default ts;
`;

if (fs.existsSync(targetDir)) {
  fs.writeFileSync(targetFile, code);
}
