import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function AISaaSAdminPage() {
  redirect('/admin/ai-services');
}
