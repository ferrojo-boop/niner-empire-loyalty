import { getSupabase } from '../supabase'

describe('getSupabase', () => {
  it('returns a supabase client instance', () => {
    const supabase = getSupabase()
    expect(supabase).toBeDefined()
    expect(typeof supabase.storage.from).toBe('function')
  })
})
