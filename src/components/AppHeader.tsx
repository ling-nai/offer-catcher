/** 应用标题栏：品牌标识 + 产品名 + 一句话定位 */
export default function AppHeader() {
  return (
    <header className="flex items-center gap-3 py-8">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
        </svg>
      </span>
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
          Offer捕手
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          简历 × 岗位 JD 匹配工具
        </p>
      </div>
    </header>
  )
}
