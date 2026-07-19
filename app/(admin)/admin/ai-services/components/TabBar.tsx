'use client';

import type { LucideIcon } from 'lucide-react';
import { Activity, BarChart3, Cpu, ExternalLink, KeyRound, Layers3, MessageSquareText, ShieldCheck, Wrench } from 'lucide-react';
import type { AISaaSServiceRecord } from '../../../lib/apiService';
import { visibleTabs, type WorkbenchTabId } from '../workbenchModel';

const TAB_ICONS: Record<WorkbenchTabId, LucideIcon> = {
  overview: Layers3,
  public: ExternalLink,
  runtime: Cpu,
  policy: ShieldCheck,
  access: KeyRound,
  usage: BarChart3,
  feedback: MessageSquareText,
  recovery: Wrench,
};

/** One domain panel at a time; Runtime/Recovery hidden without a GPU runtime. */
export default function TabBar({
  service,
  activeTab,
  onTab,
}: {
  service: AISaaSServiceRecord;
  activeTab: WorkbenchTabId;
  onTab: (tab: WorkbenchTabId) => void;
}) {
  const tabs = visibleTabs(service);
  return (
    <div role="tablist" aria-label="Service domains" className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 bg-black/15 p-2">
      {tabs.map((tab) => {
        const Icon = TAB_ICONS[tab.id] ?? Activity;
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onTab(tab.id)}
            className={`inline-flex min-w-[90px] flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition ${
              active ? 'bg-white/12 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
