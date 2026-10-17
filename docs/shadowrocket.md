# Shadowrocket 国内分流与订阅更新

分流规则继续只维护 `meta.ini`。Sub-Store 整理节点，Subconverter 以 `target=clash` 输出节点、策略组和规则；Shadowrocket 导入该输出。

## 国内规则兼容

Shadowrocket 2.2.92（3445）的实测导入会忽略 Clash 的 `GEOSITE` 条目，而普通 `DOMAIN-SUFFIX` 可以导入并命中。只剩 `GEOIP,CN,...,no-resolve` 时，域名连接未必能落到国内直连，微信在境外的服务地址也不属于中国 IP。

`meta.ini` 将原 `GEOSITE,cn` 换成 MetaCubeX 同源的 `geo/geosite/classical/cn.yaml`，由 Subconverter 展开。位置、DIRECT 策略、其后的 GEOIP 规则以及其他应用规则保持不变。自有域名 `281379.xyz` 仍由原有高优先级规则直连。无需单独维护微信白名单。

其他客户端继续使用同一份 INI。此改动只解决国内域名库的兼容性，不声称 Shadowrocket 支持全部 Mihomo 语法：其他 `GEOSITE` 和 `DOMAIN-REGEX` 的导入限制仍然存在，不在本次改动范围。

## DNS 与更新

Shadowrocket 启用仓库根目录的 `shadowrocket-dns.module`，固定既有 DNS 设置。模块不含分流规则，不需要 Android、Windows 或 OpenWRT 安装。地址为：

`https://raw.githubusercontent.com/SageSang/rule_conf/main/shadowrocket-dns.module`

主配置必须保留指向既有受保护 Subconverter 入口的 `update-url`，其中 `config` 仍指向 `https://raw.githubusercontent.com/SageSang/rule_conf/main/meta.ini`。完整订阅 URL 和节点凭据只保存在客户端及私有备份中，不进入仓库。

分别更新首页节点订阅和整份配置；主配置更新后核对 DNS 模块仍启用、微信和自有域名命中 DIRECT。客户端后台刷新受系统调度限制，手动结束应用或重启设备后需重新启动应用。模块的启用状态应在各台设备确认。

## 验证与恢复

2026-10-18 的服务端候选输出包含完整 110,534 条中国域名规则；与原输出逐条对比，仅 `GEOSITE,cn,DIRECT` 被同源列表替换，其他规则与顺序完全相同。发布时还需在客户端验证实际请求和配置刷新。

恢复分流源可回退本次 `meta.ini` 变更；恢复客户端则选择修复前备份的配置。DNS 模块与原 DNS 参数一致，恢复旧配置时可保留；如需完全恢复原客户端状态，再禁用此模块。备份中可能包含订阅凭据，应保持私密。
