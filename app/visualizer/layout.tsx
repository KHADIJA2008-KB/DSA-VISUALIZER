import { Sidebar } from '@/components/Sidebar'

export default function VisualizerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <main className="min-h-screen">{children}</main>
    </div>
  )
}
