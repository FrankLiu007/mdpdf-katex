# mdpdf-katex

> Markdown to PDF with Puppeteer & KaTeX

Convert Markdown to beautiful PDFs with **perfect** math formula rendering and multilingual support.

## 🎯 Why This Solution?

### Perfect for Server-Side APIs

- ✅ **KaTeX Math Formulas**: Fast, accurate, beautiful rendering
- ✅ **Multilingual Support**: Chinese, Japanese, Korean, Russian, Arabic, and more
- ✅ **No Font Configuration**: Chromium has built-in global font support
- ✅ **Standard Web Tech**: HTML/CSS - simple and maintainable
- ✅ **300MB is OK**: Server-side deployment, package size doesn't matter

### Why Not Browser-Based Solutions?

**❌ Option 1: pdfmake in Browser**
- Complex font configuration required
- Difficult multilingual support (need to bundle font files)
- Poor math formula rendering (SVG + MathJax)
- Large bundle size for frontend

**❌ Option 2: Browser Print Dialog**
- Generate HTML → User clicks "Print" → User selects "Save as PDF"
- Poor UX: requires manual user interaction
- Inconsistent results across browsers
- No programmatic control

**❌ Option 3: pdfmake in Node.js**
- Math formulas only work with SVG + MathJax (slow, poor quality)
- Requires 1000+ lines of conversion code
- Complex implementation

**✅ Our Solution: Puppeteer Server-Side**
- One-click PDF generation via API
- Perfect math formulas (KaTeX)
- Zero user interaction needed
- Consistent, high-quality output

**For server-side APIs with math formulas and multilingual content, Puppeteer is the only sensible choice.**

---

## 🚀 Quick Start

### Option 1: HTTP Server (Recommended)

**Perfect for production APIs:**

\`\`\`bash
# Install and start server
npm install
npm run server
\`\`\`

**Then open your browser:**

🌐 **Web Tester**: http://localhost:3000

Or use API directly:

\`\`\`bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Hello\\n\\n$E = mc^2$"}' \
  -o output.pdf
\`\`\`

**See [Quick Start Guide](QUICK_START.md) for details.**

### Option 2: CLI Tool

**Direct usage in Node.js:**

\`\`\`typescript
import { markdownToPdf } from './pdf-generator-lib';

const markdown = \`
# Test Document

Einstein's equation: $E = mc^2$

$$
\\\\int_{0}^{1} x^2 dx = \\\\frac{1}{3}
$$
\`;

await markdownToPdf(markdown, 'output.pdf');
\`\`\`

### Run Examples

\`\`\`bash
# Start HTTP server
npm run server

# Then open browser
# http://localhost:3000

# Or test with curl
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Test\n\n$E = mc^2$"}' \
  -o test.pdf
\`\`\`

---

## 📐 Math Formula Examples

### Inline Math

\`\`\`markdown
The equation $E = mc^2$ was proposed by Einstein.
\`\`\`

### Display Math

\`\`\`markdown
$$
\\\\int_{-\\\\infty}^{\\\\infty} e^{-x^2} dx = \\\\sqrt{\\\\pi}
$$
\`\`\`

### Complex Formulas

\`\`\`markdown
$$
\\\\begin{bmatrix}
a & b \\\\\\\\
c & d
\\\\end{bmatrix}
\\\\begin{bmatrix}
x \\\\\\\\
y
\\\\end{bmatrix}
=
\\\\begin{bmatrix}
ax + by \\\\\\\\
cx + dy
\\\\end{bmatrix}
$$
\`\`\`

---

## 🌍 Multilingual Support

**Works out of the box, no configuration needed:**

\`\`\`markdown
# 中文标题

质能方程：$E = mc^2$

## 日本語

オイラーの公式：$e^{i\\\\pi} + 1 = 0$

## 한국어

피타고라스 정리：$a^2 + b^2 = c^2$

## Русский

Формула Эйлера：$e^{ix} = \\\\cos x + i\\\\sin x$
\`\`\`

---

## 🎨 Customization

Edit `pdf-generator-puppeteer.ts` CSS styles:

\`\`\`css
body {
  font-family: 'Noto Serif', 'Noto Sans SC', ...;
  font-size: 12pt;
  color: #333;
}

h1 {
  color: #2c3e50;
  font-size: 28pt;
}
\`\`\`

---

## 🐳 Docker Deployment

\`\`\`dockerfile
FROM node:22-alpine

# Install Chromium dependencies
RUN apk add --no-cache \\
    chromium \\
    nss \\
    freetype \\
    harfbuzz \\
    ca-certificates

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \\
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
CMD ["node", "your-server.js"]
\`\`\`

---

## ⚡ Performance Tips

### Reuse Browser Instance

\`\`\`typescript
let browserInstance;

async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({ headless: true });
  }
  return browserInstance;
}

async function generatePdf(markdown) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  // ... generate PDF
  await page.close(); // Only close page, not browser
}
\`\`\`

### Concurrency Control

\`\`\`typescript
import PQueue from 'p-queue';

const queue = new PQueue({ concurrency: 3 });

async function batchGenerate(markdowns) {
  return Promise.all(
    markdowns.map(md => queue.add(() => generatePdf(md)))
  );
}
\`\`\`

---

## 📚 Features

- ✅ Perfect KaTeX math formula rendering
- ✅ Multilingual support (Chinese, Japanese, Korean, Russian, Arabic, etc.)
- ✅ GitHub Flavored Markdown (tables, task lists, etc.)
- ✅ Syntax highlighting for code blocks
- ✅ Custom page size and margins
- ✅ Header and footer support
- ✅ Print backgrounds and colors
- ✅ Simple, maintainable code (<300 lines)

---

## 🔍 Comparison

| Feature | Puppeteer | pdfmake |
|---------|-----------|---------|
| Math Formulas | ✅ Perfect (KaTeX) | ⚠️ Poor (SVG + MathJax) |
| Multilingual | ✅ Built-in | ❌ Manual config |
| Implementation | ✅ Simple (<300 lines) | ❌ Complex (1000+ lines) |
| Package Size | ⚠️ 300MB | ✅ 20MB |
| **Best For** | **Server APIs** | Limited use cases |

**For server-side APIs, Puppeteer is the clear winner.** 🏆

---

## 📖 Documentation

- **[Quick Start Guide](QUICK_START.md)** - 快速开始（推荐）
- **[API Documentation](API_DOCUMENTATION.md)** - 完整 API 参考
- **[PDF Optimization](PDF_OPTIMIZATION.md)** - 文件大小优化
- [Puppeteer vs pdfmake Comparison](PUPPETEER_VS_PDFMAKE.md)
- [CHANGELOG](CHANGELOG.md)
- [KaTeX Supported Functions](https://katex.org/docs/supported.html)
- [Puppeteer Documentation](https://pptr.dev/)

---

## 🔧 Troubleshooting

### Chromium Download Failed?

Use Taobao mirror:
\`\`\`bash
npm config set puppeteer_download_host=https://registry.npmmirror.com/-/binary/chromium-browser-snapshots/
npm install puppeteer
\`\`\`

### High Memory Usage?

1. Reuse browser instances
2. Close unused pages promptly
3. Set `--max-old-space-size=4096`

### Missing Fonts?

Chromium has built-in global fonts. For special fonts, use Google Fonts or local font files.

---

## 📄 License

MIT

---

## 🎉 Why This Works

1. **Server-Side API**: Package size (300MB) is acceptable
2. **Global Languages**: Chromium built-in, no configuration needed
3. **Perfect Math**: Native KaTeX rendering, fast and accurate
4. **Simple Development**: Standard Web technology, low maintenance cost

**This is why we don't use pdfmake!** 🚀

---

**Made with ❤️ for developers who need perfect PDFs with math formulas**
