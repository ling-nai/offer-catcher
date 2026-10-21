/**
 * 技能提取（纯函数，与 UI 分离）
 *
 * 匹配策略：
 * - 别名在模块加载时预编译为正则，避免每次提取重复构建；
 * - 默认大小写不敏感；词典中标记 caseSensitive 的别名（R / C / Go）
 *  按大小写敏感匹配，防止误伤英文文本中的同形词；
 * - 词边界采用 ASCII 字母数字前后瞻，保证「C++开发」「React框架」
 *  等中文紧贴场景可命中，同时避免「MySQL」误中「sql」、「JavaScript」
 *  误中「java」这类子串误报；
 * - 别名中的空格编译为 \s+，兼容「Spring Boot」等含空格写法；
 * - 单字母别名附加后置字符排除：C 后不能跟 +/#（避免命中 C++/C#），
 *   R 后不能跟 &（避免命中 R&D）；
 * - js / ts 等短别名附加前置排除：前面不能跟 '.'，避免 "Node.js"
 *   命中 js。
 */

import {
  SKILL_CATEGORY_ORDER,
  SKILL_DICT,
  type SkillCategory,
} from '../data/skillDict'

export interface ExtractedSkill {
  /** 技能规范名（与词典一致） */
  name: string
  /** 所属类别 */
  category: SkillCategory
}

export interface ExtractSkillsResult {
  /** 命中的技能列表：按类别顺序 + 词典内顺序稳定输出，已去重 */
  skills: ExtractedSkill[]
  /** 按类别分组的规范名列表；只包含有命中的类别 */
  byCategory: Partial<Record<SkillCategory, string[]>>
}

/** 单字母/短别名的后置排除字符：键为别名（小写） */
const TRAILING_BLOCK: Record<string, string> = {
  c: '+#',
  r: '+#&',
}

/** 短别名的前置排除字符：键为别名（小写） */
const LEADING_BLOCK: Record<string, string> = {
  js: '.',
  ts: '.',
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function compileAlias(alias: string, caseSensitive: boolean): RegExp {
  const body = escapeRegExp(alias).replace(/\s+/g, '\\s+')
  const key = alias.toLowerCase()
  const trailing = TRAILING_BLOCK[key]
  const leading = LEADING_BLOCK[key]
  const lookahead = trailing
    ? `(?![A-Za-z0-9${trailing}])`
    : '(?![A-Za-z0-9])'
  const lookbehind = leading
    ? `(?<![A-Za-z0-9${leading}])`
    : '(?<![A-Za-z0-9])'
  return new RegExp(
    `${lookbehind}${body}${lookahead}`,
    caseSensitive ? '' : 'i',
  )
}

interface CompiledSkill {
  name: string
  category: SkillCategory
  regexes: RegExp[]
}

/** 模块加载时预编译一次 */
const COMPILED_SKILLS: CompiledSkill[] = SKILL_CATEGORY_ORDER.flatMap(
  (category) =>
    SKILL_DICT[category].skills.map((skill) => {
      const aliases = new Set([skill.name, ...skill.aliases])
      return {
        name: skill.name,
        category,
        regexes: [...aliases].map((alias) =>
          compileAlias(alias, skill.caseSensitive?.includes(alias) ?? false),
        ),
      }
    }),
)

/**
 * 从任意文本（简历或 JD）中提取技能关键词。
 * 大小写不敏感，按规范名去重，返回技能列表与分类分组。
 */
export function extractSkills(text: string): ExtractSkillsResult {
  const skills: ExtractedSkill[] = []
  const byCategory: Partial<Record<SkillCategory, string[]>> = {}

  if (!text) {
    return { skills, byCategory }
  }

  for (const skill of COMPILED_SKILLS) {
    const hit = skill.regexes.some((regex) => regex.test(text))
    if (!hit) continue

    skills.push({ name: skill.name, category: skill.category })
    const group = byCategory[skill.category] ?? []
    group.push(skill.name)
    byCategory[skill.category] = group
  }

  return { skills, byCategory }
}
