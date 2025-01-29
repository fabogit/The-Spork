# System Architecture Analysis

## 1. High-Level Overview

The system architecture is designed as a distributed microservices ecosystem, leveraging Docker for containerization, RabbitMQ for message brokering, and a mix of PostgreSQL and MongoDB for data storage. The following provides a breakdown of the components:

### 1.1 Containers

- **API Gateway**: Acts as the entry point for all client requests, managing authentication, authorization, and routing to the appropriate microservices.
- **Microservices**:
  - **User Service**: Manages user authentication, registration, and profile management. Data stored in PostgreSQL.
  - **Restaurant Service**: Handles restaurant creation, updates, menus, and other details. Data stored in MongoDB.
  - **Review Service**: Manages reviews for restaurants, with data stored in MongoDB.
  - **Reservation Service**: Manages reservations for users and restaurants. Data stored in MongoDB.
- **RabbitMQ**: Facilitates asynchronous communication between services using a publish-subscribe model with dedicated exchanges and queues for each service.
- **Databases**:
  - **PostgreSQL**: Relational database for structured data, primarily used by the User Service.
  - **MongoDB**: NoSQL database for semi-structured data, used by Restaurant, Review, and Reservation Services.

### 1.2 Deployment Strategy

- All components are containerized using Docker.
- Services communicate over a Docker network, ensuring isolation and ease of scaling.
- RabbitMQ and databases are deployed as separate containers, with persistent volumes for data durability.

---

## 2. Communication Overview

### 2.1 tRPC

- **Purpose**: Provides a type-safe communication mechanism between the API Gateway and microservices, simplifying the development process and ensuring consistency in request/response schemas.
- **Implementation**:
  - The API Gateway forwards incoming client requests to the appropriate microservice via tRPC procedures.
  - Type definitions are shared between the Gateway and services, ensuring strict adherence to contracts.

### 2.2 RabbitMQ

- **Purpose**: Handles event-driven communication between microservices, decoupling their interactions and enabling scalability.
- **Exchanges and Queues**:
  - **User Service**:
    - **Exchange:** `user_exchange`
    - Queues: `user_registered_queue`, `user_deleted_queue`
  - **Review Service**:
    - **Exchange:** `review_exchange`
    - Queues: `review_created_queue`, `review_updated_queue`, `review_deleted_queue`
  - **Restaurant Service**:
    - **Exchange:** `restaurant_exchange`
    - Queues: `restaurant_updated_queue`, `restaurant_deleted_queue`
  - **Reservation Service**:
    - **Exchange:** `reservation_exchange`
    - Queues: `reservation_created_queue`, `reservation_updated_queue`, `reservation_deleted_queue`

### 2.3 Message Flow Between API Gateway and Services

1. **Request Handling**:
   - API Gateway validates client requests (authentication and authorization).
   - Based on the requested endpoint, the Gateway invokes the appropriate tRPC procedure or forwards the request to RabbitMQ if it requires asynchronous handling.

2. **Asynchronous Communication**:
   - Services publish events to RabbitMQ exchanges upon completing specific actions.
   - Other services consume these events from their respective queues and process them accordingly.

3. **Error Handling**:
   - RabbitMQ implements retries for failed message deliveries.
   - Dead Letter Queues (DLQs) are configured for persistent logging of unprocessed messages.

---

## 3. Inter-Service Coordination

### 3.1 Role of the API Gateway

- Centralized point for:
  - **Routing**: Directs client requests to appropriate services.
  - **Authentication**: Verifies JWT tokens for secure access.
  - **Load Balancing**: Distributes requests across multiple instances of services.
- Communication protocols:
  - **REST** for synchronous operations.
  - **WebSocket** for real-time updates (optional).

### 3.2 Protocols for Service Communication

- **tRPC**: Handles synchronous requests from the API Gateway to microservices.
- **RabbitMQ**: Facilitates asynchronous communication between services, ensuring eventual consistency across the system.

---

## 4. Deployment and Scalability

### 4.1 Container Orchestration

- **Docker Compose**: Used for local development, ensuring all services, RabbitMQ, and databases run within a unified network.
- **Scaling**:
  - Services can be scaled independently by increasing the number of container instances.
  - RabbitMQ can be clustered for high availability and load distribution.

### 4.2 Load Balancing

- API Gateway handles incoming request distribution.
- Horizontal scaling of services ensures high throughput under increased load.

### 4.3 Database Scaling

- **PostgreSQL**: Use read replicas for scaling read-heavy operations.
- **MongoDB**: Scale horizontally using sharding for large datasets.

---

## 5. Recommendations and Notes

- **Monitoring and Logging**:
  - Use tools like Prometheus and Grafana for monitoring service health and performance.
  - Centralized logging (e.g., ELK stack) to track events and errors.

- **Message Durability**:
  - Configure RabbitMQ to persist messages for critical events.

- **Security**:
  - Use SSL/TLS for secure communication between services and clients.
  - Regularly rotate JWT signing keys.

- **Documentation**:
  - Keep tRPC type definitions and RabbitMQ event payloads updated to reflect schema changes.

This architecture ensures a scalable, reliable, and maintainable system, adhering to microservices principles while providing flexibility for future enhancements.

