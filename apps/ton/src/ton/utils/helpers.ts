export async function retry<T>(fn: () => Promise<T>, options: { retries: number; delay: number }): Promise<T> {
  let lastError: Error | undefined
  for (let i = 0; i < options.retries; i++) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await fn()
    } catch (e) {
      if (e instanceof Error) {
        lastError = e
      }
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, options.delay))
    }
  }
  throw lastError
}
