import { redirect } from 'next/navigation'

export default function ReverseLinkedListPage() {
  redirect('/visualizer/linked-list/operations?mode=reverse')
}