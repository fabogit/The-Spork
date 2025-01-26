# General System Analysis

## 1. Overview

This document provides a general system analysis of the project, focusing on its event-driven architecture, API design, and inter-service communication. It details the events, producers, consumers, and queues for each service while highlighting their respective functionalities.

---

## 2. Functionality Grouping

### 2.1 Events, Producers, and Consumers

#### 2.1.1 **User Service**

- **Events Produced:**
  - `UserRegistered`:
    - **Exchange:** `user_exchange`
    - **Routing Key:** `user.registered`
    - **Payload:** `{ id, email, name, role, createdAt }`
    - **Consumers:**
      - **Reservation Service:** Initializes user-specific reservation context.
      - **Review Service:** Prepares context for user reviews.
      - **Notification Service (optional):** Sends welcome email.
  
  - `UserUpdated`:
    - **Exchange:** `user_exchange`
    - **Routing Key:** `user.updated`
    - **Payload:** `{ id, email, name, updatedAt }`
    - **Consumers:**
      - **Reservation Service:** Updates linked reservations.
      - **Review Service:** Updates linked reviews.

  - `UserDeleted`:
    - **Exchange:** `user_exchange`
    - **Routing Key:** `user.deleted`
    - **Payload:** `{ id, deletedAt }`
    - **Consumers:**
      - **Reservation Service:** Removes user-specific reservation data.
      - **Review Service:** Anonymizes or deletes user reviews.
      - **Notification Service (optional):** Sends account deletion confirmation.

- **Queues Managed:**
  - `user_registered_queue`:
    - **Bindings:** Exchange: `user_exchange`, Routing Key: `user.registered`
    - **Purpose:** Listens to acknowledgments from consumers.
  
  - `user_deleted_queue`:
    - **Bindings:** Exchange: `user_exchange`, Routing Key: `user.deleted`
    - **Purpose:** Ensures cleanup logic is processed by other services.

- **Database Used:** PostgreSQL

---

#### 2.1.2 **Review Service**

- **Events Produced:**
  - `ReviewCreated`:
    - **Exchange:** `review_exchange`
    - **Routing Key:** `review.created`
    - **Payload:** `{ id, restaurant: { id }, user: { id, name }, rating, comment, createdAt }`
    - **Consumers:**
      - **Restaurant Service:** Updates the average rating for the restaurant.

  - `ReviewUpdated`:
    - **Exchange:** `review_exchange`
    - **Routing Key:** `review.updated`
    - **Payload:** `{ id, restaurant: { id }, user: { id, name }, rating, comment, updatedAt }`
    - **Consumers:**
      - **Restaurant Service:** Recalculates the average rating for the restaurant.

  - `ReviewDeleted`:
    - **Exchange:** `review_exchange`
    - **Routing Key:** `review.deleted`
    - **Payload:** `{ id, restaurant: { id }, user: { id }, deletedAt }`
    - **Consumers:**
      - **Restaurant Service:** Updates the average rating for the restaurant.

- **Queues Managed:**
  - `review_created_queue`:
    - **Bindings:** Exchange: `review_exchange`, Routing Key: `review.created`
    - **Purpose:** Handles review creation events.

  - `review_updated_queue`:
    - **Bindings:** Exchange: `review_exchange`, Routing Key: `review.updated`
    - **Purpose:** Handles review update events.

  - `review_deleted_queue`:
    - **Bindings:** Exchange: `review_exchange`, Routing Key: `review.deleted`
    - **Purpose:** Handles review deletion events.

- **Database Used:** MongoDB

---

#### 2.1.3 **Restaurant Service**

- **Events Produced:**
  - `RestaurantCreated`:
    - **Exchange:** `restaurant_exchange`
    - **Routing Key:** `restaurant.created`
    - **Payload:** `{ id, name, location, cuisine, hours, owners, menu, createdAt }`
    - **Consumers:**
      - **Reservation Service:** Ensures the restaurant exists before accepting bookings.

  - `RestaurantUpdated`:
    - **Exchange:** `restaurant_exchange`
    - **Routing Key:** `restaurant.updated`
    - **Payload:** `{ id, updatedFields, updatedAt }`
    - **Consumers:**
      - **Reservation Service:** Updates reservation logic, e.g., changes in opening hours.

  - `RestaurantDeleted`:
    - **Exchange:** `restaurant_exchange`
    - **Routing Key:** `restaurant.deleted`
    - **Payload:** `{ id, deletedAt }`
    - **Consumers:**
      - **Reservation Service:** Deletes related reservations.
      - **Review Service:** Deletes restaurant-related reviews.

- **Queues Managed:**
  - `restaurant_updated_queue`:
    - **Bindings:** Exchange: `restaurant_exchange`, Routing Key: `restaurant.updated`
    - **Purpose:** Handles restaurant updates.

  - `restaurant_deleted_queue`:
    - **Bindings:** Exchange: `restaurant_exchange`, Routing Key: `restaurant.deleted`
    - **Purpose:** Handles restaurant deletions.

- **Database Used:** MongoDB

---

#### 2.1.4 **Reservation Service**

- **Events Produced:**
  - `ReservationCreated`:
    - **Exchange:** `reservation_exchange`
    - **Routing Key:** `reservation.created`
    - **Payload:** `{ id, userId, restaurantId, reservationTime, status, createdAt }`
    - **Consumers:**
      - **Restaurant Service:** Updates reservation count for the restaurant.
      - **Notification Service (optional):** Sends a confirmation email.

  - `ReservationUpdated`:
    - **Exchange:** `reservation_exchange`
    - **Routing Key:** `reservation.updated`
    - **Payload:** `{ id, status, updatedAt }`
    - **Consumers:**
      - **Restaurant Service:** Updates availability based on status changes.

  - `ReservationDeleted`:
    - **Exchange:** `reservation_exchange`
    - **Routing Key:** `reservation.deleted`
    - **Payload:** `{ id, deletedAt }`
    - **Consumers:**
      - **Restaurant Service:** Adjusts reservation count and availability.

- **Queues Managed:**
  - `reservation_created_queue`:
    - **Bindings:** Exchange: `reservation_exchange`, Routing Key: `reservation.created`
    - **Purpose:** Ensures reservation creation events are processed.

  - `reservation_updated_queue`:
    - **Bindings:** Exchange: `reservation_exchange`, Routing Key: `reservation.updated`
    - **Purpose:** Processes reservation updates.

  - `reservation_deleted_queue`:
    - **Bindings:** Exchange: `reservation_exchange`, Routing Key: `reservation.deleted`
    - **Purpose:** Handles reservation deletions.

- **Database Used:** MongoDB

---

### 2.2 API Endpoints Summary

- **User Service:**
  - `POST /auth/register`: Register a new user.
  - `POST /auth/login`: Authenticate and return a JWT.
  - `GET /users/me`: Get current logged user profile.
  - `PUT /users/:id`: Update an existing user.
  - `DELETE /users/:id`: Delete a user. Admin can delete any user; users can delete only their own account.

- **Restaurant Service:**
  - `GET /restaurants`: Get all restaurants with optional filters (city, cuisine).
  - `GET /restaurants/:id`: Get details of a single restaurant, including its menu.
  - `POST /restaurants`: Create a new restaurant (Admin only).
  - `PATCH /restaurants/:id`: Update a restaurant's details (Owner only).
  - `DELETE /restaurants/:id`: Delete a restaurant (Owner and Admin only).
  - `POST /restaurants/:id/menu`: Add a new item to the restaurant's menu (Owner only).
  - `GET /restaurants/:id/menu`: Retrieve the menu for a specific restaurant.
  - `PATCH /restaurants/:id/menu/:itemId`: Update a menu item (Owner only).
  - `DELETE /restaurants/:id/menu/:itemId`: Delete a menu item (Owner only).

- **Review Service:**
  - `GET /restaurants/:id/reviews`: Retrieve reviews for a specific restaurant.
  - `POST /restaurants/:id/reviews`: Add a review to a restaurant.
  - `PUT /reviews/:id`: Update an existing review.
  - `DELETE /reviews/:id`: Delete a review. Admin can delete any review; users can delete only their own reviews.

- **Reservation Service:**
  - `GET /restaurants/:id/reservations`: Retrieve reservations for a restaurant.
  - `GET /users/:id/reservations`: Retrieve reservations for a user.
  - `POST /reservations`: Create a new reservation.
  - `PUT /reservations/:id`: Update reservation status (Owner only).
  - `DELETE /reservations/:id`: Delete a reservation.

---

## 3. Recommendations and Notes

- **Error Handling:**
  - Implement retries and Dead Letter Queues for failed event processing.
  - Ensure robust error handling in each service for message delivery issues.

- **Scalability:**
  - Use appropriate indexing in databases for efficient queries.
  - Design services to handle a high volume of events and API requests.

- **Authentication and Authorization:**
  - Enforce JWT-based authentication across APIs.
  - Apply role-based access control (RBAC) where necessary.

- **Concurrency Management:**
  - Ensure atomic operations for event emission to avoid inconsistencies.

- **Documentation:**
  - Regularly update this analysis document to reflect architectural changes.

