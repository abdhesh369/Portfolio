import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// auto-cleanup after each test
afterEach(() => {
    cleanup()
})
