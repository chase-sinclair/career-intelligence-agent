'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function ProjectSlugPage() {
  const router = useRouter()
  const params = useParams<{ slug: string }>()

  useEffect(() => {
    router.replace(`/projects?open=${params.slug}`)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <div style={{ position: 'fixed', inset: 0, background: '#121315' }} />
}