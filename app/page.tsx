import React from 'react'
import Dashboard from '../components/Dashboard'
import '../styles/globals.css'

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <Dashboard />
      </div>
    </main>
  )
}
