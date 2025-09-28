export async function withRetry(fn, attempts = 2, delayMs = 400) { // Export a helper that re-runs a promise-returning function when it fails.
  let lastError; // Keep track of the last error so we can throw it if all retries are exhausted.
  for (let attempt = 0; attempt <= attempts; attempt += 1) { // Iterate from the initial try through the configured number of retries.
    try {
      return await fn(); // If the function succeeds, immediately return its resolved value.
    } catch (error) {
      lastError = error; // Remember the error and keep looping to try again.
    }
    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs)); // Wait the requested delay before attempting again when retries remain.
    }
  }
  throw lastError; // After all attempts fail, throw the final error so the caller can react.
}
