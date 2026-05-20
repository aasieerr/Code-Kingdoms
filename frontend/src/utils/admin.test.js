import { describe, expect, it } from 'vitest'
import { isAdminUser } from './admin'

describe('isAdminUser', () => {
  it('returns true when is_admin is set', () => {
    expect(isAdminUser({ is_admin: true })).toBe(true)
  })

  it('returns false for missing or non-admin users', () => {
    expect(isAdminUser(null)).toBe(false)
    expect(isAdminUser({})).toBe(false)
    expect(isAdminUser({ is_admin: false })).toBe(false)
  })
})
