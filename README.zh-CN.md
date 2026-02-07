📍 **项目路线图**：见 [ROADMAP.zh-CN.md](ROADMAP.zh-CN.md)

# SF6 Notebook（街霸6 玩家备忘录）

SF6 Notebook 是一个**轻量、开源、以实战为导向**的《街头霸王 6（Street Fighter 6）》玩家备忘录与工具站。
支持 **网页版** 与 **Windows 桌面版**，数据本地保存，离线可用。

它的定位不是社区、不是攻略站，而是一个**真正给玩家自己用的训练与复盘工具**：
你可以记录对局思路、角色理解、对策笔记、连段路线，并快速查阅帧数信息，所有内容都只保存在你本地。

---

## ✨ 功能特性

### 📓 对策 / 角色备忘录
- 按 **角色 × 对手** 组织内容
- 适合赛前准备、打完一套后的复盘记录

### 🧩 连段备忘录（Combo Notebook）
- 支持 **连段组**（如：确反、板边、绿冲等）
- 每条连段可记录：
  - 名称
  - 指令
  - 后续压制 / 起身博弈
  - 注意事项

### ⌨️ 格斗键盘输入（Fighter Input）
为格斗游戏输入法专门设计的文本系统：

- 数字 1–9 → 按小键盘方向自动转换为方向
- `lp/mp/hp`、`lk/mk/hk`、`pp/kk/ppp/kkk` 在连段语境下自动规范化
- 可在 **Normal / Fighter** 两种输入模式间切换
- 连段指令输入框默认使用 Fighter Input

### 📊 帧数表（Frame Data）
- 快速查看不同角色的关键帧数信息
- 用于对策分析与连段验证

### 💾 本地优先（Local-first）
- 所有数据仅存储在浏览器本地（`localStorage`）
- 自动保存，无需登录
- 支持导出 / 导入 logbook 文件，用于备份或跨设备使用

### 🌐 中英双语
- 支持中文 / English 一键切换

---

## 🚀 在线访问

项目已部署在 GitHub Pages：

```
https://twguri.github.io/sf6_notebook/
```

---

## 🛠 技术栈

- **前端**：Vite + React
- **路由**：React Router（`BrowserRouter` + `basename = import.meta.env.BASE_URL`）
- **状态与存储**：浏览器本地存储（localStorage）
- **部署**：GitHub Pages（`gh-pages` 分支）

---

## 📦 本地开发

### 1️⃣ 克隆仓库

```bash
git clone https://github.com/<你的用户名>/sf6_notebook.git
cd sf6_notebook
```

### 2️⃣ 安装依赖

```bash
npm install
```

### 3️⃣ 启动开发服务器

```bash
npm run dev
```

访问地址：

```
http://localhost:5173/
```

---

## 📤 部署（GitHub Pages）

项目使用 **Vite + gh-pages** 进行部署。

### 一次性配置

```bash
npm install --save-dev gh-pages
```

确保 `package.json` 中包含：

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "deploy": "npm run build && npx gh-pages -d dist"
}
```

### 部署命令

```bash
npm run deploy
```

GitHub 仓库设置中：

- **Settings → Pages**
- Source：Deploy from a branch
- Branch：`gh-pages`
- Folder：`/ (root)`

---

## ⬇️ 下载（Windows 桌面版）

👉 **推荐**：  
https://github.com/twguri/sf6_notebook/releases/latest

- 提供 `.msi` 安装包（推荐）
- 也可能提供 `.exe` 安装器
- 桌面版数据与网页版 **相互独立**

## 🌐 网页版 vs 🖥️ 桌面版

| | 网页版 | 桌面版 |
|--|--|--|
| 使用方式 | 浏览器 | Windows 应用 |
| 是否离线 | ❌ | ✅ |
| 数据存储 | 浏览器 localStorage | 本地应用数据 |
| 是否自动更新 | ❌ | 手动下载安装 |

> 💡 桌面版与网页版的数据不共享，可通过导出 / 导入功能进行迁移。



## 📱 移动端说明

本项目在设计时已考虑手机端使用场景：

- 触控目标尺寸适配移动端
- 输入框关闭自动纠错 / 自动大写，避免影响指令输入
- 使用 `100dvh` 规避移动端 `100vh` 问题
- 弹窗与滚动逻辑针对软键盘进行处理

未来计划：
- PWA（可安装到手机主屏幕）
- Android APK（Capacitor）
- Windows 桌面版（Tauri）

---

## 📊 数据来源说明

帧数数据综合自：

- 游戏内实测
- Capcom 官方信息
- 社区整理资源（如 ComboMasher）

> 注：帧数可能会随游戏版本更新而滞后，当前仍在持续补充与校对中。

---

## 📄 许可说明

本项目为开源项目，主要用于：

- 个人训练
- 学习与分析
- 竞技准备

欢迎 Fork、修改并根据自己的使用习惯进行定制。

---

## 🙌 参与贡献

欢迎任何形式的建议与贡献，包括但不限于：

- UI / UX 改进建议
- 格斗键盘输入逻辑优化
- 新功能构想

可以通过 Issue 或 Pull Request 的方式参与。

---

## 🧠 项目理念

SF6 Notebook 的核心原则是：

- **本地优先**：数据永远在你自己手里
- **工具导向**：服务于真实对局与训练，而非内容展示
- **不过度设计**：只做对玩家真正有用的功能

这是一个为格斗玩家而生的工具。