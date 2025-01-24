# Detailed Analysis: User Service

## Event Flow, Queues, Routing Keys, and Payload

### 1. API Endpoints and Corresponding Events

#### 1.1 `POST /auth/register`

**Description:** Register a new user.

- **Event Produced:** `UserRegistered`
  - **Exchange:** `user_exchange`
  - **Routing Key:** `user.registered`
  - **Payload:**
    ```json
    {
      "id": 123,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2025-01-24T12:00:00Z"
    }
    ```
- **Consumers:**
  - **Reservation Service:** Initializes user-specific reservation context.
  - **Review Service:** Prepares context for user reviews.
  - **Notification Service (optional):** Sends welcome email.

#### 1.2 `POST /auth/login`

**Description:** Authenticate and return a JWT.

- **Event Produced:** None (purely synchronous operation).

#### 1.3 `GET /users/me`

**Description:** Get current user profile.

- **Event Produced:** None (purely synchronous operation).

#### 1.4 `PATCH /users/me`

**Description:** Update current user profile.

- **Event Produced:** `UserUpdated`
  - **Exchange:** `user_exchange`
  - **Routing Key:** `user.updated`
  - **Payload:**
    ```json
    {
      "id": 123,
      "email": "user@example.com",
      "name": "John Smith",
      "updatedAt": "2025-01-24T12:30:00Z"
    }
    ```
- **Consumers:**
  - **Reservation Service:** Updates linked reservations (e.g., user's name).
  - **Review Service:** Updates linked reviews (e.g., display name).

#### 1.5 `DELETE /users/:id`

**Description:** Delete a user (admin can delete any user; users can delete their own account).

- **Event Produced:** `UserDeleted`
  - **Exchange:** `user_exchange`
  - **Routing Key:** `user.deleted`
  - **Payload:**
    ```json
    {
      "id": 123,
      "deletedAt": "2025-01-24T13:00:00Z"
    }
    ```
- **Consumers:**
  - **Reservation Service:** Removes user-specific reservation data.
  - **Review Service:** Marks user reviews as "deleted" or anonymizes them.
  - **Notification Service (optional):** Sends account deletion confirmation.

---

### 2. Queues and Dependencies

#### Queues Managed by User Service:

- `user_registered_queue`:

  - **Bindings:**
    - Exchange: `user_exchange`
    - Routing Key: `user.registered`
  - **Purpose:** Listens to acknowledgments from consumers (e.g., Reservation Service, Review Service).

- `user_deleted_queue`:

  - **Bindings:**
    - Exchange: `user_exchange`
    - Routing Key: `user.deleted`
  - **Purpose:** Ensures clean-up logic is processed by other services.

#### Dependencies on Other Services:

- **Reservation Service:**
  - Requires acknowledgment of `UserRegistered` and `UserDeleted` events.
- **Review Service:**
  - Requires acknowledgment of `UserRegistered`, `UserUpdated`, and `UserDeleted` events.
- **Notification Service (optional):**
  - Processes `UserRegistered` and `UserDeleted` for sending emails.

---

### 3. Messaging Summary

| **Event**        | **Exchange**    | **Routing Key**   | **Payload Example**                    |
| ---------------- | --------------- | ----------------- | -------------------------------------- |
| `UserRegistered` | `user_exchange` | `user.registered` | `{ id, email, name, role, createdAt }` |
| `UserUpdated`    | `user_exchange` | `user.updated`    | `{ id, email, name, updatedAt }`       |
| `UserDeleted`    | `user_exchange` | `user.deleted`    | `{ id, deletedAt }`                    |

---

### 4. Database Schema (PostgreSQL)

#### User Table

```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  password  String
  name      String
  role      Role      @default(USER)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

enum Role {
  USER
  OWNER
  ADMIN
}
```

---

### 5. Suggestions for Implementation

1. **Error Handling:** Ensure robust error handling for unacknowledged or failed event deliveries.
2. **Retries and Dead Letter Queues (DLQ):**
   - Implement retries for failed message processing.
   - Configure DLQs for persistent logging of failed messages.
3. **Authentication and Authorization:**
   - Use JWT for securing APIs.
   - Validate tokens within the API Gateway before routing requests to the User Service.

