import { fileDataType } from '../types/NftDataTypes'
import { useState, useEffect } from 'react'

interface FilePreviewModalProps {
  file: fileDataType | null
  isOpen: boolean
  onClose: () => void
}

const FilePreviewModal = ({ file, isOpen, onClose }: FilePreviewModalProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // モバイルデバイスかどうかを判定
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isIOS = /iphone|ipad|ipod/.test(userAgent)
      const isAndroid = /android/.test(userAgent)
      setIsMobile(isIOS || isAndroid)
    }

    checkMobile()
  }, [])

  // PDFファイルの場合、Blob URLを作成
  useEffect(() => {
    if (file && file.fileType === 'pdf') {
      try {
        // base64をBlobに変換
        const byteCharacters = atob(file.fileData)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        setPdfUrl(url)

        // クリーンアップ関数
        return () => {
          URL.revokeObjectURL(url)
        }
      } catch (error) {
        console.error('PDF URL creation failed:', error)
      }
    }
  }, [file])

  // コンポーネントがアンマウントされる際にBlob URLをクリーンアップ
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [pdfUrl])

  const handleDownloadPdf = () => {
    if (pdfUrl) {
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = file?.fileName || 'document.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleOpenPdfInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank')
    }
  }

  if (!isOpen || !file) return null

  const renderPdfContent = () => {
    if (isMobile) {
      // モバイルデバイスではダウンロードリンクと新しいタブで開くオプションを表示
      return (
        <div className='flex flex-col items-center justify-center space-y-4 p-8'>
          <div className='text-center'>
            <div className='mb-4 text-6xl'>📄</div>
            <h3 className='mb-2 text-lg font-semibold text-gray-900'>
              {file.fileName}
            </h3>
            <p className='mb-6 text-sm text-gray-500'>
              PDFファイル • {(file.fileSize / 1024 / 1024).toFixed(2)} MB
            </p>
            <p className='mb-6 text-sm text-gray-600'>
              モバイルデバイスではPDFの直接表示が制限されています。
            </p>
          </div>

          <div className='flex w-full max-w-sm flex-col space-y-3'>
            <button
              onClick={handleOpenPdfInNewTab}
              className='flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700'
            >
              <svg
                className='h-5 w-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                />
              </svg>
              <span>新しいタブで開く</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className='flex w-full items-center justify-center space-x-2 rounded-lg bg-green-600 px-4 py-3 text-white transition-colors hover:bg-green-700'
            >
              <svg
                className='h-5 w-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
              <span>ダウンロード</span>
            </button>
          </div>
        </div>
      )
    } else {
      // PCでは従来のiframeを使用
      return (
        <div className='flex justify-center'>
          <iframe
            src={`data:application/pdf;base64,${file.fileData}`}
            title={file.fileName}
            className='h-[70vh] w-full rounded-lg border border-gray-200'
            style={{ minHeight: '70vh' }}
          />
        </div>
      )
    }
  }

  return (
    <div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
      <div className='relative mx-4 w-full max-w-6xl rounded-lg bg-white shadow-xl'>
        {/* ヘッダー */}
        <div className='flex items-center justify-between border-b border-gray-200 px-6 py-4'>
          <div className='flex items-center space-x-3'>
            <span className='text-lg'>
              {file.fileType === 'image' ? '🖼️' : '📄'}
            </span>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>
                {file.fileName}
              </h3>
              <p className='text-sm text-gray-500'>
                {file.fileType.toUpperCase()} •{' '}
                {(file.fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <button
              onClick={onClose}
              className='rounded-md bg-gray-100 p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none'
            >
              <svg
                className='h-5 w-5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className='max-h-[80vh] overflow-auto p-6'>
          {file.fileType === 'image' ? (
            <div className='flex justify-center'>
              <img
                src={`data:image/jpeg;base64,${file.fileData}`}
                alt={file.fileName}
                className='max-h-full max-w-full rounded-lg object-contain'
                style={{ maxHeight: '70vh' }}
              />
            </div>
          ) : (
            renderPdfContent()
          )}
        </div>
      </div>
    </div>
  )
}

export default FilePreviewModal
