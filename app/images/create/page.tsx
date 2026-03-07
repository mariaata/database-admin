"use client"
import { createSupabaseBrowserClient } from "../../../src/lib/supabase/client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function CreateImagePage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const [url, setUrl] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("Not authenticated")
      setIsSubmitting(false)
      return
    }

    const { error: insertError } = await supabase
      .from('images')
      .insert({
        url,
        is_public: isPublic,
        profile_id: user.id,
        created_datetime_utc: new Date().toISOString()
      })

    if (insertError) {
      setError(insertError.message)
      setIsSubmitting(false)
    } else {
      router.push('/images')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/images" className="text-gray-400 hover:text-white transition">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-white">Create New Image</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="text-white">Make image public</span>
            </label>
          </div>

          {url && (
            <div className="mb-6">
              <p className="text-white font-semibold mb-2">Preview:</p>
              <div className="bg-black rounded-lg overflow-hidden">
                <img src={url} alt="Preview" className="w-full h-64 object-contain" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Image'}
          </button>
        </form>
      </div>
    </div>
  )
}