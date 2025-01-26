# Detailed Analysis: Review Service

## Event Flow, Queues, Routing Keys, and Payload

### 1. API Endpoints and Corresponding Events

#### 1.1 `POST /reviews`

**Description:** Create a new review for a restaurant.

- **Event Produced:** `ReviewCreated`
  - **Exchange:** `review_exchange`
  - **Routing Key:** `review.created`
  - **Payload:**
    ```json
    {
      "id": "rev_123",
      "restaurant": {
        "id": "rest_456"
      },
      "user": {
        "id": 789,
        "name": "John Doe"
      },
      "rating": 5,
      "comment": "Great food!",
      "createdAt": "2025-01-24T14:00:00Z"
    }
    ```
- **Consumers:**
  - **Restaurant Service:** Updates the average rating for the restaurant.

#### 1.2 `PATCH /reviews/:id`

**Description:** Update an existing review.

- **Event Produced:** `ReviewUpdated`
  - **Exchange:** `review_exchange`
  - **Routing Key:** `review.updated`
  - **Payload:**
    ```json
    {
      "id": "rev_123",
      "restaurant": {
        "id": "rest_456"
      },
      "user": {
        "id": 789,
        "name": "John Doe"
      },
      "rating": 4,
      "comment": "Good, but could be better!",
      "updatedAt": "2025-01-24T16:00:00Z"
    }
    ```
- **Consumers:**
  - **Restaurant Service:** Recalculates the average rating for the restaurant.

#### 1.3 `DELETE /reviews/:id`

**Description:** Delete an existing review.

- **Event Produced:** `ReviewDeleted`
  - **Exchange:** `review_exchange`
  - **Routing Key:** `review.deleted`
  - **Payload:**
    ```json
    {
      "id": "rev_123",
      "restaurant": {
        "id": "rest_456"
      },
      "user": {
        "id": 789
      },
      "deletedAt": "2025-01-24T17:00:00Z"
    }
    ```
- **Consumers:**
  - **Restaurant Service:** Updates the average rating for the restaurant.

---

### 2. Queues and Dependencies

#### Queues Managed by Review Service:

- **Queue:** `review_created_queue`

  - **Bindings:**
    - Exchange: `review_exchange`
    - Routing Key: `review.created`
  - **Purpose:** Handles review creation events.

- **Queue:** `review_updated_queue`

  - **Bindings:**
    - Exchange: `review_exchange`
    - Routing Key: `review.updated`
  - **Purpose:** Handles review update events.

- **Queue:** `review_deleted_queue`

  - **Bindings:**
    - Exchange: `review_exchange`
    - Routing Key: `review.deleted`
  - **Purpose:** Handles review deletion events.

#### Dependencies on Other Services:

- **User Service:**

  - Retrieves user details (e.g., name) during review creation.
  - Listens for `UserUpdated` and `UserDeleted` events to update or remove user details in reviews.

- **Restaurant Service:**
  - Consumes `ReviewCreated`, `ReviewUpdated`, and `ReviewDeleted` events to manage restaurant ratings.

---

### 3. Messaging Summary

| **Event**       | **Exchange**      | **Routing Key**  | **Payload Example**                                                      |
| --------------- | ----------------- | ---------------- | ------------------------------------------------------------------------ |
| `ReviewCreated` | `review_exchange` | `review.created` | `{ id, restaurant: {id}, user: {id, name}, rating, comment, createdAt }` |
| `ReviewUpdated` | `review_exchange` | `review.updated` | `{ id, restaurant: {id}, user: {id, name}, rating, comment, updatedAt }` |
| `ReviewDeleted` | `review_exchange` | `review.deleted` | `{ id, restaurant: {id}, user: {id}, deletedAt }`                        |
| `UserUpdated`   | `user_exchange`   | `user.updated`   | `{ id, name, updatedAt }`                                                |
| `UserDeleted`   | `user_exchange`   | `user.deleted`   | `{ id, deletedAt }`                                                      |

---

### 4. Database Schema (MongoDB)

#### Review Collection

```json
{
  "_id": "rev_123",
  "restaurant": {
    "id": "rest_456"
  },
  "user": {
    "id": 789,
    "name": "John Doe"
  },
  "rating": 5,
  "comment": "Great food!",
  "createdAt": "2025-01-24T14:00:00Z",
  "updatedAt": "2025-01-24T16:00:00Z"
}
```

---

### 5. Suggestions for Implementation

1. **Validation:**

   - Ensure the `restaurant.id` exists in the Restaurant Service.
   - Validate `user.id` with the User Service during review creation.

2. **Event Consistency:** Ensure atomic operations when emitting events to prevent data mismatches.

3. **Error Handling:** Implement retries and Dead Letter Queues for failed event processing.

4. **Scalability:** Use indexes on `restaurant.id` and `user.id` for efficient lookups.

5. **Concurrency Management:** Prevent conflicts during simultaneous updates to reviews.