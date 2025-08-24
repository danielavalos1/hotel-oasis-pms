describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should display login form', () => {
    cy.get('[data-testid="login-form"]').should('be.visible')
    cy.get('[data-testid="username-input"]').should('be.visible')
    cy.get('[data-testid="password-input"]').should('be.visible')
    cy.get('[data-testid="login-button"]').should('be.visible')
  })

  it('should show error for invalid credentials', () => {
    cy.get('[data-testid="username-input"]').type('invalid_user')
    cy.get('[data-testid="password-input"]').type('wrong_password')
    cy.get('[data-testid="login-button"]').click()
    
    cy.get('[data-testid="error-message"]').should('be.visible')
      .and('contain', 'Credenciales inválidas')
  })

  it('should login successfully as admin', () => {
    cy.fixture('users').then((users) => {
      cy.get('[data-testid="username-input"]').type(users.admin.username)
      cy.get('[data-testid="password-input"]').type(users.admin.password)
      cy.get('[data-testid="login-button"]').click()
      
      cy.url().should('include', '/dashboard')
      cy.get('[data-testid="user-menu"]').should('contain', 'admin')
    })
  })

  it('should login successfully as receptionist', () => {
    cy.fixture('users').then((users) => {
      cy.get('[data-testid="username-input"]').type(users.receptionist.username)
      cy.get('[data-testid="password-input"]').type(users.receptionist.password)
      cy.get('[data-testid="login-button"]').click()
      
      cy.url().should('include', '/dashboard')
      cy.get('[data-testid="user-menu"]').should('contain', 'receptionist')
    })
  })

  it('should redirect to login when accessing protected routes', () => {
    cy.visit('/dashboard')
    cy.url().should('include', '/login')
  })
})
