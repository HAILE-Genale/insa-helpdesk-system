import { redirect } from 'next/navigation';

export default function TicketDetailPage({ params }) {
  redirect(`/portal/tickets/${params.id}`);
}
