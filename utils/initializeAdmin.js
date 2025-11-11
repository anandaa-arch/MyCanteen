// utils/initializeAdmin.js - Create this file to set up default admin
export const initializeAdmin = () => {
  if (typeof window !== 'undefined') {
    const existingUsers = JSON.parse(localStorage.getItem('users')) || []
    
    // Check if admin already exists
    const adminExists = existingUsers.some(user => user.role === 'admin')
    
    if (!adminExists) {
      const defaultAdmin = {
        id: 'admin',
        name: 'Admin User',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString(),
        status: 'active'
      }
      
      const updatedUsers = [...existingUsers, defaultAdmin]
      localStorage.setItem('users', JSON.stringify(updatedUsers))
      console.log('Default admin created: ID = "admin", Password = "admin123"')
    }
  }
}

// Call this function when your app starts
// You can call it in your main layout or landing page