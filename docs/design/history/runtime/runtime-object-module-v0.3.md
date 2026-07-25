# Runtime Object Module v0.3

> 本文件只定义 Runtime Module 的领域对象、生命周期和对象关系。
> Client–Server–Host 的进程拓扑、Daemon、IPC、持久化和 Backend Adapter 另行设计。

---

## 1. 核心判断

系统的两个核心运行时对象是：

```txt
Actor = 谁来执行
Graph = 如何组织协作
```

`Project` 是最大的资源、权限和生命周期边界；`Run` 是一次具体执行记录，不是第三种核心编排对象。

```txt
Project
├─ ActorTemplate[]
├─ ActorPool
│   └─ Actor[]
├─ Graph[]
├─ PackageStore
└─ Run[]
```

一次运行的关系是：

```txt
Graph + Node → Actor bindings + input Packages + GraphPolicy snapshot
  ↓
Run
  └─ ActorInvocation[] → output Packages
```

---

## 2. Project

Project 是整个 Runtime Module 的总边界，管理 ActorTemplate、ActorPool、Graph Registry、PackageStore、ProjectPolicy 和 Run。

```txt
Project
├─ project_id
├─ actor_templates[]
├─ actor_pool
├─ graphs[]
├─ package_store
├─ project_policy
└─ run_refs[]
```

Project A 的 Actor、Graph、Package、Run 默认不能直接访问 Project B 的资源。跨 Project 传递需要显式导出、导入或外部适配器能力。

## 3. ActorTemplate、Actor 和 ActorPool

### ActorTemplate

ActorTemplate 是创建 Actor 的可复用蓝图：

```txt
ActorTemplate
├─ template_id
├─ revision
├─ role
├─ system_prompt
├─ behavior_rules
├─ backend_profile
├─ tool_profile
├─ capability_profile
└─ runtime_config
```

Template 不包含 Backend Session、Mailbox、Run 历史或当前 Graph 绑定。

```txt
ActorTemplate --instantiate--> Actor --register--> ActorPool
```

### Actor

Actor 是 Project 内真正执行智能任务的运行时工人：

```txt
Actor
├─ actor_id
├─ project_id
├─ template_ref / template_revision
├─ role
├─ backend_profile
├─ backend_session_ref?
├─ system_prompt_ref
├─ tools_profile
├─ capability_profile
├─ mailbox
├─ status
├─ current_invocation_ref?
├─ invocation_refs[]
└─ actor_trace
```

Actor 状态为 `idle`、`reserved`、`running`、`waiting`、`unavailable` 或 `terminated`。同一个 Actor 同一时刻只处理一个 `ActorInvocation`；需要并行执行时使用不同 Actor 实例。

Actor 在等待其他 Actor 返回 Package 时仍然绑定当前 Run，不返回通用 ActorPool 供无关 Run 使用。等待只释放当前 Backend Invocation 的进程资源，不释放 Actor 的 Run 归属。

Backend Session 默认属于 Actor，在多个 ActorInvocation 之间延续。如果需要严格隔离，应创建新 Actor 或显式重置 Session。

### ActorPool

ActorPool 负责注册、查询、分配和释放 Actor：

```txt
ActorPool
├─ actor_refs[]
├─ allocation_policy
├─ reservation_records[]
└─ pool_trace
```

Actor 不可用时，Run 可以选择 `wait`、`instantiate`、`replace_idle` 或 `reject`。正在运行的 Actor 不允许被静默替换。

---

## 4. Graph 和 Node

Graph 是可复用的静态协作图，描述 Node 如何通过 Connection 组织起来。Graph 是协作定义，不是一次运行，也不直接拥有 Actor。

```txt
Graph
├─ graph_id
├─ graph_revision
├─ name
├─ objective?
├─ nodes[]
├─ connections[]
├─ graph_policy
├─ activation_policy
└─ metadata
```

同一个 Graph 可以被多次运行，每次绑定不同 Actor。Graph 结构变更后创建新的 `graph_revision`；已有 Run 继续使用自己的 revision。

### Node

Node 是 Graph 中的角色位置、端口和连接端点，不负责实际智能执行：

```txt
Node
├─ node_id
├─ node_type
├─ role
├─ input_ports[]
├─ output_ports[]
├─ actor_requirements?
├─ activation_rules?
└─ metadata
```

Node 不持有 Backend Session，不保存 ActorInvocation 历史，也不拥有 Package body。

Node 类型至少包括：

```txt
ClientNode = Graph 与主控 Agent 的双向入口
ActorNode  = 需要在 Run 中绑定 Actor 的工作位置
```

典型 ActorNode：`ExplorerNode`、`CoderNode`、`DebuggerNode`、`ReviewerNode`、`SmokerNode`。

ClientNode 不绑定 Actor、不产生 ActorInvocation、不拥有 Backend Session。

### Connection

Connection 是 Graph 的核心结构，描述 Package 如何流动以及何时触发目标 Node：

```txt
Connection
├─ connection_id
├─ from_node / from_port
├─ to_node / to_port
├─ trigger
├─ package_map
├─ action
├─ required / optional
└─ metadata
```

Connection 只引用 Node，不直接引用 Actor。Run 启动时再解析 Node 到 Actor 的绑定。

Graph 结构保持静态；部分启用属于 Run：

```txt
Graph:       Client → Explorer → Coder → Reviewer → Smoker
Partial Run: Client → Coder → Client
Full Run:    Client → Explorer → Coder → Reviewer → Smoker → Client
```

---

## 5. Run

Run 是一张 Graph 的一次具体执行：

```txt
Run
├─ run_id
├─ project_id
├─ graph_id / graph_revision
├─ node_actor_bindings[]
├─ enabled_connection_ids[]
├─ effective_graph_policy_snapshot
├─ input_package_refs[]
├─ output_package_refs[]
├─ invocation_refs[]
├─ status
├─ error_refs[]
└─ trace_ref
```

Run 启动流程：

```txt
选择 Graph → 创建 Run → 记录 graph_revision
  ↓
加载 GraphPolicy snapshot → 选择 enabled connections
  ↓
从 ActorPool 为 ActorNode 分配 Actor
  ↓
冻结 Node → Actor bindings → 检查 required Node
  ↓
向 ClientNode 注入输入 Package
```

Run 状态为 `created`、`preparing`、`blocked`、`ready`、`running`、`waiting`、`completed`、`failed` 或 `cancelled`。

Run 启动后，Node 到 Actor 的绑定默认固定到 Run 结束。Actor 故障时必须产生显式 recovery/rebind 事件。

### ActorInvocation

ActorInvocation 是某个 Actor 在某个 Run 中处理一次输入事件的记录：

```txt
ActorInvocation
├─ invocation_id
├─ run_id
├─ actor_id
├─ node_id
├─ input_package_refs[]
├─ resolved_prompt_ref
├─ backend_session_ref?
├─ output_package_refs[]
├─ router_call_refs[]
├─ error_refs[]
├─ status
└─ timestamps
```

Invocation 状态为 `queued`、`starting`、`running`、`suspended`、`completed`、`failed` 或 `cancelled`。

`suspended` 表示 Actor 已经安全交出当前 Backend Invocation，并进入 Package 等待状态。等待条件满足后，Runtime 为同一个 Actor 创建新的 ActorInvocation，并使用 Actor 的 Backend Session 继续执行；旧 Invocation 不会被重新打开。

Run 描述整张 Graph 的推进；ActorInvocation 描述其中一个 Actor 的具体执行。

---

## 6. PackageStore 与 Package

PackageStore 属于 Project 层，保存 Project 内所有 Graph、Actor 和 Run 之间流动的语义材料。

```txt
Project → PackageStore → Package[]
```

Package 可以跨 Graph 引用，但不代表所有 Actor 自动可读：

```txt
Package
├─ head
│   ├─ package_id / package_type / project_id
│   ├─ produced_by_graph / run / node / actor / invocation
│   ├─ parent_package_refs[]
│   ├─ created_at / status
│   └─ visibility
└─ body
    ├─ title? / summary?
    ├─ content
    ├─ attachments?
    └─ structured_payload?
```

Package 类型：`task`、`request`、`artifact`、`report`、`summary`、`result`、`error`、`state_patch`。

Prompt 默认只注入 Package body；PackageRef 可以选择 `body_only`、`body_with_brief_head`、`summary_only`、`full` 或 `ref_only`。

---

## 7. 权限模型

Graph 权限是编排权限，与 Project 权限和 Actor 工具权限不同。

```txt
ProjectPolicy   = Project 的最高安全边界
ActorCapability = Actor 自身的最大能力
GraphGrant      = 当前 Graph 授予的编排能力

EffectivePermission = ProjectPolicy ∩ ActorCapability ∩ GraphGrant
```

GraphPolicy 主要决定：

```txt
- Node 可以调用哪些 Node
- Node 可以读取或写入哪些 Package
- Node 是否可以启动某些 Connection
- Node 是否可以请求新的 Actor
```

GraphPolicy 在 Run 创建时加载并快照化；运行中的 Run 不热更新权限。

Router 调用目标使用 `target_node_id`，不允许 Agent 直接指定任意 `actor_id`。Server/Router 必须校验 `project_id`、`run_id`、`graph_id`、`source_node_id`、`source_actor_id`、`target_node_id` 和 `package_refs`。

---

## 8. 典型完整 Run

```txt
Project
├─ ActorPool
│   ├─ explorer_actor_001
│   ├─ coder_actor_002
│   ├─ debugger_actor_003
│   └─ reviewer_actor_004
├─ Graph: complex-code-task
│   ├─ ClientNode / ExplorerNode / CoderNode
│   ├─ DebuggerNode / ReviewerNode
│   └─ Connections
└─ Run: run_001
    ├─ ExplorerNode → explorer_actor_001
    ├─ CoderNode → coder_actor_002
    ├─ DebuggerNode → debugger_actor_003
    └─ ReviewerNode → reviewer_actor_004
```

```txt
ClientNode 接收 task Package
  ↓
ExplorerInvocation 产生 explorer_report
  ↓
Connection 启动 CoderInvocation
  ↓
Coder 通过 Router 调用 DebuggerNode
  ↓
DebuggerInvocation 产生 debug_report
  ↓
Coder 产生 patch / implementation_report
  ↓
ReviewerInvocation 产生 review_result
  ↓
result Package 返回 ClientNode
```

---

## 9. v0.2 到 v0.3 的迁移

```txt
旧 Assembly                 → 新 Graph
旧 WorkUnit                 → Graph.Node + Project.Actor
旧 GraphActivation          → Run
旧 Actor.Run                → ActorInvocation
旧 PackagePool              → Project.PackageStore
旧 callable_workunits       → GraphPolicy.callable_node_ids
```

核心语义变化：Graph 是可复用图定义；Run 是一次具体执行；Actor 是 Project 内可被多个 Run 绑定的运行时资源；Node 是 Graph 中的角色位置，不是 Actor 本身。

---

## 10. 非目标与开放问题

本文件不定义：

```txt
- Client–Server–Host 进程拓扑
- Server Daemon、IPC 和 Host Agent
- Claude Code / Codex / DeepSeek Adapter
- Package 数据库持久化
- 分布式 ActorPool
- Graph 热修改
- light fork / full fork
- fan-in / fan-out / join 的完整语义
```

后续需要继续决定：

```txt
- Actor 跨 Run / Graph 重新绑定时 Session 是否永久延续
- Actor 故障后的 rebind 是否继承原 Session
- Package 的版本、归档和垃圾回收
- Run 失败后的重试与恢复
- 同一个 Node 是否允许在 Run 内替换 Actor
- GraphPolicy 的编辑、版本和审批流程
- ActorTemplate 的继承和覆盖规则
```
