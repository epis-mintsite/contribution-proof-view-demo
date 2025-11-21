export type NftDataType = {
  requestId: string
  tokenId: string
  title: string
  description: string
  imageUrl: string
  hash: string
  expiredAt: Date
  createdAt: Date
  updatedAt?: Date // オプショナルな更新日時
  files?: fileDataType[] // オプショナルに変更
}

export type fileDataType = {
  fileName: string
  fileType: string
  fileSize: number
  fileData: string // Base64エンコードされたファイルデータ
}
