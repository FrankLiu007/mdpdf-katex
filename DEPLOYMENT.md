# 🚀 构建与部署指南

本文档说明如何构建和部署 Markdown to PDF 服务。

---

## ✅ 方案二实施完成

我们已经实施了 **TypeScript 编译为 JavaScript** 的生产环境方案。

### 🔧 核心改动

1. **package.json**
   - ✅ 添加 `build` 脚本：`tsc`
   - ✅ 修改 `start` 脚本：使用编译后的 `node dist/server.js`
   - ✅ 保留 `server` 和 `dev` 脚本用于开发

2. **Dockerfile**
   - ✅ 复制 `tsconfig.json` 到容器
   - ✅ 安装全部依赖（包含 devDependencies）
   - ✅ 运行 `npm run build` 编译 TypeScript
   - ✅ 使用 `npm prune --production` 移除 dev 依赖
   - ✅ 最终镜像只包含编译后的 JS 和生产依赖

3. **.dockerignore**
   - ✅ 新建文件，优化构建效率
   - ✅ 排除 `node_modules`、`dist`、文档等不必要文件

4. **端口配置**
   - ✅ `docker-compose.standalone.yaml`：主机端口改为 `3001`
   - ✅ 容器内部仍使用 `3000` 端口
   - ✅ 更新 `README.Docker.md` 说明

5. **代码修复**
   - ✅ `pdf-generator-lib.ts`：修复 Buffer 类型转换
   - ✅ `pdf-generator-puppeteer.ts`：移除不需要的 `remark-html` 导入

---

## 📦 本地构建测试

### 编译 TypeScript

\`\`\`bash
npm run build
\`\`\`

编译成功后，会在 `dist/` 目录生成：
- `server.js`
- `pdf-generator-lib.js`
- `pdf-generator-puppeteer.js`
- 其他 `.js` 文件

### 运行编译后的代码

\`\`\`bash
npm start
\`\`\`

或直接运行：

\`\`\`bash
node dist/server.js
\`\`\`

### 测试服务

\`\`\`bash
# 健康检查
curl http://localhost:3000/health

# 生成 PDF
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Test\n\n$E = mc^2$"}' \
  -o test.pdf
\`\`\`

---

## 🐳 Docker 部署

### 方式一：Docker Compose（推荐）

\`\`\`bash
# 构建并启动（端口 3001）
docker-compose -f docker-compose.standalone.yaml up -d

# 查看日志
docker-compose -f docker-compose.standalone.yaml logs -f

# 测试（注意端口 3001）
curl http://localhost:3001/health

# 停止服务
docker-compose -f docker-compose.standalone.yaml down
\`\`\`

### 方式二：Docker Run

\`\`\`bash
# 构建镜像
docker build -t markdown-to-pdf .

# 运行容器（自定义端口，如 8080）
docker run -d -p 8080:3000 --name md-to-pdf markdown-to-pdf

# 测试
curl http://localhost:8080/health

# 停止容器
docker stop md-to-pdf
docker rm md-to-pdf
\`\`\`

---

## 🎯 端口说明

### 默认配置

- **开发模式**（`npm run server`）：`3000`
- **Docker Compose**：主机 `3001` → 容器 `3000`
- **Docker Run**：可自定义，如 `-p 8080:3000`

### 端口冲突解决

如果 3000 或 3001 端口被占用：

**方法一：修改 docker-compose.standalone.yaml**

\`\`\`yaml
ports:
  - "8080:3000"  # 改为任何可用端口
\`\`\`

**方法二：使用 docker run 指定端口**

\`\`\`bash
docker run -d -p 8080:3000 --name md-to-pdf markdown-to-pdf
\`\`\`

**重要**：容器内部始终使用 `3000` 端口，不需要修改代码。

---

## 🔍 构建流程详解

### Dockerfile 构建步骤

1. **基础镜像**：`node:22-alpine`
2. **安装系统依赖**：Chromium、字体等
3. **复制配置文件**：`package.json`、`tsconfig.json`
4. **安装全部依赖**：`npm ci`（包含 TypeScript）
5. **复制源代码**：所有 `.ts` 文件和 `index.html`
6. **编译 TypeScript**：`npm run build` → 生成 `dist/` 目录
7. **清理 dev 依赖**：`npm prune --production`
8. **创建非 root 用户**：安全性考虑
9. **启动服务**：`npm start` → `node dist/server.js`

### 为什么这样做？

✅ **生产环境不需要 tsx**
- `tsx` 只在开发时用于直接运行 TypeScript
- 生产环境使用编译后的 JavaScript，更快更稳定

✅ **减小镜像体积**
- 编译后删除 TypeScript、@types 等 dev 依赖
- 最终镜像只包含必要的生产依赖

✅ **提高运行效率**
- 直接运行 JavaScript，无需实时编译
- 启动速度更快，内存占用更小

---

## 🧪 验证清单

构建完成后，请验证以下内容：

- [ ] `npm run build` 成功编译
- [ ] `dist/` 目录包含所有 `.js` 文件
- [ ] `npm start` 能正常启动服务器
- [ ] `curl http://localhost:3000/health` 返回成功
- [ ] Docker 镜像构建成功
- [ ] Docker 容器正常运行
- [ ] 健康检查通过
- [ ] PDF 生成功能正常

---

## 📚 相关文档

- [Docker 部署指南](README.Docker.md)
- [API 文档](API_DOCUMENTATION.md)
- [快速开始](QUICK_START.md)

---

## 🎉 现在可以部署了！

所有问题已解决：
- ✅ `tsx: not found` - 已修复（使用编译后的 JS）
- ✅ 端口 3000 冲突 - 已解决（改为 3001 或自定义）
- ✅ TypeScript 编译错误 - 已修复
- ✅ Buffer 类型问题 - 已修复

**直接运行即可**：

\`\`\`bash
docker-compose -f docker-compose.standalone.yaml up -d
\`\`\`

**测试**：

\`\`\`bash
curl http://localhost:3001/health
\`\`\`

🚀 **享受完美的 PDF 生成服务吧！**

