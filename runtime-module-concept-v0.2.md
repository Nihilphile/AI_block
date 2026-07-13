# Runtime Module Concept v0.2

> 本文件基于 `cc-crew-assembly-runtime-concept-v0.1.md` 与讨论后的模型重构。
>
> v0.2 的核心变化：
>
> - `Assembly` 重命名为 `Graph`，表示可复用的静态协作图。
> - `WorkUnit` 拆分为图中的 `Node` 与真正执行任务的 `Actor`。
> - 新增 `Project` 作为 Actor、Graph、Package 和权限的总边界。
> - `Package` 从 Assembly 层上移到 Project 层，允许跨 Graph 引用。
> - Graph 权限在 Graph 激活时加载并快照化，运行中的权限不热更新。
> - `fork` 暂不进入第一版，只保留未来扩展方向。

---

## 1. 设计目标

Runtime Module 面向 Agent 主控，提供一组可以在运行时组织、连接和追踪的执行对象。

主控不需要被框架固定在一套工作流中，而是可以根据任务规模选择或组装不同的 Graph：

```txt
轻量代码修改：
Client → Coder → Client

复杂完整流程：
Client → Explorer → Coder → Reviewer → Smoker → Client

执行中委托：
Coder → Debugger
```

核心原则：

```txt
Project 管资源、数据、权限和生命周期边界；
Graph 管协作结构和流转方式；
Node 管图中的角色位置和连接端口；
Actor 管实际智能执行和 Backend Session；
Package 管跨 Node、跨 Actor、跨 Graph 的语义材料；
主控 Agent 决定采用什么 Graph、启用哪些连接以及如何组合任务。
```

框架负责：

```txt
- Graph / Node / Connection 的结构管理
- Actor 的分配、占用和串行执行
- Package 的保存、引用、版本和权限检查
- GraphPolicy 的加载和强制执行
- Run、Session、Router 调用和产物追踪
```

主控 Agent 负责：

```txt
- 选择或创建 Graph
- 选择本次 GraphActivation 的启用范围
- 向 ClientNode 注入任务 Package
- 根据运行结果决定是否继续、重试、委托或结束
```

---

## 2. 总体层级

```txt
Project
│
├─ ActorPool
│   ├─ Actor[]
│   └─ ActorTemplate[]?
│
├─ PackageStore
│   └─ Package[]
│
├─ GraphRegistry
│   └─ Graph[]
│
└─ ProjectPolicy / ProjectTrace

Graph
│
├─ Node[]
├─ Connection[]
├─ GraphPolicy
└─ ActivationPolicy

GraphActivation
│
├─ graph_revision
├─ node_actor_bindings
├─ enabled_connections
├─ effective_policy_snapshot
├─ package_refs
├─ run_refs
└─ trace

Node
│
├─ ClientNode
└─ ActorNode
       │
       └─ bind → Actor
```

最重要的关系是：

```txt
Graph.Node
      ↓ bind
ActorPool.Actor
      ↓ execute
Actor.Run
      ↓ produce
Project.PackageStore.Package
```

Graph 不拥有 Actor，只定义 Actor 在图中的位置和协作关系。ActorPool 中的 Actor 可以在空闲时重新绑定到其他 GraphActivation。

---

## 3. Project

Project 是 Runtime Module 的长期边界，负责统一管理：

```txt
- ActorPool
- PackageStore
- GraphRegistry
- ProjectPolicy
- ProjectTrace
- 资源和生命周期
```

Project 也是 Package 的命名空间和默认存储范围。Package 可以跨 Graph 引用，但不代表所有 Actor 自动拥有读取权限。

### 3.1 Project 结构

```txt
Project
├─ project_id
├─ name
├─ objective?
├─ status
├─ actor_pool_ref
├─ package_store_ref
├─ graph_refs[]
├─ project_policy_ref
└─ project_trace_ref
```

### 3.2 Project 的隔离语义

默认情况下，Project 是隔离边界：

```txt
Project A 的 Actor / Package / Graph
不能直接访问 Project B 的资源
```

跨 Project 的传递需要显式的导出、导入或外部适配器能力，不属于普通 Graph Connection。

---

## 4. ActorPool

ActorPool 管理 Project 内可以被 Graph 使用的运行时 Actor。

```txt
ActorPool
├─ actors[]
├─ actor_templates[]?
├─ allocation_policy
└─ pool_trace
```

ActorPool 的职责：

```txt
- 注册 Actor
- 查询 Actor 状态和能力
- 为 GraphActivation 分配 Actor
- 记录 Actor 当前绑定关系
- 防止同一个 Actor 同时处理多个 Run
- 在 Actor 空闲后允许重新绑定
```

### 4.1 Actor 状态

```txt
idle
reserved
running
waiting
unavailable
terminated
```

一个 Actor 同一时刻只处理一个 Run：

```txt
Actor A
  ├─ Run 001: running
  └─ Run 002: queued / rejected
```

需要并行执行时，使用不同的 Actor 实例。并行任务可以被绑定到同一个 GraphActivation，也可以分别启动不同的 GraphActivation，取决于是否需要共享 Graph 的运行范围。

### 4.2 Actor 的运行时职责

Actor 是真正执行智能工作的运行时对象，负责：

```txt
- Backend Session
- System Prompt
- Tools
- Actor 级权限上限
- Mailbox
- Run
- Session 历史
- 执行状态
```

Actor 的行为配置可以来自 ActorTemplate，但 ActorTemplate 不是本文件 v0.2 的必需对象。

---

## 5. Graph

Graph 是可复用的静态协作图，描述 Node 如何通过 Connection 组织起来。

Graph 不直接持有具体 Actor，不直接保存运行时 Package，也不包含 Backend Session。

```txt
Graph
├─ graph_id
├─ graph_revision
├─ objective?
├─ nodes[]
├─ connections[]
├─ graph_policy
├─ activation_policy
└─ metadata
```

### 5.1 Graph 的职责

```txt
- 定义有哪些 Node
- 定义 Node 的输入 / 输出端口
- 定义 Connection 如何传递 Package
- 定义哪些调用关系可能存在
- 定义 Graph 级编排权限
- 定义哪些 Node / Connection 是 required 或 optional
```

Graph 是可复用图，而不是一次性运行实例：

```txt
Graph G
  ├─ GraphActivation 001 → Actor 集合 A
  └─ GraphActivation 002 → Actor 集合 B
```

如果 Graph 结构发生变化，创建新的 `graph_revision`。已有 GraphActivation 继续使用创建时记录的旧 revision。

---

## 6. Node

Node 是 Graph 中的角色位置和连接端点，不负责实际的智能执行。

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

Node 负责：

```txt
- 表示图中的一个位置
- 声明需要什么类型的 Actor
- 定义输入 / 输出端口
- 参与 Connection
- 作为 GraphPolicy 的权限主体
```

Node 不负责：

```txt
- 持有 Backend Session
- 直接执行 LLM
- 保存 Run 历史
- 拥有 Project Package
```

### 6.1 ClientNode

ClientNode 是 Graph 与主控 Agent / 外部调用方之间的双向入口。

```txt
ClientNode
├─ input_ports[]
├─ output_ports[]
├─ inbound_package_refs[]
└─ outbound_package_refs[]
```

输入方向：

```txt
主控 Agent
  ↓ inject Package
ClientNode
  ↓ Connection
Graph 内部 Node
```

输出方向：

```txt
Graph 内部 Node
  ↓ Connection
ClientNode
  ↓ emit Package / event
主控 Agent
```

ClientNode 不需要 Backend Session，也不产生 Actor Run。它只负责接受和输出 Graph 级消息。

### 6.2 ActorNode

ActorNode 是需要绑定真实 Actor 的 Node。

```txt
ActorNode
├─ node_id
├─ role
├─ actor_requirements
├─ prompt_overrides?
└─ tool_requirements?
```

典型例子：

```txt
ExplorerNode
CoderNode
DebuggerNode
ReviewerNode
SmokerNode
```

这些名称描述 Graph 中的角色，不等同于具体的 Actor 身份。

---

## 7. GraphActivation

GraphActivation 是 Graph 的一次运行时激活。

它负责把静态 Graph 与 Project 内的 Actor、Package 和权限上下文绑定起来。

```txt
GraphActivation
├─ activation_id
├─ project_id
├─ graph_id
├─ graph_revision
├─ node_actor_bindings[]
├─ enabled_connection_ids[]
├─ effective_policy_snapshot
├─ package_refs[]
├─ run_refs[]
├─ status
└─ trace_ref
```

### 7.1 Node 与 Actor 的绑定

```txt
Graph:
  ExplorerNode → CoderNode → ReviewerNode

Activation:
  ExplorerNode → actor_001
  CoderNode    → actor_007
  ReviewerNode → actor_003
```

GraphActivation 可以根据 ActorPool 当前状态决定：

```txt
ready
  所有 required Node 都已绑定可用 Actor

partially_ready
  只有 optional Node 尚未绑定

blocked
  required Node 没有可用 Actor

running
  至少一个 Run 已启动

completed / failed / cancelled
```

### 7.2 Actor 不可用时的策略

不应该静默替换正在运行的 Actor。GraphActivation 应明确采用一种策略：

```txt
wait
  等待原有 Actor 变为空闲

allocate_new
  从 ActorTemplate 或 ActorPool 分配新的 Actor

replace_idle
  替换为空闲且兼容的 Actor

reject
  当前 GraphActivation 不可启动
```

### 7.3 部分启用和完全启用

Graph 的结构本身保持不变；部分启用属于 GraphActivation 配置：

```txt
Graph:
  Client → Explorer → Coder → Reviewer → Smoker

Partial Activation:
  enabled: Client → Coder

Full Activation:
  enabled: Client → Explorer → Coder → Reviewer → Smoker
```

这样可以保留同一张可复用 Graph，同时让主控根据任务决定本次启用哪些 Connection。

---

## 8. Connection

Connection 是 Graph 的核心结构，描述 Package 如何从一个 Node 流向另一个 Node，以及何时触发目标 Node。

```txt
Connection
├─ connection_id
├─ from_node
├─ from_port
├─ to_node
├─ to_port
├─ trigger
├─ package_map
├─ action
├─ required / optional
└─ metadata
```

### 8.1 Connection 示例

```txt
Connection:
  from: explorer_node.output.report
  to: coder_node.input.context

  trigger:
    event: package_created
    package_type: report
    status: success

  package_map:
    source: explorer_report
    target_ref: coder_context

  action:
    enqueue_run: coder_node
```

### 8.2 Connection 的执行语义

```txt
Node 产生 Package
  ↓
Connection 检查 trigger
  ↓
读取 Project.PackageStore
  ↓
检查 GraphActivation 的 enabled connections
  ↓
检查 GraphPolicy / Package 权限
  ↓
把 Package 引用注入目标 Node
  ↓
目标 Node 找到绑定的 Actor
  ↓
Actor 创建 Run
```

Connection 引用的是 Node，不直接引用 Actor。GraphActivation 负责把 Node 解析到实际 Actor。

---

## 9. PackageStore

PackageStore 位于 Project 层，负责保存 Project 内所有 Graph 和 Actor 之间流动的语义材料。

```txt
Project
└─ PackageStore
    └─ Package[]
```

Package 可以跨 Graph 引用：

```txt
Graph A 产生 explorer_report
  ↓
Project.PackageStore
  ↓ permission check
Graph B 引用 explorer_report
```

Graph 不拥有 Package 本体，只保存使用和产生关系：

```txt
GraphActivation
├─ produced_package_refs[]
├─ consumed_package_refs[]
└─ exported_package_refs[]
```

### 9.1 Package 结构

```txt
Package
├─ head
│   ├─ package_id
│   ├─ package_type
│   ├─ project_id
│   ├─ produced_by_graph
│   ├─ produced_by_activation
│   ├─ produced_by_node
│   ├─ produced_by_actor
│   ├─ produced_by_run
│   ├─ parent_package_refs[]
│   ├─ created_at
│   ├─ status
│   ├─ tags
│   ├─ priority
│   └─ visibility
│
└─ body
    ├─ title?
    ├─ summary?
    ├─ content
    ├─ attachments?
    └─ structured_payload?
```

### 9.2 Package 类型

```txt
task
request
artifact
report
summary
result
error
state_patch
```

Package 的 `head` 主要给 Server、Router、Policy 和 Trace 使用；`body` 主要用于 Prompt 拼装。

默认 Prompt 注入仍然只注入 body：

```txt
PackageRef.inject_mode:
  body_only
  body_with_brief_head
  summary_only
  full
  ref_only
```

Package 跨 Graph 可见，但不是自动可读。最终可读性由 ProjectPolicy、ActorCapability、GraphPolicy 和 Package visibility 共同决定。

---

## 10. Actor 与 Run

Actor 是有身份和运行时状态的执行者；Run 是 Actor 处理一次输入事件的记录。

```txt
Actor
├─ actor_id
├─ actor_profile
├─ backend
├─ backend_session
├─ mailbox
├─ status
├─ current_graph_activation?
├─ current_node?
├─ run_refs[]
└─ actor_trace
```

```txt
Run
├─ run_id
├─ actor_id
├─ project_id
├─ graph_activation_id
├─ node_id
├─ input_package_refs[]
├─ resolved_prompt_ref
├─ backend_session_ref
├─ output_package_refs[]
├─ router_call_refs[]
├─ error_refs[]
├─ status
└─ timestamps
```

默认运行模型：

```txt
同一个 Actor
  └─ 复用同一个 Backend Session

同一个 Actor
  └─ 同一时刻只处理一个 Run
```

如果 Actor 被重新绑定到另一个 Graph，当前设计允许 Session 跟随 Actor 延续。这意味着 Actor 的 Backend Session 是 Project 内 Actor 自己的长期状态，而不是某个 Graph 的私有状态。

如果未来需要严格的 Session 隔离，可以通过以下方式处理：

```txt
- 创建新的 Actor
- 从 ActorTemplate 实例化新的 Actor
- 显式重置 / 替换 Backend Session
```

---

## 11. 权限模型

Graph 权限是编排权限，与 Project 权限、Actor 权限、工具权限不同。

Graph 主要决定：

```txt
- 一个 Node 可以调用哪些其他 Node
- 一个 Node 可以读取哪些 Package
- 一个 Node 可以写入哪些 Package
- 一个 Node 是否可以启动某些 Connection
- 一个 Node 是否可以请求新的 Actor / GraphActivation
```

### 11.1 三层权限

```txt
ProjectPolicy       // Project 的最高安全边界
ActorCapability     // Actor 自身最大能力
GraphGrant          // 当前 Graph 授予的编排能力
```

最终有效权限：

```txt
EffectivePermission
  = ProjectPolicy
  ∩ ActorCapability
  ∩ GraphGrant
```

Graph 可以限制 Actor，但不能突破 Project 或 Actor 的安全上限。

### 11.2 GraphPolicy

```txt
GraphPolicy
├─ node_permissions
│   ├─ caller_node_id
│   │   ├─ callable_node_ids[]
│   │   ├─ readable_package_rules[]
│   │   ├─ writable_package_rules[]
│   │   └─ delegation_depth_limit
│   └─ ...
├─ activation_rules
├─ actor_selection_rules
└─ policy_revision
```

例如：

```txt
Graph A:
  CoderNode.callable_nodes = [DebuggerNode, ExplorerNode]

Graph B:
  CoderNode.callable_nodes = [ReviewerNode]
```

同一个 Coder Actor 绑定到不同 Graph 时，可以因此拥有不同的委托权限。

### 11.3 权限快照

GraphPolicy 在 GraphActivation 创建时加载并生成快照：

```txt
Graph
  ↓ activate
加载 GraphPolicy
  ↓
GraphActivation.effective_policy_snapshot
```

运行中的 GraphActivation 不热更新权限。GraphPolicy 修改后，只对之后创建的 GraphActivation 生效；旧 Activation 继续使用旧快照。

### 11.4 Router 强制校验

Agent 的 Prompt 不能作为权限边界。Router / Server 必须携带并校验完整调用上下文：

```txt
project_id
graph_id
graph_activation_id
source_node_id
source_actor_id
run_id
target_node_id
package_refs
```

调用流程：

```txt
Actor 调用 RouterTool
  ↓
Router 读取调用上下文
  ↓
解析 target_node_id → 目标 Actor
  ↓
检查 ProjectPolicy
  ↓
检查 ActorCapability
  ↓
检查 GraphActivation.effective_policy_snapshot
  ↓
检查 Package 访问权限
  ↓
允许后启动目标 Actor 的 Run
```

Router 调用目标应使用 `target_node_id`，不应让 Agent 直接指定任意 `actor_id`，避免绕过 Graph 的组织和权限边界。

---

## 12. 运行流程

### 12.1 启动 Graph

```txt
主控 Agent
  ↓
选择 Graph + graph_revision
  ↓
创建 GraphActivation
  ↓
从 ActorPool 为 required Node 分配 Actor
  ↓
加载 GraphPolicy 快照
  ↓
选择本次启用的 Connection
  ↓
检查 Activation 是否 ready
  ↓
向 ClientNode 注入 task Package
```

### 12.2 Package 驱动的自动流转

```txt
ClientNode 接收 task Package
  ↓
Connection 匹配
  ↓
目标 Node 获取 PackageRef
  ↓
Node 解析到绑定 Actor
  ↓
Actor 创建 Run
  ↓
Run 产生 result / report / error Package
  ↓
Package 写入 Project.PackageStore
  ↓
继续匹配后续 Connection
```

### 12.3 Actor 主动委托

```txt
CoderActor 发现需要 Debugger
  ↓
生成 request Package
  ↓
调用 RouterTool(target_node_id = DebuggerNode)
  ↓
Router 检查 GraphPolicy
  ↓
DebuggerNode 解析到 DebuggerActor
  ↓
DebuggerActor 执行 Run
  ↓
生成 report / result Package
  ↓
通过 Connection 或 Router 返回 Coder
```

---

## 13. 一个复杂 Graph 示例

```txt
Graph: complex-code-task

Nodes:
  client
  explorer
  coder
  debugger
  reviewer
  smoker

Connections:
  client    → explorer
  explorer  → coder
  coder     → reviewer
  reviewer  → smoker
  coder     → debugger       optional / delegated
  debugger  → coder          optional / return
  smoker    → client
```

GraphActivation 可以选择：

```txt
轻量模式：
  client → coder → client

标准模式：
  client → explorer → coder → reviewer → client

完整模式：
  client → explorer → coder → reviewer → smoker → client
```

Graph 的 Connection 不变；变化的是本次 GraphActivation 的 enabled connection 集合和 Actor 绑定。

---

## 14. 当前确定的设计决策

```txt
1. Project 是 Runtime Module 的总边界。
2. Project 拥有 ActorPool、PackageStore 和 GraphRegistry。
3. Graph 是可复用的静态协作图。
4. Graph 不直接拥有 Actor，只定义 Node 和 Connection。
5. Node 表示图中的角色位置，Actor 是真实执行者。
6. GraphActivation 负责 Node 到 Actor 的运行时绑定。
7. 同一个 Actor 同一时刻只处理一个 Run。
8. Actor 默认复用自己的 Backend Session。
9. Package 存储在 Project 层，可以跨 Graph 引用。
10. Package 不是自动可读，仍需经过权限校验。
11. GraphPolicy 是独立的编排权限。
12. GraphPolicy 在 GraphActivation 创建时快照化。
13. 运行中的 GraphActivation 不热更新权限。
14. Router / Server 必须强制执行权限，不能只依赖 Prompt。
15. fork 暂不进入 v0.2 核心实现。
```

---

## 15. 暂未展开的问题

```txt
- Actor 跨 Graph 重新绑定时，是否允许 Session 永久延续
- ActorTemplate 的定义和实例化方式
- Package 的版本控制、撤销和垃圾回收
- Connection 的 fan-in / fan-out / join 语义
- GraphActivation 失败后的重试策略
- 同一个 Node 是否允许动态替换 Actor
- GraphPolicy 的编辑、版本和审批流程
- Project 与外部代码仓库 / 工作目录的关系
- ClientNode 与外部 Client-Server-Host 的具体协议
- light fork / full fork 的统一抽象
```

未来 fork 可以建立在当前模型之上：

```txt
Light Fork:
  新 GraphActivation + 新 Actor + 指定 PackageRefs

Full Fork:
  新 GraphActivation + Adapter 提供的 Backend Session Fork
```

但二者都不属于 v0.2 的核心运行时要求。
