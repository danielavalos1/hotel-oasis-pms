describe('Staff Management', () => {
  beforeEach(() => {
    cy.loginAsAdmin()
    cy.goToDashboardSection('staff')
  })

  it('should display staff list', () => {
    cy.get('[data-testid="staff-container"]').should('be.visible')
    cy.get('[data-testid="staff-list"]').should('be.visible')
    cy.get('[data-testid="staff-card"]').should('have.length.at.least', 1)
  })

  it('should filter staff by department', () => {
    cy.get('[data-testid="department-filter"]').select('1') // Assuming department ID 1
    cy.get('[data-testid="staff-card"]').should('be.visible')
  })

  it('should filter staff by status', () => {
    cy.get('[data-testid="status-filter"]').select('ACTIVE')
    cy.get('[data-testid="staff-card"]').each(($card) => {
      cy.wrap($card).find('[data-testid="staff-status"]')
        .should('contain', 'ACTIVE')
    })
  })

  it('should search staff by name', () => {
    cy.get('[data-testid="search-input"]').type('admin')
    cy.get('[data-testid="staff-card"]').should('have.length.at.least', 1)
    cy.get('[data-testid="staff-card"]').should('contain', 'admin')
  })

  it('should display staff statistics', () => {
    cy.get('[data-testid="staff-stats"]').should('be.visible')
    cy.get('[data-testid="total-staff"]').should('contain.text', /\d+/)
    cy.get('[data-testid="active-staff"]').should('contain.text', /\d+/)
    cy.get('[data-testid="departments-count"]').should('contain.text', /\d+/)
  })

  it('should access staff management tabs', () => {
    // Test departments tab
    cy.get('[data-testid="departments-tab"]').click()
    cy.get('[data-testid="department-manager"]').should('be.visible')
    
    // Test attendance tab
    cy.get('[data-testid="attendance-tab"]').click()
    cy.get('[data-testid="attendance-manager"]').should('be.visible')
    
    // Test schedules tab
    cy.get('[data-testid="schedules-tab"]').click()
    cy.get('[data-testid="schedule-manager"]').should('be.visible')
  })

  it('should not allow access for non-admin users', () => {
    cy.loginAsReceptionist()
    cy.visit('/dashboard/staff')
    
    // Should redirect or show access denied
    cy.url().should('not.include', '/staff')
  })
})
