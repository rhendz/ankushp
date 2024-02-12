import Link from 'next/link'
import { slug } from 'github-slugger'
interface Props {
  text: string
}

const Tag = ({ text }: Props) => {
  return (
    <Link
      href={`/blog/tags/${slug(text)}`}
      className="mr-3 text-sm font-medium uppercase text-accent hover:text-accent/70"
    >
      {text.split(' ').join('-')}
    </Link>
  )
}

export default Tag
