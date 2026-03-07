import { createSupabaseServerClient } from "../../src/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import ImageActions from "./ImageActions"

export const dynamic = "force-dynamic"

export default async function ImagesPage() {
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
  
  const { data: images, error } = await supabase
    .from('images')
    .select('*, captions(count)')
    .order('created_datetime_utc', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white transition">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-white">Image Management</h1>
          </div>
          <Link 
            href="/images/create"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold"
          >
            + Create Image
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl mb-6">
            Error loading images: {error.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Total Images</p>
            <p className="text-3xl font-bold text-white">{images?.length || 0}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Public Images</p>
            <p className="text-3xl font-bold text-green-400">
              {images?.filter(i => i.is_public).length || 0}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Private Images</p>
            <p className="text-3xl font-bold text-blue-400">
              {images?.filter(i => !i.is_public).length || 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images?.map((image) => (
            <div key={image.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition">
              <div className="aspect-video relative bg-black">
                <img 
                  src={image.url} 
                  alt="Image"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    image.is_public 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {image.is_public ? 'Public' : 'Private'}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {Array.isArray(image.captions) ? image.captions.length : 0} captions
                  </span>
                </div>
                <p className="text-gray-400 text-xs mb-4">
                  Created {new Date(image.created_datetime_utc).toLocaleDateString()}
                </p>
                <ImageActions imageId={image.id} imageUrl={image.url} isPublic={image.is_public} />
              </div>
            </div>
          ))}
        </div>

        {images?.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No images yet</p>
            <Link 
              href="/images/create"
              className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold"
            >
              Create First Image
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}