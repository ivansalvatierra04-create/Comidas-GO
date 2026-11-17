import { beforeEach, describe, expect, it } from 'vitest'
import { createOneTimeLicense, updateLicenseStatus, LICENSE_STATUS } from './licenses.js'
import { createStore, getCurrentStoreId, setCurrentStoreId } from './stores.js'
import { assertStoreOperational } from './tenant.js'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe('aislamiento y operación por comercio (base local)', () => {
  it('crea comercios con ids/slugs distintos y licencias independientes', () => {
    const a = createStore({ name: 'A', slug: 'tienda-a', activateLicense: true })
    const b = createStore({ name: 'B', slug: 'tienda-b', activateLicense: true })
    expect(a.id).not.toBe(b.id)
    updateLicenseStatus(b.id, LICENSE_STATUS.SUSPENDED)
    expect(assertStoreOperational(a.id).ok).toBe(true)
    expect(assertStoreOperational(b.id).ok).toBe(false)
  })
})
