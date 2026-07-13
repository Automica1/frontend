'use client';

import React, { Suspense } from 'react';
import GpuControlPlane from './GpuControlPlane';

export default function GpuPoolsAdminPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-sm p-6">Loading GPU control plane…</div>}>
      <GpuControlPlane />
    </Suspense>
  );
}
