interface CaptionProps {
  children: React.ReactNode // The content (e.g., an image or chart)
  caption: string // The caption text
}

const Caption = ({ children, caption }: CaptionProps): JSX.Element => {
  return (
    <figure className="flex flex-col">
      <div className="w-full">{children}</div>
      <figcaption className="w-fit self-center rounded-md bg-accent/10 p-2 text-center font-sans text-sm italic shadow-md">
        {caption}
      </figcaption>
    </figure>
  )
}

export default Caption
