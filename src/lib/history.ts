/**
 * 匹配历史（基于 storage.ts 的 localStorage 封装，与 UI 分离）
 *
 * 只保存匹配结果（MatchResult）与摘要计数，不保存简历/JD 原文，
 * 避免大文本撑爆 localStorage 配额。
 */

import { buildKey, isStorageAvailable, readJSON, writeJSON } from './storage'
import type { MatchResult } from './match'

export interface HistoryRecord {
  id: string
  /** ISO 时间串 */
  createdAt: string
  score: number
  matchedCount: number
  missingCount: number
  result: MatchResult
}

const HISTORY_KEY = buildKey('match-history', 1)
const HISTORY_LIMIT = 50

export function loadHistory(): HistoryRecord[] {
  return readJSON<HistoryRecord[]>(HISTORY_KEY, [])
}

export interface SaveHistoryResult {
  ok: boolean
  error?: string
}

/** 追加一条历史记录（最新在前，超过上限丢弃最旧） */
export function saveHistory(
  record: Omit<HistoryRecord, 'id' | 'createdAt'>,
): SaveHistoryResult {
  if (!isStorageAvailable()) {
    return { ok: false, error: '浏览器本地存储不可用（可能处于隐私模式）' }
  }
  const entry: HistoryRecord = {
    ...record,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  }
  const next = [entry, ...loadHistory()].slice(0, HISTORY_LIMIT)
  if (!writeJSON(HISTORY_KEY, next)) {
    return { ok: false, error: '保存失败：本地存储空间不足' }
  }
  return { ok: true }
}
