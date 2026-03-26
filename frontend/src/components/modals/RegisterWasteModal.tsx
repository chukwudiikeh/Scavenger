import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { ScavengerClient } from '@/api/client'
import { WasteType, Material } from '@/api/types'
import { config } from '@/config'
import { networkConfig } from '@/lib/stellar'

const client = new ScavengerClient({
  rpcUrl: networkConfig.rpcUrl,
  networkPassphrase: networkConfig.networkPassphrase,
  contractId: config.contractId,
})

const WASTE_TYPES = [
  { value: WasteType.Paper, label: 'Paper' },
  { value: WasteType.PetPlastic, label: 'PET Plastic' },
  { value: WasteType.Plastic, label: 'Plastic' },
  { value: WasteType.Metal, label: 'Metal' },
  { value: WasteType.Glass, label: 'Glass' },
]

interface Props {
  open: boolean
  address: string
  onClose: () => void
  onSuccess: (material: Material) => void
}

export function RegisterWasteModal({ open, address, onClose, onSuccess }: Props) {
  const [wasteType, setWasteType] = useState<WasteType>(WasteType.Paper)
  const [weight, setWeight] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const w = parseFloat(weight)
    if (!w || w <= 0) return
    setError(null)
    setSubmitting(true)
    try {
      const material = await client.submitMaterial(address, wasteType, BigInt(Math.round(w)), address)
      onSuccess(material)
      setWeight('')
      setWasteType(WasteType.Paper)
      onClose()
    } catch (err: any) {
      setError(err?.message ?? 'Submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register Waste</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Waste type</label>
            <Select
              value={String(wasteType)}
              onValueChange={(v) => setWasteType(Number(v) as WasteType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WASTE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={String(t.value)}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Weight (kg)</label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 2.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !weight}>
              {submitting ? 'Submitting…' : 'Submit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
