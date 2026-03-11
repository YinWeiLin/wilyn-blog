# 部署指南

本项目使用 GitHub Actions 自动部署到云服务器。

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

# 或者手动创建脚本文件，复制内容

# 给脚本添加执行权限
chmod +x setup-server.sh

# 运行脚本
./setup-server.sh
```

脚本会自动完成以下操作：
- ✅ 更新系统包
- ✅ 安装 Git
- ✅ 安装 pnpm
- ✅ 安装 PM2（进程管理器）
- ✅ 配置 PM2 开机自启
- ✅ 创建项目目录
- ✅ 克隆 GitHub 仓库
- ✅ 安装依赖并构建项目
- ✅ 启动应用

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
4. ✅ 构建项目
5. ✅ SSH 连接服务器并部署
6. ✅ 重启应用

你可以在 GitHub 仓库的 **Actions** 标签页查看部署进度和日志。

## 四、手动部署（备用方案）

如果 GitHub Actions 出现问题，可以 SSH 到服务器手动部署：

```bash
# 进入项目目录
cd /var/www/wilyn-blog

# 运行部署脚本
./scripts/deploy.sh
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

# 尝试手动启动
cd /var/www/wilyn-blog
pnpm start
```

### 端口被占用

```bash
# 查看 3000 端口占用
sudo lsof -i :3000

# 杀死进程
sudo kill -9 <PID>
```

### GitHub Actions 部署失败

1. 检查 Secrets 是否配置正确
2. 查看 Actions 日志中的错误信息
3. SSH 到服务器手动部署测试

## 八、更新 Node.js 版本（如需要）

```bash
# 使用 nvm 安装最新版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
```

---

## 项目结构

```
wilyn-blog/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 工作流
├── scripts/
│   ├── setup-server.sh         # 服务器初始化脚本
│   └── deploy.sh               # 手动部署脚本
├── app/                        # Next.js 应用代码
└── DEPLOYMENT.md               # 本文档
```

## 需要帮助？

如果遇到问题，请检查：
1. 服务器防火墙是否开放了 3000 端口
2. PM2 进程是否正常运行
3. GitHub Actions 日志中的错误信息
