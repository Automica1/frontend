import type { AISaaSServiceRecord, AISaaSWarning } from '../../lib/apiService';

/**
 * Pure view-model logic for the AI SaaS workbench.
 *
 * Extracted from AISaaSWorkbench.tsx so identity/selection/warning behavior can
 * be regression-tested without a DOM. Behavior must stay identical to the page.
 */

/**
 * Selection retention after a (re)load: keep the current apiId when it still
 * exists in the response, otherwise fall back to the first service.
 * apiId is the only selection identity — never slug/serviceTag/betaServiceTag.
 */
export function retainSelectedApiId(current: string, services: AISaaSServiceRecord[]): string {
  if (current && services.some((service) => service.apiId === current)) {
    return current;
  }
  return services[0]?.apiId || '';
}

/**
 * Detail pane resolution: selected apiId wins; if the selection is not in the
 * list (e.g. filtered out), fall back to the first filtered row, then the
 * first service, then null.
 */
export function resolveSelectedService(
  services: AISaaSServiceRecord[],
  filteredServices: AISaaSServiceRecord[],
  selectedApiId: string,
): AISaaSServiceRecord | null {
  return services.find((service) => service.apiId === selectedApiId) || filteredServices[0] || services[0] || null;
}

export function filterServices(services: AISaaSServiceRecord[], query: string): AISaaSServiceRecord[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return services;
  return services.filter((service) => serviceSearchText(service).includes(normalized));
}

export function serviceSearchText(service: AISaaSServiceRecord): string {
  const runtimes = service.runtime || [];
  const registry = runtimes.flatMap((runtime) => [
    runtime.registry?.provider,
    runtime.registry?.server,
    runtime.registry?.namespace,
    runtime.registry?.imageTag,
    runtime.provision?.primaryProvider,
    runtime.provision?.fallbackProvider,
    runtime.serviceTag,
  ]);
  return [
    service.apiId,
    service.slug,
    service.displayName,
    ...service.aliases.catalogSlugs,
    ...service.aliases.usageNames,
    ...service.aliases.betaServiceNames,
    ...service.aliases.betaServiceTags,
    ...service.aliases.gpuServiceTags,
    ...service.aliases.pipelineServices,
    ...registry,
  ].filter(Boolean).join(' ').toLowerCase();
}

/**
 * Warnings shown on the detail pane: the service's own warnings plus global
 * (un-scoped) response warnings, without duplicating warnings that are already
 * attached to the selected apiId.
 */
export function mergeDetailWarnings(service: AISaaSServiceRecord, responseWarnings: AISaaSWarning[]): AISaaSWarning[] {
  const globalWarnings = responseWarnings.filter((warning) => !warning.apiId || warning.apiId === service.apiId);
  return [...(service.warnings || []), ...globalWarnings.filter((warning) => warning.apiId !== service.apiId)];
}

export type MobileWorkbenchPane = 'list' | 'detail';

export type MobileWorkbenchPaneEvent = 'selectService' | 'showDetail' | 'backToList';

/**
 * Mobile single-focus pane state (<lg only; desktop split-pane ignores this).
 * Selecting a service focuses Details; Back returns to List. Details can never
 * be focused when there is no resolvable service to show.
 */
export function nextMobilePane(
  current: MobileWorkbenchPane,
  event: MobileWorkbenchPaneEvent,
  hasSelectableService: boolean,
): MobileWorkbenchPane {
  if (event === 'backToList') return 'list';
  if (!hasSelectableService) return 'list';
  if (event === 'selectService' || event === 'showDetail') return 'detail';
  return current;
}

export type SourcePillTone = 'ok' | 'degraded';

/** Source pills render green only for fully-ok sources; partial/error/limited render amber. */
export function sourcePillTone(status: string): SourcePillTone {
  return status === 'ok' ? 'ok' : 'degraded';
}

export interface LegacyAliasGroup {
  label: string;
  values: string[];
}

/**
 * Legacy identifiers surfaced strictly as compatibility metadata under the
 * selected apiId — never as selection identity.
 */
export function legacyAliasGroups(service: AISaaSServiceRecord): LegacyAliasGroup[] {
  return [
    { label: 'Catalog slugs', values: service.aliases.catalogSlugs },
    { label: 'Usage names', values: service.aliases.usageNames },
    { label: 'Beta names', values: service.aliases.betaServiceNames },
    { label: 'Beta tags', values: service.aliases.betaServiceTags },
    { label: 'GPU tags', values: service.aliases.gpuServiceTags },
    { label: 'Pipelines', values: service.aliases.pipelineServices },
  ];
}

export function registryProviderLabel(service: AISaaSServiceRecord): string {
  const runtime = service.runtime?.find((item) => item.registry?.provider);
  if (!runtime?.registry?.provider) return '';
  const image = runtime.registry.imageTag ? `:${runtime.registry.imageTag}` : '';
  return `${runtime.registry.provider}${image}`;
}

export function sessionPricing(service: AISaaSServiceRecord): string {
  if (service.policy.startupCredits === undefined && service.policy.creditsPerMinute === undefined) {
    return 'not set';
  }
  return `${service.policy.startupCredits ?? 0} start + ${service.policy.creditsPerMinute ?? 0}/min`;
}

export function limitsText(service: AISaaSServiceRecord): string {
  const parts = [
    service.policy.maxUploadSizeMB ? `${service.policy.maxUploadSizeMB}MB` : '',
    service.policy.maxPages ? `${service.policy.maxPages} pages` : '',
    service.policy.maxFiles ? `${service.policy.maxFiles} files` : '',
  ].filter(Boolean);
  return parts.join(' / ') || 'not set';
}
