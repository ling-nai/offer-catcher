/** 空状态引导：三步使用流程说明（后续功能上线后逐步替换为真实入口） */

const STEPS = [
  {
    title: '上传简历',
    desc: '选择 PDF 简历，浏览器本地解析文本，文件不出设备',
  },
  {
    title: '粘贴 JD',
    desc: '填入目标岗位的职位描述与任职要求',
  },
  {
    title: '查看匹配报告',
    desc: '匹配评分、关键词命中情况与优化建议',
  },
] as const

export default function EmptyState() {
  return (
    <section className="w-full rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/60">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
        开始你的第一次匹配
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        按下面三步操作，即可得到一份简历与岗位的匹配分析。所有数据仅保存在浏览器本地，不会上传。
      </p>
      <ol className="mt-10 grid gap-6 text-left sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/60"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
              {index + 1}
            </span>
            <h3 className="mt-3 font-medium text-slate-900 dark:text-white">
              {step.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {step.desc}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
