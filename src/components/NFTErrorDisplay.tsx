import { NftApiError } from '../api/nftApi'

/**
 * エラー情報の型定義
 */
interface ErrorInfo {
  title: string
  message: string
  severity: 'error' | 'warning' | 'info'
  icon: 'not-found' | 'forbidden' | 'expired' | 'server-error' | 'bad-request'
}

/**
 * ステータスコード別のエラー情報を取得する関数
 */
const getErrorInfo = (statusCode: number, apiMessage?: string): ErrorInfo => {
  switch (statusCode) {
    case 400:
      return {
        title: '不正なリクエストです',
        message: apiMessage || 'リクエストパラメータが正しくありません。',
        severity: 'warning',
        icon: 'bad-request',
      }

    case 403:
      return {
        title: 'アクセスが制限されています',
        message: apiMessage || 'この証明書は現在利用できません。',
        severity: 'error',
        icon: 'forbidden',
      }

    case 404:
      return {
        title: '証明書が見つかりません',
        message: apiMessage || '指定されたIDの証明書は存在しません。',
        severity: 'warning',
        icon: 'not-found',
      }

    case 410:
      return {
        title: '証明書の有効期限が切れています',
        message: apiMessage || 'この証明書は期限切れのため表示できません。',
        severity: 'info',
        icon: 'expired',
      }

    case 500:
    default:
      return {
        title: 'サーバーエラーが発生しました',
        message:
          apiMessage ||
          '一時的な問題が発生しています。しばらく後に再度お試しください。',
        severity: 'error',
        icon: 'server-error',
      }
  }
}

/**
 * エラーアイコンコンポーネント
 */
const ErrorIcon = ({
  icon,
  className,
}: {
  icon: ErrorInfo['icon']
  className?: string
}) => {
  const iconClasses = `h-12 w-12 ${className}`

  switch (icon) {
    case 'not-found':
      return (
        <svg className={iconClasses} fill='currentColor' viewBox='0 0 20 20'>
          <path
            fillRule='evenodd'
            d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
            clipRule='evenodd'
          />
          <path d='M8 6a1 1 0 011 1v1a1 1 0 11-2 0V7a1 1 0 011-1z' />
        </svg>
      )

    case 'forbidden':
      return (
        <svg className={iconClasses} fill='currentColor' viewBox='0 0 20 20'>
          <path
            fillRule='evenodd'
            d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
            clipRule='evenodd'
          />
        </svg>
      )

    case 'expired':
      return (
        <svg className={iconClasses} fill='currentColor' viewBox='0 0 20 20'>
          <path
            fillRule='evenodd'
            d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
            clipRule='evenodd'
          />
        </svg>
      )

    case 'bad-request':
      return (
        <svg className={iconClasses} fill='currentColor' viewBox='0 0 20 20'>
          <path
            fillRule='evenodd'
            d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
            clipRule='evenodd'
          />
        </svg>
      )

    case 'server-error':
    default:
      return (
        <svg className={iconClasses} fill='currentColor' viewBox='0 0 20 20'>
          <path
            fillRule='evenodd'
            d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
            clipRule='evenodd'
          />
        </svg>
      )
  }
}

/**
 * NFT証明書エラー表示コンポーネント
 */
export const NFTErrorDisplay = ({
  error,
  requestId,
  onRetry,
}: {
  error: Error | NftApiError
  requestId: string
  onRetry?: () => void
}) => {
  const isApiError = error instanceof NftApiError
  const statusCode = isApiError ? error.statusCode : 500
  const apiMessage = isApiError ? error.apiMessage : undefined

  const errorInfo = getErrorInfo(statusCode, apiMessage)

  const getSeverityColors = (severity: ErrorInfo['severity']) => {
    switch (severity) {
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          iconBg: 'bg-red-100',
          iconText: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700',
          button: 'bg-red-600 hover:bg-red-700 text-white',
        }
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          iconBg: 'bg-yellow-100',
          iconText: 'text-yellow-600',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        }
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          iconBg: 'bg-blue-100',
          iconText: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
        }
    }
  }

  const colors = getSeverityColors(errorInfo.severity)

  return (
    <div className='flex min-h-[500px] items-center justify-center'>
      <div
        className={`mx-4 max-w-lg rounded-xl border-2 ${colors.border} ${colors.bg} p-8 text-center shadow-xl`}
      >
        <div
          className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${colors.iconBg}`}
        >
          <ErrorIcon icon={errorInfo.icon} className={colors.iconText} />
        </div>

        <h3 className={`mb-4 text-2xl font-bold ${colors.title}`}>
          {errorInfo.title}
        </h3>

        <p className={`mb-6 text-lg leading-relaxed ${colors.message}`}>
          {errorInfo.message}
        </p>

        <div className='space-y-3'>
          {/* サーバーエラーの場合のみ再試行ボタンを表示 */}
          {statusCode >= 500 && onRetry && (
            <button
              onClick={onRetry}
              className={`w-full rounded-lg px-6 py-3 font-semibold transition-colors duration-200 ${colors.button}`}
            >
              再試行
            </button>
          )}

          {/* 期限切れ以外は再読み込みボタンを表示 */}
          {statusCode !== 410 && (
            <button
              onClick={() => window.location.reload()}
              className='w-full rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors duration-200 hover:bg-gray-50'
            >
              ページを再読み込み
            </button>
          )}
        </div>

        {/* 開発モード時の詳細情報 */}
        {import.meta.env.DEV && (
          <details className='mt-6 rounded-lg bg-gray-100 p-4 text-left'>
            <summary className='cursor-pointer font-medium text-gray-700'>
              開発者向け詳細情報
            </summary>
            <pre className='mt-2 overflow-x-auto text-xs text-gray-600'>
              {JSON.stringify(
                {
                  statusCode,
                  statusText: isApiError ? error.statusText : 'Unknown',
                  apiMessage,
                  requestId,
                  timestamp: new Date().toISOString(),
                  userAgent: navigator.userAgent,
                },
                null,
                2
              )}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
