import { supabase } from '../supabase'

describe('supabase client', () => {
  it('exports a supabase client instance', () => {
    expect(supabase).toBeDefined()
    expect(typeof supabase.storage.from).toBe('function')
  })
})
