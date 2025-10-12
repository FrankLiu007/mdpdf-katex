# mdpdf-katex

> Markdown to PDF with Puppeteer & KaTeX

Convert Markdown to beautiful PDFs with **perfect** math formula rendering.

---

## 🚀 Quick Start

### Local Development

```bash
npm install
npm run server
```

Open http://localhost:3000 to test.

### Docker Deployment

```bash
# Docker Compose (recommended)
docker-compose -f docker-compose.standalone.yaml up -d

# Test (port 4000 by default)
curl http://localhost:4000/health
```

---

## 📐 Features

- ✅ Perfect KaTeX math formula rendering
- ✅ Multilingual support (Chinese, Japanese, Korean, etc.)
- ✅ GitHub Flavored Markdown
- ✅ Syntax highlighting
- ✅ RESTful API

---

## 🌐 API Usage

### Health Check

```bash
curl http://localhost:3000/health
```

### Convert Markdown to PDF

```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Test\n\n$E = mc^2$"}' \
  -o output.pdf
```

### Python Example

```python
import requests

response = requests.post(
    "http://localhost:3000/convert",
    json={"markdown": "# Test\n\n数学公式：$E = mc^2$"}
)

with open("output.pdf", "wb") as f:
    f.write(response.content)
```

---

## 🎯 Why This Solution?

**Perfect for Server-Side APIs**

- ✅ **KaTeX Math**: Fast, accurate rendering
- ✅ **Multilingual**: Built-in font support
- ✅ **No Config**: Works out of the box
- ✅ **Simple**: Standard web tech

**Why Not Browser-Based?**

- ❌ pdfmake: Complex font config, poor math rendering
- ❌ Print Dialog: Manual user action required
- ❌ html2canvas: Low quality, large file size

**✅ Puppeteer**: Server-side, perfect quality, zero config

---

## 📖 Examples

### Inline Math

```markdown
Einstein's equation $E = mc^2$ changed physics.
```

### Display Math

```markdown
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

### Multilingual

```markdown
# 中文标题

质能方程：$E = mc^2$

## 日本語

オイラーの公式：$e^{i\pi} + 1 = 0$
```

---

## 🐳 Docker

### Quick Start

```bash
# Start service (port 4000)
docker-compose -f docker-compose.standalone.yaml up -d

# Check logs
docker-compose -f docker-compose.standalone.yaml logs -f

# Stop service
docker-compose -f docker-compose.standalone.yaml down
```

### Custom Port

Edit `docker-compose.standalone.yaml`:

```yaml
ports:
  - "8080:3000"  # Change host port
```

Or use `docker run`:

```bash
docker build -t markdown-to-pdf .
docker run -d -p 8080:3000 markdown-to-pdf
```

---

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Build & deploy guide
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - API reference
- **[DOCKER_USAGE.md](DOCKER_USAGE.md)** - Docker integration
- **[QUICK_START.md](QUICK_START.md)** - Detailed tutorial

---

## 🔧 Troubleshooting

### Port Already in Use?

Change port in `docker-compose.standalone.yaml`:

```yaml
ports:
  - "4000:3000"  # Use different port
```

### Chromium Issues?

Add shared memory:

```yaml
shm_size: '1gb'
```

### High Memory Usage?

Limit resources:

```yaml
deploy:
  resources:
    limits:
      memory: 1G
```

---

## 📄 License

MIT

---

**Made with ❤️ for developers who need perfect PDFs with math formulas**
