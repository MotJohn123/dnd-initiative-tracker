'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';

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

export default function Home() {
  const [selectedBattleId, setSelectedBattleId] = useState<string | null>(null);
  
  const apiUrl = selectedBattleId 
    ? `/api/battles/active?id=${selectedBattleId}`
    : '/api/battles/active';
    
  const { data, error, isLoading } = useSWR(apiUrl, fetcher, {
    refreshInterval: 500, // Poll every 0.5 seconds for fast updates
  });

  const battle: Battle | null = data?.battle || null;
  const availableBattles: BattleOption[] = data?.availableBattles || [];
  
  const sortedCharacters = battle?.characters
    ? [...battle.characters].sort((a, b) => {
        if (b.initiative !== a.initiative) return b.initiative - a.initiative;
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      })
    : [];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">⚠️ Error</h2>
          <p className="text-gray-300">Failed to load battle data</p>
          <p className="text-sm text-gray-500 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-300">Loading battle data...</p>
        </div>
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚔️</div>
          <h1 className="text-3xl font-bold mb-4">D&D Initiative Tracker</h1>
          
          {availableBattles.length > 0 ? (
            <div>
              <p className="text-gray-300 mb-4">
                Select a battle to watch:
              </p>
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
            <p className="text-gray-300">
              No active battle. The DM will start one soon!
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">⚔️ Initiative Tracker</h1>
          <h2 className="text-xl sm:text-2xl text-primary font-semibold">{battle.name}</h2>
          <p className="text-gray-400 mt-2">
            <span className="text-primary font-semibold">Round {battle.currentRound || 1}</span>
            {' • '}
            Turn {battle.currentTurnIndex + 1} of {sortedCharacters.length}
          </p>
          
          {availableBattles.length > 1 && (
            <div className="mt-4">
              <select
                value={selectedBattleId || battle._id}
                onChange={(e) => setSelectedBattleId(e.target.value)}
                className="input-field max-w-xs"
              >
                {availableBattles.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </header>

        {sortedCharacters.length === 0 ? (
          <div className="card text-center">
            <p className="text-gray-300">Waiting for characters to be added...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCharacters.map((character, index) => {
              const isCurrentTurn = index === battle.currentTurnIndex;
              const displayName = character.isNPC && !character.isRevealed ? '?' : character.name;
              
              return (
                <div
                  key={character.id}
                  className={`initiative-card flex items-center gap-4 ${
                    isCurrentTurn ? 'active' : ''
                  }`}
                >
                  {character.imageUrl && (
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                      <img
                        src={character.imageUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold truncate flex items-center gap-2">
                      {character.isLair && '🏰 '}
                      {displayName}
                      {isCurrentTurn && (
                        <span className="text-sm bg-primary px-2 py-1 rounded">
                          Current Turn
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {character.isNPC ? 'NPC' : 'Player Character'}
                    </p>
                  </div>
                  
                  <div className="text-3xl font-bold text-primary">
                    {character.initiative}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <footer className="mt-8 text-center text-gray-400 text-sm">
          <p>Player View • Updates automatically</p>
        </footer>
      </div>
    </div>
  );
}
