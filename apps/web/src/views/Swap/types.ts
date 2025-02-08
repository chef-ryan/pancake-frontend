import { ConfirmModalState } from '@pancakeswap/widgets-internal'

export enum SwapType {
  MARKET,
  TWAP,
  LIMIT,
}

export type PendingConfirmModalState = Extract<
  ConfirmModalState,
  | ConfirmModalState.APPROVING_TOKEN
  | ConfirmModalState.PERMITTING
  | ConfirmModalState.PENDING_CONFIRMATION
  | ConfirmModalState.WRAPPING
  | ConfirmModalState.RESETTING_APPROVAL
>

export type AllowedAllowanceState =
  | ConfirmModalState.RESETTING_APPROVAL
  | ConfirmModalState.APPROVING_TOKEN
  | ConfirmModalState.PERMITTING

export type CommitButtonProps = {
  beforeCommit?: () => void
  afterCommit?: () => void
}
