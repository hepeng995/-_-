import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMG_DIR = join(__dirname, '..', 'src', 'assets', 'image');

// 按渲染场景分组配置：文件名关键词 → 最大宽度和质量
const RULES = [
  { match: 'IP3',              maxWidth: 96,   quality: 80 },
  { match: 'ip-mascot',        maxWidth: 144,  quality: 80 },
  { match: '背景',             maxWidth: 1920, quality: 75 },
  { match: '概览',             maxWidth: 1920, quality: 75 },
];

const DEFAULT_RULE = { maxWidth: 800, quality: 75 };

function getRule(name) {
  return RULES.find(r => name.includes(r.match)) || DEFAULT_RULE;
}

async function processFile(file) {
  const ext = extname(file).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return null;

  const inputPath = join(IMG_DIR, file);
  const outName = basename(file, ext) + '.webp';
  const outputPath = join(IMG_DIR, outName);
  const rule = getRule(file);

  try {
    const meta = await sharp(inputPath).metadata();
    const origSize = (await stat(inputPath)).size;

    let pipeline = sharp(inputPath);
    if (meta.width > rule.maxWidth) {
      pipeline = pipeline.resize({ width: rule.maxWidth, withoutEnlargement: true });
    }
    await pipeline.webp({ quality: rule.quality }).toFile(outputPath);

    const newSize = (await stat(outputPath)).size;
    const ratio = ((1 - newSize / origSize) * 100).toFixed(1);
    console.log(`✓ ${file}: ${(origSize / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB (-${ratio}%) [maxWidth=${rule.maxWidth}]`);
    return { original: file, webp: outName, origSize, newSize };
  } catch (e) {
    console.error(`✗ ${file}: ${e.message}`);
    return null;
  }
}

const files = await readdir(IMG_DIR);
const results = (await Promise.all(files.map(processFile))).filter(Boolean);
const totalOrig = results.reduce((s, r) => s + r.origSize, 0);
const totalNew = results.reduce((s, r) => s + r.newSize, 0);
console.log(`\n共处理 ${results.length} 张图片: ${(totalOrig / 1024 / 1024).toFixed(1)}MB → ${(totalNew / 1024 / 1024).toFixed(1)}MB (-${((1 - totalNew / totalOrig) * 100).toFixed(1)}%)`);
