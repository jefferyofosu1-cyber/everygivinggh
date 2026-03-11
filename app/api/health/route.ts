import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: 'everygivinggh',
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  )
}
