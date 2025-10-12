# 更新日志

## [1.3.0] - 2025-10-12

### 🚀 生产构建与部署

**Build System**
- ✅ TypeScript 编译为 JavaScript 生产环境方案
- ✅ 修复 Docker `tsx: not found` 错误
- ✅ 添加 `npm run build` 脚本编译 TS → dist/
- ✅ 修改 `npm start` 使用编译后的 JavaScript
- ✅ Docker 构建流程优化：编译后删除 dev 依赖

**Docker 改进**
- ✅ 创建完整的生产环境 Dockerfile
- ✅ 添加 `.dockerignore` 优化构建
- ✅ 修改端口映射 4000:3000（避免冲突）
- ✅ 多阶段构建：安装依赖 → 编译 → 清理 → 运行

**Bug 修复**
- ✅ 修复 `pdf-generator-lib.ts` Buffer 类型转换
- ✅ 移除 `pdf-generator-puppeteer.ts` 未使用的依赖
- ✅ 修复 `server.ts` 中 `index.html` 路径（支持编译后目录结构）

**文档简化**
- ✅ 简化主 README.md（335 → 180 行）
- ✅ 简化 README.Docker.md（240 → 160 行）
- ✅ 删除冗余的 README.Docker.Quick.md
- ✅ 创建 DEPLOYMENT.md 构建部署完整指南

---

## [1.2.0] - 2025-10-11

### 🎨 新增功能

#### 新增
- **代码语法高亮**：使用 `rehype-highlight` + `highlight.js`
  - 支持 180+ 编程语言
  - GitHub 主题样式
  - JavaScript, Python, Java, C++, Rust, Go, SQL, Bash 等
  - 与 GitHub Markdown CSS 完美集成
  
- **GitHub 样式**：使用官方 `github-markdown-css`
  - 完全一致的 GitHub.com 外观
  - 标题、表格、引用、代码块等
  - 更专业的 PDF 输出

#### 增强
- **矩阵示例**：在 Web 界面添加"矩阵运算"快速示例
  - 2x2/3x3 矩阵
  - 矩阵转置
  - 行列式
  - 线性方程组
  - 特征值问题

### 依赖更新
- 新增 `rehype-highlight` ^3.0.0
- 新增 `highlight.js` ^11.9.0

---

## [1.1.0] - 2025-10-11

### 🎉 重大修复和优化

#### 修复
- **关键问题**：修复 PDF 文件损坏问题（文件过大且无法打开）
  - 原因：`res.send()` 破坏了二进制数据
  - 解决：改用 `res.end(buffer, 'binary')` 确保原始二进制传输
  - 效果：后端发送 216 KB，前端接收 2.54 MB → 现在都是 216 KB ✅
  - PDF 现在可以正常打开，所有内容完整

#### 优化
- **字体加载**：移除 Google Fonts 外部加载
  - 文件大小从可能的数 MB 降至 ~200 KB
  - 改用系统字体栈（微软雅黑、宋体等）
  - 仍然支持多语言（中日韩俄等）

- **资源拦截**：添加 Puppeteer 请求过滤
  - 只加载必要资源（CSS、KaTeX 字体）
  - 拒绝不必要的字体、图片、媒体
  - 生成更快，文件更小

- **网络策略**：改进页面加载
  - 从 `networkidle0` 改为 `networkidle2`，超时 10 秒
  - 更可靠，响应更快

#### 增强
- **HTTP 响应头**：添加正确的 CORS 头
  - `Access-Control-Expose-Headers` 暴露 Content-Length 和 X-Generation-Time
  - `Cache-Control: no-cache` 防止缓存问题
  - 前端可以读取准确的文件大小

- **Web 界面**：添加调试信息
  - 显示后端大小、blob 大小、实际文件大小对比
  - 帮助诊断数据传输问题
  - 更好的错误消息

#### 文档
- **整合**：合并多个指南为单一 `QUICK_START.md`
  - 删除冗余：QUICK_START_SERVER.md, WEB_TESTER_GUIDE.md, QUICK_START_PUPPETEER.md
  - 删除过时：MIGRATION_SUMMARY.md, SERVER_SETUP_COMPLETE.md, SERVER_README.md
- **新增**：`PDF_OPTIMIZATION.md` 优化策略说明
- **更新**：README.md 文档链接

#### 清理
- 删除所有测试文件和生成的 PDF
- 删除测试脚本（test-*.ts, quick-test.ts, diagnose-*.ts）
- 简化 package.json 脚本（start, server, dev）
- 更新 main 入口为 pdf-generator-lib.ts

### 性能结果

| 文档大小 | PDF 大小 | 生成时间 |
|---------|---------|---------|
| 简单 (19 字符) | 16.72 KB | ~1.7s |
| 中等 (82 字符) | 44.82 KB | ~2.3s |
| 完整 (862 字符) | 216.67 KB | ~3.3s |

### 迁移说明

如果从早期版本升级：
1. 重启服务器（Ctrl+C 然后 `npm run server`）
2. 清除浏览器缓存
3. 测试 PDF 生成 - 文件应该在 ~200 KB（不是 MB）
4. PDF 应该能正常打开

---

## [1.0.0] - 2025-10-11

### 🎉 重大变更：从 pdfmake 迁移到 Puppeteer

#### 新增
- ✅ 基于 Puppeteer 的 PDF 生成方案
- ✅ 完美的 KaTeX 数学公式渲染
- ✅ 开箱即用的全球语言支持
- ✅ 简洁的实现（<300 行代码）

#### 删除
- ❌ pdfmake 浏览器端和 Node.js 端实现
- ❌ MathJax 数学公式渲染
- ❌ 复杂的字体配置系统
- ❌ 62 个不必要的依赖包
- ❌ 1000+ 行转换代码

#### 改进
- 📦 包体积：从 ~80 个包减少到 ~15 个包
- 📝 代码量：减少 70%+
- 🚀 数学公式：从 MathJax（慢）到 KaTeX（快）
- 🌍 多语言：从需要配置到开箱即用
- 🛠️ 维护性：从复杂到简单

#### 理由
1. **服务器端 API**：300MB 包大小可接受
2. **数学公式质量**：KaTeX 远优于 MathJax SVG
3. **多语言支持**：Chromium 内置，无需配置
4. **开发维护**：标准 Web 技术，成本低

---

## 迁移指南

### 从 pdfmake 版本迁移

**旧代码（pdfmake）：**
\`\`\`typescript
import { unified } from 'unified';
import pdf from './lib/node.js';

const processor = unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(pdf, { output: 'buffer' });

const doc = await processor.process(markdown);
const buffer = await doc.result;
\`\`\`

**新代码（Puppeteer）：**
\`\`\`typescript
import { markdownToPdfWithPuppeteer } from './pdf-generator-puppeteer';

await markdownToPdfWithPuppeteer(markdown, 'output.pdf');
\`\`\`

**更简单、更直接、更强大！**

---

## 备份

如需回退到 pdfmake 版本：
\`\`\`bash
git checkout pdfmake-backup
\`\`\`

---

**推荐所有用户升级到 Puppeteer 方案！** 🚀

