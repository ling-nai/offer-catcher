import AppHeader from './components/AppHeader'
import InputPanel from './components/InputPanel'

export default function App() {
  return (
    <div className="min-h-svh bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="mx-auto flex min-h-svh max-w-5xl flex-col px-6">
        <AppHeader />
        <main className="flex flex-1 flex-col pb-20">
          <InputPanel />
        </main>
      </div>
    </div>
  )
}
