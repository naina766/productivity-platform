import { redirect } from 'next/navigation';

export default function TodayTasksRedirect() {
  redirect('/my-tasks?view=today');
}
