import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-security'

// Smile Identity Web API v2
// Docs: https://docs.usesmileid.com/server-to-server/javascript/products/document-verification

const SMILE_PARTNER_ID = process.env.SMILE_PARTNER_ID || ''
const SMILE_API_KEY = process.env.SMILE_API_KEY || ''
const SMILE_BASE_URL = process.env.SMILE_BASE_URL || 'https://testapi.smileidentity.com/v1'

export async function POST(req: NextRequest) {
  // Require authenticated user to prevent abuse of paid API
  const auth = await requireAuth()
  if (auth.error) return auth.error

  try {
    const body = await req.json()
    const { type, data } = body

    if (!SMILE_PARTNER_ID || !SMILE_API_KEY) {
      return NextResponse.json({ error: 'Smile Identity not configured' }, { status: 500 })
    }

    if (type === 'document_verification') {
      // Step 1: Verify Ghana Card (Document Verification)
      const response = await fetch(`${SMILE_BASE_URL}/doc_verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: SMILE_PARTNER_ID,
          api_key: SMILE_API_KEY,
          timestamp: new Date().toISOString(),
          smile_client_id: data.userId,
          source_sdk: 'rest_api',
          source_sdk_version: '1.0.0',
          country: 'GH',
          id_type: 'GHANA_CARD',
          document_front_image: data.frontImage, // base64
          document_back_image: data.backImage,   // base64
          selfie_image: data.selfieImage,         // base64
        }),
      })
      const result = await response.json()
      return NextResponse.json(result)
    }

    if (type === 'biometric_kyc') {
      // Step 2: Biometric KYC — match selfie to ID
      const response = await fetch(`${SMILE_BASE_URL}/biometric_kyc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: SMILE_PARTNER_ID,
          api_key: SMILE_API_KEY,
          timestamp: new Date().toISOString(),
          smile_client_id: data.userId,
          country: 'GH',
          id_type: 'GHANA_CARD',
          id_number: data.idNumber,
          selfie_image: data.selfieImage, // base64
          dob: data.dob,
          first_name: data.firstName,
          last_name: data.lastName,
        }),
      })
      const result = await response.json()
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err) {
    console.error('Smile Identity error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
