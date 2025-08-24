// ***********************************************************
// This example support/commands.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login as admin user
       * @example cy.loginAsAdmin()
       */
      loginAsAdmin(): Chainable<void>
      
      /**
       * Custom command to login as receptionist
       * @example cy.loginAsReceptionist()
       */
      loginAsReceptionist(): Chainable<void>
      
      /**
       * Custom command to navigate to a dashboard section
       * @example cy.goToDashboardSection('rooms')
       */
      goToDashboardSection(section: string): Chainable<void>
    }
  }
}

// Custom command for admin login
Cypress.Commands.add('loginAsAdmin', () => {
  cy.visit('/login')
  cy.get('[data-testid="username-input"]').type('admin')
  cy.get('[data-testid="password-input"]').type('admin123')
  cy.get('[data-testid="login-button"]').click()
  cy.url().should('include', '/dashboard')
})

// Custom command for receptionist login
Cypress.Commands.add('loginAsReceptionist', () => {
  cy.visit('/login')
  cy.get('[data-testid="username-input"]').type('receptionist')
  cy.get('[data-testid="password-input"]').type('recep123')
  cy.get('[data-testid="login-button"]').click()
  cy.url().should('include', '/dashboard')
})

// Custom command for dashboard navigation
Cypress.Commands.add('goToDashboardSection', (section: string) => {
  cy.get(`[data-testid="nav-${section}"]`).click()
  cy.url().should('include', `/dashboard/${section}`)
})

export {}
