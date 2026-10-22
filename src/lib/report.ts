/**
 * Markdown 报告生成（纯函数，与 UI 分离）
 *
 * 技能名以反引号包裹（代码 span），避免在 Markdown 渲染器中被当作 HTML。
 */

import type { MatchResult } from './match'

export interface ReportMeta {
  /** 报告生成时间（ISO 字符串），缺省为当前时间 */
  generatedAt?: string
}

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** 生成可直接下载的 Markdown 匹配报告 */
export function buildMarkdownReport(
  result: MatchResult,
  meta: ReportMeta = {},
): string {
  const generatedAt = meta.generatedAt ?? new Date().toISOString()
  const coveredWeight = result.matched.reduce(
    (sum, skill) => sum + skill.weight,
    0,
  )
  const totalWeight =
    coveredWeight +
    result.missing.reduce((sum, skill) => sum + skill.weight, 0)

  const lines: string[] = [
    '# 简历与 JD 匹配报告',
    '',
    `- 生成时间：${formatDateTime(generatedAt)}`,
    `- 匹配度：**${result.score} / 100**`,
    `- 命中技能 ${result.matched.length} 项，缺失技能 ${result.missing.length} 项`,
    `- 加权覆盖：${coveredWeight} / ${totalWeight}`,
    '',
    '## 已匹配技能',
    '',
  ]

  if (result.matched.length === 0) {
    lines.push('（无）')
  } else {
    for (const skill of result.matched) {
      lines.push(`- \`${skill.name}\`（JD 中出现 ${skill.count} 次）`)
    }
  }

  lines.push('', '## 缺失技能（按优先级排序）', '')
  if (result.missing.length === 0) {
    lines.push('（无）')
  } else {
    result.missing.forEach((skill, index) => {
      lines.push(`${index + 1}. \`${skill.name}\`（JD 中出现 ${skill.count} 次）`)
    })
  }

  lines.push('', '## 改进建议', '')
  if (result.suggestions.length === 0) {
    lines.push('（无）')
  } else {
    result.suggestions.forEach((tip, index) => {
      lines.push(`${index + 1}. ${tip}`)
    })
  }

  lines.push('')
  return lines.join('\n')
}
