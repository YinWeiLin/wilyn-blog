#!/bin/bash

# 服务器初始化脚本
# 在你的 Ubuntu 服务器上执行这个脚本来准备部署环境

set -e

echo "开始初始化服务器环境..."

# 更新系统包
echo "1. 更新系统包..."
sudo apt update && sudo apt upgrade -y

# 安装必要工具
echo "2. 安装 Git..."
sudo apt install -y git

# 安装 pnpm
echo "3. 安装 pnpm..."
npm install -g pnpm

# 安装 PM2
echo "4. 安装 PM2（进程管理器）..."
npm install -g pm2

# 设置 PM2 开机自启
echo "5. 配置 PM2 开机自启..."
pm2 startup
# 注意：执行上面命令后，会输出一个 sudo 命令，你需要复制并执行它

# 创建项目目录
echo "6. 创建项目目录..."
sudo mkdir -p /var/www/wilyn-blog
sudo chown -R $USER:$USER /var/www/wilyn-blog

# 克隆仓库
echo "7. 克隆 GitHub 仓库..."
echo "请输入你的 GitHub 仓库地址（例如：https://github.com/username/wilyn-blog.git）："
read REPO_URL
cd /var/www
git clone $REPO_URL wilyn-blog

# 进入项目目录
cd /var/www/wilyn-blog

# 安装依赖
echo "8. 安装项目依赖..."
pnpm install

# 构建项目
echo "9. 构建项目..."
pnpm build

# 启动应用
echo "10. 启动应用..."
pm2 start npm --name "wilyn-blog" -- start

# 保存 PM2 配置
pm2 save

echo "✅ 服务器环境初始化完成！"
echo ""
echo "下一步："
echo "1. 在 GitHub 仓库设置中添加以下 Secrets："
echo "   - SERVER_HOST: 你的服务器 IP 地址"
echo "   - SERVER_USER: SSH 用户名（通常是 root 或 ubuntu）"
echo "   - SERVER_PASSWORD: SSH 密码（或使用 SSH 密钥）"
echo "   - SERVER_PORT: SSH 端口（默认是 22）"
echo ""
echo "2. 推送代码到 GitHub，Actions 将自动部署"
echo ""
echo "查看应用状态: pm2 status"
echo "查看应用日志: pm2 logs wilyn-blog"
echo "重启应用: pm2 restart wilyn-blog"
