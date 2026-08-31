# Repository Instructions

本文件是协作者和代码代理进入项目后的最小约束。开始处理项目内容前，先阅读 [OPENCLASH_CONTEXT.md](OPENCLASH_CONTEXT.md)，再根据任务需要阅读 `docs/` 下的对应文档。

## 权威文件

- `meta.ini` 是 OpenClash 的唯一运行维护源，负责规则顺序、远程规则集、策略组和默认出口。
- `sub-store/operators/` 下的脚本只负责节点订阅的整理、筛选、去重和排序，不负责 OpenClash 分流。
- `tools/` 下的脚本属于独立的本地 SOCKS 转换链路，不改变 `meta.ini` 的规则语义。
- 文档只描述设计、当前状态、来源和操作方法，不得作为另一份配置源。

## 修改边界

- 修改应用分流、规则顺序、策略组、默认出口或节点匹配逻辑时，维护 `meta.ini`。
- 修改 Sub-Store 节点预处理时，只修改对应脚本及其说明；不要把预处理逻辑复制到 `meta.ini`。
- 修改本地 SOCKS 转换行为时，只修改 `tools/` 中的对应脚本及其说明。
- 除非明确要求，不移动现有文件，不恢复已废弃的 `maoxiong` 或 `openclash-sub` 方案。

## 安全与来源

- 不保存、打印或提交密码、私钥、订阅链接、Token 或其他凭据。
- 新增远程规则源时，优先参考 [docs/sources.md](docs/sources.md) 中的来源类型和命名方式。
- GitHub Raw URL 不使用 `refs/heads` 形式。

## 完成要求

- 配置变更沿用项目现有最低要求：检查 `git diff --check`，并确认新增远程规则源可访问且内容属于目标应用。
- 文档变更不新增校验脚本、测试框架或其他自动化维护机制，除非用户另行明确要求。
