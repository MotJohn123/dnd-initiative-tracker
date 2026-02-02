'use client';

import { useEffect, useState } from 'react';

export default function EncountersPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load the DnD_Encounters app
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#1a1a2e] flex items-center justify-center">
        <div className="text-white text-xl">Loading Encounter Manager...</div>
      </div>
    );
  }

  return (
    <iframe
      src="/dnd-encounters/index.html"
      className="fixed inset-0 w-full h-full border-none"
      title="D&D Encounter Manager"
    />
  );
}
