import { createSupabaseServerClient } from "../src/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import StatsCharts from "./components/StatsCharts"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
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

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: totalImages } = await supabase
    .from('images')
    .select('*', { count: 'exact', head: true })

  const { count: totalCaptions } = await supabase
    .from('captions')
    .select('*', { count: 'exact', head: true })

  const { count: totalVotes } = await supabase
    .from('caption_votes')
    .select('*', { count: 'exact', head: true })

  const { data: voteData } = await supabase
    .from('caption_votes')
    .select('vote_value')

  const upvotes = voteData?.filter(v => v.vote_value === 1).length || 0
  const downvotes = voteData?.filter(v => v.vote_value === -1).length || 0

  const { data: recentImages } = await supabase
    .from('images')
    .select('url, created_datetime_utc')
    .order('created_datetime_utc', { ascending: false })
    .limit(5)

  const { data: imagesOverTime } = await supabase
    .from('images')
    .select('created_datetime_utc')
    .gte('created_datetime_utc', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_datetime_utc', { ascending: true })

  const engagementRate = totalCaptions && totalVotes 
    ? ((totalVotes / totalCaptions) * 100).toFixed(1)
    : 0

  const { data: captionsPerImage } = await supabase
    .from('images')
    .select('id, captions(count)')
    .limit(100)

  const captionCounts = captionsPerImage?.map(img => 
    Array.isArray(img.captions) ? img.captions.length : 0
  ) || []

  const avgCaptionsPerImage = captionCounts.length > 0 
    ? (captionCounts.reduce((a, b) => a + b, 0) / captionCounts.length).toFixed(1)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🔧</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-300 text-sm font-semibold">Total Users</p>
              <span className="text-3xl">👥</span>
            </div>
            <p className="text-4xl font-bold text-white">{totalUsers || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-purple-300 text-sm font-semibold">Total Images</p>
              <span className="text-3xl">🖼️</span>
            </div>
            <p className="text-4xl font-bold text-white">{totalImages || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-green-300 text-sm font-semibold">Total Captions</p>
              <span className="text-3xl">💬</span>
            </div>
            <p className="text-4xl font-bold text-white">{totalCaptions || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-sm border border-pink-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-pink-300 text-sm font-semibold">Total Votes</p>
              <span className="text-3xl">⭐</span>
            </div>
            <p className="text-4xl font-bold text-white">{totalVotes || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Engagement Rate</p>
            <p className="text-3xl font-bold text-yellow-400">{engagementRate}%</p>
            <p className="text-gray-500 text-xs mt-2">Votes per caption</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Avg Captions/Image</p>
            <p className="text-3xl font-bold text-cyan-400">{avgCaptionsPerImage}</p>
            <p className="text-gray-500 text-xs mt-2">Per image ratio</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Vote Ratio</p>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-2xl font-bold text-green-400">{upvotes}</p>
                <p className="text-xs text-gray-500">👍 Upvotes</p>
              </div>
              <div className="text-gray-600">vs</div>
              <div>
                <p className="text-2xl font-bold text-red-400">{downvotes}</p>
                <p className="text-xs text-gray-500">👎 Downvotes</p>
              </div>
            </div>
          </div>
        </div>

        <StatsCharts 
          upvotes={upvotes}
          downvotes={downvotes}
          imagesOverTime={imagesOverTime || []}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/users" className="group">
            <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-all hover:scale-105 hover:border-blue-500/50">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-white mb-2">Manage Users</h3>
              <p className="text-gray-400">View and manage user profiles</p>
            </div>
          </Link>

          <Link href="/images" className="group">
            <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-all hover:scale-105 hover:border-purple-500/50">
              <div className="text-4xl mb-4">🖼️</div>
              <h3 className="text-xl font-bold text-white mb-2">Manage Images</h3>
              <p className="text-gray-400">Create, edit, and delete images</p>
            </div>
          </Link>

          <Link href="/captions" className="group">
            <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-all hover:scale-105 hover:border-green-500/50">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-white mb-2">View Captions</h3>
              <p className="text-gray-400">Browse all generated captions</p>
            </div>
          </Link>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📸</span> Recent Images
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {recentImages?.map((image, i) => (
              <div key={i} className="group relative aspect-square rounded-xl overflow-hidden bg-black border border-white/10 hover:border-white/30 transition">
                <img 
                  src={image.url} 
                  alt="Recent" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                  <p className="text-gray-300 text-xs">
                    {new Date(image.created_datetime_utc).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}