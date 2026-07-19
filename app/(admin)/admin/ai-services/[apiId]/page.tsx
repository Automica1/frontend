import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/** Path-based deep links resolve to the canonical query-driven selection. */
export default async function AIServiceByIdPage({
  params,
}: {
  params: Promise<{ apiId: string }>;
}) {
  const { apiId } = await params;
  redirect(`/admin/ai-services?apiId=${encodeURIComponent(apiId)}`);
}
