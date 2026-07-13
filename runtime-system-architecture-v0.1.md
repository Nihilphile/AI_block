# Runtime System Architecture v0.1

> 本文件定义 Runtime System 的进程拓扑、组件职责和生命周期边界。
>
> 领域对象以 `runtime-object-module-v0.3.md` 为准。本文件不重新定义 Project、Actor、Graph、Run、ActorInvocation 和 Package 的内部字段。

---

## 1. 架构目标

Runtime System 为主控 Agent 提供一个持续运行的本地控制面，使后台 Actor 可以在 Client 退出后继续执行、等待、恢复和相互协作。

第一版解决以下问题：

```txt
- Server 持续运行，不依赖 CLI 命令或前台 wait 轮询推进状态
- 一个 Server 可以同时管理多个 Project
- 每个 Project 有独立的 ActorPool、Graph、Run 和 Package 范围
- 每个 Actor 实例有一个专属 ActorHost
- ActorHost 可以反复启动短命 Backend Invocation
- Actor 间所有 Package 传递都经过 Server 校验和持久化
- 多个 Project 的主控可以同时工作，互不阻塞
```

核心原则：

```txt
Server 是控制面和状态权威；
ActorHost 是单个 Actor 的专属执行容器；
Backend 进程是一次 ActorInvocation 的短命执行实例；
Client 是控制端，退出不影响后台 Runtime；
Graph 描述协作关系，但不直接持有 ActorHost。
```

---

## 2. 第一版范围

第一版部署范围：

```txt
- 单机
- 单用户
- 一个 Server Daemon
- 多个 Project
- 多个 Project Runtime 可以同时 active
- 每个 Actor 对应一个 ActorHost
- Claude Code 作为第一个 Backend Adapter
```

第一版非目标：

```txt
- 多用户认证和租户隔离
- 远程 Host
- 分布式 ActorPool
- Server 集群和高可用
- 跨机器 Package 传输
- Graph 热修改
- light fork / full fork
```

单机部署只表示所有进程位于同一台机器；组件仍通过清晰协议通信，以便未来扩展远程 Host。

---

## 3. 总体进程拓扑

```txt
Client CLI / UI / 主控 Agent
          │
          │ HTTP commands + SSE events
          ▼
┌──────────────────────────────────────┐
│ Server Daemon                        │
│                                      │
│  Runtime Kernel                      │
│  Project Registry                    │
│  ActorPool Controller                │
│  ActorHost Registry                  │
│  Scheduler                           │
│  Package Router                      │
│  Policy Engine                       │
│  Run Manager                         │
│  State Store / Package Store         │
└──────────────────────────────────────┘
          ▲
          │ outbound WebSocket connections
          │
    ┌─────┴───────────┬───────────────────┐
    │                 │                   │
┌────────────┐  ┌────────────┐      ┌────────────┐
│ ActorHost A│  │ ActorHost B│      │ ActorHost C│
│ coder_01   │  │ explorer_01│      │ reviewer_01│
└─────┬──────┘  └─────┬──────┘      └─────┬──────┘
      │               │                   │
      │ short-lived   │ short-lived       │ short-lived
      ▼               ▼                   ▼
 Claude Code -p   Claude Code -p      Claude Code -p
 Invocation       Invocation          Invocation
```

所有 ActorHost 主动连接 Server 的同一个端点，不需要为每个 ActorHost 分配独立 TCP 端口。

---

## 4. 组件职责

### 4.1 Client

Client 是无状态或弱状态控制端，包括 CLI、桌面 UI、主控 Agent 和未来的其他控制界面。

Client 负责：

```txt
- 创建、选择和查看 Project
- 激活或停用 Project Runtime / ActorPool
- 创建 Actor 和 Graph
- 启动、查看和取消 Run
- 向 ClientNode 注入 Package
- 订阅 Server 事件和读取结果
```

Client 不负责：

```txt
- 持续轮询 Worker 状态
- 维持 Actor 生命周期
- 启动 Backend 进程
- 保存 Runtime 权威状态
- 在 Client 退出时终止后台任务
```

“选择 Project”只是 Client 当前查看或操作哪个 Project，不产生 ActorHost 启停副作用。

### 4.2 Server Daemon

Server Daemon 是持续运行的控制面和 Runtime 状态权威。

Server 负责：

```txt
- 管理多个 Project Runtime
- 持久化 Actor、Graph、Run、Package 和配置
- 维护 ActorPool 的 desired state 与 runtime state
- 创建、启动、监控和重启 ActorHost
- 为 Run.Node 分配 Actor
- 调度 ActorInvocation
- 校验 ProjectPolicy、ActorCapability 和 GraphPolicy
- 接收并路由 Package
- 处理 Host 心跳、断线和重新注册
- 在 Server 重启后恢复应当 active 的 Project Runtime
```

Server 不直接执行 Claude Code，也不包含 Backend 特定命令行细节。

### 4.3 ActorHost

ActorHost 是一个 Actor 实例的专属、长期运行的执行容器。

```txt
Actor 1 ── owns/binds ── ActorHost 1
Actor 2 ── owns/binds ── ActorHost 2
```

ActorHost 负责：

```txt
- 只代表一个 actor_id
- 主动连接并注册到 Server
- 接收 Server 下发的 ActorInvocation
- 管理该 Actor 的 Backend Session 引用
- 组装或落实 Backend 所需的最终执行输入
- 启动、resume、取消和观察 Backend 子进程
- 暴露 LLM 可调用的本地 AgentControlTool
- 向 Server 上报进程事实、Session 事实和 LLM 语义状态
- 在 Actor waiting / idle 时保持连接
```

ActorHost 不负责：

```txt
- 决定 Graph 下一步执行哪个 Node
- 绕过 Server 向其他 ActorHost 直接发送 Package
- 修改 Project、Graph 或 GraphPolicy
- 为其他 Actor 执行 Invocation
```

### 4.4 Backend Invocation

Backend Invocation 是一次短命执行进程。Claude Code 第一版使用 `-p` 模式启动或通过 Session UUID resume。

```txt
ActorHost 长期存活
  ├─ Claude -p Invocation 001
  ├─ waiting / idle
  ├─ Claude --resume <session> -p Invocation 002
  └─ waiting / idle
```

Actor 的持久性不要求 Claude 进程长期常驻。持久的是 Actor、ActorHost 和 Backend Session 引用。

### 4.5 Backend Adapter

Backend Adapter 隔离具体执行后端：

```txt
ClaudeCodeAdapter
CodexAdapter
DeepSeekAdapter
LocalModelAdapter
```

Adapter 负责命令行参数、Session 创建与恢复、stdout/stderr 解析、退出码和后端专有行为。Server 和 Runtime Domain 不依赖这些实现细节。

---

## 5. Project Runtime 与 ActorPool 生命周期

### 5.1 Server 启动

Server 启动时加载 Project 元数据和持久化的 desired state，但不因 Server 本身启动而无条件启动所有 ActorHost。

如果某个 Project Runtime 在上次运行时被明确标记为 active，Server 应执行 reconciliation，恢复该 Project 的 ActorHost。

### 5.2 选择 Project

```txt
Client.select_project(project_id)
```

只改变 Client 当前上下文，不改变 Project Runtime、ActorPool 或 ActorHost 状态。

### 5.3 激活 ActorPool

```txt
activate_project_runtime(project_id)
  ↓
ActorPool.desired_state = active
  ↓
为已有 Actor 启动 ActorHost
  ↓
等待 Host 注册和 readiness
  ↓
ActorPool.runtime_state = ready / degraded
```

建议在外部 API 中使用 `activate_project_runtime`，内部由 ActorPool Controller 负责具体 Host 启动。这样未来 Project Runtime 增加其他后台组件时，不需要改变外部语义。

### 5.4 创建 Actor

新 Actor 默认直接进入所属 Project 的 ActorPool。

```txt
ActorTemplate
  ↓ instantiate
Actor
  ↓ register
ActorPool
```

Host 启动规则：

```txt
ActorPool active:
  创建 Actor 后立即启动对应 ActorHost

ActorPool inactive:
  创建 Actor 和 Host 逻辑绑定，但暂不启动 Host 进程
  等待下一次 Project Runtime activation
```

Host 的所有权属于 Actor，而不是 Graph 或 Run。

### 5.5 多 Project 并行

一个 Server 允许多个 Project Runtime 同时 active：

```txt
Server
├─ Project A Runtime: active
│   ├─ coder ActorHost
│   └─ explorer ActorHost
├─ Project B Runtime: active
│   ├─ reviewer ActorHost
│   └─ coder ActorHost
└─ Project C Runtime: inactive
```

Client 当前选择哪个 Project，不影响其他 Project 的后台工作。全局资源上限由 Server 的 Scheduler / Resource Policy 控制，而不是通过强制只激活一个 Project 实现。

---

## 6. Graph、Node、Actor 与 ActorHost

Graph 定义层不直接持有 Actor 或 ActorHost：

```txt
Graph Definition:
  CoderNode → ExplorerNode
```

Run 创建后才产生运行时绑定：

```txt
Run:
  CoderNode
    → coder_actor_01
    → coder_actor_host_01

  ExplorerNode
    → explorer_actor_03
    → explorer_actor_host_03
```

因此：

```txt
Graph.Node 表示静态角色位置
Run.NodeBinding 表示 Node → Actor
ActorHostRegistry 表示 Actor → ActorHost
```

一个 active Run 中，每个已绑定的 ActorNode 最终解析到一个 ActorHost。但并非所有 Node 都需要 Host：

```txt
ActorNode  → Actor → ActorHost
ClientNode → 外部 Client / 主控入口
未来的条件、Join、Router Node → 可以由 Server Runtime Kernel 执行
```

同一个 Graph 可以在不同 Run 中绑定不同 ActorHost。

---

## 7. 通信架构

### 7.1 Client 与 Server

第一版本地通信建议：

```txt
HTTP commands: 127.0.0.1:<configured-port>
SSE events:    127.0.0.1:<configured-port>/events
```

Client 不扫描本机端口。Server 使用固定可配置端口，或将实际 endpoint 写入用户级 runtime discovery 文件。

Server 只绑定 loopback，并使用用户级本地访问凭据。未来开放远程访问时再增加 TLS、远程认证和网络策略。

### 7.2 ActorHost 与 Server

所有 ActorHost 主动连接 Server 的统一 WebSocket endpoint：

```txt
ActorHost A ─┐
ActorHost B ─┼─→ ws://127.0.0.1:<port>/actor-hosts/connect
ActorHost C ─┘
```

Server 使用至少以下身份范围区分连接：

```txt
project_id
actor_id
actor_host_instance_id
```

ActorHost 使用受限凭据，只能代表其绑定 Actor 上报事件、接收 Invocation 和发布该 Actor 产生的 Package，不能执行用户 Client 的管理操作。

### 7.3 ActorHost 之间的 Package 传递

ActorHost 不直接互连。Graph 中的 Node Connection 在运行时通过 Server 实现：

```txt
ActorHost A
  ↓ publish Package
Server
  ├─ 校验 Project
  ├─ 校验 ActorHost → Actor 身份
  ├─ 校验 Actor → Run.Node binding
  ├─ 校验 Graph Connection
  ├─ 校验 GraphPolicy / Package permission
  ├─ 保存 Package
  └─ 解析 target Node → Actor → ActorHost
        ↓
ActorHost B
```

这样 Server 能持续追踪 Package、权限、Run 推进和失败恢复。

---

## 8. LLM 状态上报与运行事实

保留 CC_Crew 中“系统提示词要求 LLM 调用状态组件”的设计思想，但改变传输和权威边界。

未来 LLM 调用本地 AgentControlTool：

```txt
LLM
  ↓ actor.accept / actor.report_state / actor.emit_package / actor.complete
ActorHost-local AgentControlTool
  ↓
ActorHost
  ↓ WebSocket event
Server
```

LLM 不直接持有 Server 地址、Server Token 或任意 actor_id/run_id。ActorHost 根据当前 Invocation 上下文附加不可由 LLM 伪造的身份。

状态分为三类：

```txt
LLM 语义声明
  accepted / rejected / working phase / blocked / completion_requested

ActorHost 运行事实
  process_started / session_bound / process_exited / timeout / killed

Server 权威生命周期
  queued / reserved / running / waiting / completed / failed / cancelled
```

LLM 的 `completion_requested` 不能单独决定 Invocation 完成。Server 结合输出 Package、Host 进程事实和协议校验确定最终状态。

文件可以保留为 ActorHost 的本地日志、outbox 或恢复材料，但不再作为 Server 的主要状态发现协议。

---

## 9. Actor 等待、休眠与恢复

Actor 是持久逻辑实体；ActorHost 是长期执行容器；Backend Invocation 是短命进程。

典型委托流程：

```txt
Coder Invocation 运行
  ↓
Coder 生成 explorer request Package
  ↓
Server 校验并路由到 Explorer
  ↓
Coder Actor 进入 waiting
  ↓
Coder 的 Claude -p 进程退出
  ↓
Coder ActorHost 保持连接，不占用 Claude 进程资源
  ↓
Explorer 完成并返回 response Package
  ↓
Server 唤醒 Coder Actor
  ↓
Coder ActorHost 使用已有 Session 启动新的 Claude -p Invocation
```

等待期间：

```txt
- Actor 仍绑定当前 Run
- ActorHost 仍代表该 Actor
- Claude 子进程不存在
- Actor 不返回通用 ActorPool 供无关 Run 使用
- response Package 由 Server 持久保存，不依赖 Coder 进程在线
```

`delegate-and-wait` 的事务、correlation ID、ACK、重复投递和超时语义属于后续 Protocol / State Machine 规格，不在本架构文件中展开。

---

## 10. 持久化与恢复原则

Server 持久化以下权威信息：

```txt
- Project 和 Project Runtime desired state
- ActorTemplate、Actor 和 ActorPool membership
- Actor 与 ActorHost 的逻辑绑定
- Backend Session reference
- Graph、Run 和 NodeBinding
- Package 和 Package lineage
- 权限快照
- Invocation 与事件记录
```

ActorHost 是可重建的进程，不是 Actor 状态的唯一保存位置。

Server 重启后的目标行为：

```txt
读取持久化状态
  ↓
识别 desired_state = active 的 Project Runtime
  ↓
重新启动或等待 ActorHost 注册
  ↓
核对 Host、Backend 进程和 Session 事实
  ↓
恢复可恢复 Invocation，标记不可恢复 Invocation
  ↓
继续处理已持久化 Package 和等待条件
```

ActorHost 与 Server 的具体 ACK、幂等键、事件序列、heartbeat、lease 和本地 outbox 形式留给后续通信协议规格。

---

## 11. 从 CC_Crew 继承与替换

可以继承：

```txt
- Role / System Prompt 分层思想
- accepted / rejected / completion handshake 思想
- LLM 主动调用状态组件的协议
- Claude Code -p Session 创建和 resume 经验
- Role legal state 和输出约束
- Store 与 transient run artifacts 分离的经验
```

需要替换：

```txt
- 由 CLI 命令触发 Sync-All 的推进方式
- 前台 wait 轮询承担后台控制面的方式
- 共享 agents.json 同时承担注册表、队列和运行状态
- Server 通过扫描 .state / done.json 发现全部事件
- Manager、Host、Backend Adapter 混合在 PowerShell CLI 中的边界
```

CC_Crew 可以作为 ClaudeCodeAdapter 和 ActorHost 行为的验证来源，但不直接作为新 Server Daemon 的架构模板。

---

## 12. 当前确定的架构决策

```txt
1. 第一版是单机、单用户部署。
2. 一个 Server Daemon 管理多个 Project。
3. 多个 Project Runtime 可以同时 active。
4. Client 选择 Project 不触发后台资源启停。
5. Project Runtime activation 驱动 ActorPool 和 ActorHost 启动。
6. 新 Actor 默认进入 ActorPool。
7. Active Pool 中新建 Actor 时立即启动 ActorHost。
8. Inactive Pool 中新建 Actor 时延迟启动 ActorHost。
9. 一个 Actor 对应一个长期 ActorHost。
10. 一个 ActorHost 只代表一个 Actor。
11. ActorHost 在 Actor idle / waiting 时保持连接。
12. Claude Code -p 进程按 ActorInvocation 启动和退出。
13. Graph 不拥有 ActorHost；Run.NodeBinding 绑定 Actor。
14. ActorHost 作为受限执行 Client 主动连接 Server。
15. ActorHost 之间不直接通信，Package 统一经过 Server。
16. Server 是 Runtime 状态和权限校验的最终权威。
17. LLM 状态上报是语义信号，不是唯一运行事实。
18. Client 退出不影响后台 Runtime 继续执行。
```

---

## 13. 后续独立设计主题

以下内容需要作为独立规格继续讨论：

```txt
- Server 内部模块和依赖方向
- 持久化方案：SQLite、事件日志或混合模型
- Client–Server HTTP/SSE API
- ActorHost–Server WebSocket 命令和事件协议
- AgentControlTool 的 CLI / MCP 形式
- Host heartbeat、lease、ACK、幂等和 outbox
- ActorInvocation 状态机
- delegate-and-wait、Package correlation 和唤醒语义
- Server / ActorHost / Backend 崩溃后的恢复矩阵
- Project Runtime deactivation 的 graceful / force 语义
- 全局资源限制和跨 Project 调度公平性
- 未来远程 Host 与机器级 HostSupervisor
```
