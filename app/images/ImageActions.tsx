"use client"
import { createSupabaseBrowserClient } from "../../src/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface ImageActionsProps {
  imageId: string
  imageUrl: string
  isPublic: boolean
}

export default function ImageActions({ imageId, imageUrl, isPublic }: ImageActionsProps) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) return

    setIsDeleting(true)
    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId)

    if (error) {
      alert(`Error: ${error.message}`)
    } else {
      router.refresh()
    }
    setIsDeleting(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="w-full px-3 py-2 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 text-gray-400 hover:text-red-400 text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      <span className="text-lg">🗑️</span>
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  )
}