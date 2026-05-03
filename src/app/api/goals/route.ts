import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Goal from '@/models/Goal';

export async function GET() {
  await dbConnect();
  try {
    const goals = await Goal.find({});
    return NextResponse.json({ success: true, data: goals });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  try {
    const goal = await Goal.create(body);
    return NextResponse.json({ success: true, data: goal }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}