import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@/context/WalletContext'
import { useContract } from '@/context/ContractContext'
import { ScavengerClient } from '@/api/client'
import { Material, Incentive, WasteType } from '@/api/types'
import { getNetworkPassphrase } from '@/lib/stellar'

export interface RewardDistribution {
  wasteId: number
  incentiveId: number
  amount: bigint
  distributedAt: number
}

export function useManufacturerDashboard() {
  const { address } = useWallet()
  const { config } = useContract()

  const [pendingWastes, setPendingWastes] = useState<Material[]>([])
  const [incentives, setIncentives] = useState<Incentive[]>([])
  const [rewardHistory, setRewardHistory] = useState<RewardDistribution[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const client = new ScavengerClient({
    rpcUrl: config.rpcUrl,
    networkPassphrase: getNetworkPassphrase(config.network),
    contractId: config.contractId,
  })

  const load = useCallback(async () => {
    if (!address) return
    setIsLoading(true)
    setError(null)
    try {
      // Fetch active incentives for all waste types by this manufacturer
      const wasteTypeKeys = Object.values(WasteType).filter(
        (v): v is WasteType => typeof v === 'number'
      )
      const incentiveResults = await Promise.all(
        wasteTypeKeys.map((wt) => client.getActiveMfrIncentive(address, wt))
      )
      const activeIncentives = incentiveResults.filter((i): i is Incentive => i !== null)
      setIncentives(activeIncentives)

      // Fetch wastes transferred to this manufacturer pending confirmation
      const wasteTypeKeys2 = Object.values(WasteType).filter(
        (v): v is WasteType => typeof v === 'number'
      )
      const allMaterials: Material[] = []
      for (const wt of wasteTypeKeys2) {
        const incentives2 = await client.getIncentives(wt)
        for (const inc of incentives2) {
          const mat = await client.getMaterial(BigInt(inc.id))
          if (mat && mat.current_owner === address && !mat.is_confirmed && mat.is_active) {
            allMaterials.push(mat)
          }
        }
      }
      setPendingWastes(allMaterials)

      // Reward history: use participant stats as a proxy (full history not in client)
      const stats = await client.getStats(address)
      // Represent as a single summary entry if total_earned > 0
      if (stats.total_earned > 0n) {
        setRewardHistory([
          {
            wasteId: 0,
            incentiveId: 0,
            amount: stats.total_earned,
            distributedAt: Date.now(),
          },
        ])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [address, config])

  useEffect(() => {
    load()
  }, [load])

  const createIncentive = useCallback(
    async (wasteType: WasteType, rewardPoints: bigint, budget: bigint) => {
      if (!address) return
      await client.createIncentive(address, wasteType, rewardPoints, budget, address)
      await load()
    },
    [address, config, load]
  )

  const confirmWaste = useCallback(
    async (wasteId: number | bigint) => {
      if (!address) return
      await client.confirmWasteDetails(BigInt(wasteId), address, address)
      await load()
    },
    [address, config, load]
  )

  return { pendingWastes, incentives, rewardHistory, isLoading, error, createIncentive, confirmWaste, reload: load }
}
