import { redirect } from 'next/navigation';

export default function AuthLoginRedirect({ searchParams }) {
  const query = new URLSearchParams(searchParams).toString();
  redirect(`/login${query ? `?${query}` : ''}`);
}
