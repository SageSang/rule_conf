/**
 * Sub-Store Script Filter / Script Operator
 *
 * 保留：
 *   1. 香港、台湾、美国、日本、新加坡中带有“优质”标签的节点；
 *   2. 上述五国以外的所有节点（含未能识别国家的节点，避免误删）。
 *
 * 丢弃：
 *   五个核心国家中，不带优质标签的普通节点。
 *
 * 此脚本只筛选节点，不改名、不排序、不生成策略组。
 */

// 五个享有“优质/普通”分层的核心国家。
// 缩写使用非字母边界，避免把普通英文单词误识别为国家代码。
const CORE_COUNTRY_PATTERNS = [
  /(?:🇭🇰|香港|hong\s*kong|(?:^|[^a-z])hk(?:$|[^a-z]))/i,
  /(?:🇹🇼|台湾|台灣|taiwan|taipei|hinet|(?:^|[^a-z])tw(?:$|[^a-z]))/i,
  /(?:🇺🇸|美国|美國|united\s*states|los\s*angeles|san\s*francisco|san\s*jos[eé]|seattle|new\s*york|(?:^|[^a-z])us(?:$|[^a-z]))/i,
  /(?:🇯🇵|日本|japan|tokyo|osaka|(?:^|[^a-z])jp(?:$|[^a-z]))/i,
  /(?:🇸🇬|新加坡|singapore|(?:^|[^a-z])sg(?:$|[^a-z]))/i,
];

// 与当前 OpenClash 配置一致：
// 进阶IEPL、专线、原生、家宽、星链，或独立的 2x/3x/4x/5x。
// 不将 IEPL、CN2、IPLC、进阶、1x 单独视为优质。
// 倍率边界避免 0.5x、1.5x、15x 被误匹配为 5x。
const PREMIUM_QUALITY_PATTERN = /(?:进阶IEPL|专线|原生|家宽|星链|(?:^|[^0-9.])(?:2x|3x|4x|5x)(?![0-9]))/i;

function isCoreCountry(name) {
  return CORE_COUNTRY_PATTERNS.some((pattern) => pattern.test(name));
}

function isPremium(name) {
  return PREMIUM_QUALITY_PATTERN.test(name);
}

function shouldKeep(proxy) {
  const name = String(proxy && proxy.name ? proxy.name : "");

  // 节点名称无法判断国家时保留；这是保守策略，避免供应商的自定义命名被误删。
  return !isCoreCountry(name) || isPremium(name);
}

// “脚本过滤（Script Filter）”使用此入口，返回与节点数组等长的布尔数组。
// 这也是推荐在当前需求中使用的入口：它只做保留/剔除，不修改节点对象。
function filter(proxies, targetPlatform, context) {
  if (!Array.isArray(proxies)) return proxies;
  return proxies.map(shouldKeep);
}

// 同时兼容“脚本操作（Script Operator）”。若选择该操作类型，则返回筛选后的节点数组。
function operator(proxies, targetPlatform, context) {
  if (!Array.isArray(proxies)) return proxies;
  return proxies.filter(shouldKeep);
}
