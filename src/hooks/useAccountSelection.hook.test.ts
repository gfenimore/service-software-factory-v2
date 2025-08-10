import { renderHook, act } from '@testing-library/react'
import { useAccountSelection } from './useAccountSelection'

describe('useAccountSelection', () => {
  test('returns expected shape', () => {
    const { result } = renderHook(() => useAccountSelection())
    
    expect(result.current).toHaveProperty('selectedAccountId')
    expect(result.current).toHaveProperty('selectAccount')
    expect(result.current).toHaveProperty('deselectAccount')
    expect(result.current).toHaveProperty('isSelected')
  })

  test('initializes with null selection', () => {
    const { result } = renderHook(() => useAccountSelection())
    
    expect(result.current.selectedAccountId).toBeNull()
  })

  test('selects account correctly', () => {
    const { result } = renderHook(() => useAccountSelection())
    
    act(() => {
      result.current.selectAccount('account-123')
    })
    
    expect(result.current.selectedAccountId).toBe('account-123')
    expect(result.current.isSelected('account-123')).toBe(true)
  })

  test('deselects account correctly', () => {
    const { result } = renderHook(() => useAccountSelection())
    
    act(() => {
      result.current.selectAccount('account-123')
    })
    
    act(() => {
      result.current.deselectAccount()
    })
    
    expect(result.current.selectedAccountId).toBeNull()
    expect(result.current.isSelected('account-123')).toBe(false)
  })

  test('handles null account ID selection gracefully', () => {
    const { result } = renderHook(() => useAccountSelection())
    
    act(() => {
      result.current.selectAccount(null as any)
    })
    
    expect(result.current.selectedAccountId).toBeNull()
  })

  test('handles undefined account ID selection gracefully', () => {
    const { result } = renderHook(() => useAccountSelection())
    
    act(() => {
      result.current.selectAccount(undefined as any)
    })
    
    expect(result.current.selectedAccountId).toBeNull()
  })

  test('only one account selected at a time', () => {
    const { result } = renderHook(() => useAccountSelection())
    
    act(() => {
      result.current.selectAccount('account-123')
    })
    
    act(() => {
      result.current.selectAccount('account-456')
    })
    
    expect(result.current.selectedAccountId).toBe('account-456')
    expect(result.current.isSelected('account-123')).toBe(false)
    expect(result.current.isSelected('account-456')).toBe(true)
  })
})