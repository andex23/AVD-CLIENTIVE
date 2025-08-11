'use client'

import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Eye, XCircle } from 'lucide-react'

/**
 * PreviewBanner
 * - Shows a small banner when /dashboard?preview=1 is active.
 * - Clicking "Exit preview" removes the preview flag.
 */
export function PreviewBanner() {
  const params = useSearchParams()
  const router = useRouter()

  const isPreview = useMemo(() => params.get('preview') === '1', [params])

  if (!isPreview) return null

  return (
    <div className="sticky top-0 z-40 w-full border-b bg-amber-50 text-amber-900">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <p className="text-xs sm:text-sm">
            Preview Mode is active. Auth checks are skipped for easier testing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => router.replace('/dashboard')}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Exit preview
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PreviewBanner
