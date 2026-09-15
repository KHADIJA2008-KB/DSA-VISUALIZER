import { Sidebar } from '@/components/Sidebar'

export default function VisualizerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <Sidebar />
      <main className="min-h-screen lg:pl-72">{children}</main>
    </div>
  )
}
