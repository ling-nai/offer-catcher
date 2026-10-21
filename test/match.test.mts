/**
 * 临时测试脚本（不进构建）：npx tsx test/match.test.mts
 * 场景：主匹配（含加权与建议生成）、JD 无技能、空简历、全覆盖
 */
import { matchResumeJd, type MatchResult } from '../src/lib/match'
import { countSkills } from '../src/lib/skills'

const RESUME = `张明
前端开发工程师 | 3 年工作经验 | 本科学历

技能清单：
- 前端：JavaScript、TypeScript、React、Vue3、Tailwind CSS、Sass
- 工程化：Vite、Webpack、Git
- 其他：Node.js、MySQL、英语 CET-6、Figma

项目经历：
1. SaaS 管理平台前端架构：使用 React + TypeScript 重构核心模块，页面加载速度提升 40%
2. 组件库建设：基于 Vite 搭建开发调试环境，沉淀 30+ 通用组件
3. 与服务端协作：基于 Node.js 开发 BFF 层，接口性能提升 25%`

const JD = `高级前端开发工程师

岗位职责：
1. 负责核心产品的前端架构设计与开发，精通 JavaScript、TypeScript、React
2. 主导前端工程化建设：熟悉 Vite、Webpack，建设 CI/CD 与自动化测试流程
3. 负责性能优化：熟悉性能监控体系，具备 React 性能调优经验
4. 与后端紧密协作：熟悉 Node.js 与 RESTful API 设计

任职要求：
1. 精通 React，熟悉 Vue、Next.js 者优先
2. 熟悉 MySQL 或 PostgreSQL，了解 Docker、Kubernetes 容器化部署
3. 了解前端监控与错误追踪（如 Sentry）
4. 本科及以上学历，英语 CET-6 优先`

function printResult(label: string, result: MatchResult): void {
  const covered = result.matched.reduce((sum, s) => sum + s.weight, 0)
  const total = covered + result.missing.reduce((sum, s) => sum + s.weight, 0)

  console.log(`\n${'='.repeat(56)}\n${label}\n${'='.repeat(56)}`)
  console.log(`匹配度 score：${result.score}`)
  if (result.matched.length + result.missing.length > 0) {
    console.log(
      `权重计算：命中 ${covered} / 总要求 ${total} → ${((covered / total) * 100).toFixed(1)}% 取整`,
    )
  }
  console.log(`\n命中技能 matched（${result.matched.length} 项，按 JD 频次降序）：`)
  for (const skill of result.matched) {
    console.log(
      `  - ${skill.name} [${skill.category}] JD 出现 ${skill.count} 次，权重 ×${skill.weight}`,
    )
  }
  console.log(`\n缺失技能 missing（${result.missing.length} 项，按优先级降序）：`)
  for (const skill of result.missing) {
    console.log(
      `  - ${skill.name} [${skill.category}] JD 出现 ${skill.count} 次，权重 ×${skill.weight}`,
    )
  }
  console.log(`\n改进建议 suggestions（${result.suggestions.length} 条）：`)
  result.suggestions.forEach((tip, i) => console.log(`  ${i + 1}. ${tip}`))
}

// ---- 场景 1：主匹配 ----
const main = matchResumeJd(RESUME, JD)
printResult('场景 1：前端简历 × 高级前端 JD', main)

// ---- 场景 2：JD 无技能（边界） ----
const emptyJd = matchResumeJd(RESUME, '我们是一个有爱的团队，欢迎加入！')
printResult('场景 2：JD 中无技能关键词（边界）', emptyJd)

// ---- 场景 3：空简历（边界） ----
const emptyResume = matchResumeJd('', JD)
printResult('场景 3：空简历（边界）', emptyResume)

// ---- 场景 4：简历完全覆盖 JD ----
const fullCover = matchResumeJd(JD, JD)
printResult('场景 4：简历完全覆盖 JD（score 应为 100）', fullCover)

// ---- 断言 ----
const jdSkillCount = countSkills(JD).length
const checks: [string, boolean][] = [
  [
    '主场景 score 为 0-100 整数',
    Number.isInteger(main.score) && main.score >= 0 && main.score <= 100,
  ],
  [
    '主场景 score 与权重公式一致',
    main.score ===
      Math.round(
        (main.matched.reduce((s, x) => s + x.weight, 0) /
          (main.matched.reduce((s, x) => s + x.weight, 0) +
            main.missing.reduce((s, x) => s + x.weight, 0))) *
          100,
      ),
  ],
  [
    '缺失技能按 JD 频次降序',
    main.missing.every(
      (s, i, arr) => i === 0 || arr[i - 1].count >= s.count,
    ),
  ],
  [
    '建议条数在 3-6 之间',
    main.suggestions.length >= 3 && main.suggestions.length <= 6,
  ],
  [
    '加权规则正确（出现 ≥2 次 → ×1.5）',
    main.matched.every((s) =>
      s.count >= 2 ? s.weight === 1.5 : s.weight === 1,
    ),
  ],
  [
    'JD 无技能时 score=0 且有提示文案',
    emptyJd.score === 0 &&
      emptyJd.missing.length === 0 &&
      emptyJd.suggestions.length >= 1,
  ],
  [
    '空简历时 score=0 且缺失全部 JD 技能',
    emptyResume.score === 0 && emptyResume.missing.length === jdSkillCount,
  ],
  [
    '全覆盖时 score=100 且无缺失',
    fullCover.score === 100 && fullCover.missing.length === 0,
  ],
]

let failed = 0
console.log(`\n${'='.repeat(56)}\n断言检查\n${'='.repeat(56)}`)
for (const [title, pass] of checks) {
  if (!pass) failed += 1
  console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${title}`)
}
console.log(
  failed === 0
    ? `\n全部 ${checks.length} 项断言通过`
    : `\n${failed} / ${checks.length} 项断言失败`,
)

if (failed > 0) {
  process.exitCode = 1
}
