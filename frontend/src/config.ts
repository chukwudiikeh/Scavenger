const required = (key: string): string => {
  const value = import.meta.env[key] as string | undefined
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

const VALID_NETWORKS = ['TESTNET', 'MAINNET', 'FUTURENET', 'STANDALONE'] as const
type Network = (typeof VALID_NETWORKS)[number]

const rawNetwork = (import.meta.env.VITE_NETWORK as string) || 'TESTNET'
if (!VALID_NETWORKS.includes(rawNetwork as Network)) {
  throw new Error(
    `Invalid VITE_NETWORK "${rawNetwork}". Must be one of: ${VALID_NETWORKS.join(', ')}`
  )
}

export const config = {
  contractId: required('VITE_CONTRACT_ID'),
  network: rawNetwork as Network,
  rpcUrl: required('VITE_RPC_URL')
} as const
