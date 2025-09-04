import { QueryClient, useQuery } from '@tanstack/react-query'
import { fileDataType, NftDataType } from '../types/NftDataTypes'

// 定数定義
const API_BASE_URL = 'https://epis-mint-site-backend-dev.up.railway.app'

const IPFS_GATEWAY_URL = 'https://epis.mypinata.cloud/ipfs'

/**
 * NFT証明書API レスポンスの型定義
 */
type NftCertificateApiResponse = {
  success: boolean
  message: string
  data: {
    requestId: string
    tokenId: string
    title: string
    description: string
    imageUrl: string
    hash: string
    expiredAt: number // Unixタイムスタンプ（秒）
    createdAt: number // Unixタイムスタンプ（秒）
    files: fileDataType[] // オプションでファイル情報
  }
}

/**
 * IPFSのURLをHTTPゲートウェイURLに変換する関数
 * @param url - 変換するURL（ipfs://で始まるURLまたは通常のHTTP URL）
 * @returns HTTPアクセス可能なURL
 */
const processImageUrl = (url: string): string => {
  if (url.startsWith('ipfs://')) {
    const cid = url.replace('ipfs://', '')
    return `${IPFS_GATEWAY_URL}/${cid}`
  }
  return url
}

/**
 * Unixタイムスタンプ（秒）をDateオブジェクトに変換する関数
 * @param timestamp - Unixタイムスタンプ（秒）
 * @returns Dateオブジェクト
 */
const convertUnixTimestampToDate = (timestamp: number): Date => {
  return new Date(timestamp * 1000)
}

/**
 * React QueryのQueryClientインスタンスを作成する関数
 * @returns 設定済みのQueryClient
 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 5, // 5秒
        retry: 0,
      },
    },
  })

/**
 * API エラーの詳細情報を含むカスタムエラークラス
 */
export class NftApiError extends Error {
  constructor(
    public statusCode: number,
    public statusText: string,
    public apiMessage?: string,
    message?: string
  ) {
    super(message || `NFT API Error: ${statusCode} ${statusText}`)
    this.name = 'NftApiError'
  }
}

/**
 * NFT証明書データを取得する関数
 * @param requestId - NFT証明書のリクエストID
 * @returns Promise<NftDataType> - NFT証明書データ
 * @throws NftApiError - APIエラーまたはネットワークエラーが発生した場合
 */
export const fetchNftCertificate = async (
  requestId: string
): Promise<NftDataType> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/certificate?requestId=${requestId}`
    )

    if (!response.ok) {
      let apiMessage: string | undefined

      try {
        // エラーレスポンスからメッセージを取得試行
        const errorData = await response.json()
        apiMessage =
          errorData.message || errorData.error || errorData.description
      } catch {
        // JSONパースに失敗した場合は無視
      }

      throw new NftApiError(
        response.status,
        response.statusText,
        apiMessage,
        `NFT証明書取得エラー: ${response.status} ${response.statusText}`
      )
    }

    const apiResponse: NftCertificateApiResponse = await response.json()

    // レスポンスの構造をチェック
    if (!apiResponse.success) {
      throw new Error(
        `API処理エラー: ${apiResponse.message || '不明なエラーが発生しました'}`
      )
    }

    if (!apiResponse.data) {
      throw new Error('NFT証明書データが見つかりません')
    }

    const data = apiResponse.data

    return {
      requestId: data.requestId,
      tokenId: data.tokenId,
      title: data.title,
      description: data.description,
      imageUrl: processImageUrl(data.imageUrl),
      hash: data.hash,
      expiredAt: convertUnixTimestampToDate(data.expiredAt),
      createdAt: convertUnixTimestampToDate(data.createdAt),
      files: data.files || [], // ファイルが存在しない場合は空配列を設定
    }
  } catch (error) {
    console.error('NFT証明書取得中にエラーが発生しました:', error)
    throw error // エラーを上位で処理するために再度スローする
  }
}

/**
 * NFT証明書データを取得するためのカスタムフック
 * @param requestId - NFT証明書のリクエストID
 * @returns React QueryのuseQueryの結果
 */
export const useNftCertificate = (requestId: string) => {
  return useQuery({
    queryKey: ['nft-certificate', requestId],
    queryFn: () => fetchNftCertificate(requestId),
    retry: 0,
    // エラー時のフォールバックデータは上位コンポーネントで処理
  })
}
