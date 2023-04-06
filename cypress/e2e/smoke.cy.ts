import { faker } from "@faker-js/faker";

describe("smoke tests", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it("should allow you to register and login", () => {
    const loginForm = {
      first: faker.name.firstName(),
      last: faker.name.lastName(),
      email: `${faker.internet.userName()}@example.com`,
      password: faker.internet.password(),
    };
    cy.then(() => ({ email: loginForm.email })).as("user");

    cy.visitAndCheck("/");
    cy.findByRole("link", { name: /sign up/i }).click();

    cy.findByRole("textbox", { name: /first name/i }).type(loginForm.first);
    cy.findByRole("textbox", { name: /last name/i }).type(loginForm.last);
    cy.findByRole("textbox", { name: /email/i }).type(loginForm.email);
    cy.findByLabelText(/^password$/i).type(loginForm.password);
    cy.findByLabelText(/confirm password/i).type(loginForm.password);
    cy.findByRole("button", { name: /create account/i }).click();
  });
});
