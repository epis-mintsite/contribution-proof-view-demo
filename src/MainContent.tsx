import { useSearchParams } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { useNftCertificate, createQueryClient } from './api/nftApi'
import { NFTCard, NFTLoading } from './components/NFTComponents'
import { NFTErrorDisplay } from './components/NFTErrorDisplay'
import { memo, useMemo } from 'react'

// QueryClientのインスタンスを作成
const queryClient = createQueryClient()

// NFTコンテンツコンポーネント
const NFTContent = memo(({ requestId }: { requestId: string }) => {
  const {
    data: nft,
    isLoading,
    isError,
    error,
    refetch,
  } = useNftCertificate(requestId)

  // デフォルトNFTオブジェクトをuseMemoで作成し、再レンダリング時に同じ参照を保持
  const defaultNft = useMemo(
    () => ({
      requestId: requestId,
      tokenId: '999',
      title: 'サンプルNFT証明書',
      description:
        'これはサンプルのNFT証明書です。\n実際のデータが取得できない場合に表示されます。\n\n詳細な説明やリンクなどを記載することができます。',
      imageUrl: './placeholder-image.jpg',
      hash: '4c83cc45c3a5a586839f78ea626b5d5011d998c579a1e83d4dc4c0b74f4af2eb',
      expiredAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年後
      createdAt: new Date(),
    }),
    [requestId]
  )

  if (isLoading) {
    return <NFTLoading />
  }

  if (isError && error) {
    return (
      <NFTErrorDisplay
        error={error}
        requestId={requestId}
        onRetry={() => refetch()}
      />
    )
  }

  if (!nft) {
    return <NFTCard nft={defaultNft} />
  }

  return <NFTCard nft={nft} />
})

NFTContent.displayName = 'NFTContent'

// メインコンテンツコンポーネント
const MainContent = () => {
  // クエリパラメータを取得
  const [searchParams] = useSearchParams()
  const requestId = searchParams.get('requestId')

  if (!requestId) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='mx-4 max-w-md rounded-lg border border-[var(--color-credential-border)] bg-white p-8 text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-error)]'>
            <svg
              className='h-8 w-8 text-white'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <h3 className='mb-2 text-lg font-semibold text-[var(--color-credential-primary)]'>
            NFT証明書IDが指定されていません
          </h3>
          <p className='text-[var(--color-text-secondary)]'>
            URLにrequestIdパラメータを指定してください
          </p>
        </div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className='min-h-screen bg-[var(--color-credential-bg)]'>
        {/* ヘッダーセクション */}
        <header className='bg-[var(--color-credential-primary)] py-8 text-white shadow-[var(--shadow-credential-sm)]'>
          <div className='container mx-auto px-4'>
            <h1
              className='text-center text-3xl font-bold md:text-4xl'
              style={{ fontFamily: 'var(--font-family-secondary)' }}
            >
              NFT証明書表示システム
            </h1>
            <p className='mt-2 text-center font-medium text-blue-100'>
              NFT Certificate Verification System
            </p>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className='container mx-auto py-8'>
          <NFTContent requestId={requestId} />
        </main>

        {/* フッター */}
        <footer className='mt-12 border-t border-[var(--color-credential-border)] bg-white py-6'>
          <div className='container mx-auto px-4 text-center'>
            <p className='text-sm text-[var(--color-text-secondary)]'>
              © 2025 Epis Education Centre. NFT証明書システム
            </p>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  )
}

export { MainContent }
