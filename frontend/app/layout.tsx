import 'lxgw-wenkai-screen-webfont/lxgwwenkaigbscreen.css'
import '@/styles/globals.css'
import React from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='zh-CN'>
      <head>
        <title>做饭助手</title>
        <meta name="referrer" content="origin" />
        <meta
          name="description"
          content="基于 RAG 的家常菜谱智能助手"
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className='bg-gray-2 text-gray-10'>
        {children}
      </body>
    </html>
  )
}