// Stub implementation - replace with actual API calls
export const authService = {
  async login(email: string, password: string) {
    // Mock login
    return {
      token: 'mock-jwt-token',
      admin: {
        id: '1',
        email,
        name: 'NATPAC Admin',
        role: 'admin' as const,
        organization: 'NATPAC',
        createdAt: new Date().toISOString(),
      }
    };
  },
  
  async verifyToken(token: string) {
    // Mock verify
    return {
      id: '1',
      email: 'admin@natpac.gov.in',
      name: 'NATPAC Admin',
      role: 'admin' as const,
      organization: 'NATPAC',
      createdAt: new Date().toISOString(),
    };
  }
};