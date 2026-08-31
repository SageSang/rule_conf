# 远程规则源

本文档是远程规则源的人工维护索引，便于查找、替换和理解来源。实际加载关系、目标策略组和 TTL 以 [`meta.ini`](../meta.ini) 为准。

新增来源时应确认：来源格式与 `clash-domain`、`clash-classic` 或 `clash-ipcidr` 的声明一致；内容确实属于目标应用；Raw URL 不包含 `refs/heads`；不要把订阅地址、Token 或私有链接提交到仓库。

## MetaCubeX

| 用途 | 目标策略组 | URL | 类型 | TTL |
| --- | --- | --- | --- | ---: |
| Gemini | `♊ Gemini` | `https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/classical/google-gemini.yaml` | `clash-classic` | 86400 |
| DLsite | `🇯🇵 日本原生解锁` | `https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/classical/dlsite.yaml` | `clash-classic` | 86400 |
| Steam 中国下载 | `⬇️ Steam / Epic 下载` | `https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/classical/steam%40cn.yaml` | `clash-classic` | 86400 |
| Epic 中国下载 | `⬇️ Steam / Epic 下载` | `https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/classical/epicgames%40cn.yaml` | `clash-classic` | 86400 |
| BT 网段 | `⬇️ BT/PT 下载` | `https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/bt.yaml` | `clash-ipcidr` | 86400 |
| PT 网段 | `⬇️ BT/PT 下载` | `https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/pt.yaml` | `clash-ipcidr` | 86400 |

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
- `FINAL` 规则和非标端口相关的策略链。

`meta.ini` 中注释里的 `https://xxx/okx.yaml` 只是示例占位符，不属于实际规则源。

## 来源变更原则

规则源更换时，先记录目标策略组、规则类型、TTL 和规则优先级，再修改 `meta.ini`。如果只是来源替换，不要同时改变默认出口或国家组语义；不同目的的改动应分开记录在 `CHANGELOG.md` 中。
