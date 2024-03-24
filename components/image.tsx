import React from 'react'
import NextImage, { ImageProps } from 'next/image'

const Image = ({ ...rest }: ImageProps) => <NextImage {...rest} />

export const FormattedImage = ({ children, formatStyle }) => {
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

  return <div style={mergedStyles}>{formattedImages}</div>
}

export default Image
