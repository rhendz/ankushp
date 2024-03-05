'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image' // Import the Image component from Next.js
import { useTheme } from 'next-themes' // Import the useTheme hook from next-themes

const ThemedImage = ({ src, alt, width, height }) => {
  const { resolvedTheme } = useTheme() // Get the resolved theme using the useTheme hook
  const [imagePath, setImagePath] = useState(null) // State to hold the image path

  // Build the dark image path by appending "-dark" to the base filename
  const darkSrc =
    src && /(\.svg|\.png|\.jpg|\.jpeg)$/i.test(src) ? src.replace(/(\.\w+)$/i, '-dark$1') : null

  // Determine the image source based on the resolved theme
  useEffect(() => {
    setImagePath(resolvedTheme === 'dark' && darkSrc ? darkSrc : src)
  }, [resolvedTheme, darkSrc, src])

  // Render null if the image path is not available yet
  if (!imagePath) {
    return null
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      {/* Use the Next.js Image component */}
      <Image src={imagePath} alt={alt} width={width} height={height} />
    </div>
  )
}

export default ThemedImage
