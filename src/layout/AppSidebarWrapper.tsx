"use client";

import dynamic from 'next/dynamic'

const AppSidebar = dynamic(() => import('./AppSidebar'), {
  ssr: false,
  loading: () => <div className="w-[90px] h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800" />
})

export default AppSidebar
