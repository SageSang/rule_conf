# OpenClash 项目上下文

在修改本项目之前，请先阅读 [OPENCLASH_CONTEXT.md](OPENCLASH_CONTEXT.md)。

- `meta.ini` 是 OpenClash 的 SubConverter 模板源文件。
- `maoxiong_rules.toml` 是同一套规则与策略组的 TOML 描述；变更分流或策略组时必须同步修改两者。
- 不要保存、打印或提交密码、私钥、订阅链接、Token 等凭据。
- 新增规则优先按上下文文档记录的 MetaCubeX、blackmatrix7 来源查找；GitHub Raw URL 一律移除 `refs/heads`。
- 修改后至少执行 `git diff --check`，并验证新增的远程规则源可访问。
