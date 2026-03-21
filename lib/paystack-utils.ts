/**
 * Paystack Integration & Fee Calculation Utilities
 * Handles: Fee calculations, payment initialization, subaccount management
 */

import crypto from 'crypto'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY
const PAYSTACK_BASE_URL = 'https://api.paystack.co'
const EVERYGIVING_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://everygiving.org'

// ============================================================================
// FEE CALCULATION UTILITIES
// ============================================================================

export function calculateTransactionFeeGHS(amountGHS: number): number {
  if (amountGHS <= 0) return 0
  const percentage = amountGHS * 0.029
  const flatFee = 0.5
  // Always round to 2 decimal places to match GHS currency
  return Number((percentage + flatFee).toFixed(2))
}

/**
 * Calculate transaction fee in pesewas
 * @param amountPesewas - Amount in pesewas (GHS * 100)
 * @returns Fee in pesewas
 */
export function calculateTransactionFeePesewas(amountPesewas: number): number {
  const feeGHS = calculateTransactionFeeGHS(amountPesewas / 100)
  return Math.round(feeGHS * 100)
}

/**
 * Calculate net amount (amount - fee)
 * @param amountPesewas - Amount in pesewas
 * @returns Net amount in pesewas
 */
export function calculateNetAmount(amountPesewas: number): number {
  const fee = calculateTransactionFeePesewas(amountPesewas)
  return amountPesewas - fee
}

/**
 * Format pesewas to GHS string
 * @param pesewas - Amount in pesewas
 * @returns Formatted GHS string (e.g., "100.00")
 */
export function pesewasToGHS(pesewas: number): string {
  return (pesewas / 100).toFixed(2)
}

/**
 * Convert GHS to pesewas
 * @param ghs - Amount in GHS
 * @returns Amount in pesewas
 */
export function ghsToPesewas(ghs: number): number {
  return Math.round(ghs * 100)
}

// ============================================================================
// PAYSTACK INTEGRATION UTILITIES
// ============================================================================

/**
 * Verify Paystack webhook signature
 * @param body - Raw request body
 * @param signature - x-paystack-signature header value
 * @returns boolean - True if signature is valid
 */
export function verifyPaystackSignature(body: string, signature: string): boolean {
  if (!PAYSTACK_SECRET_KEY) {
    console.warn('PAYSTACK_SECRET_KEY not configured')
    return false
  }

  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(body)
    .digest('hex')

  return hash === signature
}

/**
 * Initialize payment on Paystack
 * @param options - Payment initialization options
 * @returns Paystack response with authorization URL
 */
export async function initializePaystackPayment({
  amount,
  tip,
  email,
  subaccountCode,
  reference,
  metadata = {},
}: {
  amount: number // Donation amount in pesewas
  tip?: number // Tip amount in pesewas
  email: string
  subaccountCode?: string
  reference: string
  metadata?: Record<string, any>
}) {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured')
  }

  const donationAmount = amount
  const tipAmount = tip || 0
  const totalAmount = donationAmount + tipAmount
  const processingFee = calculateTransactionFeePesewas(donationAmount)
  const totalChargeToSubaccount = processingFee + tipAmount

  const payload: Record<string, any> = {
    amount: totalAmount,
    email,
    reference,
    metadata: {
      ...metadata,
      platform: 'everygiving',
      amount_paid: donationAmount,
      donor_tip: tipAmount,
      paystack_fee: processingFee,
      net_received: donationAmount - processingFee,
    },
  }

  // Add subaccount and fee bearer if subaccount is provided
    if (subaccountCode) {
    payload.subaccount = subaccountCode
    payload.transaction_charge = totalChargeToSubaccount
    payload.bearer = 'account' // Fundraiser bears the processing fee
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Paystack initialization error:', data)
      throw new Error(`Paystack initialization failed: ${data.message}`)
    }

    return {
      success: true,
      data: data.data,
      accessCode: data.data.access_code,
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
    }
  } catch (error) {
    console.error('Payment initialization error:', error)
    throw error
  }
}

/**
 * Verify payment on Paystack
 * @param reference - Transaction reference
 * @returns Transaction details
 */
export async function verifyPaystackPayment(reference: string) {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured')
  }

  try {
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Payment verification error:', data)
      throw new Error(`Payment verification failed: ${data.message}`)
    }

    return {
      success: true,
      status: data.data.status,
      amount: data.data.amount,
      reference: data.data.reference,
      customer: data.data.customer,
      authorization: data.data.authorization,
      metadata: data.data.metadata,
      paid_at: data.data.paid_at,
    }
  } catch (error) {
    console.error('Verification error:', error)
    throw error
  }
}

// ============================================================================
// SUBACCOUNT MANAGEMENT
// ============================================================================

/**
 * Create Paystack subaccount for fundraiser
 * @param options - Subaccount creation options
 * @returns Subaccount code
 */
export async function createPaystackSubaccount({
  businessName,
  settlementBank,
  accountNumber,
  accountHolder,
  accountCode,
}: {
  businessName: string
  settlementBank: string
  accountNumber: string
  accountHolder: string
  accountCode?: string
}) {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured')
  }

  const payload = {
    business_name: businessName,
    settlement_bank: settlementBank,
    account_number: accountNumber,
    subaccount_type: 'individual',
    ...(accountHolder && { contact_firstname: accountHolder.split(' ')[0] }),
    description: `EveryGiving Fundraiser: ${businessName}`,
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/subaccount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Subaccount creation error:', data)
      throw new Error(`Subaccount creation failed: ${data.message}`)
    }

    return {
      success: true,
      subaccountCode: data.data.subaccount_code,
      subaccountId: data.data.id,
    }
  } catch (error) {
    console.error('Subaccount creation error:', error)
    throw error
  }
}

/**
 * Verify bank account for subaccount creation
 * @param accountNumber - Account number
 * @param bankCode - Bank code
 * @returns Account details
 */
export async function verifyBankAccount(accountNumber: string, bankCode: string) {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured')
  }

  try {
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Bank verification error:', data)
      throw new Error(`Bank verification failed: ${data.message}`)
    }

    return {
      success: true,
      accountName: data.data.account_name,
      accountNumber: data.data.account_number,
    }
  } catch (error) {
    console.error('Bank verification error:', error)
    throw error
  }
}

/**
 * Get list of supported banks
 * @returns List of banks with codes
 */
export async function getSupportedBanks() {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured')
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/bank?country=GH`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`Failed to fetch banks: ${data.message}`)
    }

    return data.data || []
  } catch (error) {
    console.error('Bank listing error:', error)
    throw error
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate unique transaction reference
 * @returns Reference string (e.g., "EVG_1710828000_randomstring")
 */
export function generateTransactionReference(): string {
  const timestamp = Math.floor(Date.now() / 1000)
  const randomPart = crypto.randomBytes(6).toString('hex').toUpperCase()
  return `EVG_${timestamp}_${randomPart}`
}

/**
 * Generate checkout URL for payment
 * @param accessCode - Paystack access code
 * @returns Checkout URL
 */
export function getPaystackCheckoutUrl(accessCode: string): string {
  return `https://checkout.paystack.com/${accessCode}`
}

/**
 * Format amount for display
 * @param pesewas - Amount in pesewas
 * @returns Formatted string (e.g., "GHS 100.00")
 */
export function formatAmount(pesewas: number): string {
  const ghs = (pesewas / 100).toFixed(2)
  return `GHS ${ghs}`
}
