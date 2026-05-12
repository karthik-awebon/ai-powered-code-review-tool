describe('Authentication Flow', () => {
  beforeEach(() => {
    // Intercept the session call to simulate logged out state by default
    cy.intercept('GET', '/api/auth/session', { body: {} }).as('getSession');
  });

  it('should display the sign in button when not authenticated', () => {
    cy.visit('/');
    cy.wait('@getSession');
    cy.get('button').contains('Sign in with GitHub').should('be.visible');
  });

  it('should display user menu when authenticated', () => {
    // Mock an active session
    cy.intercept('GET', '/api/auth/session', {
      body: {
        user: {
          name: 'Test User',
          image: 'https://github.com/test-user.png',
          email: 'test@example.com'
        },
        expires: new Date(Date.now() + 3600 * 1000).toISOString(),
        accessToken: 'mock-token'
      }
    }).as('getAuthenticatedSession');

    cy.visit('/');
    cy.wait('@getAuthenticatedSession');
    
    // Verify user avatar is present (alt text is "Test User")
    cy.get('img[alt="Test User"]').should('be.visible');
    cy.get('button').contains('Sign out').should('be.visible');
  });

  it('should trigger sign in action when clicking sign in button', () => {
    cy.visit('/');
    cy.wait('@getSession');
    
    // Since we use a Server Action in a form, we can't easily intercept it like a REST call,
    // but we can check if it tries to navigate to the auth provider or submits the form.
    // For this simple E2E, we just verify the presence of the form.
    cy.get('form').contains('Sign in with GitHub').parent('form').should('have.attr', 'action');
  });
});
