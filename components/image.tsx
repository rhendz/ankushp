import React from 'react'
import NextImage, { ImageProps } from 'next/image'

const Image = ({ ...rest }: ImageProps) => <NextImage {...rest} />

interface FormattedImageProps {
  children: React.ReactNode
  caption?: string
  formatStyle?: React.CSSProperties
}

export const FormattedImage = ({ children, caption, formatStyle }) => {
  const defaultStyle: React.CSSProperties = {
    margin: '32px auto',
    boxSizing: 'content-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '8px',
  }

  // Merge default styles with provided styles
  const mergedStyles: React.CSSProperties = formatStyle
    ? { ...defaultStyle, ...formatStyle }
    : defaultStyle

  // Clones original images and applies formmatting to them, merging them with original class props
  const formattedImages = React.Children.map(children, (child) => {
    return React.cloneElement(child, {
      className: `${child.props.className} rounded-lg shadow-lg shadow-secondary/20`,
    })
  })

  return (
    <div className="flex-1 flex-col items-center justify-center py-8">
      <div style={mergedStyles}>{formattedImages}</div>
      <p className="text-center">{caption && <span className="italic">{caption}</span>}</p>
    </div>
  )
}

export default Image
