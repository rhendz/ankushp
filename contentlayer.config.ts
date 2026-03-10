import { defineDocumentType, ComputedFields, makeSource } from 'contentlayer2/source-files'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs'
import readingTime from 'reading-time'
import GithubSlugger from 'github-slugger'
import path from 'path'
// Remark packages
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import {
  remarkExtractFrontmatter,
  remarkCodeTitles,
  remarkImgToJsx,
  extractTocHeadings,
} from 'pliny/mdx-plugins/index.js'
// Rehype packages
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'
import rehypeCitation from 'rehype-citation'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypePresetMinify from 'rehype-preset-minify'
import siteMetadata from './data/siteMetadata'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer.js'

const root = process.cwd()
const isProduction = process.env.NODE_ENV === 'production'

const computedFields: ComputedFields = {
  readingTime: { type: 'json', resolve: (doc) => readingTime(doc.body.raw) },
  slug: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath.replace(/^.+?(\/)/, ''),
  },
  path: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath,
  },
  filePath: {
    type: 'string',
    resolve: (doc) => doc._raw.sourceFilePath,
  },
  toc: { type: 'string', resolve: (doc) => extractTocHeadings(doc.body.raw) },
}

/**
 * Count the occurrences of all tags across blog posts and write to json file
 */
function createTagCount(allBlogs) {
  const tagCount: Record<string, number> = {}
  allBlogs.forEach((file) => {
    if (file.tags && (!isProduction || file.draft !== true)) {
      file.tags.forEach((tag) => {
        const formattedTag = GithubSlugger.slug(tag)
        if (formattedTag in tagCount) {
          tagCount[formattedTag] += 1
        } else {
          tagCount[formattedTag] = 1
        }
      })
    }
  })
  writeFileSync('./app/blog/tag-data.json', JSON.stringify(tagCount))
}

function createSearchIndex(allBlogs) {
  if (
    siteMetadata?.search?.provider === 'kbar' &&
    siteMetadata.search.kbarConfig.searchDocumentsPath
  ) {
    writeFileSync(
      `public/${siteMetadata.search.kbarConfig.searchDocumentsPath}`,
      JSON.stringify(allCoreContent(sortPosts(allBlogs)))
    )
    console.log('Local search index generated...')
  }
}

function patchGeneratedJsonImports(dir = path.join(root, '.contentlayer/generated')) {
  const singleQuoteJsonAssertion = /assert\s*\{\s*type:\s*'json'\s*\}/g
  const doubleQuoteJsonAssertion = /assert\s*\{\s*type:\s*"json"\s*\}/g

  try {
    for (const name of readdirSync(dir)) {
      const fullPath = path.join(dir, name)
      const entry = statSync(fullPath)

      if (entry.isDirectory()) {
        patchGeneratedJsonImports(fullPath)
        continue
      }

      if (!entry.isFile() || !fullPath.endsWith('.mjs')) {
        continue
      }

      const source = readFileSync(fullPath, 'utf8')
      if (
        !singleQuoteJsonAssertion.test(source) &&
        !doubleQuoteJsonAssertion.test(source)
      ) {
        continue
      }

      const patchedSource = source
        .replace(singleQuoteJsonAssertion, "with { type: 'json' }")
        .replace(doubleQuoteJsonAssertion, 'with { type: "json" }')

      writeFileSync(fullPath, patchedSource, 'utf8')
    }
  } catch {
    // Contentlayer may not have generated files yet on initial startup.
  }
}

export const Blog = defineDocumentType(() => ({
  name: 'Blog',
  filePathPattern: 'blog/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    lastmod: { type: 'date' },
    draft: { type: 'boolean' },
    summary: { type: 'string' },
    images: { type: 'json' },
    authors: { type: 'list', of: { type: 'string' } },
    layout: { type: 'string' },
    bibliography: { type: 'string' },
    canonicalUrl: { type: 'string' },
  },
  computedFields: {
    ...computedFields,
    structuredData: {
      type: 'json',
      resolve: (doc) => ({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: doc.title,
        datePublished: doc.date,
        dateModified: doc.lastmod || doc.date,
        description: doc.summary,
        image: doc.images ? doc.images[0] : siteMetadata.socialBanner,
        url: `${siteMetadata.siteUrl}/${doc._raw.flattenedPath}`,
      }),
    },
  },
}))

export const Authors = defineDocumentType(() => ({
  name: 'Authors',
  filePathPattern: 'authors/**/*.mdx',
  contentType: 'mdx',
  fields: {
    name: { type: 'string', required: true },
    avatar: { type: 'string' },
    occupation: { type: 'string' },
    company: { type: 'string' },
    email: { type: 'string' },
    twitter: { type: 'string' },
    linkedin: { type: 'string' },
    github: { type: 'string' },
    layout: { type: 'string' },
  },
  computedFields,
}))

const remarkPlugins = [
  remarkExtractFrontmatter,
  remarkGfm,
  remarkCodeTitles,
  remarkMath,
  remarkImgToJsx,
] as any[]

const rehypePlugins = [
  rehypeSlug,
  rehypeAutolinkHeadings,
  rehypeKatex,
  [rehypeCitation, { path: path.join(root, 'data') }],
  [rehypePrismPlus, { defaultLanguage: 'js', ignoreMissing: true }],
  rehypePresetMinify,
] as any[]

export default makeSource({
  contentDirPath: 'data',
  documentTypes: [Blog, Authors],
  mdx: {
    cwd: process.cwd(),
    remarkPlugins,
    rehypePlugins,
  },
  onSuccess: async (importData) => {
    patchGeneratedJsonImports()
    const { allBlogs } = await importData()
    createTagCount(allBlogs)
    createSearchIndex(allBlogs)
  },
})
