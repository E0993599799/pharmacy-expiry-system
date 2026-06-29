import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const text = await performOCR(image)

    return NextResponse.json({ text })
  } catch (error) {
    console.error('OCR error:', error)
    return NextResponse.json(
      { error: 'OCR processing failed' },
      { status: 500 }
    )
  }
}

async function performOCR(imageData: string): Promise<string> {
  try {
    // For Phase 2 MVP: Use Tesseract.js (browser-side) or real OCR service
    // Option 1: Call Google Vision API (requires API key)
    // Option 2: Call AWS Textract (requires AWS credentials)
    // Option 3: Use Tesseract.js locally (bundled in frontend)

    // Mock OCR response - in production, integrate real OCR service
    const mockOCRText = extractTextFromImage(imageData)
    return mockOCRText
  } catch (error) {
    console.error('OCR error:', error)
    throw error
  }
}

function extractTextFromImage(imageData: string): string {
  // Mock extraction patterns for pharmacy labels
  // In production, use Tesseract.js or call cloud OCR service

  const mockPatterns = [
    'ยา แอมโมซิลลิน 500mg',
    'LOT: 2025-ABC-001',
    'EXP: 26/12/2025',
    'QTY: 50 tablets',
    'Manufacturer: Thai Pharma Co., Ltd.',
  ]

  return mockPatterns.join('\n')
}
