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
  sortOrder?: number;
}

interface Battle {
  _id: string;
  name: string;
  characters: BattleCharacter[];
  currentTurnIndex: number;
  currentRound: number;
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [groups, setGroups] = useState<PlayerGroup[]>([]);
  const [activeBattle, setActiveBattle] = useState<Battle | null>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showBattleForm, setShowBattleForm] = useState(false);
  const [showAddNPC, setShowAddNPC] = useState(false);
  const [showAddPC, setShowAddPC] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<PlayerGroup | null>(null);
  
  // Form states
  const [groupName, setGroupName] = useState('');
  const [characters, setCharacters] = useState<Character[]>([{ name: '', imageUrl: '' }]);
  const [battleName, setBattleName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [npcName, setNpcName] = useState('');
  const [npcInitiative, setNpcInitiative] = useState(10);
  const [pcName, setPcName] = useState('');
  const [pcInitiative, setPcInitiative] = useState(10);
  const [addGroupId, setAddGroupId] = useState('');

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

  const handleEditGroup = (group: PlayerGroup) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setCharacters(group.characters.length > 0 ? group.characters : [{ name: '', imageUrl: '' }]);
    setShowGroupForm(true);
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingGroup) return;

    try {
      const res = await fetch(`/api/groups/${editingGroup._id}`, {
        method: 'PUT',
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
        setEditingGroup(null);
        setGroupName('');
        setCharacters([{ name: '', imageUrl: '' }]);
        loadGroups(token);
      }
    } catch (error) {
      console.error('Failed to update group:', error);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!token || !confirm('Are you sure you want to delete this group?')) return;

    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        loadGroups(token);
      }
    } catch (error) {
      console.error('Failed to delete group:', error);
    }
  };

  const handleStartBattle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    let battleCharacters: BattleCharacter[] = [];
    
    // Only add group characters if a group is selected
    if (selectedGroupId) {
      const selectedGroup = groups.find(g => g._id === selectedGroupId);
      if (selectedGroup) {
        battleCharacters = selectedGroup.characters.map((char, idx) => ({
          id: `pc-${idx}-${Date.now()}`,
          name: char.name,
          isNPC: false,
          isRevealed: true,
          initiative: 0,
          imageUrl: char.imageUrl,
          sortOrder: idx,
        }));
      }
    }

    try {
      // First, end any existing active battle
      if (activeBattle) {
        await fetch(`/api/battles/${activeBattle._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: false }),
        });
      }

      // Then create the new battle
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

    const maxSortOrder = Math.max(...activeBattle.characters.map(c => c.sortOrder || 0), 0);

    const newNPC: BattleCharacter = {
      id: `npc-${Date.now()}`,
      name: npcName,
      isNPC: true,
      isRevealed: false,
      initiative: npcInitiative,
      sortOrder: maxSortOrder + 1,
    };

    // Get the current character before sorting changes
    const sortedBefore = [...activeBattle.characters].sort((a, b) => {
      if (b.initiative !== a.initiative) return b.initiative - a.initiative;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
    const currentCharacterId = sortedBefore[activeBattle.currentTurnIndex]?.id;

    const updatedCharacters = [...activeBattle.characters, newNPC];

    // Find where the current character will be after adding new NPC
    const sortedAfter = [...updatedCharacters].sort((a, b) => {
      if (b.initiative !== a.initiative) return b.initiative - a.initiative;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
    const newTurnIndex = sortedAfter.findIndex(c => c.id === currentCharacterId);

    try {
      const res = await fetch(`/api/battles/${activeBattle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          characters: updatedCharacters,
          currentTurnIndex: newTurnIndex >= 0 ? newTurnIndex : activeBattle.currentTurnIndex
        }),
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

  const handleAddPC = async () => {
    if (!token || !activeBattle) return;

    const maxSortOrder = Math.max(...activeBattle.characters.map(c => c.sortOrder || 0), 0);

    const newPC: BattleCharacter = {
      id: `pc-${Date.now()}`,
      name: pcName,
      isNPC: false,
      isRevealed: true,
      initiative: pcInitiative,
      sortOrder: maxSortOrder + 1,
    };

    // Get the current character before sorting changes
    const sortedBefore = [...activeBattle.characters].sort((a, b) => {
      if (b.initiative !== a.initiative) return b.initiative - a.initiative;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
    const currentCharacterId = sortedBefore[activeBattle.currentTurnIndex]?.id;

    const updatedCharacters = [...activeBattle.characters, newPC];

    // Find where the current character will be after adding new PC
    const sortedAfter = [...updatedCharacters].sort((a, b) => {
      if (b.initiative !== a.initiative) return b.initiative - a.initiative;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
    const newTurnIndex = sortedAfter.findIndex(c => c.id === currentCharacterId);

    try {
      const res = await fetch(`/api/battles/${activeBattle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          characters: updatedCharacters,
          currentTurnIndex: newTurnIndex >= 0 ? newTurnIndex : activeBattle.currentTurnIndex
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveBattle(data.battle);
        setShowAddPC(false);
        setPcName('');
        setPcInitiative(10);
      }
    } catch (error) {
      console.error('Failed to add PC:', error);
    }
  };

  const handleAddGroupToBattle = async () => {
    if (!token || !activeBattle || !addGroupId) return;

    const selectedGroup = groups.find(g => g._id === addGroupId);
    if (!selectedGroup) return;

    // Get the current character before adding group
    const sortedBefore = [...activeBattle.characters].sort((a, b) => {
      if (b.initiative !== a.initiative) return b.initiative - a.initiative;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
    const currentCharacterId = sortedBefore[activeBattle.currentTurnIndex]?.id;

    const maxSortOrder = Math.max(...activeBattle.characters.map(c => c.sortOrder || 0), 0);

    // Add all characters from the group
    const newCharacters = selectedGroup.characters.map((char, idx) => ({
      id: `pc-group-${Date.now()}-${idx}`,
      name: char.name,
      isNPC: false,
      isRevealed: true,
      initiative: 0,
      imageUrl: char.imageUrl,
      sortOrder: maxSortOrder + idx + 1,
    }));

    const updatedCharacters = [...activeBattle.characters, ...newCharacters];

    // Find where the current character will be after adding group
    const sortedAfter = [...updatedCharacters].sort((a, b) => {
      if (b.initiative !== a.initiative) return b.initiative - a.initiative;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
    const newTurnIndex = sortedAfter.findIndex(c => c.id === currentCharacterId);

    try {
      const res = await fetch(`/api/battles/${activeBattle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          characters: updatedCharacters,
          currentTurnIndex: newTurnIndex >= 0 ? newTurnIndex : activeBattle.currentTurnIndex
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveBattle(data.battle);
        setShowAddGroup(false);
        setAddGroupId('');
      }
    } catch (error) {
      console.error('Failed to add group to battle:', error);
    }
  };

  const handleAddLair = async () => {
    if (!token || !activeBattle) return;

    const maxSortOrder = Math.max(...activeBattle.characters.map(c => c.sortOrder || 0), 0);

    const lairAction: BattleCharacter = {
      id: `lair-${Date.now()}`,
      name: 'Lair Action',
      isNPC: true,
      isRevealed: true,
      initiative: 20,
      isLair: true,
      sortOrder: maxSortOrder + 1,
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

    // Get the current character before sorting changes
    const sortedBefore = [...activeBattle.characters].sort((a, b) => {
      if (b.initiative !== a.initiative) return b.initiative - a.initiative;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
    const currentCharacterId = sortedBefore[activeBattle.currentTurnIndex]?.id;

    const updatedCharacters = activeBattle.characters.map(char =>
      char.id === charId ? { ...char, initiative } : char
    );

    // Sort characters by initiative after update
    const sortedCharacters = updatedCharacters.sort((a, b) => {
      if (b.initiative !== a.initiative) return b.initiative - a.initiative;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });

    // Find where the current character is after sorting
    const newTurnIndex = sortedCharacters.findIndex(c => c.id === currentCharacterId);

    try {
      const res = await fetch(`/api/battles/${activeBattle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          characters: sortedCharacters,
          currentTurnIndex: newTurnIndex >= 0 ? newTurnIndex : 0
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

    // Get the current character before removing
    const sortedBefore = [...activeBattle.characters].sort((a, b) => {
      if (b.initiative !== a.initiative) return b.initiative - a.initiative;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
    const currentCharacterId = sortedBefore[activeBattle.currentTurnIndex]?.id;

    // If we're removing the current character, move to next turn
    const updatedCharacters = activeBattle.characters.filter(char => char.id !== charId);
    
    if (updatedCharacters.length === 0) {
      // If no characters left, just remove and set index to 0
      try {
        const res = await fetch(`/api/battles/${activeBattle._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            characters: updatedCharacters,
            currentTurnIndex: 0
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setActiveBattle(data.battle);
        }
      } catch (error) {
        console.error('Failed to remove character:', error);
      }
      return;
    }

    // Sort characters after removal
    const sortedAfter = [...updatedCharacters].sort((a, b) => {
      if (b.initiative !== a.initiative) return b.initiative - a.initiative;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });

    let newTurnIndex;
    if (charId === currentCharacterId) {
      // If removing current character, stay at same index (effectively moves to next character)
      newTurnIndex = activeBattle.currentTurnIndex >= sortedAfter.length 
        ? 0 
        : activeBattle.currentTurnIndex;
    } else {
      // Find where the current character is after removal
      newTurnIndex = sortedAfter.findIndex(c => c.id === currentCharacterId);
      if (newTurnIndex < 0) newTurnIndex = 0;
    }

    try {
      const res = await fetch(`/api/battles/${activeBattle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          characters: updatedCharacters,
          currentTurnIndex: newTurnIndex
        }),
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

    const sortedCharacters = [...activeBattle.characters].sort((a, b) => {
      if (b.initiative !== a.initiative) return b.initiative - a.initiative;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
    
    const newIndex = (activeBattle.currentTurnIndex + 1) % sortedCharacters.length;
    const newRound = newIndex === 0 ? (activeBattle.currentRound || 1) + 1 : (activeBattle.currentRound || 1);

    try {
      const res = await fetch(`/api/battles/${activeBattle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          currentTurnIndex: newIndex,
          currentRound: newRound
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveBattle(data.battle);
      }
    } catch (error) {
      console.error('Failed to advance turn:', error);
    }
  };

  const handlePreviousTurn = async () => {
    if (!token || !activeBattle) return;

    const sortedCharacters = [...activeBattle.characters].sort((a, b) => {
      if (b.initiative !== a.initiative) return b.initiative - a.initiative;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
    
    const newIndex = activeBattle.currentTurnIndex === 0 
      ? sortedCharacters.length - 1 
      : activeBattle.currentTurnIndex - 1;
    
    const newRound = activeBattle.currentTurnIndex === 0 
      ? Math.max((activeBattle.currentRound || 1) - 1, 1)
      : (activeBattle.currentRound || 1);

    try {
      const res = await fetch(`/api/battles/${activeBattle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          currentTurnIndex: newIndex,
          currentRound: newRound
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveBattle(data.battle);
      }
    } catch (error) {
      console.error('Failed to go back:', error);
    }
  };

  const handleResetBattle = async () => {
    if (!token || !activeBattle) return;
    
    if (!confirm('Reset battle to Round 1, Turn 1? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/battles/${activeBattle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          currentTurnIndex: 0,
          currentRound: 1
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveBattle(data.battle);
      }
    } catch (error) {
      console.error('Failed to reset battle:', error);
    }
  };

  const handleMoveCharacter = async (charId: string, direction: 'up' | 'down') => {
    if (!token || !activeBattle) return;

    const sortedCharacters = [...activeBattle.characters].sort((a, b) => {
      if (b.initiative !== a.initiative) return b.initiative - a.initiative;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });

    const currentIndex = sortedCharacters.findIndex(c => c.id === charId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sortedCharacters.length) return;

    // Swap sortOrder values
    const currentChar = sortedCharacters[currentIndex];
    const targetChar = sortedCharacters[targetIndex];

    // Only allow swapping characters with the same initiative
    if (currentChar.initiative !== targetChar.initiative) return;

    const updatedCharacters = activeBattle.characters.map(char => {
      if (char.id === currentChar.id) {
        return { ...char, sortOrder: targetChar.sortOrder || 0 };
      }
      if (char.id === targetChar.id) {
        return { ...char, sortOrder: currentChar.sortOrder || 0 };
      }
      return char;
    });

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
      console.error('Failed to move character:', error);
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

  const handleRefreshExpiration = async () => {
    if (!token || !activeBattle) return;

    try {
      const res = await fetch(`/api/battles/${activeBattle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ refreshExpiration: true }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveBattle(data.battle);
        alert('Battle extended by 8 hours!');
      }
    } catch (error) {
      console.error('Failed to refresh expiration:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin');
  };

  const getBattleDuration = (battle: Battle): string => {
    const start = new Date(battle.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const sortedBattleCharacters = activeBattle
    ? [...activeBattle.characters].sort((a, b) => {
        if (b.initiative !== a.initiative) return b.initiative - a.initiative;
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      })
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
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold">⚔️ {activeBattle.name}</h2>
                <p className="text-gray-400 text-sm mt-1">
                  <span className="text-primary font-semibold">Round {activeBattle.currentRound || 1}</span>
                  {' • '}
                  Turn {activeBattle.currentTurnIndex + 1} of {sortedBattleCharacters.length}
                  {sortedBattleCharacters.length > 0 && (
                    <span className="ml-2 text-white">
                      → {sortedBattleCharacters[activeBattle.currentTurnIndex]?.name}
                    </span>
                  )}
                </p>
                <p className="text-yellow-500 text-sm mt-1">
                  ⏱️ Duration: {getBattleDuration(activeBattle)}
                </p>
              </div>
              
              {/* Mobile: Next Turn as prominent button */}
              <div className="flex flex-col gap-2 lg:hidden w-full">
                <div className="flex gap-2">
                  <button 
                    onClick={handlePreviousTurn} 
                    className="btn-secondary text-lg py-3 font-bold whitespace-nowrap flex-1"
                  >
                    ← Back
                  </button>
                  <button 
                    onClick={handleNextTurn} 
                    className="btn-primary text-lg py-3 font-bold whitespace-nowrap flex-[2]"
                  >
                    Next Turn →
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  <button onClick={() => setShowAddPC(true)} className="btn-primary text-sm whitespace-nowrap">
                    + Add PC
                  </button>
                  <button onClick={() => setShowAddNPC(true)} className="btn-primary text-sm whitespace-nowrap">
                    + Add NPC
                  </button>
                  <button onClick={() => setShowAddGroup(true)} className="btn-primary text-sm whitespace-nowrap">
                    + Add Group
                  </button>
                  <button onClick={handleAddLair} className="btn-secondary text-sm whitespace-nowrap">
                    + Lair (20)
                  </button>
                  <button onClick={handleResetBattle} className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap">
                    🔄 Reset
                  </button>
                  <button onClick={handleRefreshExpiration} className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap">
                    🕐 +8 Hours
                  </button>
                  <button onClick={handleEndBattle} className="btn-danger text-sm whitespace-nowrap">
                    End Battle
                  </button>
                </div>
              </div>

              {/* Desktop: All buttons in one row */}
              <div className="hidden lg:flex gap-2 flex-wrap justify-end">
                <button onClick={() => setShowAddPC(true)} className="btn-primary text-sm whitespace-nowrap">
                  + Add PC
                </button>
                <button onClick={() => setShowAddNPC(true)} className="btn-primary text-sm whitespace-nowrap">
                  + Add NPC
                </button>
                <button onClick={() => setShowAddGroup(true)} className="btn-primary text-sm whitespace-nowrap">
                  + Add Group
                </button>
                <button onClick={handleAddLair} className="btn-secondary text-sm whitespace-nowrap">
                  + Lair (20)
                </button>
                <button onClick={handleResetBattle} className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap">
                  🔄 Reset
                </button>
                <button onClick={handleRefreshExpiration} className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap">
                  🕐 +8 Hours
                </button>
                <button onClick={handlePreviousTurn} className="btn-secondary text-sm whitespace-nowrap">
                  ← Back
                </button>
                <button onClick={handleNextTurn} className="btn-primary text-sm whitespace-nowrap">
                  Next Turn →
                </button>
                <button onClick={handleEndBattle} className="btn-danger text-sm whitespace-nowrap">
                  End Battle
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {sortedBattleCharacters.map((char, index) => {
                const isCurrentTurn = index === activeBattle.currentTurnIndex;
                const hasSameInitiativeAbove = index > 0 && sortedBattleCharacters[index - 1].initiative === char.initiative;
                const hasSameInitiativeBelow = index < sortedBattleCharacters.length - 1 && sortedBattleCharacters[index + 1].initiative === char.initiative;
                
                return (
                  <div
                    key={char.id}
                    className={`flex items-center gap-2 p-4 rounded-lg border ${
                      isCurrentTurn
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-700 bg-gray-800/30'
                    }`}
                  >
                    {/* Sort arrows - only show if there are characters with same initiative */}
                    <div className="flex flex-col gap-1">
                      {hasSameInitiativeAbove ? (
                        <button
                          onClick={() => handleMoveCharacter(char.id, 'up')}
                          className="text-gray-400 hover:text-white text-xs"
                          title="Move up"
                        >
                          ▲
                        </button>
                      ) : (
                        <div className="h-3"></div>
                      )}
                      {hasSameInitiativeBelow ? (
                        <button
                          onClick={() => handleMoveCharacter(char.id, 'down')}
                          className="text-gray-400 hover:text-white text-xs"
                          title="Move down"
                        >
                          ▼
                        </button>
                      ) : (
                        <div className="h-3"></div>
                      )}
                    </div>

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

            {/* Floating Next Turn Button - fixed to window viewport */}
            <div className="fixed bottom-6 right-6 z-50">
              <button 
                onClick={handleNextTurn} 
                className="btn-primary text-xl py-5 px-8 rounded-full shadow-2xl font-bold hover:scale-110 transition-all flex items-center gap-2"
                title={`Next Turn - Round ${activeBattle.currentRound || 1}, Turn ${activeBattle.currentTurnIndex + 1}`}
              >
                <span>Next Turn</span>
                <span className="text-2xl">→</span>
              </button>
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

        {/* Add PC Modal */}
        {showAddPC && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Add Player Character</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">PC Name</label>
                  <input
                    type="text"
                    value={pcName}
                    onChange={(e) => setPcName(e.target.value)}
                    className="input-field"
                    placeholder="Character name"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Initiative</label>
                  <input
                    type="number"
                    value={pcInitiative}
                    onChange={(e) => setPcInitiative(parseInt(e.target.value) || 0)}
                    className="input-field"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddPC} className="btn-primary flex-1">
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddPC(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Group Modal */}
        {showAddGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Add Player Group to Battle</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Select Group</label>
                  <select
                    value={addGroupId}
                    onChange={(e) => setAddGroupId(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Choose a group...</option>
                    {groups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name} ({group.characters.length} characters)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-2">
                    All characters from the group will be added with initiative 0. You can set their initiative after adding.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleAddGroupToBattle} 
                    className="btn-primary flex-1"
                    disabled={!addGroupId}
                  >
                    Add Group
                  </button>
                  <button
                    onClick={() => {
                      setShowAddGroup(false);
                      setAddGroupId('');
                    }}
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
                  <label className="block text-sm mb-2">Player Group (Optional)</label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="input-field"
                  >
                    <option value="">No group - Start empty</option>
                    {groups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name} ({group.characters.length} characters)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    You can add characters after starting the battle
                  </p>
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
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{group.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditGroup(group)}
                        className="text-primary hover:text-primary/80 text-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group._id)}
                        className="text-red-500 hover:text-red-400 text-sm"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {group.characters.length} character(s):{' '}
                    {group.characters.map((c) => c.name).join(', ') || 'None'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Create/Edit Group Modal */}
        {showGroupForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="card max-w-2xl w-full my-8">
              <h3 className="text-xl font-bold mb-4">
                {editingGroup ? 'Edit Player Group' : 'Create Player Group'}
              </h3>
              <form onSubmit={editingGroup ? handleUpdateGroup : handleCreateGroup} className="space-y-4">
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
                    {editingGroup ? 'Update Group' : 'Create Group'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowGroupForm(false);
                      setEditingGroup(null);
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
