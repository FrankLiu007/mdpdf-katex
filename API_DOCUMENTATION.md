# Markdown to PDF API Documentation

High-performance API for converting Markdown to PDF with KaTeX math formulas and multilingual support.

## Quick Start

### Installation

```bash
npm install
```

### Start Server

```bash
# Production
npm run server

# Development (auto-reload)
npm run server:dev
```

Server runs on `http://localhost:3000`

---

## API Endpoints

### GET /

Service information and available endpoints.

**Response:**
```json
{
  "service": "Markdown to PDF API",
  "version": "1.0.0",
  "endpoints": {
    "POST /convert": "Convert markdown to PDF",
    "GET /health": "Health check"
  }
}
```

---

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "markdown-to-pdf",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### POST /convert

Convert Markdown to PDF (JSON format).

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "markdown": "# Hello World\n\n$E = mc^2$",
  "options": {
    "pageFormat": "A4",
    "margin": {
      "top": "20mm",
      "right": "15mm",
      "bottom": "20mm",
      "left": "15mm"
    }
  },
  "filename": "output.pdf"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `markdown` | string | ✅ Yes | Markdown content to convert |
| `options` | object | ❌ No | PDF generation options |
| `options.pageFormat` | string | ❌ No | Page format: `"A4"` or `"Letter"` (default: `"A4"`) |
| `options.margin` | object | ❌ No | Page margins |
| `filename` | string | ❌ No | Output filename (default: auto-generated) |

**Response:**
- Content-Type: `application/pdf`
- Headers:
  - `Content-Disposition`: `attachment; filename="output.pdf"`
  - `Content-Length`: PDF file size in bytes
  - `X-Generation-Time`: Generation time in milliseconds

---

### POST /convert-text

Convert Markdown to PDF (plain text format).

**Request Headers:**
```
Content-Type: text/plain
```

**Request Body:**
```
# Hello World

Einstein's equation: $E = mc^2$

$$
\int_{0}^{1} x^2 dx = \frac{1}{3}
$$
```

**Response:**
Same as `/convert` endpoint.

---

## Usage Examples

### cURL

```bash
# JSON format
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Test\n\n$E = mc^2$", "filename": "test.pdf"}' \
  -o output.pdf

# Plain text format
curl -X POST http://localhost:3000/convert-text \
  -H "Content-Type: text/plain" \
  --data-binary @input.md \
  -o output.pdf
```

### JavaScript/TypeScript

```typescript
// Using fetch
async function convertMarkdownToPdf(markdown: string): Promise<Blob> {
  const response = await fetch('http://localhost:3000/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      markdown,
      filename: 'document.pdf'
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.blob();
}

// Usage
const markdown = `
# Test Document

Math: $E = mc^2$

$$
\\int_{0}^{1} x^2 dx = \\frac{1}{3}
$$
`;

const pdfBlob = await convertMarkdownToPdf(markdown);
const url = URL.createObjectURL(pdfBlob);
window.open(url);
```

### Python

```python
import requests

def convert_markdown_to_pdf(markdown: str, output_path: str):
    response = requests.post(
        'http://localhost:3000/convert',
        json={
            'markdown': markdown,
            'filename': 'output.pdf'
        }
    )
    
    if response.status_code == 200:
        with open(output_path, 'wb') as f:
            f.write(response.content)
        print(f"✅ PDF saved: {output_path}")
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.json())

# Usage
markdown = """
# Test Document

Math: $E = mc^2$

$$
\\int_{0}^{1} x^2 dx = \\frac{1}{3}
$$
"""

convert_markdown_to_pdf(markdown, 'output.pdf')
```

### Node.js (axios)

```javascript
import axios from 'axios';
import fs from 'fs';

async function convertMarkdownToPdf(markdown, outputPath) {
  const response = await axios.post(
    'http://localhost:3000/convert',
    {
      markdown,
      filename: 'output.pdf'
    },
    {
      responseType: 'arraybuffer'
    }
  );

  fs.writeFileSync(outputPath, response.data);
  console.log(`✅ PDF saved: ${outputPath}`);
}

// Usage
const markdown = `
# Test Document

Math: $E = mc^2$

$$
\\int_{0}^{1} x^2 dx = \\frac{1}{3}
$$
`;

await convertMarkdownToPdf(markdown, 'output.pdf');
```

---

## Markdown Features

### Math Formulas (KaTeX)

**Inline Math:**
```markdown
Einstein's equation: $E = mc^2$
```

**Display Math:**
```markdown
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

**Complex Formulas:**
```markdown
$$
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
\begin{bmatrix}
x \\
y
\end{bmatrix}
=
\begin{bmatrix}
ax + by \\
cx + dy
\end{bmatrix}
$$
```

### Multilingual Support

Chinese, Japanese, Korean, Russian, Arabic, and more - all work out of the box:

```markdown
# 中文标题

质能方程：$E = mc^2$

## 日本語

オイラーの公式：$e^{i\pi} + 1 = 0$

## 한국어

피타고라스 정리：$a^2 + b^2 = c^2$
```

### Tables

```markdown
| Feature | Supported |
|---------|-----------|
| Math | ✅ Yes |
| Tables | ✅ Yes |
| Code | ✅ Yes |
```

### Code Blocks

````markdown
```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}
```
````

---

## Performance

### Browser Instance Reuse

The server reuses a single Puppeteer browser instance for all requests, providing excellent performance:

- First request: ~1-2 seconds (browser launch)
- Subsequent requests: ~200-500ms (per PDF)

### Concurrency

The server handles multiple concurrent requests efficiently. For high-load scenarios, consider:

1. **Horizontal scaling**: Run multiple server instances behind a load balancer
2. **Request queuing**: Implement a queue (e.g., Bull, Redis) for request management

---

## Error Handling

### Error Response Format

```json
{
  "error": "Internal server error",
  "message": "Error description",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Common Errors

| Status Code | Description | Solution |
|-------------|-------------|----------|
| 400 | Invalid request | Check request body format |
| 500 | Server error | Check server logs |

---

## Configuration

### Environment Variables

```bash
PORT=3000  # Server port (default: 3000)
```

### Docker Deployment

```dockerfile
FROM node:22-alpine

# Install Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
CMD ["npm", "run", "server"]
```

---

## Troubleshooting

### High Memory Usage?

Puppeteer browser instances use ~100-200MB memory. For high-load scenarios:

1. Set Node.js memory limit: `node --max-old-space-size=4096 server.js`
2. Implement request rate limiting
3. Consider horizontal scaling

### Slow PDF Generation?

1. Check network latency (KaTeX CSS loading)
2. Optimize markdown content size
3. Use CDN for static assets

---

## License

MIT

