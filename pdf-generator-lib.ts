import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import puppeteer, { type Browser, type Page } from 'puppeteer';

/**
 * PDF 生成选项
 */
export interface PdfOptions {
  pageFormat?: 'A4' | 'Letter';
  margin?: { top: string; right: string; bottom: string; left: string };
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
}

/**
 * Browser 实例管理器（性能优化）
 */
class BrowserManager {
  private browser: Browser | null = null;
  private isLaunching = false;

  async getBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    // 防止并发启动多个 browser
    while (this.isLaunching) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (this.browser) {
      return this.browser;
    }

    this.isLaunching = true;
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--font-render-hinting=none',
        ]
      });

      console.log('✅ Puppeteer browser launched successfully');
      return this.browser;
    } finally {
      this.isLaunching = false;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('✅ Puppeteer browser closed');
    }
  }
}

export const browserManager = new BrowserManager();

/**
 * 将 Markdown 转换为 HTML
 */
async function markdownToHtml(markdown: string): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)  // 代码高亮
    .use(rehypeKatex)      // 数学公式
    .use(rehypeStringify);

  const vfile = await processor.process(markdown);
  return String(vfile);
}

/**
 * 创建完整的 HTML 文档
 */
function createFullHtml(contentHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PDF Document</title>
  
  <!-- GitHub Markdown CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@5.5.1/github-markdown-light.css">
  
  <!-- KaTeX CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.23/dist/katex.min.css" crossorigin="anonymous">
  
  <!-- Highlight.js CSS (GitHub 主题) -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github.min.css">
  
  <!-- PDF Optimizations & Custom Styles -->
  <style>
    body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 900px;
      margin: 0 auto;
      padding: 45px;
    }
    
    /* 使用 GitHub 字体栈 */
    .markdown-body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, 
                   'Microsoft YaHei', 'SimSun', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
      font-size: 16px;
      line-height: 1.6;
      word-wrap: break-word;
    }
    
    /* KaTeX 数学公式样式优化 */
    .katex {
      font-size: 1.1em;
    }
    
    .katex-display {
      margin: 1em 0;
      text-align: center;
      page-break-inside: avoid;
    }
    
    /* PDF 打印优化 */
    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid;
      page-break-inside: avoid;
    }
    
    pre, blockquote, table, img, figure {
      page-break-inside: avoid;
    }
    
    /* 确保表格在 PDF 中正确显示 */
    .markdown-body table {
      display: table;
      width: 100%;
      overflow: auto;
    }
    
    /* 代码块样式 */
    .markdown-body pre {
      padding: 16px;
      overflow: auto;
      font-size: 85%;
      line-height: 1.45;
      background-color: #f6f8fa;
      border-radius: 6px;
    }
    
    /* 代码高亮样式优化 */
    .markdown-body pre code.hljs {
      display: block;
      overflow-x: auto;
      padding: 0;
      background: transparent;
    }
    
    /* 确保行内代码在 PDF 中可见 */
    .markdown-body code {
      padding: 0.2em 0.4em;
      margin: 0;
      font-size: 85%;
      background-color: rgba(175,184,193,0.2);
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
    }
    
    .markdown-body pre code {
      background-color: transparent;
      padding: 0;
      font-size: 100%;
      color: inherit;
      border-radius: 0;
    }
  </style>
</head>
<body class="markdown-body">
  ${contentHtml}
</body>
</html>
  `.trim();
}

/**
 * 使用 Puppeteer 将 Markdown 转换为 PDF（重用 Browser 实例）
 */
export async function markdownToPdf(
  markdown: string,
  outputPath: string,
  options: PdfOptions = {}
): Promise<void> {
  // 1. 将 Markdown 转换为 HTML
  const contentHtml = await markdownToHtml(markdown);
  const fullHtml = createFullHtml(contentHtml);

  // 2. 获取重用的 browser 实例
  const browser = await browserManager.getBrowser();
  const page = await browser.newPage();

  try {
    // 3. 拦截不必要的资源（减小文件大小）
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      const url = req.url();
      
      // 只允许文档、样式表、字体和脚本
      if (['document', 'stylesheet'].includes(resourceType)) {
        req.continue();
      } 
      // 允许 KaTeX 字体，但拒绝 Google Fonts
      else if (resourceType === 'font') {
        if (url.includes('katex') || url.includes('jsdelivr')) {
          req.continue();
        } else {
          req.abort();
        }
      }
      // 拒绝图片、媒体等
      else if (['image', 'media', 'websocket'].includes(resourceType)) {
        req.abort();
      }
      else {
        req.continue();
      }
    });
    
    // 4. 设置内容
    await page.setContent(fullHtml, {
      waitUntil: 'networkidle2',
      timeout: 10000
    });

    // 5. 生成 PDF
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
      printBackground: true,
      preferCSSPageSize: false,
      omitBackground: false,
    });

    console.log(`✅ PDF generated: ${outputPath}`);
  } finally {
    await page.close();
  }
}

/**
 * 将 Markdown 转换为 PDF Buffer（用于 HTTP 响应）
 */
export async function markdownToPdfBuffer(
  markdown: string,
  options: PdfOptions = {}
): Promise<Buffer> {
  // 1. 将 Markdown 转换为 HTML
  const contentHtml = await markdownToHtml(markdown);
  const fullHtml = createFullHtml(contentHtml);

  // 2. 获取重用的 browser 实例
  const browser = await browserManager.getBrowser();
  const page = await browser.newPage();

  try {
    // 3. 拦截不必要的资源（减小文件大小）
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      const url = req.url();
      
      // 只允许文档、样式表、字体和脚本
      if (['document', 'stylesheet'].includes(resourceType)) {
        req.continue();
      } 
      // 允许 KaTeX 字体，但拒绝 Google Fonts
      else if (resourceType === 'font') {
        if (url.includes('katex') || url.includes('jsdelivr')) {
          req.continue();
        } else {
          req.abort();
        }
      }
      // 拒绝图片、媒体等
      else if (['image', 'media', 'websocket'].includes(resourceType)) {
        req.abort();
      }
      else {
        req.continue();
      }
    });
    
    // 4. 设置内容
    await page.setContent(fullHtml, {
      waitUntil: 'networkidle2',
      timeout: 10000
    });

    // 5. 生成 PDF Buffer
    const pdfBuffer = await page.pdf({
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
      printBackground: true,
      preferCSSPageSize: false,
      omitBackground: false,
    });

    console.log(`✅ PDF buffer generated (${pdfBuffer.length} bytes)`);
    return pdfBuffer;
  } finally {
    await page.close();
  }
}

