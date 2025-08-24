describe('Room Management', () => {
  beforeEach(() => {
    cy.loginAsAdmin()
    cy.goToDashboardSection('rooms')
  })

  it('should display room grid', () => {
    cy.get('[data-testid="room-grid"]').should('be.visible')
    cy.get('[data-testid="room-card"]').should('have.length.at.least', 1)
  })

  it('should filter rooms by floor', () => {
    cy.get('[data-testid="floor-filter"]').select('1')
    cy.get('[data-testid="room-card"]').each(($card) => {
      cy.wrap($card).should('contain', '1') // Verificar que sea piso 1
    })
  })

  it('should filter rooms by status', () => {
    cy.get('[data-testid="status-filter"]').select('LIBRE')
    cy.get('[data-testid="room-card"]').each(($card) => {
      cy.wrap($card).find('[data-testid="room-status"]')
        .should('contain', 'LIBRE')
    })
  })

  it('should search rooms by number', () => {
    cy.get('[data-testid="search-input"]').type('101')
    cy.get('[data-testid="room-card"]').should('have.length', 1)
    cy.get('[data-testid="room-card"]').should('contain', '101')
  })

  it('should update room status', () => {
    cy.get('[data-testid="room-card"]').first().as('firstRoom')
    cy.get('@firstRoom').find('[data-testid="room-actions"]').click()
    cy.get('[data-testid="change-status-option"]').click()
    cy.get('[data-testid="status-select"]').select('SUCIA')
    cy.get('[data-testid="confirm-button"]').click()
    
    cy.get('@firstRoom').find('[data-testid="room-status"]')
      .should('contain', 'SUCIA')
  })

  it('should open edit room dialog', () => {
    cy.get('[data-testid="room-card"]').first()
      .find('[data-testid="room-actions"]').click()
    cy.get('[data-testid="edit-room-option"]').click()
    
    cy.get('[data-testid="edit-room-dialog"]').should('be.visible')
    cy.get('[data-testid="room-number-input"]').should('be.visible')
    cy.get('[data-testid="room-type-select"]').should('be.visible')
  })

  it('should display room statistics', () => {
    cy.get('[data-testid="room-stats"]').should('be.visible')
    cy.get('[data-testid="total-rooms"]').should('contain.text', /\d+/)
    cy.get('[data-testid="available-rooms"]').should('contain.text', /\d+/)
    cy.get('[data-testid="occupied-rooms"]').should('contain.text', /\d+/)
  })
})
