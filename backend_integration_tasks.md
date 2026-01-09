# Backend Integration Tasks

## Authentication & User Session
- [ ] **User Status API**: The frontend needs an endpoint (e.g., `/api/me` or `/api/user/status`) to check if the user is currently logged in.
    - **Response (Logged In)**: 
      ```json
      {
        "isAuthenticated": true,
        "user": {
          "username": "johndoe",
          "email": "john@example.com",
          "avatar": "..."
        }
      }
      ```
    - **Response (Guest)**: 
      ```json
      {
        "isAuthenticated": false
      }
      ```

- [ ] **Role Management**: The backend should identify if a user is an 'admin' to hide global headers/footers on admin pages in the future.

- [ ] **Sign In / Sign Up**:
    - Endpoints for Login and Registration.
    - Session management (Cookies vs JWT).

## Product Data
- [ ] **Dynamic Products**: The "Shop" and "Student Kits" pages will need real data from the backend.
- [ ] **Best Sellers**: The landing page "Best Sellers" should be a query parameter or specific endpoint.
