#!/usr/bin / env node

/* eslint-disable */

const fs = require('fs');
const path = require('path');

/**
 * 版本更新脚本
 * 将 VERSION.txt 中的版本号直接覆盖到 src/lib/version.ts 中的 CURRENT_VERSION
 * 并检查 CHANGELOG 中是否包含该版本的日志
 */

function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8').trim();
  } catch (error) {
    console.error(`❌ 无法读取文件 ${filePath}:`, error.message);
    process.exit(1);
  }
}

function updateVersionInTsFile(content, newVersion) {
  // 首先检查是否能找到 CURRENT_VERSION 常量
  if (!/const CURRENT_VERSION = ['"`][^'"`]+['"`];/.test(content)) {
    console.error('❌ 无法在 version.ts 中找到 CURRENT_VERSION 常量');
    process.exit(1);
  }

  // 使用正则表达式替换 CURRENT_VERSION 的值
  const updatedContent = content.replace(
    /const CURRENT_VERSION = ['"`][^'"`]+['"`];/,
    `const CURRENT_VERSION = '${newVersion}';`
  );

  return updatedContent;
}

function writeFileContent(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ 成功更新文件: ${filePath}`);
  } catch (error) {
    console.error(`❌ 无法写入文件 ${filePath}:`, error.message);
    process.exit(1);
  }
}

function checkVersionInChangelog(changelogContent, version) {
  // 检查 CHANGELOG 中是否包含指定版本的日志
  const versionPatterns = [
    new RegExp(`## \\[${version.replace(/\./g, '\\.')}\\]`, 'i'),
  ];

  return versionPatterns.some((pattern) => pattern.test(changelogContent));
}

function main() {
  console.log('🔄 开始版本更新...\n');

  // 获取项目根目录
  const projectRoot = path.resolve(__dirname, '..');

  // 读取相关文件
  const versionTxtPath = path.join(projectRoot, 'VERSION.txt');
  const versionTsPath = path.join(projectRoot, 'src/lib/version.ts');
  const changelogPath = path.join(projectRoot, 'CHANGELOG');

  console.log('📁 检查文件路径:');
  console.log(`   VERSION.txt: ${versionTxtPath}`);
  console.log(`   version.ts: ${versionTsPath}`);
  console.log(`   CHANGELOG: ${changelogPath}\n`);

  // 检查文件是否存在
  [versionTxtPath, versionTsPath, changelogPath].forEach((filePath) => {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ 文件不存在: ${filePath}`);
      process.exit(1);
    }
  });

  // 读取文件内容
  const versionTxtContent = readFileContent(versionTxtPath);
  const versionTsContent = readFileContent(versionTsPath);
  const changelogContent = readFileContent(changelogPath);

  console.log('📖 读取文件内容完成\n');

  // 获取新版本号
  const newVersion = versionTxtContent;

  console.log('🔢 版本信息:');
  console.log(`   VERSION.txt: ${newVersion}\n`);

  // 更新 version.ts 文件
  console.log('✅ 更新 version.ts 文件');
  const updatedTsContent = updateVersionInTsFile(versionTsContent, newVersion);
  writeFileContent(versionTsPath, updatedTsContent);

  // 检查变更日志
  console.log('\n✅ 检查变更日志');
  if (checkVersionInChangelog(changelogContent, newVersion)) {
    console.log('   ✅ 变更日志包含当前版本');
  } else {
    console.error('   ❌ 变更日志中未找到当前版本!');
    console.error(`      当前版本: ${newVersion}`);
    console.error('      请检查 CHANGELOG 文件格式是否正确');
    process.exit(1);
  }

  console.log('\n🎉 版本更新完成!');
  console.log(`   CURRENT_VERSION 已更新为: ${newVersion}`);
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { main };
