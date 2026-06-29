import { differenceInDays } from 'date-fns'
import { RiskLevel } from '@/lib/types'

export function calculateRiskLevel(expiryDate: string): RiskLevel {
  const today = new Date()
  const expiry = new Date(expiryDate)
  const daysUntilExpiry = differenceInDays(expiry, today)

  if (daysUntilExpiry < 0) {
    return 'expired'
  }
  if (daysUntilExpiry <= 30) {
    return 'critical'
  }
  if (daysUntilExpiry <= 60) {
    return 'high'
  }
  if (daysUntilExpiry <= 90) {
    return 'medium'
  }
  return 'normal'
}

export function getRiskColor(risk: RiskLevel): string {
  switch (risk) {
    case 'expired':
      return 'bg-red-900 text-white'
    case 'critical':
      return 'bg-red-500 text-white'
    case 'high':
      return 'bg-orange-500 text-white'
    case 'medium':
      return 'bg-yellow-500 text-white'
    case 'normal':
      return 'bg-green-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

export function getRiskLabel(risk: RiskLevel, locale: 'th' | 'en' = 'th'): string {
  const labels = {
    th: {
      expired: 'หมดอายุแล้ว',
      critical: 'เร่งด่วน (≤30 วัน)',
      high: 'สูง (31-60 วัน)',
      medium: 'ปกติ (61-90 วัน)',
      normal: 'ปลอดภัย (>90 วัน)',
    },
    en: {
      expired: 'Expired',
      critical: 'Critical (≤30 days)',
      high: 'High (31-60 days)',
      medium: 'Medium (61-90 days)',
      normal: 'Normal (>90 days)',
    },
  }
  return labels[locale][risk]
}
