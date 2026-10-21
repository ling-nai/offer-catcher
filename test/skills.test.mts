/**
 * 临时测试脚本（不进构建）：npx tsx test/skills.test.mts
 * 覆盖：别名归一、大小写不敏感 + 去重、无命中、分类归属、符号/中文边界
 */
import { extractSkills } from '../src/lib/skills'
import type { SkillCategory } from '../src/data/skillDict'

interface TestCase {
  title: string
  text: string
  /** 期望命中的规范名（比较时排序，顺序不敏感） */
  expect: string[]
  /** 期望的 byCategory 分组（可选，精确比较） */
  expectByCategory?: Partial<Record<SkillCategory, string[]>>
}

const CASES: TestCase[] = [
  {
    title: '别名归一：js / py / vue3',
    text: '熟练使用 js 和 py 做开发，了解 vue3',
    expect: ['JavaScript', 'Python', 'Vue'],
  },
  {
    title: '大小写不敏感 + 同名去重',
    text: '精通 JAVASCRIPT、JavaScript 与 javascript',
    expect: ['JavaScript'],
  },
  {
    title: '无命中场景',
    text: '今天天气不错，我去公园散步，顺便喝了杯咖啡。',
    expect: [],
  },
  {
    title: '分类归属 byCategory',
    text: '熟悉 React、Node.js、MySQL、Excel，已通过 CET-6',
    expect: ['React', 'Node.js', 'MySQL', 'Excel', 'CET-6'],
    expectByCategory: {
      frontend: ['React'],
      backend: ['Node.js', 'MySQL'],
      office: ['Excel'],
      certificate: ['CET-6'],
    },
  },
  {
    title: '符号与中文边界：C++ / C# / Go / R',
    text: '具备C++开发经验，熟悉C#与Go，了解R语言',
    expect: ['C#', 'C++', 'Go', 'R'],
  },
]

let failed = 0

for (const [index, testCase] of CASES.entries()) {
  const { skills, byCategory } = extractSkills(testCase.text)
  const actual = skills.map((skill) => skill.name).sort()
  const expected = [...testCase.expect].sort()

  const namesPass =
    actual.length === expected.length &&
    actual.every((name, i) => name === expected[i])
  const categoryPass = testCase.expectByCategory
    ? JSON.stringify(byCategory) === JSON.stringify(testCase.expectByCategory)
    : true
  const pass = namesPass && categoryPass

  if (!pass) failed += 1

  console.log(`\n用例 ${index + 1} [${pass ? 'PASS' : 'FAIL'}] ${testCase.title}`)
  console.log(`  输入：${testCase.text}`)
  console.log(`  期望：${JSON.stringify(expected)}`)
  console.log(`  实际：${JSON.stringify(actual)}`)
  console.log(`  分类：${JSON.stringify(byCategory)}`)
  if (!categoryPass) {
    console.log(`  期望分类：${JSON.stringify(testCase.expectByCategory)}`)
  }
}

console.log(
  failed === 0
    ? `\n全部 ${CASES.length} 个用例通过`
    : `\n${failed} / ${CASES.length} 个用例失败`,
)

if (failed > 0) {
  process.exitCode = 1
}
