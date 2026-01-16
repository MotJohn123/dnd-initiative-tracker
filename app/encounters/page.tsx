'use client';

import { useEffect, useState } from 'react';

export default function EncountersPage() {
  const [htmlContent, setHtmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load the DnD_Encounters app
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <div className="text-white text-xl">Loading Encounter Manager...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      <iframe
        src="/dnd-encounters/index.html"
        className="w-full h-screen border-none"
        title="D&D Encounter Manager"
      />
    </div>
  );
}
