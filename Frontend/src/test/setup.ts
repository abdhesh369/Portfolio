import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// auto-cleanup after each test
afterEach(() => {
    cleanup()
})

// Mock virtual modules
vi.mock('virtual:pwa-register/react', () => ({
    useRegisterSW: () => ({
        offlineReady: [false, vi.fn()],
        needRefresh: [false, vi.fn()],
        updateServiceWorker: vi.fn(),
    }),
}))
