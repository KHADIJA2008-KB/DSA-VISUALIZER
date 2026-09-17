import { redirect } from 'next/navigation'

export default function CompareLinkedListsPage() {
  redirect('/visualizer/linked-list/operations?mode=compare')
}