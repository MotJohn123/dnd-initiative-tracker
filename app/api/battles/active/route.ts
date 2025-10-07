import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Battle from '@/models/Battle';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    // Get token to identify the user
    const token = getTokenFromRequest(request);
    let userId = null;
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.userId;
      }
    }
    
    // If no valid token, still try to find any active battle (for public view)
    // But prioritize the authenticated user's battle if available
    const query = userId 
      ? { isActive: true, userId } 
      : { isActive: true };
    
    const battle = await Battle.findOne(query).sort({ updatedAt: -1 });

    if (!battle) {
      return NextResponse.json({ battle: null });
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
    }));

    return NextResponse.json({
      battle: {
        _id: battle._id,
        name: battle.name,
        characters: publicCharacters,
        currentTurnIndex: battle.currentTurnIndex,
        currentRound: battle.currentRound || 1,
        updatedAt: battle.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get active battle error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active battle' },
      { status: 500 }
    );
  }
}
