"use client";

import dynamic from 'next/dynamic'

const AppHeader = dynamic(() => import('./AppHeader'), {
  ssr: false,
  loading: () => <div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800" />
})

export default AppHeader
