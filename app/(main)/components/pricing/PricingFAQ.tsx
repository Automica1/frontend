// app/(main)/components/pricing/PricingFAQ.tsx
'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What are credits?',
    a: 'Credits are the currency you use to call Automica\'s AI services — QR masking, face detection, signature verification, etc. Each API call costs a fixed number of credits. 1,000 credits = roughly 1,000 standard API calls.',
  },
  {
    q: 'Do credits carry over month to month?',
    a: 'Yes. Unused credits roll over as long as your subscription stays active. They only expire if your subscription lapses entirely.',
  },
  {
    q: 'What happens if my payment fails?',
    a: 'We\'ll retry your payment automatically. Your credits and access remain fully active during retries. If all retries fail, the subscription expires and your credit balance resets.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel anytime — your subscription stays active and your credits remain usable until the end of your current billing period. No partial refunds are issued.',
  },
  {
    q: 'When am I billed?',
    a: 'You\'re billed monthly on the same date you first subscribed. For example, subscribing on March 17 means your next billing is April 17.',
  },
  {
    q: 'Can I upgrade or downgrade?',
    a: 'Upgrades take effect immediately, and you pay the prorated difference for the rest of the cycle. Downgrades take effect at the next billing cycle — your current plan continues until then.',
  },
];

export default function PricingFAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto px-4 pb-28">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="text-sm font-medium text-purple-400 tracking-widest uppercase">FAQ</span>
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mt-2 mb-4" />
        <h2 className="text-3xl font-light text-white tracking-tight">
          Common <span className="text-purple-400">Questions</span>
        </h2>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden transition-all duration-200 hover:border-purple-500/20"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-6 py-5 text-left"
            >
              <span className="text-white font-light">{faq.q}</span>
              <ChevronDown
                className={`w-4 h-4 text-purple-400 flex-shrink-0 ml-4 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
              />
            </button>
            {open === i && (
              <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed font-light border-t border-white/5 pt-4">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
