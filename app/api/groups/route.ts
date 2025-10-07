import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PlayerGroup from '@/models/PlayerGroup';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

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

    const groups = await PlayerGroup.find({ userId: decoded.userId }).sort({ createdAt: -1 });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Get groups error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

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
        { error: 'Group name is required' },
        { status: 400 }
      );
    }

    const group = await PlayerGroup.create({
      name,
      userId: decoded.userId,
      characters: characters || [],
    });

    return NextResponse.json({ group });
  } catch (error) {
    console.error('Create group error:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}
