/**
 * PDF 文本提取（浏览器端 pdfjs-dist）
 *
 * - pdfjs-dist 通过动态 import 按需加载，不进入主包；
 * - Worker 通过 Vite 的 ?url 导入，解析在 Worker 线程执行，不阻塞界面；
 * - 只提取文本层：扫描版/图片型 PDF 没有文本层，会得到空文本并抛出
 *   可读错误，由调用方引导用户改用粘贴文本。
 */

import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'

/** 单个 PDF 文件大小上限（10MB） */
export const MAX_PDF_SIZE = 10 * 1024 * 1024

export interface PdfParseResult {
  /** 提取的纯文本（按页拼接，页间换行分隔） */
  text: string
  /** PDF 总页数 */
  pageCount: number
}

/** PDF 解析错误：消息面向终端用户，可直接展示 */
export class PdfParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PdfParseError'
  }
}

/**
 * 从用户选择的 PDF 文件中提取纯文本。
 * @throws {PdfParseError} 格式/大小/读取/解析失败或未提取到文本时
 */
export async function extractPdfText(file: File): Promise<PdfParseResult> {
  if (file.type && file.type !== 'application/pdf') {
    throw new PdfParseError(
      `文件格式不是 PDF（${file.type || '未知'}），请选择 .pdf 文件，或直接粘贴简历文本`,
    )
  }
  if (file.size === 0) {
    throw new PdfParseError('PDF 文件内容为空，请重新选择，或直接粘贴简历文本')
  }
  if (file.size > MAX_PDF_SIZE) {
    throw new PdfParseError('PDF 超过 10MB，请压缩后重试，或直接粘贴简历文本')
  }

  let buffer: ArrayBuffer
  try {
    buffer = await file.arrayBuffer()
  } catch {
    throw new PdfParseError('读取文件失败，请重试，或直接粘贴简历文本')
  }

  let pdfjs: typeof import('pdfjs-dist')
  try {
    // 动态 import：仅在用户上传 PDF 时才加载解析库
    pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  } catch {
    throw new PdfParseError('PDF 解析组件加载失败，请检查网络后重试，或直接粘贴简历文本')
  }
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) })
  let pdf: Awaited<typeof loadingTask.promise>
  try {
    pdf = await loadingTask.promise
  } catch (error) {
    const reason = error instanceof Error ? error.message : '未知错误'
    void loadingTask.destroy().catch(() => undefined)
    throw new PdfParseError(
      `PDF 解析失败（${reason}），文件可能损坏或已加密，建议直接粘贴简历文本`,
    )
  }

  const parts: string[] = []
  let pageCount = 0
  try {
    pageCount = pdf.numPages
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const content = await page.getTextContent()
      for (const item of content.items) {
        if (!('str' in item)) continue
        parts.push(item.str)
        if (item.hasEOL) parts.push('\n')
      }
      parts.push('\n')
      page.cleanup()
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : '未知错误'
    throw new PdfParseError(
      `PDF 文本提取失败（${reason}），建议直接粘贴简历文本`,
    )
  } finally {
    void loadingTask.destroy().catch(() => undefined)
  }

  const text = parts.join('').replace(/\n{3,}/g, '\n\n').trim()
  if (text.length === 0) {
    throw new PdfParseError(
      '未能从 PDF 中提取到文本（可能是扫描版或图片型 PDF），请直接粘贴简历文本',
    )
  }

  return { text, pageCount }
}
