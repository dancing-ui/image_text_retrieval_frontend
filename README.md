
# Quick Start
- https://ant.design/docs/react/use-with-vite-cn
- node: v22.12.0

# 开发
```sh
nvm use v22.12.0
yarn create vite image_text_retrieval
yarn add antd
npm install
npm run dev
```

# 部署
## 构建项目
```sh
nvm use v22.12.0
npm run build
```

## 全局安装 serve
```sh
npm install -g serve
```

## 启动静态文件服务器
```sh
serve -s dist -l 9527
```