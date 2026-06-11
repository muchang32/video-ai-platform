/**
 * Service barrel — picks real or mock API based on VITE_MOCK_API env var.
 * Set VITE_MOCK_API=true in .env.local to use mock mode.
 */
import * as realApi from './api'
import * as mockApi from './mockApi'

const MOCK = import.meta.env.VITE_MOCK_API === 'true'

if (MOCK) {
  console.info('[Mock API] 已啟用模擬模式，不會呼叫真實後端。')
}

export const registerAsset = MOCK ? mockApi.registerAsset : realApi.registerAsset
export const uploadAsset   = MOCK ? mockApi.uploadAsset   : realApi.uploadAsset
export const enrichAsset   = MOCK ? mockApi.enrichAsset   : realApi.enrichAsset
export const getBatch      = MOCK ? mockApi.getBatch      : realApi.getBatch
export const getJobResult  = MOCK ? mockApi.getJobResult  : realApi.getJobResult
export const checkHealth   = MOCK ? mockApi.checkHealth   : realApi.checkHealth

export const isMockMode = MOCK
