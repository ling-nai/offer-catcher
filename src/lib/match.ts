/**
 * 简历与 JD 匹配分析（纯函数，与 UI 分离）
 *
 * 评分规则：
 * - 分别提取简历与 JD 的技能关键词；
 * - JD 中出现次数 ≥ REPEAT_THRESHOLD 的技能按 REPEAT_WEIGHT 加权；
 * - 匹配度 = 命中权重和 ÷ JD 总权重和 × 100（取整）。
 *   JD 中无重复技能时，等价于「命中数 ÷ 总数」的数量公式；
 * - JD 技能总数为 0 时返回 score=0 与提示文案，不抛错。
 */

import { countSkills, type SkillCount } from './skills'

/** JD 中出现次数达到该值的技能按 REPEAT_WEIGHT 加权 */
const REPEAT_THRESHOLD = 2
/** 重复技能的权重倍数 */
const REPEAT_WEIGHT = 1.5

/** JD 中未识别出任何技能时的提示文案 */
const EMPTY_JD_SUGGESTION =
  '未能从 JD 中识别出技能关键词：请确认 JD 包含岗位职责或任职要求等文本内容'

export interface MatchedSkill extends SkillCount {
  /** 该技能在评分中的权重 */
  weight: number
}

export interface MissingSkill extends SkillCount {
  /** 该技能在评分中的权重 */
  weight: number
}

export interface MatchResult {
  /** 匹配度 0-100（取整）；JD 无技能时为 0 */
  score: number
  /** 简历覆盖的 JD 技能，按 JD 出现次数降序 */
  matched: MatchedSkill[]
  /** 简历未覆盖的 JD 技能，按优先级（JD 频次）降序 */
  missing: MissingSkill[]
  /** 中文改进建议（3-6 条；JD 无技能时为提示文案） */
  suggestions: string[]
}

function weightOf(count: number): number {
  return count >= REPEAT_THRESHOLD ? REPEAT_WEIGHT : 1
}

function buildSuggestions(
  score: number,
  matched: MatchedSkill[],
  missing: MissingSkill[],
): string[] {
  const suggestions: string[] = []

  // 1) 未覆盖技能：按优先级取前 3 条逐条建议
  for (const skill of missing.slice(0, 3)) {
    const emphasis =
      skill.count >= REPEAT_THRESHOLD ? '，该技能在 JD 中被多次强调' : ''
    suggestions.push(
      `简历中未体现「${skill.name}」，建议补充相关项目经历或技能描述${emphasis}`,
    )
  }

  // 2) 已覆盖且 JD 高频强调的技能：建议突出呈现
  const emphasized = matched
    .filter((skill) => skill.count >= REPEAT_THRESHOLD)
    .sort((a, b) => b.count - a.count)
    .slice(0, 2)
  for (const skill of emphasized) {
    suggestions.push(
      `「${skill.name}」在 JD 中出现 ${skill.count} 次，建议在简历中前置并用数据量化相关经验`,
    )
  }

  // 3) 整体匹配度评价
  if (score >= 80) {
    suggestions.push('整体匹配度较高，建议保持关键词与 JD 表述一致，并突出量化成果')
  } else if (score >= 50) {
    suggestions.push('整体匹配度中等，建议对照 JD 逐条补齐核心技能要求')
  } else {
    suggestions.push('整体匹配度偏低，建议针对目标岗位调整技能组合与项目经历')
  }

  // 4) 全部覆盖时补充
  if (missing.length === 0) {
    suggestions.push('简历已覆盖 JD 全部已识别技能，建议优化项目经历的表述与成果数据')
  }

  // 5) 不足 3 条时补充通用建议
  const genericTips = [
    '建议使用 JD 中的原关键词描述技能，提升简历筛选系统的识别率',
    '建议在简历开头添加一段与目标岗位对齐的技能摘要',
  ]
  for (const tip of genericTips) {
    if (suggestions.length >= 3) break
    suggestions.push(tip)
  }

  return suggestions.slice(0, 6)
}

/**
 * 分析简历与目标 JD 的技能匹配情况。
 * @param resumeText 简历纯文本
 * @param jdText 岗位 JD 纯文本
 */
export function matchResumeJd(resumeText: string, jdText: string): MatchResult {
  const jdSkills = countSkills(jdText)
  const resumeSkillNames = new Set(countSkills(resumeText).map((s) => s.name))

  if (jdSkills.length === 0) {
    return {
      score: 0,
      matched: [],
      missing: [],
      suggestions: [EMPTY_JD_SUGGESTION],
    }
  }

  const matched: MatchedSkill[] = []
  const missing: MissingSkill[] = []
  let totalWeight = 0
  let coveredWeight = 0

  for (const skill of jdSkills) {
    const weight = weightOf(skill.count)
    totalWeight += weight
    if (resumeSkillNames.has(skill.name)) {
      coveredWeight += weight
      matched.push({ ...skill, weight })
    } else {
      missing.push({ ...skill, weight })
    }
  }

  // 频次高的在前（稳定排序：同频次保持词典顺序）
  matched.sort((a, b) => b.count - a.count)
  missing.sort((a, b) => b.count - a.count)

  const score = Math.round((coveredWeight / totalWeight) * 100)

  return {
    score,
    matched,
    missing,
    suggestions: buildSuggestions(score, matched, missing),
  }
}
