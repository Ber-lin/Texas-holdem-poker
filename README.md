# 德州扑克积分器

一个基于 React + TypeScript + Next.js 的多人德州扑克积分管理系统。

## 功能特点

- 🎮 多人实时游戏支持
- 💬 实时聊天系统
- 👑 Master/Guest 角色管理
- 💰 筹码管理和充值系统
- 🎯 局和轮的游戏流程控制
- 📱 响应式设计，支持移动端

## 快速开始

### 本地开发

\`\`\`bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 打开浏览器访问 http://localhost:3000
\`\`\`

### 部署到 Vercel

1. Fork 这个仓库到你的 GitHub 账户
2. 在 Vercel 中导入这个项目
3. 部署完成后即可访问

## 游戏规则

### 角色说明
- **Master（房主）**：创建房间，设置密码，控制游戏流程，管理玩家筹码
- **Guest（客人）**：通过房间ID和密码加入游戏，参与下注

### 游戏流程
1. Master 创建房间并设置密码
2. Guest 通过房间ID和密码加入
3. 所有玩家获得初始筹码（默认1000）
4. Master 开始新局游戏
5. 玩家进行下注操作
6. Master 控制轮次进度
7. 筹码实时同步给所有玩家

### 下注选项
- 小盲注：Base 数额
- 大盲注：Base 数额 × 2
- 加注：Base 数额 × 4
- All In：全部筹码
- 自定义：输入任意金额

## 技术栈

- **前端框架**：Next.js 14 + React 18
- **类型系统**：TypeScript
- **样式方案**：Tailwind CSS + shadcn/ui
- **状态管理**：React Hooks
- **实时通信**：模拟 WebSocket（可扩展为真实 WebSocket）

## 项目结构

\`\`\`
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 基础组件
│   ├── room-entry.tsx    # 房间进入组件
│   ├── poker-room.tsx    # 游戏房间组件
│   └── chat-panel.tsx    # 聊天面板组件
├── hooks/                # 自定义 Hooks
│   └── useWebSocket.ts   # WebSocket 通信 Hook
├── types/                # TypeScript 类型定义
│   └── game.ts          # 游戏相关类型
└── lib/                  # 工具函数
    └── utils.ts         # 通用工具函数
\`\`\`

## 部署说明

本项目已优化用于 Vercel 部署：

- 使用 Next.js 14 App Router
- 静态资源优化
- 自动代码分割
- 服务端渲染支持

## 开发计划

- [ ] 真实 WebSocket 后端集成
- [ ] 游戏历史记录功能
- [ ] 玩家头像系统
- [ ] 音效和动画效果
- [ ] 数据持久化存储

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
