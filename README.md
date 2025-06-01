<!--
COLOR PALETTE (Professional Blue Theme)

- Primary Blue: #2563eb
- Blue Gradient 1: #1e40af
- Blue Gradient 2: #3b82f6
- Blue Gradient 3: #60a5fa
- Accent: #0ea5e9
- Light Background: #f8fafc
- Section Background: #e0e7ef
- Text: #0f172a
- Subtle Text: #64748b
- Border: #cbd5e1

To use these colors in markdown, apply them via HTML tags and inline styles.
-->

<div style="background: linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%); padding: 32px 0;">
  <h1 style="color: #2563eb; text-align: center; font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5em; letter-spacing: -1px;">E-Banking Application Documentation</h1>
  <p style="color: #64748b; text-align: center; font-size: 1.2rem; max-width: 900px; margin: 0 auto 2em auto;">
    This document provides a comprehensive overview of the main components in the E-Banking application, including entities, enums, repositories, DTOs, mappers, services, exceptions, REST controllers, and the security layer. The application is built with Java, Spring Boot, and follows a layered architecture to ensure maintainability and scalability.
  </p>
</div>

---

# <span style="color: #1e40af;">Entities</span>

<div style="background: #e0e7ef; padding: 1em 2em; border-radius: 8px; margin-bottom: 1.5em;">
Entities represent the core business objects persisted in the database.

<ul style="color: #0f172a;">
  <li><b>Customer</b>: Represents a bank customer with personal details and associated accounts.</li>
  <li><b>BankAccount (Abstract)</b>: Base class for all bank account types, holding common properties.</li>
  <li><b>CurrentAccount</b>: Extends <code>BankAccount</code> to add overdraft capability.</li>
  <li><b>SavingAccount</b>: Extends <code>BankAccount</code> to add interest rate.</li>
  <li><b>AccountOperation</b>: Represents a transaction (credit or debit) on a bank account.</li>
</ul>
</div>

---

# <span style="color: #1e40af;">Enums</span>

<div style="background: #e0e7ef; padding: 1em 2em; border-radius: 8px; margin-bottom: 1.5em;">
Enums define fixed sets of constants used throughout the application.

<ul style="color: #0f172a;">
  <li><b>AccountStatus</b>: Indicates the state of a bank account (<code>CREATED</code>, <code>ACTIVATED</code>, <code>SUSPENDED</code>).</li>
  <li><b>OperationType</b>: Specifies the type of account operation (<code>DEBIT</code>, <code>CREDIT</code>).</li>
</ul>
</div>

---

# <span style="color: #1e40af;">Repositories</span>

<div style="background: #e0e7ef; padding: 1em 2em; border-radius: 8px; margin-bottom: 1.5em;">
Spring Data JPA repositories for data access.

<ul style="color: #0f172a;">
  <li><b>CustomerRepository</b>: CRUD and search operations for customers.</li>
  <li><b>BankAccountRepository</b>: CRUD operations for bank accounts.</li>
  <li><b>AccountOperationRepository</b>: Operations for account transactions, including paginated queries.</li>
</ul>
</div>

---

# <span style="color: #1e40af;">DTOs (Data Transfer Objects)</span>

<div style="background: #e0e7ef; padding: 1em 2em; border-radius: 8px; margin-bottom: 1.5em;">
DTOs are used to transfer data between layers and to the client, decoupling internal models from API contracts.

<ul style="color: #0f172a;">
  <li><b>CustomerDTO</b>: Customer data for API requests/responses.</li>
  <li><b>BankAccountDTO</b>: Base DTO for account data.</li>
  <li><b>CurrentBankAccountDTO</b>: DTO for current account details.</li>
  <li><b>SavingBankAccountDTO</b>: DTO for savings account details.</li>
  <li><b>AccountOperationDTO</b>: DTO for transaction details.</li>
  <li><b>AccountHistoryDTO</b>: DTO for paginated account operations.</li>
  <li><b>DebitDTO, CreditDTO, TransferRequestDTO</b>: DTOs for debit, credit, and transfer requests.</li>
</ul>
</div>

---

# <span style="color: #1e40af;">Mappers</span>

<div style="background: #e0e7ef; padding: 1em 2em; border-radius: 8px; margin-bottom: 1.5em;">
Mappers convert between entities and DTOs, ensuring data consistency and separation between layers.

<ul style="color: #0f172a;">
  <li><b>BankAccountMapperImpl</b>: Contains methods to map between entities and their corresponding DTOs for customers, accounts, and operations. Uses Spring's <code>BeanUtils</code> for property copying and handles nested mappings.</li>
</ul>
</div>

---

# <span style="color: #1e40af;">Services</span>

<div style="background: #e0e7ef; padding: 1em 2em; border-radius: 8px; margin-bottom: 1.5em;">
Services encapsulate business logic and orchestrate operations between repositories and mappers.

<ul style="color: #0f172a;">
  <li><b>BankAccountService</b>: Interface defining all business operations (customer/account management, transactions, history).</li>
  <li><b>BankAccountServiceImpl</b>: Implements the service interface, handling business rules, validation, and exception management.</li>
  <li><b>BankService</b>: Utility service for consulting and printing account details and history.</li>
</ul>
</div>

---

# <span style="color: #1e40af;">Exceptions</span>

<div style="background: #e0e7ef; padding: 1em 2em; border-radius: 8px; margin-bottom: 1.5em;">
Custom exceptions for error handling and clear API responses.

<ul style="color: #0f172a;">
  <li><b>BankAccountNotFoundException</b>: Thrown when a bank account is not found.</li>
  <li><b>BalanceNotSufficientException</b>: Thrown when an account has insufficient funds for a transaction.</li>
  <li><b>CustomerNotFoundException</b>: Thrown when a customer is not found.</li>
</ul>
<p>Each exception extends <code>Exception</code> and provides a constructor for a custom error message.</p>
</div>

---

# <span style="color: #1e40af;">REST Controllers</span>

<div style="background: #e0e7ef; padding: 1em 2em; border-radius: 8px; margin-bottom: 1.5em;">
REST controllers expose the application's functionality via HTTP endpoints, handling requests and responses.

<h3 style="color: #2563eb;">CustomerRestController</h3>
<ul style="color: #0f172a;">
  <li><b>Purpose</b>: Manages customer-related operations via RESTful endpoints.</li>
  <li><b>Endpoints</b>:
    <ul>
      <li><code>GET /customers</code>: Retrieve all customers.</li>
      <li><code>GET /customers/search?keyword=...</code>: Search customers by keyword.</li>
      <li><code>GET /customers/{id}</code>: Get a specific customer by ID.</li>
      <li><code>POST /customers</code>: Create a new customer.</li>
      <li><code>PUT /customers/{customerId}</code>: Update an existing customer.</li>
      <li><code>DELETE /customers/{id}</code>: Delete a customer.</li>
    </ul>
  </li>
  <li><b>Notes</b>: Uses <code>BankAccountService</code> for business logic. Handles exceptions such as <code>CustomerNotFoundException</code>.</li>
</ul>

<h3 style="color: #2563eb;">BankAccountRestAPI</h3>
<ul style="color: #0f172a;">
  <li><b>Purpose</b>: Manages bank account and transaction operations via RESTful endpoints.</li>
  <li><b>Endpoints</b>:
    <ul>
      <li><code>GET /accounts/{accountId}</code>: Get account details by ID.</li>
      <li><code>GET /accounts</code>: List all accounts.</li>
      <li><code>GET /accounts/{accountId}/operations</code>: Get all operations for an account.</li>
      <li><code>GET /accounts/{accountId}/pageOperations</code>: Get paginated operations for an account.</li>
      <li><code>POST /accounts/debit</code>: Perform a debit operation.</li>
      <li><code>POST /accounts/credit</code>: Perform a credit operation.</li>
      <li><code>POST /accounts/transfer</code>: Transfer funds between accounts.</li>
    </ul>
  </li>
  <li><b>Notes</b>: Uses <code>BankAccountService</code> for business logic. Handles exceptions such as <code>BankAccountNotFoundException</code> and <code>BalanceNotSufficientException</code>.</li>
</ul>
</div>

---

# <span style="color: #1e40af;">Security Layer</span>

<div style="background: #e0e7ef; padding: 1em 2em; border-radius: 8px; margin-bottom: 1.5em;">
The security layer secures the application's endpoints using Spring Security and JWT (JSON Web Token) authentication. It ensures that only authenticated users can access protected resources and provides mechanisms for user login and token generation.

<h3 style="color: #2563eb;">SecurityConfig</h3>
<ul style="color: #0f172a;">
  <li><b>Purpose</b>: Configures Spring Security for the application.</li>
  <li><b>Key Features</b>:
    <ul>
      <li>Defines in-memory users with roles (<code>CLIENT</code>, <code>ADMIN</code>) and encrypted passwords.</li>
      <li>Configures stateless session management and disables CSRF for REST APIs.</li>
      <li>Sets up JWT encoding and decoding using a secret key from application properties.</li>
      <li>Configures CORS to allow cross-origin requests.</li>
      <li>Restricts access to endpoints: <code>/auth/login</code>, Swagger UI, and API docs are public; all others require authentication.</li>
    </ul>
  </li>
  <li><b>Beans Provided</b>:
    <ul>
      <li><code>AuthenticationManager</code>: Authenticates user credentials.</li>
      <li><code>UserDetailsService</code>: Loads user details from memory.</li>
      <li><code>PasswordEncoder</code>: Encrypts passwords using BCrypt.</li>
      <li><code>JwtEncoder</code>/<code>JwtDecoder</code>: Handles JWT creation and validation.</li>
      <li><code>CorsConfigurationSource</code>: Configures CORS policy.</li>
    </ul>
  </li>
</ul>
</div>

---

# <span style="color: #1e40af;">Frontend (Angular)</span>

<div style="background: #e0e7ef; padding: 1em 2em; border-radius: 8px; margin-bottom: 1.5em;">
This section documents the Angular frontend located in <code>client-ebank/</code>. It covers the main modules, components, services, models, and routing structure.
</div>

## <span style="color: #2563eb;">App Component</span>
<div style="background: #f8fafc; padding: 1em 2em; border-radius: 8px; margin-bottom: 1.5em;">
<ul style="color: #0f172a;">
  <li><b>app.ts</b>: Root component logic. Handles route changes to show/hide the navbar.</li>
  <li><b>app.html</b>: Root template. Displays the navbar (except on /login) and the router outlet.</li>
  <li><b>app.css</b>: Global styles for layout and background.</li>
</ul>
</div>

## <span style="color: #2563eb;">Routing</span>
<div style="background: #f8fafc; padding: 1em 2em; border-radius: 8px; margin-bottom: 1.5em;">
Routing is defined in <b>app.routes.ts</b> and maps URL paths to components:
<ul style="color: #0f172a;">
  <li><b>''</b>: Redirects to dashboard</li>
  <li><b>'login'</b>: Login page</li>
  <li><b>'dashboard'</b>: Dashboard page</li>
  <li><b>'customers'</b>: Customers management</li>
  <li><b>'accounts'</b>: Accounts management</li>
  <li><b>'**'</b>: Wildcard, redirects to dashboard</li>
</ul>
</div>

## <span style="color: #2563eb;">Modules & Components</span>
<div style="background: #f8fafc; padding: 1em 2em; border-radius: 8px; margin-bottom: 1.5em;">
<ul style="color: #0f172a;">
  <li><b>Login</b> (login.ts, login.html, login.css): User authentication form, handles login, error display, and navigation.</li>
  <li><b>Customers</b> (customers.ts, customers.html, customers.css): CRUD for customers, search, edit, create, delete, and view details in modal.</li>
  <li><b>Accounts</b> (accounts.ts, accounts.html, accounts.css): List and manage accounts, view details, history, and perform debit/credit/transfer operations.</li>
  <li><b>Dashboard</b> (dashboard.ts, dashboard.html, dashboard.css): Analytics dashboard with statistics, charts (ng2-charts/Chart.js), and recent operations.</li>
  <li><b>Navbar</b> (navbar.ts, navbar.html, navbar.css): Responsive navigation bar, links to main pages, logout, adapts to authentication state.</li>
</ul>
</div>

## <span style="color: #2563eb;">Services</span>
<div style="background: #f8fafc; padding: 1em 2em; border-radius: 8px; margin-bottom: 1.5em;">
<ul style="color: #0f172a;">
  <li><b>auth.service.ts</b>: Handles login, logout, JWT token storage, and authentication state.</li>
  <li><b>customer.service.ts</b>: CRUD operations for customers, search, and API communication (with JWT).</li>
  <li><b>account.service.ts</b>: Account management, operations (debit, credit, transfer), and history (with JWT).</li>
</ul>
</div>

## <span style="color: #2563eb;">Models</span>
<div style="background: #f8fafc; padding: 1em 2em; border-radius: 8px; margin-bottom: 1.5em;">
<ul style="color: #0f172a;">
  <li><b>customer.model.ts</b>: Defines the <code>Customer</code> interface (id, name, email, password?).</li>
</ul>
</div>

## <span style="color: #2563eb;">Technologies</span>
<div style="background: #f8fafc; padding: 1em 2em; border-radius: 8px; margin-bottom: 1.5em;">
<ul style="color: #0f172a;">
  <li>Angular 17+</li>
  <li>TypeScript</li>
  <li>Tailwind CSS</li>
  <li>ng2-charts & Chart.js (for dashboard)</li>
  <li>JWT authentication (with backend)</li>
</ul>
</div>

## <span style="color: #2563eb;">Notes</span>
<div style="background: #f8fafc; padding: 1em 2em; border-radius: 8px; margin-bottom: 1.5em;">
<ul style="color: #0f172a;">
  <li>All API requests include the JWT token in the Authorization header.</li>
  <li>Responsive design for desktop and mobile.</li>
  <li>Exception and error handling for user-friendly feedback.</li>
  <li>For development, run <code>npm install</code> then <code>npm start</code> in <code>client-ebank/</code>.</li>
</ul>
</div>

---
