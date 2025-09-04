import { useState, useEffect, SyntheticEvent } from 'react'
import { cn } from '../utils/cn'
import FileList from './FileList'
import { linkifyText } from '../utils/linkifyText'
import { NftDataType } from '../types/NftDataTypes'
import { verifyNftHash } from '../utils/hashVerification'

// 共通のスタイル定義（デザインシステム準拠）
const credentialCardStyles =
  'bg-white border border-[var(--color-credential-border)] rounded-xl p-8 m-4 shadow-[var(--shadow-credential-lg)]'
const messageStyles =
  'm-4 flex h-32 justify-center items-center border-2 border-[var(--color-credential-border)] p-6 text-xl lg:text-3xl rounded-xl bg-white font-[var(--font-family-primary)] shadow-sm'

// 画像モーダルコンポーネント
const ImageModal = ({
  isOpen,
  onClose,
  imageUrl,
  title,
}: {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  title: string
}) => {
  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden' // スクロールを無効化
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'auto' // スクロールを復元
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='relative max-h-[90vh] max-w-[90vw] p-4'
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className='absolute -top-2 -right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-gray-100'
          aria-label='モーダルを閉じる'
        >
          <svg
            className='h-6 w-6 text-gray-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>

        {/* 画像 */}
        <div className='overflow-hidden rounded-xl shadow-2xl'>
          <img
            src={imageUrl}
            alt={title}
            className='max-h-[85vh] max-w-full object-contain'
            onError={(e) => {
              const target = e.currentTarget
              // すでにプレースホルダーを表示している場合は再実行を防ぐ
              if (target.src.includes('placeholder-image.jpg')) {
                return
              }
              target.src = './placeholder-image.jpg'
              target.alt = 'Image not available'
            }}
          />
        </div>

        {/* 画像タイトル */}
        <div className='mt-4 text-center'>
          <h3 className='text-lg font-bold text-white drop-shadow-lg'>
            {title}
          </h3>
          <p className='text-sm text-gray-300 drop-shadow'>
            クリックまたはESCキーで閉じる
          </p>
        </div>
      </div>
    </div>
  )
}

// フォールバックコンポーネント
export const NFTFallback = ({
  message = 'NFT証明書の読み込みに失敗しました。',
}: {
  message?: string
}) => <div className={messageStyles}>{message}</div>

// ローディングコンポーネント
export const NFTLoading = () => (
  <div className='flex min-h-[500px] items-center justify-center'>
    <div className='mx-4 max-w-lg rounded-xl border border-[var(--color-credential-border)] bg-white p-12 text-center shadow-xl'>
      <div className='relative mx-auto mb-8 h-20 w-20'>
        <div className='absolute inset-0 animate-spin rounded-full border-4 border-[var(--color-credential-primary)] border-t-transparent'></div>
        <div className='absolute inset-2 animate-pulse rounded-full bg-gradient-to-r from-blue-50 to-indigo-50'></div>
      </div>
      <h3 className='mb-3 text-2xl font-black text-[var(--color-credential-primary)]'>
        NFT証明書を読み込み中
      </h3>
      <p className='text-lg font-medium text-[var(--color-text-secondary)]'>
        しばらくお待ちください...
      </p>
      <div className='mt-6 flex justify-center gap-1'>
        <div className='h-2 w-2 animate-bounce rounded-full bg-[var(--color-credential-primary)] [animation-delay:-0.3s]'></div>
        <div className='h-2 w-2 animate-bounce rounded-full bg-[var(--color-credential-primary)] [animation-delay:-0.15s]'></div>
        <div className='h-2 w-2 animate-bounce rounded-full bg-[var(--color-credential-primary)]'></div>
      </div>
    </div>
  </div>
)

// NFTカードコンポーネント
export const NFTCard = ({ nft }: { nft: NftDataType }) => {
  // 期限切れかどうかを判定
  const isExpired = nft.expiredAt && new Date() > new Date(nft.expiredAt)

  // 画像モーダルの状態管理
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  // 画像読み込みエラーの状態管理
  const [imageError, setImageError] = useState(false)

  // ハッシュ検証の状態管理
  const [hashVerification, setHashVerification] = useState<{
    isLoading: boolean
    isValid: boolean | null
    calculatedHash: string
    error?: string
  }>({
    isLoading: true,
    isValid: null,
    calculatedHash: '',
  })

  // コンポーネントマウント時にハッシュ検証を実行
  useEffect(() => {
    const performHashVerification = async () => {
      try {
        const result = await verifyNftHash(
          {
            title: nft.title,
            description: nft.description,
            imageUrl: nft.imageUrl,
            files: nft.files,
          },
          nft.hash
        )
        setHashVerification({
          isLoading: false,
          isValid: result.isValid,
          //isValid: true,
          calculatedHash: result.calculatedHash,
          //error: result.error,
          error: undefined,
        })
      } catch (error) {
        setHashVerification({
          isLoading: false,
          isValid: false,
          calculatedHash: '',
          error:
            error instanceof Error ? error.message : 'Hash verification failed',
        })
      }
    }

    performHashVerification()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nft.requestId, nft.title, nft.description, nft.imageUrl, nft.hash])

  // 画像エラーハンドラー
  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget
    // すでにプレースホルダーを表示している場合は再実行を防ぐ
    if (target.src.includes('placeholder-image.jpg') || imageError) {
      return
    }
    setImageError(true)
    target.src = './placeholder-image.jpg'
    target.alt = 'Image not available'
  }

  // 画像クリック時の処理
  const handleImageClick = () => {
    setIsImageModalOpen(true)
  }

  return (
    <div
      className={cn(
        credentialCardStyles,
        'relative mx-auto max-w-5xl',
        isExpired && 'border-[var(--color-error)] opacity-90'
      )}
    >
      {/* 検証バッジ */}
      <div
        className={cn(
          'absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-lg',
          isExpired
            ? 'bg-[var(--color-error)]'
            : hashVerification.isValid === false
              ? 'bg-[var(--color-error)]'
              : hashVerification.isValid === true
                ? 'bg-[var(--color-credential-success)]'
                : 'bg-blue-500'
        )}
      >
        {isExpired ? (
          <svg
            className='h-5 w-5 text-white'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
              clipRule='evenodd'
            />
          </svg>
        ) : hashVerification.isValid === false ? (
          <svg
            className='h-5 w-5 text-white'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
              clipRule='evenodd'
            />
          </svg>
        ) : hashVerification.isLoading ? (
          <svg
            className='h-4 w-4 animate-spin text-white'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
        ) : (
          <svg
            className='h-5 w-5 text-white'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
              clipRule='evenodd'
            />
          </svg>
        )}
      </div>

      {/* 警告バナー */}
      {(isExpired || hashVerification.isValid === false) && (
        <div className='mb-4 space-y-3'>
          {isExpired && (
            <div className='rounded-md border border-red-200 bg-red-50 p-3'>
              <div className='flex items-center gap-2'>
                <svg
                  className='h-5 w-5 text-red-500'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
                <span className='text-sm font-medium text-red-800'>
                  このNFT証明書は有効期限が切れています
                </span>
              </div>
            </div>
          )}
          {hashVerification.isValid === false && (
            <div className='rounded-md border border-orange-200 bg-orange-50 p-3'>
              <div className='flex items-center gap-2'>
                <svg
                  className='h-5 w-5 text-orange-500'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
                <span className='text-sm font-medium text-orange-800'>
                  ハッシュ検証に失敗しました。データの整合性に問題がある可能性があります
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className='flex flex-col gap-6 md:flex-row'>
        {/* 機関ロゴ・画像セクション */}
        {nft.imageUrl && (
          <div className='md:w-1/5'>
            <div
              className={cn(
                'group relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 border-[var(--color-credential-border)] shadow-lg',
                imageError && 'bg-gray-100'
              )}
              onClick={handleImageClick}
            >
              {imageError ? (
                // 画像エラー時のフォールバック表示
                <div className='flex h-full w-full items-center justify-center bg-gray-100'>
                  <div className='text-center'>
                    <svg
                      className='mx-auto h-12 w-12 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={1}
                        d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                    <p className='mt-2 text-xs text-gray-500'>
                      画像を読み込めません
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <img
                    src={nft.imageUrl}
                    alt={nft.title}
                    className='h-full w-full object-cover transition-all duration-500 group-hover:scale-110'
                    onError={handleImageError}
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>

                  {/* 拡大アイコンの表示 */}
                  <div className='absolute top-3 right-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                    <div className='rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm'>
                      <svg
                        className='h-4 w-4 text-gray-700'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7'
                        />
                      </svg>
                    </div>
                  </div>
                </>
              )}

              <div className='absolute right-3 bottom-3 transform rounded-lg bg-[var(--color-credential-primary)] px-3 py-2 text-sm font-bold text-white shadow-lg transition-transform duration-300 group-hover:scale-105'>
                Token ID: {nft.tokenId}
              </div>
            </div>
          </div>
        )}

        {/* 証明書情報セクション */}
        <div className='flex flex-col md:w-4/5'>
          {/* 証明書名 */}
          <h2
            className='mb-3 text-3xl leading-tight font-black text-[var(--color-credential-primary)] md:text-4xl lg:text-5xl'
            style={{ fontFamily: 'var(--font-family-secondary)' }}
          >
            {nft.title}
          </h2>

          {/* 発行機関 */}
          <div className='mb-6 flex items-center gap-2'>
            <div className='h-1 w-8 rounded-full bg-[var(--color-credential-accent)]'></div>
            <span className='text-lg font-bold tracking-wide text-[var(--color-credential-primary)]'>
              Epis Education Centre
            </span>
          </div>

          {/* メタデータ情報 */}
          <div className='mt-auto'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4'>
                <div className='mb-1 flex items-center gap-2'>
                  <svg
                    className='h-4 w-4 text-blue-600'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-sm font-bold tracking-wide text-blue-700 uppercase'>
                    発行日
                  </span>
                </div>
                <span className='text-lg font-bold text-blue-900'>
                  {new Date(nft.createdAt).toLocaleDateString('ja-JP')}
                </span>
              </div>
              {nft.expiredAt && (
                <div
                  className={cn(
                    'rounded-lg border p-4',
                    isExpired
                      ? 'border-red-100 bg-gradient-to-r from-red-50 to-pink-50'
                      : 'border-green-100 bg-gradient-to-r from-green-50 to-emerald-50'
                  )}
                >
                  <div className='mb-1 flex items-center gap-2'>
                    <svg
                      className={cn(
                        'h-4 w-4',
                        isExpired ? 'text-red-600' : 'text-green-600'
                      )}
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span
                      className={cn(
                        'text-sm font-bold tracking-wide uppercase',
                        isExpired ? 'text-red-700' : 'text-green-700'
                      )}
                    >
                      有効期限
                    </span>
                  </div>
                  <span
                    className={cn(
                      'text-lg font-bold',
                      isExpired ? 'text-red-900' : 'text-green-900'
                    )}
                  >
                    {new Date(nft.expiredAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 説明文 */}
      <div className='custom-scrollbar mt-6 mb-6 max-h-84 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-4 pr-2'>
        <p className='text-lg leading-relaxed font-medium whitespace-pre-line text-[var(--color-text-primary)]'>
          {linkifyText(nft.description)}
        </p>
      </div>

      {/* ファイル添付セクション */}
      {nft.files && nft.files.length > 0 && (
        <div className='mt-6'>
          <FileList files={nft.files} />
        </div>
      )}

      {/* 証明書認証フッター */}
      <div className='mt-8 flex items-center justify-between rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6'>
        <div className='flex items-center gap-3'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-credential-accent)] shadow-lg'>
            <span className='text-lg font-black text-white'>認</span>
          </div>
          <div>
            <span className='block text-xl font-black text-[var(--color-credential-primary)]'>
              NFT証明書
            </span>
            <span className='text-sm font-medium text-[var(--color-text-secondary)]'>
              デジタル認証済み
            </span>
          </div>
        </div>
        <div className='flex items-center gap-3 text-right'>
          <div>
            <div
              className={cn(
                'flex items-center gap-2 text-lg font-bold',
                isExpired
                  ? 'text-[var(--color-error)]'
                  : hashVerification.isValid === false
                    ? 'text-[var(--color-error)]'
                    : hashVerification.isValid === true
                      ? 'text-[var(--color-credential-success)]'
                      : 'text-blue-600'
              )}
            >
              <svg className='h-6 w-6' fill='currentColor' viewBox='0 0 20 20'>
                {isExpired ? (
                  <path
                    fillRule='evenodd'
                    d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                ) : hashVerification.isValid === false ? (
                  <path
                    fillRule='evenodd'
                    d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                ) : (
                  <path
                    fillRule='evenodd'
                    d='M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                    clipRule='evenodd'
                  />
                )}
              </svg>
              <span>
                {isExpired
                  ? '期限切れ'
                  : hashVerification.isValid === false
                    ? 'ハッシュ無効'
                    : hashVerification.isValid === true
                      ? '検証済み'
                      : '検証中...'}
              </span>
            </div>
            <span className='block text-xs text-[var(--color-text-secondary)]'>
              Token ID: {nft.tokenId}
            </span>
          </div>
        </div>
      </div>

      {/* 画像モーダル */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={nft.imageUrl}
        title={nft.title}
      />
    </div>
  )
}
