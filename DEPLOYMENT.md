# 部署指南

本项目使用 GitHub Actions 自动部署到云服务器。**构建在 GitHub 上完成**，服务器只需要运行构建好的代码，避免服务器资源不足。

## 一、服务器初始化（首次部署必做）

### 1. SSH 连接到服务器

```bash
ssh your_username@your_server_ip
```

### 2. 下载并执行初始化脚本

在服务器上执行：

```bash
# 下载脚本（从 GitHub）
wget https://raw.githubusercontent.com/YOUR_USERNAME/wilyn-blog/main/scripts/setup-server.sh

# 给脚本添加执行权限
chmod +x setup-server.sh

# 运行脚本
./setup-server.sh
```

脚本会自动完成以下操作：
- ✅ 更新系统包
- ✅ 安装 Git、pnpm、PM2
- ✅ 配置 PM2 开机自启
- ✅ 创建项目目录
- ✅ 克隆 GitHub 仓库
- ✅ 安装生产依赖（不构建）

### 3. 配置 PM2 开机自启

执行初始化脚本后，PM2 会输出一条 `sudo` 命令，复制并执行它：

```bash
# 例如：
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

## 二、配置 GitHub Secrets

在 GitHub 仓库页面：

1. 点击 **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**
3. 添加以下 4 个 secrets：

| Name | Value | 说明 |
|------|-------|------|
| `SERVER_HOST` | `123.45.67.89` | 你的服务器 IP 地址 |
| `SERVER_USER` | `root` 或 `ubuntu` | SSH 登录用户名 |
| `SERVER_PASSWORD` | `your_password` | SSH 登录密码 |
| `SERVER_PORT` | `22` | SSH 端口（默认 22） |

> 💡 **提示**：如果使用 SSH 密钥而非密码，需要将 `SERVER_PASSWORD` 替换为 `SERVER_KEY`，并填入私钥内容。

## 三、自动部署流程

配置完成后，每次推送代码到 `main` 分支：

```bash
git add .
git commit -m "feat: 新功能"
git push origin main
```

GitHub Actions 会自动：
1. ✅ 检出代码
2. ✅ 安装依赖
3. ✅ 运行 ESLint 检查
4. ✅ **在 GitHub 上构建项目**（不占用服务器资源）
5. ✅ 打包构建产物
6. ✅ 传输到服务器
7. ✅ 解压并重启应用

你可以在 GitHub 仓库的 **Actions** 标签页查看部署进度和日志。

## 四、手动部署（备用方案）

如果 GitHub Actions 出现问题，可以在本地构建后手动传输：

### 方法 A：本地构建后 SCP 传输

```bash
# 在本地项目目录
pnpm build

# 打包构建产物
tar -czf deploy.tar.gz .next public package.json pnpm-lock.yaml next.config.ts app

# 传输到服务器
scp deploy.tar.gz your_user@your_server_ip:/tmp/

# SSH 到服务器
ssh your_user@your_server_ip

# 解压并重启
cd /var/www/wilyn-blog
tar -xzf /tmp/deploy.tar.gz
rm /tmp/deploy.tar.gz
pnpm install --prod --frozen-lockfile
pm2 restart wilyn-blog
```

### 方法 B：在服务器上手动拉取并构建

```bash
# SSH 到服务器
cd /var/www/wilyn-blog

# 拉取最新代码
git pull origin main

# 安装依赖
pnpm install --frozen-lockfile

# 构建（注意：会占用服务器资源）
pnpm build

# 重启
pm2 restart wilyn-blog || pm2 start npm --name "wilyn-blog" -- start
pm2 save
```

## 五、常用命令

在服务器上管理应用：

```bash
# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs wilyn-blog

# 查看实时日志
pm2 logs wilyn-blog --lines 100

# 重启应用
pm2 restart wilyn-blog

# 停止应用
pm2 stop wilyn-blog

# 删除应用
pm2 delete wilyn-blog

# 查看服务器资源使用
free -h
top
```

## 六、配置域名（可选）

### 1. 安装 Nginx

```bash
sudo apt install nginx -y
```

### 2. 创建 Nginx 配置

```bash
sudo nano /etc/nginx/sites-available/wilyn-blog
```

添加以下内容：

```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. 启用配置并重启 Nginx

```bash
sudo ln -s /etc/nginx/sites-available/wilyn-blog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. 配置 HTTPS（推荐）

使用 Let's Encrypt 免费证书：

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your_domain.com -d www.your_domain.com
```

## 七、故障排查

### 应用无法启动

```bash
# 查看错误日志
pm2 logs wilyn-blog --err

# 检查端口占用
sudo lsof -i :3000

# 手动测试启动
cd /var/www/wilyn-blog
pnpm start
```

### GitHub Actions 部署失败

1. 检查 Secrets 是否配置正确
2. 查看 Actions 日志中的错误信息
3. 确认服务器 SSH 可以正常连接
4. 检查服务器磁盘空间：`df -h`

### 服务器资源不足

```bash
# 查看内存使用
free -h

# 查看磁盘使用
df -h

# 清理不必要的文件
sudo apt autoremove -y
sudo apt autoclean
```

### 构建产物传输失败

检查服务器 `/tmp` 目录权限：
```bash
ls -la /tmp
chmod 1777 /tmp
```

## 八、优化建议

### 1. 使用 SSH 密钥代替密码

更安全，且避免密码泄露：

```bash
# 本地生成密钥
ssh-keygen -t rsa -b 4096

# 复制公钥到服务器
ssh-copy-id your_user@your_server_ip

# 在 GitHub Secrets 中使用 SERVER_KEY 替代 SERVER_PASSWORD
```

### 2. 配置防火墙

```bash
# 安装 ufw
sudo apt install ufw -y

# 允许 SSH
sudo ufw allow 22/tcp

# 允许 HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 启用防火墙
sudo ufw enable
```

### 3. 定期备份

```bash
# 创建备份脚本
cat > /root/backup.sh << 'EOF'
#!/bin/bash
tar -czf /root/wilyn-blog-$(date +%Y%m%d).tar.gz /var/www/wilyn-blog
EOF

chmod +x /root/backup.sh

# 添加定时任务（每周备份）
crontab -e
# 添加: 0 2 * * 0 /root/backup.sh
```

---

## 架构说明

```
本地开发
    ↓ git push
GitHub 仓库
    ↓ 触发 GitHub Actions
GitHub Actions（构建）
    ↓ 传输构建产物
云服务器（运行）
    ↓ PM2 管理
用户访问
```

**优势**：
- ✅ 服务器不需要构建，节省资源
- ✅ 构建失败不影响服务器稳定性
- ✅ GitHub Actions 提供免费的构建资源
- ✅ 部署速度更快

---

## 项目结构

```
wilyn-blog/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 工作流
├── scripts/
│   ├── setup-server.sh         # 服务器初始化脚本
│   └── deploy.sh               # 手动部署脚本（备用）
├── app/                        # Next.js 应用代码
└── DEPLOYMENT.md               # 本文档
```

## 需要帮助？

如果遇到问题，请检查：
1. GitHub Actions 日志
2. PM2 应用日志：`pm2 logs wilyn-blog`
3. 服务器资源使用：`free -h` 和 `df -h`
4. 防火墙配置：`sudo ufw status`
