import { atom } from 'jotai'

enum TransactionState {
  None,
  Submitted,
  PendingApproval,
  Approving,
}

const transactionState = atom<TransactionState>(TransactionState.None)
