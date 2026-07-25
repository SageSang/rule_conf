/**
 * Sub-Store Script Filter / Script Operator
 *
 * 保留：
 *   1. 香港、台湾、美国、日本、新加坡中带有高倍率标签的节点；
 *   2. 上述五国以外的所有节点（含未能识别国家的节点，避免误删）。
 *
 * 丢弃：
 *   五个核心国家中，不带高倍率标签的普通节点。
 *
 * 此脚本只筛选节点，不改名、不排序、不生成策略组。
 */

// 五个享有“高倍率/普通”分层的核心国家。
// 英文别名可忽略大小写；ISO 两位代码只匹配大写完整单词。
const CORE_COUNTRY_NAME_PATTERNS = [
  /(?:🇭🇰|香港|hong\s*kong)/i,
  /(?:🇹🇼|台湾|台灣|taiwan|taipei|hinet)/i,
  /(?:🇺🇸|美国|美國|united\s*states|los\s*angeles|san\s*francisco|seattle|new\s*york)/i,
  /(?:🇯🇵|日本|japan|tokyo|osaka)/i,
  /(?:🇸🇬|新加坡|singapore)/i,
];

const CORE_COUNTRY_CODE_PATTERNS = [
  /\bHK\b/,
  /\bTW\b/,
  /\bUS\b/,
  /\bJP\b/,
  /\bSG\b/,
];

// 与当前 OpenClash 配置一致：严格匹配数值大于 1x / 1倍的倍率标签。
// 0.1x、0.5x、1x、1.0x、1倍不属于高倍率；线路类型词本身不作为高倍率条件。
const HIGH_MULTIPLIER_PATTERN = /(?:^|[^0-9.])(?:1\.0*[1-9][0-9]*|(?:[2-9][0-9]*|1[0-9]+)(?:\.[0-9]+)?)(?:x|倍)(?![0-9.])/i;

function isCoreCountry(name) {
  return CORE_COUNTRY_NAME_PATTERNS.some(
    (pattern, index) =>
      pattern.test(name) || CORE_COUNTRY_CODE_PATTERNS[index].test(name),
  );
}

function isHighMultiplier(name) {
  return HIGH_MULTIPLIER_PATTERN.test(name);
}

function shouldKeep(proxy) {
  const name = String(proxy && proxy.name ? proxy.name : "");

  // 节点名称无法判断国家时保留；这是保守策略，避免供应商的自定义命名被误删。
  return !isCoreCountry(name) || isHighMultiplier(name);
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
