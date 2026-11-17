import { beforeEach, describe, expect, it } from 'vitest'
import { createOneTimeLicense, getLicenseByStoreId, isLicenseOperational, updateLicenseStatus, LICENSE_STATUS } from './licenses.js'
import { platformKey } from './storage.js'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe('licencias de pago único (permanente)', () => {
  it('crea licencia activa y es operativa', () => {
    createOneTimeLicense({ storeId: 's1', amount: 100, activated: true })
    const lic = getLicenseByStoreId('s1')
    expect(lic.type).toBe('permanente')
    expect(lic.status).toBe(LICENSE_STATUS.ACTIVE)
    expect(isLicenseOperational('s1')).toBe(true)
  })

  it('suspender bloquea operaciones y reactivar restaura sin borrar datos', () => {
    createOneTimeLicense({ storeId: 's2', amount: 0, activated: true })
    updateLicenseStatus('s2', LICENSE_STATUS.SUSPENDED, { reason: 'impago' })
    expect(isLicenseOperational('s2')).toBe(false)
    expect(getLicenseByStoreId('s2').status).toBe(LICENSE_STATUS.SUSPENDED)
    updateLicenseStatus('s2', LICENSE_STATUS.ACTIVE, { reason: 'regularizado' })
    expect(isLicenseOperational('s2')).toBe(true)
    expect(getLicenseByStoreId('s2').history.length).toBeGreaterThanOrEqual(3)
  })

  it('no hay expiración automática por fecha (licencia permanente)', () => {
    createOneTimeLicense({ storeId: 's3', activated: true })
    // no existe lógica de vencimiento; sigue operativa
    expect(isLicenseOperational('s3')).toBe(true)
  })
})
