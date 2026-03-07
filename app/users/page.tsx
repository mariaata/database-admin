import { createSupabaseServerClient } from "../../src/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function UsersPage() {
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
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_datetime_utc', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white transition">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl mb-6">
            Error loading users: {error.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Total Users</p>
            <p className="text-3xl font-bold text-white">{profiles?.length || 0}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Superadmins</p>
            <p className="text-3xl font-bold text-purple-400">
              {profiles?.filter(p => p.is_superadmin).length || 0}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Regular Users</p>
            <p className="text-3xl font-bold text-blue-400">
              {profiles?.filter(p => !p.is_superadmin).length || 0}
            </p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Full Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Username</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Superadmin</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {profiles?.map((profile) => (
                  <tr key={profile.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4 text-sm text-white">{profile.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{profile.full_name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{profile.username || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      {profile.is_superadmin ? (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold">
                          Yes
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(profile.created_datetime_utc).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}