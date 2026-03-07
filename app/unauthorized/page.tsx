import { createSupabaseServerClient } from "../../src/lib/supabase/server"

export default async function UnauthorizedPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-gray-900 to-black p-6">
      <div className="max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-32 h-32 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-red-500">
            <span className="text-6xl">🚫</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Superadmin Permission Required</h1>
        </div>

        {user?.email && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-6">
            <p className="text-gray-300 text-lg mb-4">
              Signed in as <span className="font-bold text-white">{user.email}</span>, 
              but this account is not marked as superadmin.
            </p>
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-6">
              <p className="text-yellow-200 font-semibold mb-3">To gain access:</p>
              <ol className="text-gray-300 space-y-2 list-decimal list-inside">
                <li>Go to your Supabase Dashboard → SQL Editor</li>
                <li>Run this query:</li>
              </ol>
              <div className="bg-black/50 rounded-lg p-4 mt-4 mb-4 font-mono text-sm text-green-400 overflow-x-auto">
                UPDATE profiles<br/>
                SET is_superadmin = TRUE<br/>
                WHERE id = '{user.id}';
              </div>
              <ol start={3} className="text-gray-300 space-y-2 list-decimal list-inside">
                <li>Sign out and sign in again</li>
              </ol>
            </div>
          </div>
        )}

        <div className="text-center">
          <a 
            href="/login"
            className="inline-block px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition border border-white/20"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  )
}