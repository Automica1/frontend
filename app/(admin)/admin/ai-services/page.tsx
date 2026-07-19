import AIServicesWorkbench from './AIServicesWorkbench';

export const dynamic = 'force-dynamic';

/** AI Services admin workbench. Selection is ?apiId=&tab= (apiId identity only). */
export default async function AIServicesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ apiId?: string; tab?: string }>;
}) {
  const params = await searchParams;
  return <AIServicesWorkbench initialApiId={params.apiId || ''} initialTab={params.tab || ''} />;
}
