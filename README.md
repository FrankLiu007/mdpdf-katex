# md2pdf-katex

Markdown to PDF converter with perfect KaTeX math formula rendering and multilingual support.

## Quick Start

### Local Development

```bash
npm install
npm run build
npm start
```

Server runs on `http://localhost:3000`

### Docker

```bash
docker compose up -d
curl http://localhost:4000/health
```

## Features

- Perfect KaTeX math formula rendering
- Multilingual support (Chinese, Japanese, Korean, etc.)
- GitHub Flavored Markdown
- Syntax highlighting
- RESTful API

## Why Puppeteer?

### Server-Side vs Client-Side

**Server-Side (This Project) ✅**

- ✅ **Perfect Quality**: Chromium rendering engine, pixel-perfect PDFs
- ✅ **KaTeX Math**: Fast, accurate math formula rendering
- ✅ **Multilingual**: Built-in Noto fonts (CJK, Arabic, etc.)
- ✅ **Automated**: No user interaction required, perfect for APIs
- ✅ **Consistent**: Same output regardless of user's browser
- ✅ **Zero Config**: Works out of the box
- ⚠️ **Resource Cost**: Requires server CPU/memory (~300MB package)

**Client-Side Alternatives ❌**

- ❌ **Browser Print Dialog**: Requires manual user action, not suitable for APIs
- ❌ **pdfmake**: Complex font config, poor math rendering (SVG only)
- ❌ **html2canvas**: Low quality (rasterized), large file size
- ❌ **jsPDF**: Limited formatting, poor math support

**Conclusion**: For server-side APIs, Puppeteer is the best choice. 300MB package size is acceptable for server environments where quality and automation matter more than bundle size.

## API

### Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{"status":"ok","service":"markdown-to-pdf","timestamp":"..."}
```

### Convert Markdown to PDF

**POST /convert** (JSON)

```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Test\n\n$E = mc^2$"}' \
  -o output.pdf
```

**POST /convert-text** (Plain text)

```bash
curl -X POST http://localhost:3000/convert-text \
  -H "Content-Type: text/plain" \
  --data-binary @input.md \
  -o output.pdf
```

**Request Body (JSON):**
```json
{
  "markdown": "# Hello\n\n$E = mc^2$",
  "options": {
    "pageFormat": "A4",
    "margin": {"top": "20mm", "right": "15mm", "bottom": "20mm", "left": "15mm"}
  },
  "filename": "output.pdf"
}
```

### Examples

**Python:**
```python
import requests

response = requests.post(
    "http://localhost:3000/convert",
    json={"markdown": "# Test\n\n$E = mc^2$"}
)
with open("output.pdf", "wb") as f:
    f.write(response.content)
```

**JavaScript:**
```javascript
const response = await fetch('http://localhost:3000/convert', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({markdown: '# Test\n\n$E = mc^2$'})
});
const blob = await response.blob();
```

## Docker

### Quick Start

```bash
docker compose up -d
docker compose logs -f
docker compose down
```

### Custom Port

Edit `docker-compose.yaml`:
```yaml
ports:
  - "127.0.0.1:8080:3000"  # host:container
```

### Docker Run

```bash
docker build -t markdown-to-pdf .
docker run -d -p 4000:3000 --name md2pdf markdown-to-pdf
docker logs -f md2pdf
```

### Security

Service binds to `127.0.0.1` by default (localhost only). For production:
- Use reverse proxy (nginx) with authentication
- Or bind to internal network IP only
- Never expose to public internet without auth

## Build

### Local Build

```bash
npm run build    # Compile TypeScript
npm start        # Run compiled JS
```

### Docker Build

```bash
docker build -t markdown-to-pdf .
```

Build process:
1. Install dependencies (including TypeScript)
2. Compile TypeScript → JavaScript
3. Remove dev dependencies
4. Run production code

## Markdown Features

**Math Formulas:**
```markdown
Inline: $E = mc^2$

Display:
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

**Multilingual:**
```markdown
# 中文标题
质能方程：$E = mc^2$

## 日本語
オイラーの公式：$e^{i\pi} + 1 = 0$
```

**Tables, Code Blocks, Syntax Highlighting** - All supported

## Troubleshooting

**Port conflict:**
```yaml
# docker-compose.yaml
ports:
  - "127.0.0.1:8080:3000"
```

**Chromium issues:**
```yaml
shm_size: '1gb'
```


## License

MIT
