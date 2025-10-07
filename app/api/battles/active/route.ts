import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Battle from '@/models/Battle';

export async function GET() {
  try {
    await connectDB();
    
    const battle = await Battle.findOne({ isActive: true }).sort({ updatedAt: -1 });

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
