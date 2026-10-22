/**
 * AnalysisReport：匹配结果展示
 *
 * - 环形进度条（SVG 手写，无图表库）+ 匹配度大数字；
 * - 三张分组卡片：已匹配技能（中性色）/ 缺失技能（红色系，按优先级）/
 *   改进建议；
 * - 顶部操作：导出 Markdown 报告（Blob 下载）、保存到历史（lib/history.ts）；
 * - 空状态：未分析时显示引导图文；
 * - 安全：所有文本均通过 JSX 表达式渲染（React 默认转义），
 *   不使用 dangerouslySetInnerHTML，防止用户输入中的 HTML/脚本注入。
 */

import { useState } from 'react'
import type { MatchResult, MatchedSkill, MissingSkill } from '../../lib/match'
import { buildMarkdownReport } from '../../lib/report'
import { saveHistory } from '../../lib/history'

export interface AnalysisReportProps {
  /** 匹配结果；null 表示尚未分析，展示空状态引导 */
  result: MatchResult | null
}

const RING_RADIUS = 52
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

function scoreTone(score: number): string {
  if (score >= 80) return 'text-emerald-500'
  if (score >= 50) return 'text-indigo-500'
  return 'text-rose-500'
}

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '--'
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function EmptyState() {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-10 text-center dark:border-slate-700 dark:bg-slate-900/60">
      <svg
        viewBox="0 0 96 96"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="mx-auto h-20 w-20 text-slate-300 dark:text-slate-600"
        aria-hidden="true"
      >
        <rect x="20" y="14" width="44" height="56" rx="4" />
        <path d="M32 28h20M32 38h20M32 48h12" />
        <circle cx="64" cy="60" r="12" />
        <path d="M73 69l8 8" />
      </svg>
      <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
        还没有匹配结果
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        填写简历并粘贴 JD，然后点击「开始匹配」，这里会展示匹配度、技能明细与改进建议。
      </p>
    </section>
  )
}

function ScoreRing({ score }: { score: number }) {
  const offset = RING_CIRCUMFERENCE * (1 - score / 100)
  return (
    <div
      className="relative h-32 w-32"
      role="progressbar"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="匹配度"
    >
      <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="10"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-700"
        />
        <circle
          cx="60"
          cy="60"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={`${scoreTone(score)} transition-[stroke-dashoffset] duration-700`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${scoreTone(score)}`}>
          {score}
        </span>
        <span className="mt-0.5 text-xs text-slate-400">匹配度</span>
      </div>
    </div>
  )
}

function SkillRow({
  skill,
  danger = false,
}: {
  skill: MatchedSkill | MissingSkill
  danger?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
      <span
        className={`text-sm font-medium ${
          danger
            ? 'text-rose-600 dark:text-rose-400'
            : 'text-slate-700 dark:text-slate-200'
        }`}
      >
        {skill.name}
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-xs text-slate-400">
        JD ×{skill.count}
        {skill.weight > 1 && (
          <span className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
            加权 ×{skill.weight}
          </span>
        )}
      </span>
    </div>
  )
}

export default function AnalysisReport({ result }: AnalysisReportProps) {
  // 生成时间只取一次，避免渲染期调用 impure 的 Date
  const [generatedAt] = useState(() => new Date().toISOString())
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  if (!result) {
    return <EmptyState />
  }

  const coveredWeight = result.matched.reduce(
    (sum, skill) => sum + skill.weight,
    0,
  )
  const totalWeight =
    coveredWeight +
    result.missing.reduce((sum, skill) => sum + skill.weight, 0)

  const handleExport = () => {
    const markdown = buildMarkdownReport(result, { generatedAt })
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `匹配报告-${generatedAt.slice(0, 10)}.md`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    setActionMessage({ type: 'success', message: 'Markdown 报告已开始下载' })
  }

  const handleSave = () => {
    const saved = saveHistory({
      score: result.score,
      matchedCount: result.matched.length,
      missingCount: result.missing.length,
      result,
    })
    setActionMessage(
      saved.ok
        ? { type: 'success', message: '已保存到本地历史' }
        : { type: 'error', message: saved.error ?? '保存失败' },
    )
  }

  return (
    <section className="space-y-6">
      {/* 顶部：标题 + 操作按钮 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            匹配报告
          </h2>
          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            生成于 {formatDateTime(generatedAt)} · 命中{' '}
            {result.matched.length} 项 / 缺失 {result.missing.length} 项
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
          >
            导出 Markdown 报告
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-700"
          >
            保存到历史
          </button>
        </div>
      </div>
      {actionMessage && (
        <p
          aria-live="polite"
          className={`text-xs ${
            actionMessage.type === 'success'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {actionMessage.message}
        </p>
      )}

      {/* 匹配度：环形进度 + 摘要 */}
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:justify-center dark:border-slate-700 dark:bg-slate-900">
        <ScoreRing score={result.score} />
        <div className="text-center sm:text-left">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            加权覆盖{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {coveredWeight}
            </span>{' '}
            / {totalWeight}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            已匹配{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {result.matched.length}
            </span>{' '}
            项技能，仍有{' '}
            <span className="font-semibold text-rose-600 dark:text-rose-400">
              {result.missing.length}
            </span>{' '}
            项待补齐
          </p>
        </div>
      </div>

      {/* 分组卡片：已匹配 + 缺失 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            已匹配技能
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {result.matched.length}
            </span>
          </h3>
          {result.matched.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">暂无命中技能</p>
          ) : (
            <ul className="mt-3 max-h-72 space-y-2 overflow-auto">
              {result.matched.map((skill) => (
                <li key={skill.name}>
                  <SkillRow skill={skill} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm dark:border-rose-900/60 dark:bg-slate-900">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-400">
            缺失技能（按优先级）
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600 dark:bg-rose-400/15 dark:text-rose-300">
              {result.missing.length}
            </span>
          </h3>
          {result.missing.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">
              JD 技能已全部覆盖
            </p>
          ) : (
            <ol className="mt-3 max-h-72 space-y-2 overflow-auto">
              {result.missing.map((skill, index) => (
                <li key={skill.name} className="flex items-center gap-2">
                  <span className="w-4 shrink-0 text-center text-xs font-medium text-slate-400">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <SkillRow skill={skill} danger />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* 改进建议 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          改进建议
        </h3>
        <ol className="mt-3 space-y-2">
          {result.suggestions.map((tip, index) => (
            <li
              key={index}
              className="flex gap-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                {index + 1}
              </span>
              {tip}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
