import type { Metadata } from 'next'

type PageProps = {
  params: Promise<{ [key: string]: string | string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
}

export default async function Page({ params, searchParams }: PageProps) {
  // Await the promises
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  // Helper to handle string | string[] | undefined
  const getParam = (param: string | string[] | undefined): string | undefined => {
    return Array.isArray(param) ? param[0] : param
  }

  return <div>{/* Your page content */}</div>
}
