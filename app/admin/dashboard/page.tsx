'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Character {
  name: string;
  imageUrl?: string;
}

interface PlayerGroup {
  _id: string;
  name: string;
  characters: Character[];
}

interface BattleCharacter {
  id: string;
  name: string;
  isNPC: boolean;
  isRevealed: boolean;
  initiative: number;
  imageUrl?: string;
  isLair?: boolean;
}

interface Battle {
  _id: string;
  name: string;
  characters: BattleCharacter[];
  currentTurnIndex: number;
  isActive: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [groups, setGroups] = useState<PlayerGroup[]>([]);
  const [activeBattle, setActiveBattle] = useState<Battle | null>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showBattleForm, setShowBattleForm] = useState(false);
  const [showAddNPC, setShowAddNPC] = useState(false);
  
  // Form states
  const [groupName, setGroupName] = useState('');
  const [characters, setCharacters] = useState<Character[]>([{ name: '', imageUrl: '' }]);
  const [battleName, setBattleName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [npcName, setNpcName] = useState('');
  const [npcInitiative, setNpcInitiative] = useState(10);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/admin');
      return;
    }
    setToken(storedToken);
    loadGroups(storedToken);
    loadActiveBattle(storedToken);
  }, [router]);

  const loadGroups = async (authToken: string) => {
    try {
      const res = await fetch('/api/groups', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  };

  const loadActiveBattle = async (authToken: string) => {
    try {
      const res = await fetch('/api/battles', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      const active = data.battles?.find((b: Battle) => b.isActive);
      setActiveBattle(active || null);
    } catch (error) {
      console.error('Failed to load battles:', error);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: groupName,
          characters: characters.filter(c => c.name.trim()),
        }),
      });

      if (res.ok) {
        setShowGroupForm(false);
        setGroupName('');
        setCharacters([{ name: '', imageUrl: '' }]);
        loadGroups(token);
      }
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleStartBattle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const selectedGroup = groups.find(g => g._id === selectedGroupId);
    if (!selectedGroup) return;

    const battleCharacters = selectedGroup.characters.map((char, idx) => ({
      id: `pc-${idx}-${Date.now()}`,
      name: char.name,
      isNPC: false,
      isRevealed: true,
      initiative: 0,
      imageUrl: char.imageUrl,
    }));

    try {
      const res = await fetch('/api/battles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: battleName,
          characters: battleCharacters,
        }),
      });

      if (res.ok) {
        setShowBattleForm(false);
        setBattleName('');
        setSelectedGroupId('');
        loadActiveBattle(token);
      }
    } catch (error) {
      console.error('Failed to start battle:', error);
    }
  };

  const handleAddNPC = async () => {
    if (!token || !activeBattle) return;

    const newNPC: BattleCharacter = {
      id: `npc-${Date.now()}`,
      name: npcName,
      isNPC: true,
      isRevealed: false,
      initiative: npcInitiative,
    };

    const updatedCharacters = [...activeBattle.characters, newNPC];

    try {
      const res = await fetch(`/api/battles/${activeBattle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ characters: updatedCharacters }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveBattle(data.battle);
        setShowAddNPC(false);
        setNpcName('');
        setNpcInitiative(10);
      }
    } catch (error) {
      console.error('Failed to add NPC:', error);
    }
  };

  const handleAddLair = async () => {
    if (!token || !activeBattle) return;

    const lairAction: BattleCharacter = {
      id: `lair-${Date.now()}`,
      name: 'Lair Action',
      isNPC: true,
      isRevealed: true,
      initiative: 20,
      isLair: true,
    };

    const updatedCharacters = [...activeBattle.characters, lairAction];

    try {
      const res = await fetch(`/api/battles/${activeBattle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ characters: updatedCharacters }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveBattle(data.battle);
      }
    } catch (error) {
      console.error('Failed to add lair action:', error);
    }
  };

  const handleUpdateInitiative = async (charId: string, initiative: number) => {
    if (!token || !activeBattle) return;

    const updatedCharacters = activeBattle.characters.map(char =>
      char.id === charId ? { ...char, initiative } : char
    );

    // Sort characters by initiative after update
    const sortedCharacters = updatedCharacters.sort((a, b) => b.initiative - a.initiative);

    try {
      const res = await fetch(`/api/battles/${activeBattle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          characters: sortedCharacters,
          currentTurnIndex: 0 // Reset to first character after re-sorting
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveBattle(data.battle);
      }
    } catch (error) {
      console.error('Failed to update initiative:', error);
    }
  };

  const handleToggleReveal = async (charId: string) => {
    if (!token || !activeBattle) return;

    const updatedCharacters = activeBattle.characters.map(char =>
      char.id === charId ? { ...char, isRevealed: !char.isRevealed } : char
    );

    try {
      const res = await fetch(`/api/battles/${activeBattle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ characters: updatedCharacters }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveBattle(data.battle);
      }
    } catch (error) {
      console.error('Failed to toggle reveal:', error);
    }
  };

  const handleRemoveCharacter = async (charId: string) => {
    if (!token || !activeBattle) return;

    const updatedCharacters = activeBattle.characters.filter(char => char.id !== charId);

    try {
      const res = await fetch(`/api/battles/${activeBattle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ characters: updatedCharacters }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveBattle(data.battle);
      }
    } catch (error) {
      console.error('Failed to remove character:', error);
    }
  };

  const handleNextTurn = async () => {
    if (!token || !activeBattle) return;

    const sortedCharacters = [...activeBattle.characters].sort((a, b) => b.initiative - a.initiative);
    const newIndex = (activeBattle.currentTurnIndex + 1) % sortedCharacters.length;

    try {
      const res = await fetch(`/api/battles/${activeBattle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentTurnIndex: newIndex }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveBattle(data.battle);
      }
    } catch (error) {
      console.error('Failed to advance turn:', error);
    }
  };

  const handleEndBattle = async () => {
    if (!token || !activeBattle) return;

    try {
      const res = await fetch(`/api/battles/${activeBattle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: false }),
      });

      if (res.ok) {
        setActiveBattle(null);
      }
    } catch (error) {
      console.error('Failed to end battle:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin');
  };

  const sortedBattleCharacters = activeBattle
    ? [...activeBattle.characters].sort((a, b) => b.initiative - a.initiative)
    : [];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">🎲 DM Dashboard</h1>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </header>

        {/* Active Battle Section */}
        {activeBattle ? (
          <div className="card mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">⚔️ {activeBattle.name}</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Turn {activeBattle.currentTurnIndex + 1} of {sortedBattleCharacters.length}
                  {sortedBattleCharacters.length > 0 && (
                    <span className="ml-2 text-primary">
                      → {sortedBattleCharacters[activeBattle.currentTurnIndex]?.name}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAddNPC(true)} className="btn-primary text-sm">
                  + Add NPC
                </button>
                <button onClick={handleAddLair} className="btn-secondary text-sm">
                  + Lair (20)
                </button>
                <button onClick={handleNextTurn} className="btn-primary text-sm">
                  Next Turn →
                </button>
                <button onClick={handleEndBattle} className="btn-danger text-sm">
                  End Battle
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {sortedBattleCharacters.map((char, index) => {
                const isCurrentTurn = index === activeBattle.currentTurnIndex;
                return (
                  <div
                    key={char.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      isCurrentTurn
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-700 bg-gray-800/30'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{char.name}</span>
                        {char.isLair && <span>🏰</span>}
                        {isCurrentTurn && (
                          <span className="text-xs bg-primary px-2 py-1 rounded">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-400">
                        {char.isNPC ? 'NPC' : 'PC'}
                      </span>
                    </div>

                    <input
                      type="number"
                      value={char.initiative}
                      onChange={(e) => {
                        // Update local state immediately for responsive UI
                        const newInitiative = parseInt(e.target.value) || 0;
                        const updatedCharacters = activeBattle.characters.map(c =>
                          c.id === char.id ? { ...c, initiative: newInitiative } : c
                        );
                        setActiveBattle({ ...activeBattle, characters: updatedCharacters });
                      }}
                      onBlur={(e) => {
                        // Save to database and sort when user leaves the field
                        handleUpdateInitiative(char.id, parseInt(e.target.value) || 0);
                      }}
                      onKeyDown={(e) => {
                        // Also save when user presses Enter
                        if (e.key === 'Enter') {
                          handleUpdateInitiative(char.id, parseInt(e.currentTarget.value) || 0);
                          e.currentTarget.blur();
                        }
                      }}
                      className="w-20 px-2 py-1 bg-gray-700 rounded text-center"
                    />

                    {char.isNPC && !char.isLair && (
                      <button
                        onClick={() => handleToggleReveal(char.id)}
                        className={`px-3 py-1 rounded text-sm ${
                          char.isRevealed
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                      >
                        {char.isRevealed ? '👁️ Revealed' : '🔒 Hidden'}
                      </button>
                    )}

                    <button
                      onClick={() => handleRemoveCharacter(char.id)}
                      className="text-red-500 hover:text-red-400 px-2"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="card mb-8 text-center">
            <p className="text-gray-400 mb-4">No active battle</p>
            <button
              onClick={() => setShowBattleForm(true)}
              className="btn-primary"
            >
              Start New Battle
            </button>
          </div>
        )}

        {/* Add NPC Modal */}
        {showAddNPC && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Add NPC</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">NPC Name</label>
                  <input
                    type="text"
                    value={npcName}
                    onChange={(e) => setNpcName(e.target.value)}
                    className="input-field"
                    placeholder="Goblin, Dragon, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Initiative</label>
                  <input
                    type="number"
                    value={npcInitiative}
                    onChange={(e) => setNpcInitiative(parseInt(e.target.value) || 0)}
                    className="input-field"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddNPC} className="btn-primary flex-1">
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddNPC(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Start Battle Modal */}
        {showBattleForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Start New Battle</h3>
              <form onSubmit={handleStartBattle} className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Battle Name</label>
                  <input
                    type="text"
                    value={battleName}
                    onChange={(e) => setBattleName(e.target.value)}
                    className="input-field"
                    required
                    placeholder="e.g., Goblin Ambush"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Player Group</label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Select a group</option>
                    {groups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name} ({group.characters.length} characters)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1">
                    Start Battle
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBattleForm(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Player Groups Section */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">👥 Player Groups</h2>
            <button
              onClick={() => setShowGroupForm(true)}
              className="btn-primary"
            >
              + Create Group
            </button>
          </div>

          <div className="space-y-4">
            {groups.length === 0 ? (
              <p className="text-gray-400 text-center">
                No groups yet. Create one to get started!
              </p>
            ) : (
              groups.map((group) => (
                <div key={group._id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <h3 className="font-bold mb-2">{group.name}</h3>
                  <div className="text-sm text-gray-400">
                    {group.characters.length} character(s):{' '}
                    {group.characters.map((c) => c.name).join(', ') || 'None'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Create Group Modal */}
        {showGroupForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="card max-w-2xl w-full my-8">
              <h3 className="text-xl font-bold mb-4">Create Player Group</h3>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Group Name</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="input-field"
                    required
                    placeholder="e.g., The Adventurers"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Characters</label>
                  {characters.map((char, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={char.name}
                        onChange={(e) => {
                          const newChars = [...characters];
                          newChars[index].name = e.target.value;
                          setCharacters(newChars);
                        }}
                        className="input-field flex-1"
                        placeholder="Character name"
                      />
                      <input
                        type="url"
                        value={char.imageUrl}
                        onChange={(e) => {
                          const newChars = [...characters];
                          newChars[index].imageUrl = e.target.value;
                          setCharacters(newChars);
                        }}
                        className="input-field flex-1"
                        placeholder="Image URL (optional)"
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setCharacters(characters.filter((_, i) => i !== index));
                          }}
                          className="text-red-500 px-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCharacters([...characters, { name: '', imageUrl: '' }])}
                    className="btn-secondary text-sm w-full mt-2"
                  >
                    + Add Character
                  </button>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1">
                    Create Group
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowGroupForm(false);
                      setGroupName('');
                      setCharacters([{ name: '', imageUrl: '' }]);
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
