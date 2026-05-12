describe('AI Code Review Flow', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
  });

  it('should display the home page with the correct title', () => {
    cy.get('h1').should('contain', 'AI-Powered Code Review Tool');
    cy.get('input[placeholder*="owner/repo#123"]').should('be.visible');
  });

  it('should show error for invalid PR format', () => {
    cy.get('input[placeholder*="owner/repo#123"]').type('invalid-format');
    cy.contains('✗ Unrecognized format').should('be.visible');
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should show success recognition for valid PR shorthand', () => {
    cy.get('input[placeholder*="owner/repo#123"]').type('facebook/react#12345');
    cy.contains('✓ Recognized: facebook/react #12345').should('be.visible');
    cy.get('button[type="submit"]').should('not.be.disabled');
  });

  it('should load example PR when clicking the button', () => {
    cy.contains('button', 'Example PR').click();
    cy.get('input').should('have.value', 'vercel/next.js/pull/76505');
    cy.contains('✓ Recognized: vercel/next.js #76505').should('be.visible');
  });

  it('should handle repository default settings', () => {
    cy.get('input[placeholder="owner/repo"]').clear().type('my-org/my-repo');
    cy.get('input[placeholder*="owner/repo#123"]').type('#555');
    cy.contains('✓ Recognized: my-org/my-repo #555').should('be.visible');
  });
});
