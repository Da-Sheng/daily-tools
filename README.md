# 日常工具箱 (Daily Tools)

一个实用工具集合，包含各种生活和工作中常用的计算工具、转换工具等。

## 功能特点

- 分类展示多种实用工具
- 响应式设计，适配各种设备
- 美观的用户界面
- 详细的使用说明

## 现有工具

- **金融工具**
  - 房贷计算器
  - 贷款计算器（规划中）
- **转换工具**
  - 单位转换器（规划中）
- **生成器**
  - 随机生成器（规划中）
- **日常工具**
  - 日期计算器（规划中）

## 技术栈

- React 18
- TypeScript
- Ant Design 5
- Webpack 5 (代码分割和哈希)
- React Router 6
- Jest 单元测试
- ESLint + Prettier
- Husky (Git Hooks)

## 安装与运行

### 前提条件

- Node.js (推荐 v16.0.0 或更高版本)
- npm (推荐 v7.0.0 或更高版本)

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
npm start
```

浏览器将自动打开 http://localhost:3000

### 生产环境构建

```bash
npm run build
```

构建文件将输出到 `dist` 目录。

### 运行测试

```bash
npm test
```

## 项目结构

```
daily-tools/
├── public/               # 静态资源
├── src/                  # 源代码
│   ├── components/       # 公共组件
│   ├── hooks/            # 自定义钩子
│   ├── layouts/          # 布局组件
│   ├── pages/            # 页面组件
│   │   ├── Home/         # 首页
│   │   ├── Category/     # 分类页
│   │   └── tools/        # 工具页面
│   ├── styles/           # 样式文件
│   ├── types/            # 类型定义
│   ├── utils/            # 工具函数
│   ├── App.tsx           # 应用入口
│   └── index.tsx         # 渲染入口
├── .eslintrc.json        # ESLint 配置
├── .prettierrc           # Prettier 配置
├── jest.config.js        # Jest 配置
├── tsconfig.json         # TypeScript 配置
└── webpack.config.js     # Webpack 配置
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

ISC 