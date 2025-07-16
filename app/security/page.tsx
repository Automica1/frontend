// app/security/page.tsx
import React from 'react';

export default function SecurityPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-24 text-white">
      <h1 className="text-5xl font-bold mb-10 text-center">Security & Privacy</h1>
      <div className="space-y-8 text-gray-300 text-lg">
        <section>
          <h2 className="text-2xl font-semibold mb-2 text-white">Data Protection</h2>
          <p>We implement strong encryption and follow industry-standard security protocols to ensure your data is safe at all times, both in transit and at rest.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2 text-white">User Privacy</h2>
          <p>Your personal information is never shared or sold. We comply with GDPR and other international privacy laws to safeguard your rights and transparency.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2 text-white">Infrastructure Security</h2>
          <p>All services are hosted on secure, compliant cloud platforms with regular audits, monitoring, and threat detection systems in place.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2 text-white">AI Ethics</h2>
          <p>We build with responsibility. Our AI models are trained and deployed with ethical considerations, fairness, and safety in mind.</p>
        </section>
      </div>
    </main>
  );
}