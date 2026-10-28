# 维护与操作流程

本文档描述仓库内配置的日常维护方式。配置行为、节点预处理和本地 SOCKS 是三个不同层次，不要把它们混成一个脚本或一份配置。

## 1. 先判断修改层次

| 需求 | 修改位置 |
| --- | --- |
| 新增应用规则、调整规则顺序 | `meta.ini` |
| 修改策略组、默认出口、国家节点匹配 | `meta.ini` |
| 删除说明节点、去重、重命名、排序 | `sub-store/operators/` |
| 将订阅转换为本地 SOCKS 出口 | `tools/convert-any-proxy-to-local-socks.js` |
| 记录设计原因和历史决策 | Sidney Vault（见 `../OPENCLASH_CONTEXT.md`） |
| 维护来源和操作说明 | `docs/sources.md` 与本文件 |

## 2. 修改 `meta.ini`

1. 先确认规则属于哪个应用策略组。
2. 将应用专属规则放在通用规则和中国直连规则之前。
3. 应用需要独立出口控制时创建同名 `select` 策略组；明确使用 `DIRECT` 或既有地区组的规则可直接引用，无需新增策略组。
4. 确保策略组的第一个选项是期望默认值。
5. 五个核心国家始终按照普通组、同国 High 组相邻排列。
6. 保持 High 倍率和国家代码正则的既有语义。
7. 新增来源时参考 [sources.md](sources.md)，不要提交私有订阅 URL。

## 3. 修改 Sub-Store

1. 先确定是“删除节点”还是“整理节点”。
2. 需要保留五国 High 和其他地区时使用 `keep-core-premium-and-remote.js`。
3. 需要去重、重命名和排序时使用 `filter-sort-by-region-and-quality.js`。
4. JavaScript 脚本必须添加到 Sub-Store 的 Script Filter 或 Script Operator 中，不能添加到普通正则过滤操作。
5. Sub-Store 只处理节点，不添加应用域名规则，也不生成 OpenClash 策略组。

## 4. 修改本地 SOCKS 工具

本地 SOCKS 转换工具是独立的订阅适配器。修改时只关注输入订阅、地区端口映射、输出格式和运行方式；不要在其中复制 `meta.ini` 的应用分流规则。

具体说明见 [../tools/README.md](../tools/README.md)。

## 5. 变更记录方式

- 个人背景、当前核验状态、设计原因与故障历史维护于 Sidney Vault；入口见 [OPENCLASH_CONTEXT.md](../OPENCLASH_CONTEXT.md)。
- 仓库维护可执行配置、来源与通用操作说明；精确规则和完整默认值直接查看 `meta.ini`。
- 新取得的现场信息注明设备、版本与日期，再补充 Vault 中同一对象的未知项。

## 6. 完成前检查

配置变更沿用项目原有的最低要求：执行 `git diff --check`，检查规则顺序、默认项和策略组引用，并确认新增远程规则源可访问且内容正确。文档变更不需要新增自动校验脚本或测试框架。

## 7. 部署注意事项

- 仓库中的 `meta.ini` 是模板源，不是路由器上的最终生成配置。
- 远程 SubConverter 可能缓存旧模板；发现生成结果与仓库不一致时，先排查缓存，再确认实际使用的模板地址和版本。
- 路由器实际生效的配置路径应在目标设备上确认，不能依赖历史文件名。
- OpenClash、HomeProxy、sing-box 等代理栈如果争用透明代理、DNS 或控制端口，应先确认运行状态再切换。
