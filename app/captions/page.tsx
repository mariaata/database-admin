import { createSupabaseServerClient } from "../../src/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function CaptionsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_superadmin) {
    redirect('/unauthorized')
  }
  
  const { data: captions, error } = await supabase
    .from('captions')
    .select('*, images(url), profiles(email)')
    .order('created_datetime_utc', { ascending: false })
    .limit(100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white transition">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-white">Caption Viewer</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl mb-6">
            Error loading captions: {error.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Total Captions</p>
            <p className="text-3xl font-bold text-white">{captions?.length || 0}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Avg Vote Count</p>
            <p className="text-3xl font-bold text-green-400">
              {captions?.length 
                ? (captions.reduce((sum, c) => sum + (c.vote_count || 0), 0) / captions.length).toFixed(1)
                : 0
              }
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Top Vote Count</p>
            <p className="text-3xl font-bold text-purple-400">
              {Math.max(...(captions?.map(c => c.vote_count || 0) || [0]))}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {captions?.map((caption) => (
            <div key={caption.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition">
              {caption.images?.url && (
                <div className="aspect-video relative bg-black">
                  <img 
                    src={caption.images.url} 
                    alt="Caption image"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="p-4">
                <p className="text-white mb-3 leading-relaxed">"{caption.content}"</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-400 font-semibold">
                    {caption.vote_count || 0} votes
                  </span>
                  <span className="text-gray-500 text-xs">
                    {new Date(caption.created_datetime_utc).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {captions?.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No captions yet</p>
          </div>
        )}
      </div>
    </div>
  )
}