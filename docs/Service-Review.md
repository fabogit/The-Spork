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
      "comment": "Amazing food!",
      "createdAt": "2025-01-24T14:00:00Z"
    }
    ```
- **Consumers:**
  - **Restaurant Service:** Updates the restaurant's average rating.

#### 1.2 `PATCH /reviews/:id`

**Description:** Update an existing review.

- **Event Produced:** `ReviewUpdated`
  - **Exchange:** `review_exchange`
  - **Routing Key:** `review.updated`
  - **Payload:**
    ```json
    {
      "id": "rev_123",
      "rating": 4,
      "comment": "Good, but could be better.",
      "updatedAt": "2025-01-24T15:00:00Z"
    }
    ```
- **Consumers:**
  - **Restaurant Service:** Recalculates the average rating based on the updated review.

#### 1.3 `DELETE /reviews/:id`

**Description:** Delete a review.

- **Event Produced:** `ReviewDeleted`
  - **Exchange:** `review_exchange`
  - **Routing Key:** `review.deleted`
  - **Payload:**
    ```json
    {
      "id": "rev_123",
      "deletedAt": "2025-01-24T16:00:00Z"
    }
    ```
- **Consumers:**
  - **Restaurant Service:** Recalculates the average rating to exclude the deleted review.

---

### 2. Queues and Dependencies

#### Queues Managed by Review Service:

- **Queue:** `review_created_queue`

  - **Bindings:**
    - Exchange: `review_exchange`
    - Routing Key: `review.created`
  - **Purpose:** Ensures that review creation events are processed.

- **Queue:** `review_updated_queue`

  - **Bindings:**
    - Exchange: `review_exchange`
    - Routing Key: `review.updated`
  - **Purpose:** Processes review updates.

- **Queue:** `review_deleted_queue`

  - **Bindings:**
    - Exchange: `review_exchange`
    - Routing Key: `review.deleted`
  - **Purpose:** Handles review deletions.

#### Dependencies on Other Services:

- **User Service:**
  - Retrieves user details (ID and name) during review creation.
  - Listens for `UserUpdated` and `UserDeleted` events to keep user details in reviews synchronized.
    - **`UserUpdated`:** Updates the `user.name` field in associated reviews.
    - **`UserDeleted`:** Either anonymizes the `user` field or handles the review accordingly (e.g., marking it as anonymous).

- **Restaurant Service:**
  - Consumes review-related events to maintain accurate average ratings for restaurants.

---

### 3. Messaging Summary

| **Event**        | **Exchange**      | **Routing Key**     | **Payload Example**                                               |
| ----------------- | ----------------- | ------------------- | ----------------------------------------------------------------- |
| `ReviewCreated`   | `review_exchange` | `review.created`    | `{ id, restaurantId, user, rating, comment, createdAt }`          |
| `ReviewUpdated`   | `review_exchange` | `review.updated`    | `{ id, rating, comment, updatedAt }`                              |
| `ReviewDeleted`   | `review_exchange` | `review.deleted`    | `{ id, deletedAt }`                                               |
| `UserUpdated`     | `user_exchange`   | `user.updated`      | `{ id, name, updatedAt }`                                         |
| `UserDeleted`     | `user_exchange`   | `user.deleted`      | `{ id, deletedAt }`                                               |

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
  "comment": "Amazing food!",
  "createdAt": "2025-01-24T14:00:00Z",
  "updatedAt": "2025-01-24T15:00:00Z"
}
```

---

### 5. Suggestions for Implementation

1. **Validation:** Ensure that the `userId` and `restaurantId` exist and are valid during review creation.
2. **Error Handling:** Implement retries and Dead Letter Queues for failed event processing.
3. **Data Synchronization:** Listen to `UserUpdated` and `UserDeleted` events to keep user details up-to-date.
4. **Concurrency Management:** Prevent conflicts during simultaneous updates to reviews.
5. **Scalability:** Index the `restaurantId` and `user.id` fields for efficient querying.

