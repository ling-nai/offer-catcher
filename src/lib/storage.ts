/**
 * localStorage 安全封装（纯逻辑，与 UI 分离）
 *
 * 设计约定：
 * - 所有键名通过 buildKey 生成，带应用命名空间与版本号，便于后续数据结构升级；
 * - 读写均带 try/catch：隐私模式、存储被禁用或配额超限时返回安全值而不抛异常；
 * - 只依赖浏览器全局 localStorage，不涉及任何 React/DOM 渲染逻辑。
 */

/** 应用命名空间前缀，避免与其他应用共用存储时冲突 */
const APP_STORAGE_PREFIX = 'offer-catcher'

/** 生成带命名空间和版本的键名，例如 offer-catcher:v1:resume-draft */
export function buildKey(name: string, version = 1): string {
  return `${APP_STORAGE_PREFIX}:v${version}:${name}`
}

/** 检测 localStorage 是否可用（隐私模式或用户禁用存储时返回 false） */
export function isStorageAvailable(): boolean {
  try {
    const testKey = buildKey('__storage_test__')
    window.localStorage.setItem(testKey, '1')
    window.localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * 读取 JSON 值。
 * 键不存在或内容损坏（JSON 解析失败）时返回 fallback，保证调用方拿到可用数据。
 */
export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** 写入 JSON 值；成功返回 true，失败（如配额超限）返回 false，由调用方决定提示 */
export function writeJSON<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/** 删除指定键；删除失败时静默忽略（不影响主流程） */
export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // 忽略：删除失败不影响运行
  }
}
