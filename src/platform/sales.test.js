import { beforeEach, describe, expect, it } from 'vitest'
import { nextSaleCode, peekSaleSeq } from './sales.js'

beforeEach(() => {
  localStorage.clear()
})

describe('códigos de venta por comercio', () => {
  it('genera secuencia VTA-000001 incremental por store', () => {
    expect(nextSaleCode('a').code).toBe('VTA-000001')
    expect(nextSaleCode('a').code).toBe('VTA-000002')
    expect(peekSaleSeq('a')).toBe(2)
  })

  it('mantiene secuencias independientes por comercio', () => {
    expect(nextSaleCode('store-1').code).toBe('VTA-000001')
    expect(nextSaleCode('store-2').code).toBe('VTA-000001')
    expect(nextSaleCode('store-1').code).toBe('VTA-000002')
  })
})
