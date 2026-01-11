'use client';

import { useEffect, useState, useRef } from 'react';
import useSWR from 'swr';
import Link from 'next/link';

interface Character {
  id: string;
  name: string;
  isNPC: boolean;
  isRevealed: boolean;
  initiative: number;
  imageUrl?: string;
  isLair?: boolean;
  sortOrder?: number;
}

interface Battle {
  _id: string;
  name: string;
  characters: Character[];
  currentTurnIndex: number;
  currentRound: number;
  expiresAt: string;
  updatedAt: string;
}

interface BattleOption {
  _id: string;
  name: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function FullscreenTracker() {
  const [selectedBattleId, setSelectedBattleId] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const apiUrl = selectedBattleId
    ? `/api/battles/active?id=${selectedBattleId}`
    : '/api/battles/active';

  const { data, error, isLoading } = useSWR(apiUrl, fetcher, {
    refreshInterval: 500,
  });

  const battle: Battle | null = data?.battle || null;
  const availableBattles: BattleOption[] = data?.availableBattles || [];

  const sortedCharacters = battle?.characters
    ? [...battle.characters].sort((a, b) => {
        if (b.initiative !== a.initiative) return b.initiative - a.initiative;
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      })
    : [];

  // Update dimensions on window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls]);

  // Calculate responsive sizes based on character count and window size
  const characterCount = sortedCharacters.length || 1;
  const headerHeight = 80;
  const footerHeight = 40;
  const availableHeight = dimensions.height - headerHeight - footerHeight - 40;
  const availableWidth = dimensions.width - 32;

  // Calculate optimal card size
  const columns = Math.max(1, Math.min(4, Math.ceil(Math.sqrt(characterCount * (availableWidth / availableHeight)))));
  const rows = Math.ceil(characterCount / columns);
  const cardWidth = Math.floor(availableWidth / columns) - 12;
  const cardHeight = Math.floor(availableHeight / rows) - 12;

  // Dynamic font sizes based on card dimensions
  const baseFontSize = Math.min(cardWidth / 10, cardHeight / 5, 24);
  const nameFontSize = Math.max(baseFontSize * 1.2, 14);
  const initiativeFontSize = Math.max(baseFontSize * 2, 20);
  const smallFontSize = Math.max(baseFontSize * 0.7, 10);
  const avatarSize = Math.min(cardHeight * 0.5, cardWidth * 0.25, 80);

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-b from-[#1e1b4b] to-[#0f0d26]">
        <div className="card max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">⚠️ Error</h2>
          <p className="text-gray-300">Failed to load battle data</p>
          <Link href="/" className="btn-secondary mt-4 inline-block">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-b from-[#1e1b4b] to-[#0f0d26]">
        <div className="card max-w-md w-full text-center">
          <div className="text-6xl mb-4 animate-pulse">⏳</div>
          <p className="text-gray-300">Loading battle data...</p>
        </div>
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-b from-[#1e1b4b] to-[#0f0d26]">
        <div className="card max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚔️</div>
          <h1 className="text-3xl font-bold mb-4">Fullscreen Tracker</h1>

          {availableBattles.length > 0 ? (
            <div>
              <p className="text-gray-300 mb-4">Select a battle to watch:</p>
              <div className="space-y-2">
                {availableBattles.map((b) => (
                  <button
                    key={b._id}
                    onClick={() => setSelectedBattleId(b._id)}
                    className="btn-primary w-full"
                  >
                    📜 {b.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-300">No active battle. The DM will start one soon!</p>
          )}

          <Link href="/" className="btn-secondary mt-4 inline-block">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen w-screen overflow-hidden bg-gradient-to-b from-[#1e1b4b] to-[#0f0d26] flex flex-col"
      onMouseMove={() => setShowControls(true)}
      onTouchStart={() => setShowControls(true)}
    >
      {/* Compact Header */}
      <header
        className={`flex-shrink-0 flex items-center justify-between px-4 py-2 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-60'
        }`}
        style={{ height: headerHeight }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Home
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold">⚔️ {battle.name}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-primary font-bold text-lg">Round {battle.currentRound || 1}</span>
            <span className="text-gray-400 text-sm ml-2">
              Turn {battle.currentTurnIndex + 1}/{sortedCharacters.length}
            </span>
          </div>

          {availableBattles.length > 1 && (
            <select
              value={selectedBattleId || battle._id}
              onChange={(e) => setSelectedBattleId(e.target.value)}
              className="input-field max-w-[150px] text-sm py-1"
            >
              {availableBattles.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </header>

      {/* Character Grid - Fills remaining space */}
      <main className="flex-1 p-4 overflow-hidden">
        {sortedCharacters.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="card text-center">
              <p className="text-gray-300 text-xl">Waiting for characters to be added...</p>
            </div>
          </div>
        ) : (
          <div
            className="h-full w-full grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
            }}
          >
            {sortedCharacters.map((character, index) => {
              const isCurrentTurn = index === battle.currentTurnIndex;
              const displayName = character.isNPC && !character.isRevealed ? '?' : character.name;

              return (
                <div
                  key={character.id}
                  className={`
                    relative flex items-center rounded-lg overflow-hidden
                    transition-all duration-300
                    ${isCurrentTurn
                      ? 'bg-primary/20 border-2 border-primary shadow-lg shadow-primary/30 scale-[1.02] z-10'
                      : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
                    }
                  `}
                  style={{
                    padding: Math.max(cardHeight * 0.08, 8),
                  }}
                >
                  {/* Avatar */}
                  {character.imageUrl && (
                    <div
                      className="flex-shrink-0 rounded-full overflow-hidden bg-gray-700 mr-3"
                      style={{
                        width: avatarSize,
                        height: avatarSize,
                      }}
                    >
                      <img
                        src={character.imageUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Character Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3
                      className="font-bold truncate leading-tight"
                      style={{ fontSize: nameFontSize }}
                    >
                      {character.isLair && '🏰 '}
                      {displayName}
                    </h3>
                    <p
                      className="text-gray-400 truncate"
                      style={{ fontSize: smallFontSize }}
                    >
                      {character.isNPC ? 'NPC' : 'Player'}
                      {isCurrentTurn && (
                        <span className="ml-2 text-primary font-semibold">• Active</span>
                      )}
                    </p>
                  </div>

                  {/* Initiative Score */}
                  <div
                    className="flex-shrink-0 font-bold text-primary text-right"
                    style={{ fontSize: initiativeFontSize }}
                  >
                    {character.initiative}
                  </div>

                  {/* Current Turn Indicator */}
                  {isCurrentTurn && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Compact Footer */}
      <footer
        className={`flex-shrink-0 text-center py-2 text-gray-500 text-xs bg-black/20 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-30'
        }`}
        style={{ height: footerHeight }}
      >
        Fullscreen View • Auto-updates every 0.5s • Move mouse to show controls
      </footer>
    </div>
  );
}
