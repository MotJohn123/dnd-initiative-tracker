import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Battle from '@/models/Battle';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const updates = await request.json();

    const battle = await Battle.findOne({
      _id: params.id,
      userId: decoded.userId,
    });

    if (!battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
    }

    // Update allowed fields
    if (updates.characters !== undefined) {
      battle.characters = updates.characters;
    }
    if (updates.currentTurnIndex !== undefined) {
      battle.currentTurnIndex = updates.currentTurnIndex;
    }
    if (updates.isActive !== undefined) {
      battle.isActive = updates.isActive;
    }
    if (updates.name !== undefined) {
      battle.name = updates.name;
    }

    await battle.save();

    return NextResponse.json({ battle });
  } catch (error) {
    console.error('Update battle error:', error);
    return NextResponse.json(
      { error: 'Failed to update battle' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const result = await Battle.deleteOne({
      _id: params.id,
      userId: decoded.userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete battle error:', error);
    return NextResponse.json(
      { error: 'Failed to delete battle' },
      { status: 500 }
    );
  }
}
