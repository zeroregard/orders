import { describe, it, expect } from 'vitest'
import { isEmailAllowed } from '../contexts/AuthContext'

describe('Authentication Logic', () => {
  describe('isEmailAllowed', () => {
    it('should allow authorized emails', () => {
      expect(isEmailAllowed('myemail@gmail.com')).toBe(true)
      expect(isEmailAllowed('partneremail@gmail.com')).toBe(true)
    })

    it('should reject unauthorized emails', () => {
      expect(isEmailAllowed('unauthorized@gmail.com')).toBe(false)
      expect(isEmailAllowed('random@example.com')).toBe(false)
      expect(isEmailAllowed('test@yahoo.com')).toBe(false)
    })

    it('should reject empty or invalid emails', () => {
      expect(isEmailAllowed('')).toBe(false)
      expect(isEmailAllowed('invalid-email')).toBe(false)
      expect(isEmailAllowed('test@')).toBe(false)
    })

    it('should be case sensitive', () => {
      expect(isEmailAllowed('MYEMAIL@GMAIL.COM')).toBe(false)
      expect(isEmailAllowed('MyEmail@Gmail.com')).toBe(false)
    })
  })
}) 