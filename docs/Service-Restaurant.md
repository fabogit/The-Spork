# Detailed Analysis: Restaurant Service

## Event Flow, Queues, Routing Keys, and Payload

### 1. API Endpoints and Corresponding Events

#### 1.1 `POST /restaurants`

**Description:** Create a new restaurant.

- **Event Produced:** `RestaurantCreated`
  - **Exchange:** `restaurant_exchange`
  - **Routing Key:** `restaurant.created`
  - **Payload:**
    ```json
    {
      "id": "rest_456",
      "name": "La Bella Tavola",
      "location": {
        "address": "123 Main St",
        "city": "Rome",
        "coordinates": {
          "latitude": 41.902782,
          "longitude": 12.496366
        }
      },
      "cuisine": ["Italian", "Pizza"],
      "hours": {
        "monday": ["11-15", "18-22"],
        "sunday": "closed"
      },
      "owners": [789],
      "menu": [
        { "name": "Margherita Pizza", "price": 10 },
        { "name": "Tiramisu", "price": 7 }
      ],
      "createdAt": "2025-01-24T14:00:00Z"
    }
    ```
- **Consumers:**
  - **Reservation Service:** Ensures the restaurant exists before accepting bookings.

#### 1.2 `PATCH /restaurants/:id`

**Description:** Update restaurant details.

- **Event Produced:** `RestaurantUpdated`
  - **Exchange:** `restaurant_exchange`
  - **Routing Key:** `restaurant.updated`
  - **Payload:**
    ```json
    {
      "id": "rest_456",
      "updatedFields": {
        "hours": {
          "monday": ["12-16", "19-23"]
        },
        "menu": [
          { "name": "Margherita Pizza", "price": 12 },
          { "name": "Panna Cotta", "price": 8 }
        ]
      },
      "updatedAt": "2025-01-25T10:00:00Z"
    }
    ```
- **Consumers:**
  - **Reservation Service:** Updates any dependent reservation logic, such as changes in opening hours that might affect reservations.

#### 1.3 `DELETE /restaurants/:id`

**Description:** Delete a restaurant.

- **Event Produced:** `RestaurantDeleted`
  - **Exchange:** `restaurant_exchange`
  - **Routing Key:** `restaurant.deleted`
  - **Payload:**
    ```json
    {
      "id": "rest_456",
      "deletedAt": "2025-01-25T12:00:00Z"
    }
    ```
- **Consumers:**
  - **Reservation Service:** Deletes related reservations.
  - **Review Service:** Deletes reviews for the restaurant.

#### 1.4 `GET /restaurants`

**Description:** Fetch restaurants with optional filters (e.g., city, cuisine, or rating).

- **Event Consumed:** None (direct database query).

#### 1.5 `GET /restaurants/:id`

**Description:** Fetch details of a specific restaurant.

- **Event Consumed:** None (direct database query).

---

### 2. Queues and Dependencies

#### Queues Managed by Restaurant Service:

- **Queue:** `restaurant_updated_queue`
  - **Bindings:**
    - Exchange: `restaurant_exchange`
    - Routing Key: `restaurant.updated`
  - **Purpose:** Handles updates to restaurant data.

- **Queue:** `restaurant_deleted_queue`
  - **Bindings:**
    - Exchange: `restaurant_exchange`
    - Routing Key: `restaurant.deleted`
  - **Purpose:** Handles restaurant deletion events.

#### Dependencies on Other Services:

- **Review Service:**
  - Consumes `ReviewCreated`, `ReviewUpdated`, and `ReviewDeleted` events to maintain the restaurant's average rating.

- **Reservation Service:**
  - Verifies the existence of a restaurant before accepting reservations.

---

### 3. Messaging Summary

| **Event**           | **Exchange**         | **Routing Key**      | **Payload Example**                                                      |
| ------------------- | -------------------- | -------------------- | ------------------------------------------------------------------------ |
| `RestaurantCreated` | `restaurant_exchange`| `restaurant.created` | `{ id, name, location, cuisine, hours, owners, menu, createdAt }`       |
| `RestaurantUpdated` | `restaurant_exchange`| `restaurant.updated` | `{ id, updatedFields, updatedAt }`                                      |
| `RestaurantDeleted` | `restaurant_exchange`| `restaurant.deleted` | `{ id, deletedAt }`                                                     |

---

### 4. Database Schema (MongoDB)

#### Restaurant Collection

```json
{
  "_id": "rest_456",
  "name": "La Bella Tavola",
  "location": {
    "address": "123 Main St",
    "city": "Rome",
    "coordinates": {
      "latitude": 41.902782,
      "longitude": 12.496366
    }
  },
  "cuisine": ["Italian", "Pizza"],
  "hours": {
    "monday": ["11-15", "18-22"],
    "sunday": "closed"
  },
  "owners": [789],
  "menu": [
    { "name": "Margherita Pizza", "price": 10 },
    { "name": "Tiramisu", "price": 7 }
  ],
  "rating": 4.5,
  "createdAt": "2025-01-24T14:00:00Z",
  "updatedAt": "2025-01-25T10:00:00Z"
}
```

---

### 5. Suggestions for Implementation

1. **Validation:**
   - Ensure the `owners` exist in the User Service during restaurant creation.
   - Validate `location` coordinates for correctness.

2. **Event Consistency:**
   - Emit events atomically with database operations.

3. **Error Handling:**
   - Implement retries and Dead Letter Queues for failed event processing.

4. **Scalability:**
   - Index `location.city`, `cuisine`, and `rating` for efficient querying.

5. **Authorization:**
   - Ensure only restaurant owners or admins can update/delete restaurants.

