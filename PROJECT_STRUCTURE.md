# 项目结构说明

## 📁 核心文件

### 服务器和库
| 文件 | 用途 | 说明 |
|------|------|------|
| `server.ts` | HTTP 服务器 | Express API 服务器，提供 `/convert` 端点 |
| `pdf-generator-lib.ts` | 核心库 | 优化的 PDF 生成库，包含浏览器管理器 |
| `index.html` | Web 界面 | 浏览器测试界面，可视化测试 API |
| `pdf-generator-puppeteer.ts` | 简单示例 | 独立的 PDF 生成器，适合学习参考 |

### 配置文件
| 文件 | 用途 |
|------|------|
| `package.json` | npm 包配置和脚本 |
| `tsconfig.json` | TypeScript 编译配置 |

## 📚 文档

### 用户文档（按推荐阅读顺序）
| 文档 | 内容 | 推荐度 |
|------|------|--------|
| `README.md` | 项目概述、特性介绍 | ⭐⭐⭐ 必读 |
| `QUICK_START.md` | 快速开始指南、示例代码 | ⭐⭐⭐ 必读 |
| `API_DOCUMENTATION.md` | 完整 API 参考 | ⭐⭐ 开发必备 |
| `PDF_OPTIMIZATION.md` | PDF 优化说明、故障排查 | ⭐ 遇到问题时阅读 |
| `PUPPETEER_VS_PDFMAKE.md` | 技术选型对比 | ⭐ 了解背景 |
| `CHANGELOG.md` | 版本历史、迁移说明 | 升级时参考 |

## 🚀 使用方式

### 方式 1：HTTP Server（推荐）⭐

**启动服务器：**
```bash
npm install
npm run server
# 或 npm start
```

**访问 Web 界面：**
```
http://localhost:3000
```

**调用 API：**
```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Hello\n\n$E = mc^2$"}' \
  -o output.pdf
```

### 方式 2：作为库使用

```typescript
import { markdownToPdf, markdownToPdfBuffer } from './pdf-generator-lib.js';

// 生成文件
await markdownToPdf(markdown, 'output.pdf');

// 生成 Buffer（适合 HTTP 响应）
const buffer = await markdownToPdfBuffer(markdown);
```

## 📊 npm 脚本

| 命令 | 功能 |
|------|------|
| `npm start` | 启动服务器（同 `npm run server`） |
| `npm run server` | 启动生产服务器 |
| `npm run dev` | 启动开发服务器（监听文件变化） |

## 🌲 目录结构

```
remark-pdf/
├── server.ts                    # Express HTTP 服务器
├── pdf-generator-lib.ts         # 核心 PDF 生成库
├── pdf-generator-puppeteer.ts   # 简单示例生成器
├── index.html                   # Web 测试界面
│
├── README.md                    # 项目主文档
├── QUICK_START.md               # 快速开始指南 ⭐
├── API_DOCUMENTATION.md         # API 完整参考
├── PDF_OPTIMIZATION.md          # 优化说明
├── PUPPETEER_VS_PDFMAKE.md     # 技术对比
├── CHANGELOG.md                 # 版本历史
├── PROJECT_STRUCTURE.md         # 本文件
│
├── package.json                 # npm 配置
├── tsconfig.json                # TypeScript 配置
├── LICENSE                      # MIT 许可证
│
└── node_modules/                # 依赖包
```

## 🎯 核心依赖

| 包 | 用途 | 版本 |
|---|------|------|
| `puppeteer` | 无头浏览器，生成 PDF | ^23.11.1 |
| `express` | HTTP 服务器框架 | ^4.21.2 |
| `unified` | Markdown 处理器 | ^10.1.1 |
| `remark-*` | Markdown 解析和转换 | ^3.0.1+ |
| `rehype-katex` | KaTeX 数学公式渲染 | ^7.0.1 |
| `tsx` | TypeScript 执行器 | ^4.7.0 |

## 🔧 关键技术点

### PDF 生成流程

1. **Markdown → HTML**
   ```
   Markdown
     ↓ remark-parse
   MDAST (Markdown AST)
     ↓ remark-math
   带数学的 MDAST
     ↓ remark-gfm
   带 GFM 的 MDAST
     ↓ remark-rehype
   HAST (HTML AST)
     ↓ rehype-katex
   带 KaTeX 的 HAST
     ↓ rehype-stringify
   HTML 字符串
   ```

2. **HTML → PDF**
   ```
   HTML
     ↓ Puppeteer.setContent()
   浏览器渲染
     ↓ page.pdf()
   PDF Buffer
     ↓ res.end(buffer, 'binary')
   客户端接收
   ```

### 性能优化

- **浏览器重用**：`browserManager` 单例模式，避免重复启动
- **资源拦截**：只加载必要资源（CSS、字体），拒绝图片等
- **系统字体**：使用系统字体栈，避免外部字体下载
- **超时控制**：`networkidle2` + 10 秒超时，防止卡死

### 二进制传输

- ❌ 不要用 `res.send(buffer)` - 会损坏数据
- ✅ 使用 `res.end(buffer, 'binary')` - 保证完整性
- ✅ 设置正确的 `Content-Type` 和 `Content-Length`

## 🐛 常见问题

### 问题：PDF 文件过大或无法打开

**检查**：
1. 后端日志中的文件大小
2. 前端显示的文件大小
3. 实际下载的文件大小

**解决**：参考 `PDF_OPTIMIZATION.md`

### 问题：服务器启动失败

**检查**：
```bash
npm install  # 确保依赖已安装
npm run server  # 启动服务器
```

### 问题：Chromium 下载失败（中国大陆）

**解决**：
```bash
npm config set puppeteer_download_host=https://registry.npmmirror.com/-/binary/chromium-browser-snapshots/
npm install puppeteer
```

## 📖 推荐学习路径

1. **快速上手**（5 分钟）
   - 阅读 `README.md`
   - 运行 `npm run server`
   - 打开 http://localhost:3000 测试

2. **深入了解**（30 分钟）
   - 阅读 `QUICK_START.md` 了解三种使用方式
   - 查看 `API_DOCUMENTATION.md` 了解完整 API
   - 测试各种 Markdown 语法和数学公式

3. **开发集成**（1 小时）
   - 阅读 `pdf-generator-lib.ts` 源码
   - 了解 `server.ts` API 实现
   - 根据需求自定义样式和选项

4. **生产部署**（1 小时）
   - 参考 `QUICK_START.md` Docker 部署
   - 配置环境变量和资源限制
   - 监控性能和错误日志

## 🎉 项目亮点

- ✅ **简洁**：核心代码 < 500 行
- ✅ **强大**：完美的数学公式和多语言支持
- ✅ **易用**：三种使用方式，适合各种场景
- ✅ **可靠**：经过充分测试和优化
- ✅ **维护**：清晰的代码结构和完整文档

---

**需要帮助？** 查看文档或提交 Issue！

