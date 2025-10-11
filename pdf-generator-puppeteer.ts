import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import puppeteer, { type Browser, type Page } from 'puppeteer';
import * as fs from 'fs';

/**
 * 使用 Puppeteer 将 Markdown 转换为 PDF（支持 KaTeX 数学公式）
 */
export async function markdownToPdfWithPuppeteer(
  markdown: string,
  outputPath: string,
  options: {
    pageFormat?: 'A4' | 'Letter';
    margin?: { top: string; right: string; bottom: string; left: string };
    displayHeaderFooter?: boolean;
    headerTemplate?: string;
    footerTemplate?: string;
  } = {}
): Promise<void> {
  // 1. 将 Markdown 转换为 HTML（包含 KaTeX 渲染）
  const processor = unified()
    .use(remarkParse)      // 解析 Markdown
    .use(remarkMath)       // 解析数学公式
    .use(remarkGfm)        // 支持 GitHub Flavored Markdown
    .use(remarkRehype)     // 转换为 HTML AST
    .use(rehypeKatex)      // 渲染 KaTeX
    .use(rehypeStringify); // 转换为 HTML 字符串

  const vfile = await processor.process(markdown);
  const contentHtml = String(vfile);

  // 2. 创建完整的 HTML 文档（包含 KaTeX CSS 和自定义样式）
  const fullHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PDF Document</title>
  
  <!-- KaTeX CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.23/dist/katex.min.css">
  
  <!-- Google Fonts for multilingual support -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&family=Noto+Sans+JP:wght@400;700&family=Noto+Sans+KR:wght@400;700&family=Noto+Serif:wght@400;700&display=swap" rel="stylesheet">
  
  <!-- Custom Styles -->
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      /* 使用 Noto 字体家族支持全球语言 */
      font-family: 'Noto Serif', 'Noto Sans SC', 'Noto Sans JP', 'Noto Sans KR', 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    h1 {
      font-size: 28pt;
      font-weight: bold;
      color: #2c3e50;
      margin: 20px 0 10px 0;
      page-break-after: avoid;
    }
    
    h2 {
      font-size: 24pt;
      font-weight: bold;
      color: #34495e;
      margin: 15px 0 8px 0;
      page-break-after: avoid;
    }
    
    h3 {
      font-size: 20pt;
      font-weight: bold;
      color: #7f8c8d;
      margin: 12px 0 6px 0;
      page-break-after: avoid;
    }
    
    h4, h5, h6 {
      font-size: 16pt;
      color: #95a5a6;
      margin: 10px 0 5px 0;
      page-break-after: avoid;
    }
    
    p {
      margin: 0.5em 0;
      text-align: justify;
    }
    
    blockquote {
      font-style: italic;
      color: #7f8c8d;
      margin: 10px 20px;
      padding-left: 15px;
      border-left: 3px solid #bdc3c7;
    }
    
    code {
      font-family: 'Courier New', Courier, monospace;
      background-color: #f8f9fa;
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 0.9em;
    }
    
    pre {
      background-color: #f8f9fa;
      padding: 12px;
      border-radius: 5px;
      overflow-x: auto;
      margin: 1em 0;
      page-break-inside: avoid;
    }
    
    pre code {
      background: none;
      padding: 0;
    }
    
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
      page-break-inside: avoid;
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    
    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    
    ul, ol {
      margin: 0.5em 0;
      padding-left: 30px;
    }
    
    li {
      margin: 0.3em 0;
    }
    
    /* KaTeX 数学公式样式 */
    .katex {
      font-size: 1.1em;
    }
    
    .katex-display {
      margin: 1em 0;
      text-align: center;
      page-break-inside: avoid;
    }
    
    /* 防止元素跨页分割 */
    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid;
    }
    
    img, figure, table, pre {
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  ${contentHtml}
</body>
</html>
  `.trim();

  // 3. 使用 Puppeteer 渲染 HTML 并生成 PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // 解决 Docker 环境内存问题
      '--disable-gpu',
      '--font-render-hinting=none', // 更好的字体渲染
    ]
  });

  try {
    const page = await browser.newPage();
    
    // 设置内容
    await page.setContent(fullHtml, {
      waitUntil: 'networkidle0' // 等待所有网络请求完成（包括 KaTeX CSS）
    });

    // 生成 PDF
    await page.pdf({
      path: outputPath,
      format: options.pageFormat || 'A4',
      margin: options.margin || {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      displayHeaderFooter: options.displayHeaderFooter || false,
      headerTemplate: options.headerTemplate || '',
      footerTemplate: options.footerTemplate || '',
      printBackground: true, // 打印背景色
      preferCSSPageSize: false,
    });

    console.log(`✅ PDF 生成成功: ${outputPath}`);
  } finally {
    await browser.close();
  }
}

// 示例用法
const runExample = async () => {
  const markdown = `
# Puppeteer + KaTeX PDF 示例

这是使用 Puppeteer 和 KaTeX 生成的 PDF 文档。

## 数学公式测试

行内公式：质能方程 $E = mc^2$ 是爱因斯坦提出的著名公式。

显示公式：

$$
\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1
$$

更复杂的公式：

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## 代码块

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

## 表格

| 特性 | Puppeteer 方案 | pdfmake 方案 |
|------|---------------|-------------|
| 数学公式 | ✅ 完美支持 | ⚠️ 需转换 |
| 性能 | ⚡ 快速 | 🐌 较慢 |
| 样式控制 | 🎨 CSS | 📝 配置对象 |

> 使用 Puppeteer 可以获得更好的 KaTeX 渲染效果！
  `.trim();

  try {
    await markdownToPdfWithPuppeteer(
      markdown,
      'example-puppeteer-output.pdf'
    );
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
};

// 自动运行示例
runExample();

