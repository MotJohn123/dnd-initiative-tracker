import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Battle from '@/models/Battle';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
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

    const { name, characters } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Battle name is required' },
        { status: 400 }
      );
    }

    // Deactivate any existing active battles for this user
    await Battle.updateMany(
      { userId: decoded.userId, isActive: true },
      { isActive: false }
    );

    const battle = await Battle.create({
      name,
      userId: decoded.userId,
      characters: characters || [],
      currentTurnIndex: 0,
      isActive: true,
    });

    return NextResponse.json({ battle });
  } catch (error) {
    console.error('Create battle error:', error);
    return NextResponse.json(
      { error: 'Failed to create battle' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
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

    const battles = await Battle.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({ battles });
  } catch (error) {
    console.error('Get battles error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch battles' },
      { status: 500 }
    );
  }
}
