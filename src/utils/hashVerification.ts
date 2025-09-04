/**
 * NFTメタデータのハッシュ検証ユーティリティ
 */

/**
 * NFTメタデータの型定義（ハッシュ計算用）
 */
export interface HashableMetadata {
  name: string
  description: string // description に対応
  image: string // imageUrl に対応
  certificationFiles?: Array<{
    fileName: string
    fileType: string
    fileData: string
    fileSize: number
  }>
}

/**
 * Web環境でSHA256ハッシュを計算する関数
 * @param text - ハッシュ化する文字列
 * @returns Promise<string> - 16進数のハッシュ値
 */
async function sha256(text: string): Promise<string> {
  // TextEncoderでUTF-8バイト配列に変換
  const encoder = new TextEncoder()
  const data = encoder.encode(text)

  // Web Crypto APIでSHA256ハッシュを計算
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)

  // ArrayBufferを16進数文字列に変換
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

  return hashHex
}

/**
 * NFTメタデータからハッシュを計算する関数
 * @param metadata - ハッシュ計算対象のメタデータ
 * @returns Promise<string> - 計算されたハッシュ値
 */
export async function calculateMetadataHash(
  metadata: HashableMetadata
): Promise<string> {
  try {
    // 仕様に従って、プロパティの順序を固定
    const orderedMetadata: {
      name: string
      description: string
      image: string
      certificationFiles?: Array<{
        fileName: string
        fileType: string
        fileData: string
        fileSize: number
      }>
    } = {
      name: metadata.name,
      description: metadata.description,
      image: metadata.image,
    }

    // certificationFilesを追加（空配列の場合は除外）
    if (metadata.certificationFiles && metadata.certificationFiles.length > 0) {
      orderedMetadata.certificationFiles = metadata.certificationFiles
    }

    // JSON文字列化
    const jsonString = JSON.stringify(orderedMetadata)

    // SHA256ハッシュ計算
    const hash = await sha256(jsonString)

    return hash
  } catch (error) {
    console.error('Hash calculation failed:', error)
    throw new Error('Failed to calculate metadata hash')
  }
}

/**
 * NFTデータから検証用メタデータを抽出する関数
 * @param nft - NFTデータ
 * @returns HashableMetadata - ハッシュ計算用メタデータ
 */
export function extractHashableMetadata(nft: {
  title: string
  description: string
  imageUrl: string
  files?: Array<{
    fileName: string
    fileType: string
    fileData: string
    fileSize: number
  }>
}): HashableMetadata {
  // imageUrlからIPFS URIを抽出（HTTPゲートウェイURLの場合）
  let imageUri = nft.imageUrl
  if (imageUri.includes('epis.mypinata.cloud/ipfs/')) {
    const cid = imageUri.split('epis.mypinata.cloud/ipfs/')[1]
    imageUri = `ipfs://${cid}`
  }

  const metadata: HashableMetadata = {
    name: nft.title,
    description: nft.description,
    image: imageUri,
  }

  // filesをcertificationFilesとして追加（空配列の場合は除外）
  if (nft.files && nft.files.length > 0) {
    metadata.certificationFiles = nft.files
  }

  return metadata
}

/**
 * ハッシュ検証を実行する関数
 * @param nft - NFTデータ
 * @param storedHash - 保存されているハッシュ値
 * @returns Promise<{isValid: boolean, calculatedHash: string, error?: string}>
 */
export async function verifyNftHash(
  nft: {
    title: string
    description: string
    imageUrl: string
    files?: Array<{
      fileName: string
      fileType: string
      fileData: string
      fileSize: number
    }>
  },
  storedHash: string
): Promise<{
  isValid: boolean
  calculatedHash: string
  error?: string
}> {
  try {
    // ハッシュ計算用メタデータを抽出
    const metadata = extractHashableMetadata(nft)

    // ハッシュ計算
    const calculatedHash = await calculateMetadataHash(metadata)

    // 検証
    const isValid = calculatedHash === storedHash

    return {
      isValid,
      calculatedHash,
    }
  } catch (error) {
    console.error('Hash verification failed:', error)
    return {
      isValid: false,
      calculatedHash: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * ハッシュ値を短縮表示用にフォーマットする関数
 * @param hash - ハッシュ値
 * @param length - 表示する文字数（前後それぞれ）
 * @returns string - フォーマットされたハッシュ値
 */
export function formatHashForDisplay(hash: string, length: number = 8): string {
  if (hash.length <= length * 2 + 3) {
    return hash
  }
  return `${hash.slice(0, length)}...${hash.slice(-length)}`
}
