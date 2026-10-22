/**
 * InputPanel：简历与 JD 输入区
 *
 * - 简历：多行文本粘贴 + PDF 上传（浏览器本地解析，状态可见）；
 * - JD：多行文本 + 实时字数；
 * - 底部「开始匹配」按钮任一侧为空即禁用并提示；
 * - 点击后调用 matchResumeJd，结果暂以原始 JSON 展示
 *   （正式报告组件 AnalysisReport 下一步开发）。
 */

import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { matchResumeJd, type MatchResult } from '../../lib/match'
import { extractPdfText } from '../../lib/pdf'

type PdfStatus =
  | { status: 'idle' }
  | { status: 'parsing' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }

const PDF_STATUS_STYLE: Record<PdfStatus['status'], string> = {
  idle: '',
  parsing: 'text-indigo-600 dark:text-indigo-300',
  success: 'text-emerald-600 dark:text-emerald-400',
  error: 'text-rose-600 dark:text-rose-400',
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-indigo-400"
    />
  )
}

export default function InputPanel() {
  const [resumeText, setResumeText] = useState('')
  const [jdText, setJdText] = useState('')
  const [pdfStatus, setPdfStatus] = useState<PdfStatus>({ status: 'idle' })
  const [result, setResult] = useState<MatchResult | null>(null)

  const resumeEmpty = resumeText.trim().length === 0
  const jdEmpty = jdText.trim().length === 0
  const isParsing = pdfStatus.status === 'parsing'
  const canSubmit = !resumeEmpty && !jdEmpty && !isParsing

  const emptyHint = resumeEmpty && jdEmpty
    ? '请先填写简历内容和 JD 内容'
    : resumeEmpty
      ? '请先填写简历内容（可粘贴文本或上传 PDF）'
      : jdEmpty
        ? '请先填写 JD 内容'
        : ''

  const handlePdfChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // 允许再次选择同一文件
    event.target.value = ''
    if (!file) return

    setPdfStatus({ status: 'parsing' })
    try {
      const { text, pageCount } = await extractPdfText(file)
      setResumeText(text)
      setPdfStatus({
        status: 'success',
        message: `解析成功：共 ${pageCount} 页，提取 ${text.length} 字，已填入简历文本框`,
      })
    } catch (error) {
      setPdfStatus({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'PDF 解析失败，请直接粘贴简历文本',
      })
    }
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    setResult(matchResumeJd(resumeText.trim(), jdText.trim()))
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 简历输入 */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              简历
            </h2>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {resumeText.length} 字
            </span>
          </div>
          <textarea
            id="resume-input"
            value={resumeText}
            onChange={(event) => setResumeText(event.target.value)}
            rows={12}
            placeholder="粘贴简历全文（纯文本效果最佳）…"
            className="mt-3 w-full resize-y rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label
              htmlFor="resume-pdf"
              className={`cursor-pointer rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300 ${
                isParsing ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              上传 PDF 简历
            </label>
            <input
              id="resume-pdf"
              type="file"
              accept="application/pdf,.pdf"
              onChange={handlePdfChange}
              disabled={isParsing}
              className="hidden"
            />
            {isParsing && (
              <span className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-300">
                <Spinner />
                解析中…
              </span>
            )}
          </div>
          {(pdfStatus.status === 'success' || pdfStatus.status === 'error') && (
            <p
              aria-live="polite"
              className={`mt-2 text-xs leading-relaxed ${PDF_STATUS_STYLE[pdfStatus.status]}`}
            >
              {pdfStatus.message}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            PDF 在浏览器本地解析，文件不会上传；解析失败时可改用上方粘贴文本
          </p>
        </section>

        {/* JD 输入 */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              岗位 JD
            </h2>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {jdText.length} 字
            </span>
          </div>
          <textarea
            id="jd-input"
            value={jdText}
            onChange={(event) => setJdText(event.target.value)}
            rows={12}
            placeholder="粘贴目标岗位的职位描述与任职要求…"
            className="mt-3 w-full resize-y rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            建议粘贴完整 JD（岗位职责 + 任职要求），技能识别更准确
          </p>
        </section>
      </div>

      {/* 提交按钮 */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="rounded-xl bg-indigo-600 px-8 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none dark:disabled:bg-slate-700"
        >
          开始匹配
        </button>
        {!canSubmit && emptyHint && (
          <p className="text-xs text-slate-400 dark:text-slate-500">{emptyHint}</p>
        )}
      </div>

      {/* 匹配结果（原始 JSON，正式报告组件下一步开发） */}
      {result && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            匹配结果（原始 JSON）
          </h2>
          <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-slate-100 dark:bg-slate-950">
            {JSON.stringify(result, null, 2)}
          </pre>
        </section>
      )}
    </div>
  )
}
