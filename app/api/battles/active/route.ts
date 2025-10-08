import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Battle from '@/models/Battle';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    // Auto-expire old battles
    await Battle.updateMany(
      { 
        isActive: true,
        expiresAt: { $lt: new Date() }
      },
      { isActive: false }
    );
    
    // Get token to identify the user
    const token = getTokenFromRequest(request);
    let userId = null;
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.userId;
      }
    }
    
    // Get all active battles (for battle selection)
    const activeBattles = await Battle.find({ isActive: true })
      .sort({ updatedAt: -1 })
      .select('_id name userId updatedAt');
    
    // If specific battle ID requested
    const url = new URL(request.url);
    const battleId = url.searchParams.get('id');
    
    let battle;
    if (battleId) {
      battle = await Battle.findOne({ _id: battleId, isActive: true });
    } else if (userId) {
      // Prioritize authenticated user's battle
      battle = await Battle.findOne({ isActive: true, userId }).sort({ updatedAt: -1 });
    } else {
      // For unauthenticated users, get the most recent active battle
      battle = await Battle.findOne({ isActive: true }).sort({ updatedAt: -1 });
    }

    if (!battle) {
      return NextResponse.json({ 
        battle: null,
        availableBattles: activeBattles.map(b => ({
          _id: b._id,
          name: b.name,
        }))
      });
    }

    // Filter out hidden NPCs for public view
    const publicCharacters = battle.characters.map(char => ({
      id: char.id,
      name: char.isNPC && !char.isRevealed ? '?' : char.name,
      isNPC: char.isNPC,
      isRevealed: char.isRevealed,
      initiative: char.initiative,
      imageUrl: char.isNPC && !char.isRevealed ? '' : char.imageUrl,
      isLair: char.isLair,
      sortOrder: char.sortOrder,
    }));

    return NextResponse.json({
      battle: {
        _id: battle._id,
        name: battle.name,
        characters: publicCharacters,
        currentTurnIndex: battle.currentTurnIndex,
        currentRound: battle.currentRound || 1,
        expiresAt: battle.expiresAt,
        updatedAt: battle.updatedAt,
      },
      availableBattles: activeBattles.map(b => ({
        _id: b._id,
        name: b.name,
      }))
    });
  } catch (error) {
    console.error('Get active battle error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active battle' },
      { status: 500 }
    );
  }
}
