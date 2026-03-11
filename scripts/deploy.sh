#!/bin/bash

# 手动部署脚本
# 如果 GitHub Actions 出现问题，可以在服务器上手动运行此脚本

set -e

PROJECT_DIR="/var/www/wilyn-blog"
APP_NAME="wilyn-blog"

echo "开始部署 WiLyn 博客..."

# 进入项目目录
cd $PROJECT_DIR

# 拉取最新代码
echo "1. 拉取最新代码..."
git pull origin main

# 安装依赖
echo "2. 安装依赖..."
pnpm install --frozen-lockfile

# 构建项目
echo "3. 构建项目..."
pnpm build

# 重启应用
echo "4. 重启应用..."
pm2 restart $APP_NAME || pm2 start npm --name "$APP_NAME" -- start

# 保存 PM2 配置
pm2 save

echo "✅ 部署完成！"
echo ""
echo "查看状态: pm2 status"
echo "查看日志: pm2 logs $APP_NAME"
