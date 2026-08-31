# OpenClash Rule Configuration

这是一个面向 OpenClash / SubConverter 的规则配置仓库，核心文件是根目录的 [`meta.ini`](meta.ini)。项目同时提供 Sub-Store 节点预处理脚本和独立的本地 SOCKS 转换工具。

## 快速理解

```text
节点订阅 → Sub-Store 预处理 → SubConverter 读取 meta.ini → Clash 配置
```

职责边界：

- `meta.ini`：唯一维护 OpenClash 分流规则、策略组和默认出口。
- `sub-store/operators/`：节点过滤、去重、重命名和排序。
- `tools/`：独立的本地 SOCKS 转换链路。
- `docs/`：设计原则、远程来源、操作说明和故障记录。

## 从哪里开始

1. 修改配置前阅读 [OPENCLASH_CONTEXT.md](OPENCLASH_CONTEXT.md)。
2. 需要理解规则语义时阅读 [docs/policy.md](docs/policy.md)。
3. 新增或替换远程规则源时阅读 [docs/sources.md](docs/sources.md)。
4. 进行日常维护或发布时阅读 [docs/operations.md](docs/operations.md)。
5. 遇到历史问题时阅读 [docs/troubleshooting.md](docs/troubleshooting.md)。

## 当前维护原则

- 不重新引入第二份 OpenClash 配置源。
- 不把 Sub-Store 的节点预处理逻辑复制到 `meta.ini`。
- 五个核心国家的普通/High 语义必须保持一致。
- High 只表示严格大于 `1x` 或 `1倍` 的倍率。
- 国家代码使用大写完整单词匹配，避免 `US`、`IN` 等片段误匹配。
- 未知节点优先保留，不进行猜测性删除。
- 不在仓库保存凭据、订阅地址、私钥或 Token。

## 相关文档

- [OpenClash 上下文](OPENCLASH_CONTEXT.md)
- [配置策略](docs/policy.md)
- [规则源清单](docs/sources.md)
- [维护流程](docs/operations.md)
- [故障排查](docs/troubleshooting.md)
- [变更记录](CHANGELOG.md)
- [Sub-Store 脚本](sub-store/README.md)
- [本地 SOCKS 工具](tools/README.md)
