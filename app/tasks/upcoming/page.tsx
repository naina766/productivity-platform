import { redirect } from 'next/navigation';

export default function UpcomingTasksRedirect() {
  redirect('/my-tasks?view=upcoming');
}
