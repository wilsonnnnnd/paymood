import React from 'react'
import AdSenseSlot from '../components/AdSenseSlot'
import Dashboard from '../components/Dashboard'

export default function Page() {
  return (
    <main className="app-shell app-shell--with-ads">
      <AdSenseSlot placement="side" />
      <Dashboard />
      <AdSenseSlot placement="side" />
    </main>
  )
}
