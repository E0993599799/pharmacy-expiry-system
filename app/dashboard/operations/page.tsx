'use client'

import Link from 'next/link'

const PAGE_SIZE = 25
const MAX_PAGE_SIZE = 50

const flows = [
  {
    title: 'Stock import',
    body: 'Import PDF/image stock evidence, then reconcile uncertain matches before verified Lot/EXP is accepted.',
    href: '/dashboard/expiry-records/pdf-upload',
    action: 'Open import',
  },
  {
    title: 'Expiry review',
    body: 'Review captured Lot/EXP evidence. Ambiguous OCR remains manual-review only and cannot auto-verify.',
    href: '/dashboard/expiry-records',
    action: 'Review expiry',
  },
  {
    title: 'Patient & dispense',
    body: 'FEFO/dispensing workflow is governed by immutable approval, idempotency, optimistic versioning, and store isolation.',
    href: '/dashboard',
    action: 'Open workspace',
  },
  {
    title: 'Required documents',
    body: 'KHY12 document required before completion. Missing required evidence must fail closed.',
    href: '/dashboard',
    action: 'Open documents',
  },
  {
    title: 'Arabic label',
    body: 'Only verified/versioned phrase content may become final output. AI/free-form Arabic cannot be final-printed.',
    href: '/dashboard',
    action: 'Open label review',
  },
]

export default function OperationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-red-700">Production operations</p>
          <h2 className="text-3xl font-bold text-gray-900">Pharmacy Operations</h2>
          <p className="mt-2 max-w-3xl text-gray-600">
            Verified operational entry points for stock/expiry, dispensing, required documents, and label review.
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
          Drug search: PAGE_SIZE = 25, max 50
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {flows.map((flow) => (
          <section key={flow.title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">{flow.title}</h3>
            <p className="mt-2 min-h-20 text-sm leading-6 text-gray-600">{flow.body}</p>
            <Link href={flow.href} className="mt-4 inline-flex rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black">
              {flow.action}
            </Link>
          </section>
        ))}
      </div>

      <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
        <h3 className="font-semibold text-amber-950">Production guard</h3>
        <div className="mt-2 space-y-1 text-sm text-amber-900">
          <p>Rx approval required before final print.</p>
          <p>KHY12 document required before completion.</p>
          <p>AI/free-form Arabic cannot be final-printed.</p>
          <p>Duplicate requests must reuse an idempotency key; stale clients must reload before mutation.</p>
          <p>Bounded drug search only: PAGE_SIZE = {PAGE_SIZE}; server maximum = {MAX_PAGE_SIZE}.</p>
        </div>
      </section>
    </div>
  )
}
