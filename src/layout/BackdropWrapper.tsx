"use client";

import dynamic from 'next/dynamic'

const Backdrop = dynamic(() => import('./Backdrop'), {
  ssr: false
})

export default Backdrop
