import { markdownToPdfBuffer } from './pdf-generator-lib.js';
import fs from 'fs';

const testMarkdown = `# 代码高亮测试

这个文档测试多种编程语言的语法高亮。

## JavaScript

\`\`\`javascript
// 斐波那契数列
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log(\`Fibonacci(10) = \${result}\`);

// 异步函数
async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}
\`\`\`

## Python

\`\`\`python
# 快速排序
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

# 类定义
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def greet(self):
        print(f"Hello, I'm {self.name}, {self.age} years old.")

person = Person("Alice", 25)
person.greet()
\`\`\`

## TypeScript

\`\`\`typescript
// 接口定义
interface User {
  id: number;
  name: string;
  email?: string;
}

// 泛型函数
function identity<T>(arg: T): T {
  return arg;
}

// 类型守卫
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// 使用
const users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob' }
];
\`\`\`

## Java

\`\`\`java
// Java 类示例
public class Calculator {
    private int result;
    
    public Calculator() {
        this.result = 0;
    }
    
    public int add(int a, int b) {
        result = a + b;
        return result;
    }
    
    public static void main(String[] args) {
        Calculator calc = new Calculator();
        int sum = calc.add(10, 20);
        System.out.println("Result: " + sum);
    }
}
\`\`\`

## C++

\`\`\`cpp
#include <iostream>
#include <vector>
#include <algorithm>

template<typename T>
class Stack {
private:
    std::vector<T> elements;
    
public:
    void push(const T& elem) {
        elements.push_back(elem);
    }
    
    T pop() {
        if (elements.empty()) {
            throw std::out_of_range("Stack is empty");
        }
        T elem = elements.back();
        elements.pop_back();
        return elem;
    }
};

int main() {
    Stack<int> s;
    s.push(10);
    s.push(20);
    std::cout << "Popped: " << s.pop() << std::endl;
    return 0;
}
\`\`\`

## Rust

\`\`\`rust
// Rust 示例
fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

struct Person {
    name: String,
    age: u32,
}

impl Person {
    fn new(name: String, age: u32) -> Self {
        Person { name, age }
    }
    
    fn greet(&self) {
        println!("Hello, I'm {}, {} years old.", self.name, self.age);
    }
}

fn main() {
    let person = Person::new(String::from("Alice"), 25);
    person.greet();
    println!("Fibonacci(10) = {}", fibonacci(10));
}
\`\`\`

## Go

\`\`\`go
package main

import (
    "fmt"
    "sync"
)

// 并发示例
func worker(id int, wg *sync.WaitGroup) {
    defer wg.Done()
    fmt.Printf("Worker %d starting\\n", id)
    // 模拟工作
    fmt.Printf("Worker %d done\\n", id)
}

type Person struct {
    Name string
    Age  int
}

func (p Person) Greet() {
    fmt.Printf("Hello, I'm %s, %d years old.\\n", p.Name, p.Age)
}

func main() {
    var wg sync.WaitGroup
    for i := 1; i <= 3; i++ {
        wg.Add(1)
        go worker(i, &wg)
    }
    wg.Wait()
    
    person := Person{Name: "Alice", Age: 25}
    person.Greet()
}
\`\`\`

## SQL

\`\`\`sql
-- 创建表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入数据
INSERT INTO users (name, email) VALUES
    ('Alice', 'alice@example.com'),
    ('Bob', 'bob@example.com');

-- 查询
SELECT u.name, u.email, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY order_count DESC;
\`\`\`

## Bash/Shell

\`\`\`bash
#!/bin/bash

# 函数定义
function greet() {
    local name=\${1:-"World"}
    echo "Hello, \$name!"
}

# 循环
for i in {1..5}; do
    echo "Number: \$i"
done

# 条件判断
if [ -f "file.txt" ]; then
    echo "File exists"
else
    echo "File does not exist"
fi

# 管道和重定向
cat file.txt | grep "pattern" | sort | uniq > output.txt

greet "Alice"
\`\`\`

## JSON

\`\`\`json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "A sample project",
  "scripts": {
    "start": "node index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
\`\`\`

## 行内代码

行内代码示例：\`const x = 42;\` 和 \`print("Hello")\` 以及 \`SELECT * FROM users;\`

---

**代码高亮测试完成！** 🎨
`;

async function test() {
  console.log('🎨 测试代码语法高亮...\n');

  try {
    const startTime = Date.now();
    const buffer = await markdownToPdfBuffer(testMarkdown);
    const duration = Date.now() - startTime;

    const outputPath = 'code-highlight-output.pdf';
    fs.writeFileSync(outputPath, buffer);

    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(2);

    console.log('✅ PDF 生成成功！');
    console.log(`📄 文件: ${outputPath}`);
    console.log(`📊 大小: ${sizeKB} KB`);
    console.log(`⏱️  耗时: ${duration}ms`);
    console.log('\n💡 请打开 PDF 查看代码高亮效果！');
    console.log('\n支持的语言：');
    console.log('  - JavaScript / TypeScript');
    console.log('  - Python');
    console.log('  - Java / C++');
    console.log('  - Rust / Go');
    console.log('  - SQL / Bash');
    console.log('  - JSON / YAML');
    console.log('  - 以及 180+ 其他语言');
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
  }

  process.exit(0);
}

test();

