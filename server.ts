import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { markdownToPdfBuffer, browserManager, type PdfOptions } from './pdf-generator-lib.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ limit: '10mb' }));

// 提供静态 HTML 测试页面
app.get('/', (req: Request, res: Response) => {
  // 兼容开发模式和编译模式
  // 开发模式：tsx server.ts → __dirname = /remark-pdf
  // 编译模式：node dist/server.js → __dirname = /remark-pdf/dist
  const indexPath = __dirname.endsWith('dist') 
    ? path.resolve(__dirname, '../index.html')  // 编译模式：向上一级
    : path.resolve(__dirname, 'index.html');     // 开发模式：当前目录
  res.sendFile(indexPath);
});

// 健康检查
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    service: 'markdown-to-pdf',
    timestamp: new Date().toISOString()
  });
});

// API 信息
app.get('/api', (req: Request, res: Response) => {
  res.json({
    service: 'Markdown to PDF API',
    version: '1.0.0',
    endpoints: {
      'GET /': 'Web-based API tester',
      'GET /api': 'API information',
      'GET /health': 'Health check',
      'POST /convert': 'Convert markdown to PDF (JSON)',
      'POST /convert-text': 'Convert markdown to PDF (plain text)'
    },
    docs: 'https://github.com/yourusername/markdown-to-pdf'
  });
});

/**
 * POST /convert
 * 
 * Request Body (JSON):
 * {
 *   "markdown": "# Hello World\n\n$E = mc^2$",
 *   "options": {
 *     "pageFormat": "A4",
 *     "margin": {
 *       "top": "20mm",
 *       "right": "15mm",
 *       "bottom": "20mm",
 *       "left": "15mm"
 *     }
 *   },
 *   "filename": "output.pdf"
 * }
 * 
 * Response: PDF file (application/pdf)
 */
app.post('/convert', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { markdown, options, filename } = req.body;

    // 验证输入
    if (!markdown || typeof markdown !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'markdown field is required and must be a string'
      });
    }

    // 生成 PDF
    const startTime = Date.now();
    const pdfBuffer = await markdownToPdfBuffer(markdown, options as PdfOptions);
    const duration = Date.now() - startTime;

    // 设置响应头
    const outputFilename = filename || `document-${Date.now()}.pdf`;
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${outputFilename}"`,
      'Content-Length': pdfBuffer.length,
      'X-Generation-Time': `${duration}ms`,
      'Cache-Control': 'no-cache',
      'Access-Control-Expose-Headers': 'Content-Length, X-Generation-Time'
    });

    // 直接写入二进制数据
    res.end(pdfBuffer, 'binary');

    console.log(`✅ PDF sent: ${outputFilename} (${pdfBuffer.length} bytes, ${duration}ms)`);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /convert-text
 * 
 * Request Body (plain text): markdown content
 * Response: PDF file (application/pdf)
 */
app.post('/convert-text', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const markdown = req.body;

    // 验证输入
    if (!markdown || typeof markdown !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Request body must be plain text markdown'
      });
    }

    // 生成 PDF
    const startTime = Date.now();
    const pdfBuffer = await markdownToPdfBuffer(markdown);
    const duration = Date.now() - startTime;

    // 设置响应头
    const outputFilename = `document-${Date.now()}.pdf`;
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${outputFilename}"`,
      'Content-Length': pdfBuffer.length,
      'X-Generation-Time': `${duration}ms`,
      'Cache-Control': 'no-cache',
      'Access-Control-Expose-Headers': 'Content-Length, X-Generation-Time'
    });

    // 直接写入二进制数据
    res.end(pdfBuffer, 'binary');

    console.log(`✅ PDF sent: ${outputFilename} (${pdfBuffer.length} bytes, ${duration}ms)`);
  } catch (error) {
    next(error);
  }
});

// 错误处理中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err);
  
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║    Markdown to PDF API Server                        ║
║                                                       ║
║    🚀 Server running on http://localhost:${PORT}      ║
║                                                       ║
║    🌐 Web Tester: http://localhost:${PORT}            ║
║                                                       ║
║    Endpoints:                                         ║
║      GET  /         - Web-based API tester           ║
║      GET  /api      - API information                ║
║      GET  /health   - Health check                   ║
║      POST /convert  - Convert markdown to PDF (JSON) ║
║      POST /convert-text - Convert markdown (text)    ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// 优雅关闭
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received, closing server gracefully...`);
  
  server.close(async () => {
    console.log('HTTP server closed');
    
    // 关闭 Puppeteer browser
    await browserManager.close();
    
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  });

  // 强制关闭超时
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

