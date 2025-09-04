import { ReactNode } from 'react'

const linkifyText = (text: string): ReactNode[] => {
  if (!text) return []

  // URLを検出する正規表現
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, i) => {
    // 正規表現にマッチする部分（URL）の場合
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-600 hover:text-blue-800 hover:underline'
        >
          {part}
        </a>
      )
    }
    // 通常のテキストの場合
    return part
  })
}

export { linkifyText }
