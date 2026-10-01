import { redirect } from 'next/navigation';

export default function OverdueTasksRedirect() {
  redirect('/my-tasks?view=overdue');
}
