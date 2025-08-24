import { RoomStatusBadge } from '@/components/rooms'
import { mount } from '@cypress/react'

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}

beforeEach(() => {
  // Add mount to cy for component testing
  (cy as any).mount = mount
})

describe('RoomStatusBadge Component', () => {
  it('should render LIBRE status correctly', () => {
    cy.mount(<RoomStatusBadge status="LIBRE" />)
    
    cy.get('[data-testid="room-status-badge"]')
      .should('be.visible')
      .and('contain', 'LIBRE')
      .and('have.class', 'bg-green-100') // Assuming green for available
  })

  it('should render OCUPADA status correctly', () => {
    cy.mount(<RoomStatusBadge status="OCUPADA" />)
    
    cy.get('[data-testid="room-status-badge"]')
      .should('be.visible')
      .and('contain', 'OCUPADA')
      .and('have.class', 'bg-red-100') // Assuming red for occupied
  })

  it('should render SUCIA status correctly', () => {
    cy.mount(<RoomStatusBadge status="SUCIA" />)
    
    cy.get('[data-testid="room-status-badge"]')
      .should('be.visible')
      .and('contain', 'SUCIA')
      .and('have.class', 'bg-orange-100') // Assuming orange for dirty
  })

  it('should render RESERVADA status correctly', () => {
    cy.mount(<RoomStatusBadge status="RESERVADA" />)
    
    cy.get('[data-testid="room-status-badge"]')
      .should('be.visible')
      .and('contain', 'RESERVADA')
      .and('have.class', 'bg-blue-100') // Assuming blue for reserved
  })

  it('should render BLOQUEADA status correctly', () => {
    cy.mount(<RoomStatusBadge status="BLOQUEADA" />)
    
    cy.get('[data-testid="room-status-badge"]')
      .should('be.visible')
      .and('contain', 'BLOQUEADA')
      .and('have.class', 'bg-gray-100') // Assuming gray for blocked
  })

  it('should render EN_MANTENIMIENTO status correctly', () => {
    cy.mount(<RoomStatusBadge status="EN_MANTENIMIENTO" />)
    
    cy.get('[data-testid="room-status-badge"]')
      .should('be.visible')
      .and('contain', 'MANTENIMIENTO')
      .and('have.class', 'bg-yellow-100') // Assuming yellow for maintenance
  })
})
