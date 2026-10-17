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

本次客户端链接在上述 INI 地址后使用固定查询参数 `?compat=shadowrocket`，并设置 `expand=true`，避开转换服务对旧 INI 的缓存；仍跟随 main 的同一个文件，后续无需随规则更新更换链接。

分别更新首页节点订阅和整份配置；主配置更新后核对 DNS 模块仍启用、微信和自有域名命中 DIRECT。客户端后台刷新受系统调度限制，手动结束应用或重启设备后需重新启动应用。模块的启用状态应在各台设备确认。

## 验证与恢复

2026-10-18 服务端输出包含完整 110,534 条中国域名规则；与原输出逐条对比，仅 `GEOSITE,cn,DIRECT` 被同源列表替换，其他规则与顺序完全相同。Mac 与 iPhone 均启用 `sub-unified-update.conf`，各自从正式地址刷新成功，导入后保留 115,277 条规则及 69 个策略组。

iPhone 在 Wi-Fi、VPN 开启时，微信 `weixin.qq.com` 请求命中 `DOMAIN-SUFFIX,qq.com,DIRECT`，群晖请求命中 `DOMAIN-SUFFIX,281379.xyz,DIRECT`；微信原图可打开，Drive 可读取新目录及下载文件，Photos 显示照片备份完成。初次 Drive 有连接失败，重连后恢复；HTTP 与 TUN 对照均可访问，最终保留原 HTTP 模式。Mac 的百度和群晖 HTTPS 入口返回 200，Google 检查返回 204。两端运行日志确认 DNS 模块在主配置刷新后仍生效。

Mac 已开启配置每天更新、节点订阅每 12 小时更新。iPhone 的手动更新已验证，后台更新开关本轮未调整。客户端后台调度和所有故障场景的 DNS 行为不属于本次实测结论。

恢复分流源可回退本次 `meta.ini` 变更；恢复客户端则选择修复前备份的配置。DNS 模块与原 DNS 参数一致，恢复旧配置时可保留；如需完全恢复原客户端状态，再禁用此模块。备份中可能包含订阅凭据，应保持私密。
