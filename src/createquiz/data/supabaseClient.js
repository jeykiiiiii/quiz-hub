import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for your app
export const authAPI = {
  signUp: async (email, password, userData) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    
    if (authError) throw authError
    
    // Create user profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role || 'student'
        }])
      
      if (profileError) throw profileError
    }
    
    return authData
  },
  
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },
  
  signOut: async () => {
    return await supabase.auth.signOut()
  },
  
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }
}

export const classAPI = {
  joinClass: async (classCode, userId) => {
    // Find class by code
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id')
      .eq('code', classCode)
      .single()
    
    if (classError) throw classError
    
    // Enroll student
    const { data, error } = await supabase
      .from('enrollments')
      .insert([{
        user_id: userId,
        class_id: classData.id
      }])
      .select()
    
    return { data, error }
  },
  
  getStudentClasses: async (userId) => {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        class_id,
        classes (
          id,
          code,
          name,
          schedule,
          instructor_id,
          users!classes_instructor_id_fkey (first_name, last_name)
        )
      `)
      .eq('user_id', userId)
    
    return { data, error }
  }
}