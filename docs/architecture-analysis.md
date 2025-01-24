# General Architecture Analysis

## 1. API Gateway

*   **Function:** Single entry point for all client requests.
*   **Technologies:** NestJS, with support for gRPC and RabbitMQ.
*   **Responsibilities:**
    *   Centralized authentication and authorization.
    *   Routing requests to the appropriate microservices.
    *   Aggregation of microservice responses (if necessary).

## 2. Microservices

*   **User Service:**
    *   Manages user registration, authentication, and profiles.
    *   **Database:** PostgreSQL.
    *   **Communication:** gRPC for synchronous operations (e.g., authentication) and RabbitMQ for asynchronous notifications/events.
*   **Restaurant Service:**
    *   Manages the creation, modification, and deletion of restaurants and menus.
    *   **Database:** MongoDB.
    *   **Communication:** RabbitMQ for events like "Restaurant created".
*   **Reservation Service:**
    *   Manages restaurant reservations, status updates (pending/approved/rejected).
    *   **Database:** PostgreSQL.
    *   **Communication:** RabbitMQ for reservation status notifications.
*   **Review Service:**
    *   Manages user reviews of restaurants.
    *   **Database:** MongoDB.
    *   **Communication:** RabbitMQ for notifications related to reviews.

## 3. Messaging System

*   **RabbitMQ:** Exchange of asynchronous events between microservices.
*   **Exchanges used:**
    *   `user_exchange`: For user-related events (e.g., "User registered").
    *   `restaurant_exchange`: For restaurant-related events (e.g., "Restaurant created").
    *   `reservation_exchange`: For reservation updates (e.g., "Reservation confirmed").
    *   `review_exchange`: For review notifications.

## 4. Database

*   **PostgreSQL:** Storage of structured data such as users and reservations.
*   **MongoDB:** More flexible data such as restaurants, menus, and reviews.

# Main Event Flows

## 1. User Registered

*   **Producer:** User Service.
*   **Consumers:**
    *   Reservation Service: Prepares initial data for the user.
    *   Review Service: Initializes a context for future reviews.
    *   Notification Service (optional): Sends a welcome email.

## 2. Restaurant Created

*   **Producer:** Restaurant Service.
*   **Consumers:**
    *   Review Service: Associates the new restaurant with the review system.
    *   Notification Service: Notifies the owner that the restaurant has been created.

## 3. Reservation Created

*   **Producer:** Reservation Service.
*   **Consumers:**
    *   Restaurant Service: Updates availability.
    *   Notification Service: Sends confirmation to the customer.

## 4. Review Published

*   **Producer:** Review Service.
*   **Consumers:**
    *   Restaurant Service: Updates the average restaurant rating.
    *   Notification Service: Sends notification to the restaurant owner.