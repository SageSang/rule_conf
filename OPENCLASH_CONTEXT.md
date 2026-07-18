# OpenClash 配置上下文

最后更新：2026-07-16

此文档是本项目的维护基线。它记录网络拓扑、配置文件职责、规则顺序、远端规则来源和策略组默认值；不保存密码、私钥、订阅 URL 或 Token。

## 网络与管理端点

| 项目 | 地址 / 值 | 说明 |
| --- | --- | --- |
| OpenWrt 管理地址 | `192.168.31.4` | LuCI / SSH 所在设备；认证信息不记录在仓库。 |
| OpenClash 控制面板 | `http://192.168.31.4:9090` | 与 HomeProxy 不能同时运行并占用此端口。 |
| OpenWrt WAN（`eth1`） | `192.168.31.4`，上级网关 `192.168.31.1` | 上级主路由网络。 |
| OpenWrt LAN（`eth0`） | `10.0.0.1/24` | DHCP 当前关闭。 |
| 路由器生效配置 | `/etc/openclash/maoxiong.yaml` | 路由器上的转换后配置。 |
| 本地模板 | `meta.ini` | OpenClash / SubConverter INI 源。 |
| 本地 TOML | `maoxiong_rules.toml` | 与 `meta.ini` 等价的规则、策略组描述。 |
| Sub-Store 节点筛选 | `sub-store/operators/keep-core-premium-and-remote.js` | 仅筛选节点源，不含凭据、不生成策略组。 |

网络角色为旁路代理网关：上级网段设备经 `192.168.31.4` 使用代理，流量最终经 `192.168.31.1` 出网。切换代理栈时，必须先停止 HomeProxy/sing-box，再启动 OpenClash；两者不能同时接管透明代理、DNS 与 `9090`。

`openclash-sub/` 已废弃并删除；不再通过仓库内 Docker/Nginx 暴露私有节点文件。若使用 Sub-Store，将节点源汇总后使用上述脚本筛选，再将其生成的订阅地址交给客户端或 OpenClash。

## 维护规则

1. 新增应用必须同时写入 `meta.ini` 与 `maoxiong_rules.toml`。
2. 应用专属规则必须放在 `DIRECT` 的中国域名 / GeoIP 规则之前，也必须放在通用服务规则之前。例如 Google Voice 置于通用 Google 规则之前。
3. 每个应用规则组应有同名 `select` 策略组；数组第一个项目就是默认值。每个应用组还应保留五个可手动选择的优质故障切换出口：`🇺🇸 优质美国`、`🇸🇬 优质新加坡`、`🇭🇰 优质香港`、`🇹🇼 优质台湾`、`🇯🇵 优质日本`。
4. 规则源优先使用维护活跃且可验证的 Clash YAML。新增后确认 HTTP 200 和实际内容，再执行 `git diff --check`。
5. 不新增宽泛的 `google.com`、`googleapis.com` 等域名规则到单个应用组，以免覆盖普通 Google、Play 或其他应用。
6. GitHub Raw 链接不得包含 `refs/heads`。例如 `https://raw.githubusercontent.com/<owner>/<repo>/master/<path>`，而不是 `.../refs/heads/master/<path>`。
7. 不做 `0.1x` 的全局订阅排除；仅香港、台湾、美国、日本、新加坡五个普通国家组应排除精确的 `0.1x` 节点。优质组和其他国家不受此条件影响。

## 规则来源与查找顺序

当当前规则库没有所需应用规则时，按以下来源查找，并选择与现有转换格式兼容的文件：

1. [MetaCubeX meta-rules-dat / geo](https://github.com/MetaCubeX/meta-rules-dat/tree/meta/geo)：优先用于 GeoSite、GeoIP 及其 `classical` YAML 规则集。
2. [blackmatrix7 / OKX Clash rules](https://github.com/blackmatrix7/ios_rule_script/tree/master/rule/Clash/OKX)：作为 blackmatrix7 Clash 应用规则的路径示例；其他应用通常位于同一仓库的 `rule/Clash/<应用名>/`。

引用 GitHub 文件时，网页链接中的分支路径只用于浏览；配置内应使用 `raw.githubusercontent.com` 的简化 Raw 链接，并自动移除 `refs/heads`。新增来源还应核对文件内容确实属于目标应用，避免引入空规则或覆盖范围错误的规则集。

## 当前新增：Google Voice

| 项目 | 配置 |
| --- | --- |
| 策略组 | `📞 Google Voice` |
| 规则源 | `https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/GoogleVoice/GoogleVoice.yaml` |
| 规则位置 | Cloudflare 之后、通用 `🔎 Google` 之前；因此优先命中。 |
| 默认策略 | `🇺🇸 优质美国` |
| 可选策略 | `🇺🇸 US`、`🇸🇬 SG`、`🇭🇰 HK`、`🇹🇼 TW`、`🇯🇵 JP`、`🇦🇷 AR`、`🇬🇧 UK`、`🇩🇪 DE`、冷门节点、五个优质地区出口、手动选择、自动选择、Default。 |

Google Voice 需要稳定的优质美国出口，故默认设为 `🇺🇸 优质美国`。共享的 Google 登录、账户和 API 域名仍由 `🔎 Google` 处理；如果号码注册、通话质量或风控表现不佳，再从此专属组调整，不影响通用 Google 或 FCM。

## 应用策略组默认值

这里的“默认值”是策略组列表第一个项目，即生成后初始选中的策略。

| 应用 / 策略组 | 默认值 |
| --- | --- |
| 🍎 Apple | 🇺🇸 US |
| ♊ Gemini | 🇺🇸 优质美国 |
| 🤖 ChatGPT | 🇺🇸 优质美国 |
| 🧠 AI | 🇺🇸 US |
| 📨 Telegram | 🇸🇬 SG |
| 📞 即时通讯 | 🇺🇸 US |
| 💬 社交媒体 | 🇸🇬 SG |
| 🎬 YouTube | 🇸🇬 SG |
| 🎥 Netflix | 🇸🇬 SG |
| 🏰 DisneyPlus | 🇸🇬 SG |
| 🎵 TikTok | 🇸🇬 SG |
| 💬 WhatsApp | 🇸🇬 优质新加坡 |
| 📸 Instagram | 🇸🇬 SG |
| 🐦 X | 🇺🇸 US |
| 🧑‍💻 GitHub | 🌐 Default |
| 🚝 测速工具 | DIRECT |
| ⬇️ Steam / Epic 下载 | DIRECT |
| ♨️ Steam | 🇦🇷 AR |
| 🛍️ Epic Games | 🇦🇷 AR |
| ⭐ Rockstar | 🇦🇷 AR |
| ⬇️ BT/PT 下载 | DIRECT |
| 🟦 OKX | 🇸🇬 SG |
| 🟨 Binance | 🇸🇬 SG |
| 🟪 Bybit | 🇸🇬 SG |
| 🟥 Adobe | REJECT |
| 📞 Google Voice | 🇺🇸 优质美国 |
| 🔎 Google | 🇺🇸 US |
| 📢 Google FCM | 🌐 Default |
| ☁️ cloudflare | 🌐 Default |
| 🪟 Microsoft | 🇸🇬 SG |

## 基础策略组默认值

| 策略组 | 默认值 |
| --- | --- |
| 🚀 手动选择 | 🇸🇬 SG |
| 🌐 Default | 🇭🇰 HK |
| GLOBAL | 🇺🇸 优质美国 |
| 🐟 漏网之鱼 | DIRECT |
| 🔀 非标端口 | 🐟 遵循规则 |
| 🐟 遵循规则 | 🐟 漏网之鱼 |

香港、台湾、美国、日本、新加坡是特权国家：它们的普通节点为 `url-test`，以 `https://www.gstatic.com/generate_204` 每 300 秒按延迟自动选优；五个同名优质组为 `fallback`，保持当前健康节点，仅在失联时切换。

优质组仅为 `🇺🇸 优质美国`、`🇸🇬 优质新加坡`、`🇭🇰 优质香港`、`🇹🇼 优质台湾`、`🇯🇵 优质日本`。优质节点仅匹配 `进阶IEPL`、`专线`、`原生`、`家宽`、`星链`，或独立的 `2x`、`3x`、`4x`、`5x` 倍率标签；`0.5x`、`1.5x`、`15x` 不能因包含 `5x` 被判为优质。五个特权国家的普通组仅排除这些优质标签，二者不重叠。`CN2`、`IPLC`、普通 `IEPL`、`进阶`、`1x`不作为优质条件。

韩国及其他独立展示国家均为 `fallback`，按国家保留当前健康节点、失联才切换，不受五个特权国家的优质/普通互斥筛选影响。`🧊 冷门节点`归集澳门、泰国、印度尼西亚、越南、菲律宾、新西兰、巴西、墨西哥、智利、荷兰、挪威、阿联酋、沙特阿拉伯、尼日利亚，也采用 `fallback` 并保留全部节点。

## 策略组展示顺序

输出配置按“应用策略组 → 基础控制组 → 五个优质/普通国家成对 → 其他常用国家 → 冷门节点”排列。每个应用组保留原默认项在第一位；其后按同一国家的优质/普通相邻、常用国家在前、`🧊 冷门节点`在后排列。该排序仅影响面板展示和手动选择顺序，不改变规则命中或默认出站。
