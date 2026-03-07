"use client"
import { createSupabaseBrowserClient } from "../../src/lib/supabase/client"
import { useState } from "react"

export default function LoginPage() {
  const [error, setError] = useState("")
  const supabase = createSupabaseBrowserClient()

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
      <div className="bg-white/10 backdrop-blur-lg p-10 rounded-3xl border border-white/20 max-w-md w-full shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">🔧</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-300">Database Management System</p>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-400 text-red-200 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        <button
          onClick={signInWithGoogle}
          className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all text-lg shadow-lg hover:scale-105"
        >
          Sign in with Google
        </button>
        
        <p className="text-gray-400 text-sm text-center mt-6">
          ⚠️ Superadmin access required
        </p>
      </div>
    </div>
  )
}