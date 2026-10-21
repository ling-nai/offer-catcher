import AppHeader from './components/AppHeader'
import EmptyState from './components/EmptyState'

export default function App() {
  return (
    <div className="min-h-svh bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="mx-auto flex min-h-svh max-w-3xl flex-col px-6">
        <AppHeader />
        <main className="flex flex-1 items-center justify-center pb-20">
          <EmptyState />
        </main>
      </div>
    </div>
  )
}
