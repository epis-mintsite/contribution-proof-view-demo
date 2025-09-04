import { useState } from 'react'
import { fileDataType } from '../types/NftDataTypes'
import FilePreviewModal from './FilePreviewModal'

interface FileListProps {
  files: fileDataType[]
}

const FileList = (props: FileListProps) => {
  const [files, _] = useState<fileDataType[]>(props.files)
  const [previewFile, setPreviewFile] = useState<fileDataType | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const getFileIcon = (fileType: string) => {
    if (fileType === 'image') {
      return '🖼️'
    } else if (fileType === 'pdf') {
      return '📄'
    }
    return '📎'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileClick = (file: fileDataType) => {
    setPreviewFile(file)
    setIsPreviewOpen(true)
  }

  const handleClosePreview = () => {
    setIsPreviewOpen(false)
    setPreviewFile(null)
  }

  if (files.length === 0) {
    return (
      <div className={`p-4`}>
        <p className='text-sm text-gray-500'>ファイル添付はありません</p>
      </div>
    )
  }

  return (
    <>
      <h4 className='mb-3 text-sm font-medium text-gray-700'>
        ファイル添付一覧
      </h4>
      <div className='space-y-2'>
        {files.map((file, index) => (
          <div
            key={index}
            className='flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100'
          >
            <div className='flex flex-1 items-center space-x-3'>
              <div
                className='flex flex-1 cursor-pointer items-center space-x-3 rounded p-2 transition-colors hover:bg-gray-200'
                onClick={() => handleFileClick(file)}
              >
                <span className='text-lg'>{getFileIcon(file.fileType)}</span>
                <div>
                  <p className='text-sm font-medium text-gray-900'>
                    {file.fileName}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {file.fileType.toUpperCase()} •{' '}
                    {formatFileSize(file.fileSize)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ファイルプレビューモーダル */}
      <FilePreviewModal
        file={previewFile}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
      />
    </>
  )
}

export default FileList
