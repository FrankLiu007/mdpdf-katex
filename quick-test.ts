/**
 * 快速测试 - 验证服务器是否正常工作
 */

const API_URL = 'http://localhost:3000';

async function quickTest() {
  console.log('🧪 Quick Test: Converting Markdown to PDF...\n');

  const markdown = `
# 测试文档 / Test Document

## 数学公式测试

爱因斯坦质能方程：$E = mc^2$

积分公式：

$$
\\int_{0}^{1} x^2 dx = \\frac{1}{3}
$$

## 表格测试

| 特性 | 状态 |
|------|------|
| 数学公式 | ✅ 支持 |
| 多语言 | ✅ 支持 |
| 表格 | ✅ 支持 |

## 代码测试

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

---

**测试完成！**
  `.trim();

  try {
    console.log('📤 Sending request to server...');
    
    const response = await fetch(`${API_URL}/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        markdown,
        filename: 'quick-test-output.pdf'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 保存到文件
    const fs = await import('fs');
    fs.writeFileSync('quick-test-output.pdf', buffer);

    const size = response.headers.get('Content-Length');
    const time = response.headers.get('X-Generation-Time');

    console.log('✅ Success!');
    console.log(`   📄 File: quick-test-output.pdf`);
    console.log(`   📊 Size: ${size} bytes`);
    console.log(`   ⏱️  Time: ${time}`);
    console.log('\n✨ PDF generated successfully! Check quick-test-output.pdf\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

quickTest();

