# E-IX 节点专用 DNS

E-IX 的节点域名需要由其专用 DNS 解析。Sub-Store 合集输出的是节点，原机场配置的 DNS 不会随节点自动进入 Subconverter 的输出。只更新节点或给订阅增加 `flag=anytls`，不能补齐这项解析策略。

`meta.ini` 通过 `clash_rule_base` 引用 [`templates/clash-base.yaml`](../templates/clash-base.yaml)。模板沿用当前转换服务的基础监听设置，只增加节点 DNS 默认值与 `eixcloud.com` 的专用策略；规则、策略组、默认出口继续由 `meta.ini` 维护。

## 解析范围

`proxy-server-nameserver-policy` 将 E-IX 节点域名交给两个官方 HTTPS DNS。`nameserver-policy` 同时覆盖客户端经 DNS 入口查询这些节点域名的情况。两处都只匹配 `eixcloud.com` 及其子域名，普通网站不交给机场 DNS。

`proxy-server-nameserver` 使用现有节点解析所用的阿里、腾讯 IP DoH，因为 Mihomo 要求节点专用策略启用时该项非空。机场 DoH 的 `#DIRECT` 避免依赖尚未建立的代理节点；DoH 域名的引导解析仍由客户端已有设置负责。节点保留域名、SNI 和证书校验，地址变化由 DNS 动态处理，不写死当前 IP。

本模板不接管 DNS 开关、监听、Fake-IP、普通网站、直连及备用 DNS。OpenClash 应保留原有防泄漏覆写；最终运行配置须启用 DNS，并保留模板中的两个域名策略。自定义脚本或客户端若整体替换 DNS 区块，仍需调整其合并方式，不能用关闭防泄漏来代替检查。

## 客户端更新

| 使用方式 | 取得修改的方法 |
| --- | --- |
| OpenClash，使用现有 Subconverter 与 meta.ini | 更新整份订阅配置，检查运行 YAML 的两项域名策略；仅更新节点不够 |
| 其他 Mihomo 客户端 | 更新整份配置，并确认本地 DNS 覆写保留策略且 DNS 已启用 |
| Shadowrocket（Mac、iPhone、iPad） | 不能依赖 Clash DNS 字段自动导入；现有 DNS 保护模块需另行适配，本次未修改该模块 |
| 只导入节点的客户端、订阅集合或 local-socks 转换器 | 不会自动继承该 DNS 区块，需要在实际运行配置中单独适配 |
| Surge、Stash、Loon 等其他内核或格式 | 不将 Mihomo 专用字段视为通用协议，需按目标格式核验 |

现有订阅 URL 无需更换。转换服务可能缓存 INI 或底模；更新后应在实际输出中查找 `proxy-server-nameserver-policy`，不能仅根据更新时间判断已生效。GitHub 发布成功不代表所有终端已经刷新。

## 验证与恢复

转换验证使用虚构节点，比较修改前后的完整 YAML；除新增 `dns` 区块外，基础参数、节点、策略组和规则应一致。再验证正式 Raw 文件及既有转换入口输出，检查新增策略、域名范围、SNI 与证书校验字段。

软路由更新后，应抽测多个 E-IX 节点的真实出网，并确认其他机场、国内直连及原 DNS 防泄漏路径保持正常。机场 DNS 失效时，不应将该域名回退给已确认无法提供可用入口的公共 DNS。端口或 TLS 握手成功不能替代代理认证与出网验收。

回退时删除 `meta.ini` 中的 `clash_rule_base` 引用，并刷新整份配置，转换器恢复原底模；模板文件本身不会独立生效。此次没有修改路由器的 UCI、DNS 覆写或服务部署。

依据：[Mihomo DNS 定义](https://wiki.metacubex.one/config/dns/)、[OpenClash DNS 合并实现](https://github.com/vernesong/OpenClash/blob/master/luci-app-openclash/root/usr/share/openclash/yml_change.sh)。两个机场 DoH 地址来自用户导入的 E-IX 官方配置；维护时核对最新官方配置，不保存订阅凭据。
