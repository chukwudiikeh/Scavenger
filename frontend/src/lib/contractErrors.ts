import { ContractError } from '@/api/types'

// Maps contract error codes to user-friendly messages
const ERROR_MESSAGES: Record<number, string> = {
  1: 'You are not authorized to perform this action.',
  2: 'Participant is already registered.',
  3: 'Participant not found.',
  4: 'Incentive not found.',
  5: 'Incentive is no longer active.',
  6: 'Insufficient budget for this incentive.',
  7: 'Material not found.',
  8: 'Material is not active.',
  9: 'Material has already been confirmed.',
  10: 'Invalid waste type.',
  11: 'Invalid role for this operation.',
  12: 'Transfer not allowed — you do not own this material.',
  13: 'Reward distribution failed.',
  14: 'Contract is not initialized.',
  15: 'Percentages must add up to 100.'
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ContractError) {
    const code = error.code
    if (code !== undefined && ERROR_MESSAGES[code]) {
      return ERROR_MESSAGES[code]
    }
    if (error.message && error.message !== 'Unknown Contract Error') {
      return error.message
    }
  }
  return 'Something went wrong. Please try again.'
}
