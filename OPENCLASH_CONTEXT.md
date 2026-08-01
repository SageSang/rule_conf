# OpenClash 配置上下文

最后更新：2026-07-26

此文档是本项目的维护基线。它记录网络拓扑、配置文件职责、规则顺序、远端规则来源和策略组默认值；不保存密码、私钥、订阅 URL 或 Token。

## 网络与管理端点

| 项目 | 地址 / 值 | 说明 |
| --- | --- | --- |
| OpenWrt 管理地址 | `192.168.31.4` | LuCI / SSH 所在设备；认证信息不记录在仓库。 |
| OpenClash 控制面板 | `http://192.168.31.4:9090` | 与 HomeProxy 不能同时运行并占用此端口。 |
| OpenWrt WAN（`eth1`） | `192.168.31.4`，上级网关 `192.168.31.1` | 上级主路由网络。 |
| OpenWrt LAN（`eth0`） | `10.0.0.1/24` | DHCP 当前关闭。 |
| 路由器生效配置 | `/etc/openclash/maoxiong.yaml` | 路由器上的转换后配置。 |
| 本地模板 | `meta.ini` | OpenClash / SubConverter 的唯一规则与策略组维护源。 |

| Sub-Store 节点整理 | `sub-store/operators/filter-sort-by-region-and-quality.js` | 删除说明项、规范重名并按地区及倍率排序；不生成策略组。 |
| Sub-Store 精简筛选 | `sub-store/operators/keep-core-premium-and-remote.js` | 仅保留五国高倍率节点及其他地区节点；不含凭据、不生成策略组。 |

网络角色为旁路代理网关：上级网段设备经 `192.168.31.4` 使用代理，流量最终经 `192.168.31.1` 出网。切换代理栈时，必须先停止 HomeProxy/sing-box，再启动 OpenClash；两者不能同时接管透明代理、DNS 与 `9090`。

`openclash-sub/` 已废弃并删除；不再通过仓库内 Docker/Nginx 暴露私有节点文件。若使用 Sub-Store，将节点源汇总后使用上述脚本筛选，再将其生成的订阅地址交给客户端或 OpenClash。

## 维护规则

1. 新增或调整应用、分流规则、策略组时，只维护 `meta.ini`。
2. 应用专属规则必须放在 `DIRECT` 的中国域名 / GeoIP 规则之前，也必须放在通用服务规则之前。例如 Google Voice 置于通用 Google 规则之前。
3. 每个应用规则组应有同名 `select` 策略组；数组第一个项目就是默认值。五国节点必须以“普通 → 同国高倍率”相邻排列；若默认值为五国普通组，第二项必须是该国高倍率组。
4. 规则源优先使用维护活跃且可验证的 Clash YAML。新增后确认 HTTP 200 和实际内容，再执行 `git diff --check`。
5. 不新增宽泛的 `google.com`、`googleapis.com` 等域名规则到单个应用组，以免覆盖普通 Google、Play 或其他应用。
6. GitHub Raw 链接不得包含 `refs/heads`。例如 `https://raw.githubusercontent.com/<owner>/<repo>/master/<path>`，而不是 `.../refs/heads/master/<path>`。
7. 不做 `0.1x` 的订阅排除；它属于普通节点。五个高倍率组仅匹配严格数值大于 `1x` 的节点，普通组保留其余倍率节点。
8. 国家英文缩写必须按大写单词边界匹配；外层使用 `(?i)` 时，缩写应写为 `(?-i:\bUS\b)`，不能使用裸 `US` 或忽略大小写的 `\bUS\b`，避免将普通英文单词或国家全称内部片段误归入其他国家组。

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
| 默认策略 | `🇺🇸 US` |
| 可选策略 | `🇺🇸 US`、`🇸🇬 SG`、`🇭🇰 HK`、`🇹🇼 TW`、`🇯🇵 JP`、`🇦🇷 AR`、`🇬🇧 UK`、`🇩🇪 DE`、冷门节点、五个高倍率地区出口、手动选择、自动选择、Default。 |

Google Voice 默认设为 `🇺🇸 US`，其后的同国高倍率出口可手动切换。共享的 Google 登录、账户和 API 域名仍由 `🔎 Google` 处理；如果号码注册、通话质量或风控表现不佳，再从此专属组调整，不影响通用 Google 或 FCM。

## 应用策略组默认值

这里的“默认值”是策略组列表第一个项目，即生成后初始选中的策略。

| 应用 / 策略组 | 默认值 |
| --- | --- |
| 🍎 Apple | 🇺🇸 US |
| ♊ Gemini | 🇺🇸 US |
| 🤖 ChatGPT | 🇺🇸 US |
| 🧠 AI | 🇺🇸 US |
| 📨 Telegram | 🇸🇬 SG |
| 📞 即时通讯 | 🇺🇸 US |
| 💬 社交媒体 | 🇸🇬 SG |
| 🎬 YouTube | 🇸🇬 SG |
| 🎥 Netflix | 🇸🇬 SG |
| 🏰 DisneyPlus | 🇸🇬 SG |
| 🎵 TikTok | 🇸🇬 SG |
| 💬 WhatsApp | 🇸🇬 SG |
| 📸 Instagram | 🇸🇬 SG |
| 🐦 X | 🇺🇸 US |
| 🧑‍💻 GitHub | 🌐 Default |
| 🚝 测速工具 | DIRECT |
| ⬇️ Steam / Epic 下载 | DIRECT |
| ♨️ Steam | 🇦🇷 AR |
| 🛍️ Epic Games | 🇦🇷 AR |
| ⭐ Rockstar | 🇦🇷 AR |
| ⬇️ BT/PT 下载 | DIRECT |
| 🟦 OKX | 🇹🇼 TW |
| 🟨 Binance | 🇹🇼 TW |
| 🟪 Bybit | 🇹🇼 TW |
| 🟥 Adobe | REJECT |
| 📞 Google Voice | 🇺🇸 US |
| 🔎 Google | 🇺🇸 US |
| 📢 Google FCM | 🌐 Default |
| ☁️ cloudflare | 🌐 Default |
| 🪟 Microsoft | 🇸🇬 SG |

## 基础策略组默认值

| 策略组 | 默认值 |
| --- | --- |
| 🚀 手动选择 | 🇺🇸 US |
| 🌐 Default | 🇹🇼 TW |
| GLOBAL | 🇺🇸 US |
| 🐟 漏网之鱼 | 🌐 Default |
| 🔀 非标端口 | 🐟 遵循规则 |
| 🐟 遵循规则 | 🐟 漏网之鱼 |

香港、台湾、美国、日本、新加坡五国的普通组和对应高倍率组均为 `fallback`，按订阅顺序保留第一个健康节点，仅在失联时向后切换。`♻️ 自动选择` 使用 `url-test`，根据定时测速结果自动选择延迟最低的节点。

高倍率组仅为 `🇺🇸 US High`、`🇸🇬 SG High`、`🇭🇰 HK High`、`🇹🇼 TW High`、`🇯🇵 JP High`。高倍率节点严格匹配数值大于 `1x` 或 `1倍` 的倍率标签，例如 `1.01x`、`1.5x`、`2x`、`15x`、`5倍消耗`；`0.1x`、`0.5x`、`1x`、`1.0x`、`1.00x`、`1倍` 不属于高倍率，仍归普通组。五个特权国家的普通组仅排除高倍率节点，因此与高倍率组的倍率筛选不重叠。所有策略选择中的五国节点均按“普通 → 同国高倍率”相邻排列。`进阶IEPL`、`专线`、`原生`、`家宽`、`星链`、`CN2`、`IPLC`、普通 `IEPL`、`进阶`不再作为高倍率条件。

韩国及其他独立展示国家均为 `fallback`，按国家保留当前健康节点、失联才切换，不受五个特权国家的高倍率/普通互斥筛选影响。`🧊 冷门节点`是 21 个独立国家组的补集：所有未命中独立国家别名的节点都会进入该组，因此新增国家、非标准名称和未单独展示的国家不会遗漏；它也采用 `fallback` 并保留全部节点。

## 策略组展示顺序

输出配置按“应用策略组 → 基础控制组 → 五个普通/高倍率国家成对 → 其他常用国家 → 冷门节点”排列。每个应用组保留原默认项在第一位；其后按同一国家的普通/高倍率相邻、常用国家在前、`🧊 冷门节点`在后排列。该排序仅影响面板展示和手动选择顺序，不改变规则命中或默认出站。
