# 远程规则源

本文档是远程规则源的人工维护索引，便于查找、替换和理解来源。实际加载关系、目标策略组和 TTL 以 [`meta.ini`](../meta.ini) 为准。

新增来源时应确认：来源格式与 `surge`、`clash-domain`、`clash-classic` 或 `clash-ipcidr` 的声明一致；内容确实属于目标应用；Raw URL 不包含 `refs/heads`；不要把订阅地址、Token 或私有链接提交到仓库。普通两字段 `.list` 使用默认的 `surge` 类型。

## 本仓库维护的香港银行域名

| 用途 | 目标策略组 | URL | 类型 | TTL |
| --- | --- | --- | --- | ---: |
| 常用香港银行域名 | `DIRECT` | `https://raw.githubusercontent.com/SageSang/rule_conf/main/rules/hk-banks.list` | `surge`（默认） | 86400 |

[`rules/hk-banks.list`](../rules/hk-banks.list) 只保存普通域名匹配数据；策略、顺序及汇丰香港例外仍由 `meta.ini` 维护。`hsbc.com.hk` 及子域名直接引用现有 `🇭🇰 HK` 普通组，位置早于 Aethersailor 直连补丁，避免补丁中已有的汇丰直连规则抢先命中。没有新增银行策略组，香港普通组继续使用原有的倍率筛选和故障切换行为。

域名线索参考 [NoCapBRB/hk-banks-proxy-rules 的固定版本](https://github.com/NoCapBRB/hk-banks-proxy-rules/blob/21d157315bec0a2b1aa007181326edf73d5663b2/hk_banks_direct.list)，按香港银行官网筛选后人工维护。只使用 `DOMAIN` / `DOMAIN-SUFFIX`，不使用 URL 路径、域名关键字、`GEOSITE` 或 `DOMAIN-REGEX` 来表达新增银行分流，以兼容 Shadowrocket 的 Clash 配置导入。

相对参考表的处理方式：

- 去掉 `URL-REGEX`、`DOMAIN-KEYWORD` 和全球共享的 `api.sc.com`；仅凭域名无法把 `www.sc.com/hk/` 与同域其他地区分开，因此不将整个 `sc.com` 直连。
- 众安收窄至 [ZA Bank 的 `bank.za.group`](https://bank.za.group/)，富邦改用 [香港官网 `fubonbank.com.hk`](https://www.fubonbank.com.hk/en/contact-us/index.html)，不覆盖整个集团域名。
- 补充官网确认的 [华侨 `ocbc.com.hk`](https://www.ocbc.com.hk/personal-banking/index.page)、[花旗 `citibank.com.hk`](https://www.citibank.com.hk/)、[平安数字银行 `pingandb.com`](https://www.pingandb.com/en/webmap.html)，以及旧 Airstar 官网跳转到的 [大象银行 `elebank.com`](https://www.elebank.com/zh-hk/index.html)。原有银行旧域名保留明确的归属说明，不能把它们的首页可达性当作 App 已验证。
- `ccb.com.hk`、`bankofchina.com.hk`、`bocpay.com.hk` 和 `dahsing.com.hk` 本次未确认当前业务用途，暂不纳入；对应银行仍有已核实的官网域名。共享的 `mobile.eum-appdynamics.com`、全球汇丰和 Amex 域名也不在本次范围。

新增或修改域名时先确认银行归属及香港范围，再检查 SubConverter 展开后的规则和目标策略。发布后应分别刷新 OpenClash 和 Shadowrocket，检查实际请求命中；域名归属和规则生成通过不代表银行登录、Reward+ 功能已完成实测。完整回退时移除 `meta.ini` 的两条香港银行规则声明，列表文件不单独决定运行行为。

## MetaCubeX

| 用途 | 目标策略组 | URL | 类型 | TTL |
| --- | --- | --- | --- | ---: |
| Gemini | `♊ Gemini` | `https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/classical/google-gemini.yaml` | `clash-classic` | 86400 |
| DLsite | `🇯🇵 日本原生解锁` | `https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/classical/dlsite.yaml` | `clash-classic` | 86400 |
| Steam 中国下载 | `⬇️ Steam / Epic 下载` | `https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/classical/steam%40cn.yaml` | `clash-classic` | 86400 |
| Epic 中国下载 | `⬇️ Steam / Epic 下载` | `https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/classical/epicgames%40cn.yaml` | `clash-classic` | 86400 |

GeoIP 文件 `bt.yaml`、`pt.yaml` 分别对应不丹和葡萄牙，不用于 BT/PT 下载识别。现有 `⬇️ BT/PT 下载` 策略组保留，暂不配置替代规则源。

## blackmatrix7

| 用途 | 目标策略组 | URL | 类型 | TTL |
| --- | --- | --- | --- | ---: |
| Pixiv | `🇯🇵 日本原生解锁` | `https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Pixiv/Pixiv.yaml` | `clash-classic` | 86400 |
| Reddit | `🟠 Reddit` | `https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Reddit/Reddit.yaml` | `clash-classic` | 86400 |
| Google Voice | `📞 Google Voice` | `https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/GoogleVoice/GoogleVoice.yaml` | `clash-classic` | 86400 |
| Copilot | `🧠 AI` | `https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Copilot/Copilot.yaml` | `clash-classic` | 86400 |

## ACL4SSR

| 用途 | 目标策略组 | URL | 类型 | TTL |
| --- | --- | --- | --- | ---: |
| AI 补充规则 | `🧠 AI` | `https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Providers/Ruleset/AI.yaml` | `clash-classic` | 86400 |
| Google FCM | `📢 Google FCM` | `https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Providers/Ruleset/GoogleFCM.yaml` | `clash-classic` | 86400 |

## Aethersailor

| 用途 | 目标策略组 | URL | 类型 | TTL |
| --- | --- | --- | --- | ---: |
| 直连域名补充 | `DIRECT` | `https://testingcf.jsdelivr.net/gh/Aethersailor/Custom_OpenClash_Rules@main/rule/Custom_Direct_Domain.yaml` | `clash-domain` | 28800 |
| 直连 IP 补充 | `DIRECT` | `https://testingcf.jsdelivr.net/gh/Aethersailor/Custom_OpenClash_Rules@main/rule/Custom_Direct_Classical_IP.yaml` | `clash-classic` | 28800 |
| 代理域名兜底 | `🚀 手动选择` | `https://testingcf.jsdelivr.net/gh/Aethersailor/Custom_OpenClash_Rules@main/rule/Custom_Proxy_Domain.yaml` | `clash-domain` | 28800 |
| 代理 IP 兜底 | `🚀 手动选择` | `https://testingcf.jsdelivr.net/gh/Aethersailor/Custom_OpenClash_Rules@main/rule/Custom_Proxy_Classical_IP.yaml` | `clash-classic` | 28800 |
| 非标端口 | `🔀 非标端口` | `https://testingcf.jsdelivr.net/gh/Aethersailor/Custom_OpenClash_Rules@main/rule/Custom_Port_Direct.yaml` | `clash-classic` | 28800 |

## 内置与内联规则

以下规则不使用远程 URL：

- `GEOSITE` / `GEOIP` 的 private、cn、google、telegram、apple、youtube、netflix、disney、steam、epicgames、rockstar、github、cloudflare、microsoft 等集合。
- 日本原生解锁中的 `fanza.cc`、`fanza.jp`、`fantia.jp`、`dmm.co.jp` 和 `dmm.com` 域名后缀。
- 汇丰香港的 `hsbc.com.hk` 域名后缀，直接引用现有 `🇭🇰 HK` 普通组。
- `FINAL` 规则和非标端口相关的策略链。

`meta.ini` 中注释里的 `https://xxx/okx.yaml` 只是示例占位符，不属于实际规则源。

## 来源变更原则

规则源更换时，先记录目标策略组、规则类型、TTL 和规则优先级，再修改 `meta.ini`。如果只是来源替换，不要同时改变默认出口或国家组语义；不同目的的设计决定应分开记录到 Sidney Vault，入口见 [OPENCLASH_CONTEXT.md](../OPENCLASH_CONTEXT.md)。
