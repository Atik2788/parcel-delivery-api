# Parcel Delivery Service

Welcome to the **Parcel Delivery Service**, a robust and scalable Node.js application built with TypeScript, Express, MongoDB, and Mongoose. This application facilitates parcel delivery operations, allowing users to create, track, and manage parcels with role-based access control for Senders, Receivers, Admins, and Super Admins. The system supports Google OAuth2 and credential-based authentication, ensuring secure access and seamless user experience.

This README provides an overview of the project, setup instructions, API testing details, and more. You can copy and paste this file into your project to create a professional and comprehensive guide.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [Authentication Routes](#authentication-routes)
  - [User Routes](#user-routes)
  - [Parcel Routes](#parcel-routes)
  - [Admin Routes](#admin-routes)
- [API Testing Guide](#api-testing-guide)
  - [Testing Tools](#testing-tools)
  - [Authentication](#authentication)
  - [User API Testing](#user-api-testing)
  - [Parcel API Testing](#parcel-api-testing)
  - [Admin API Testing](#admin-api-testing)
- [Error Handling](#error-handling)
- [Contributing](#contributing)
- [License](#license)
- [References](#references)

---

## Project Overview
The Parcel Delivery Service is designed to streamline parcel delivery operations. It provides a RESTful API for managing users, parcels, and administrative tasks. The application supports:
- **User Management**: Register, update profiles, and authenticate users via credentials or Google OAuth2.
- **Parcel Management**: Create, claim, track, rate, and cancel parcels.
- **Admin Operations**: Manage users and parcels with role-based access for Admins and Super Admins.
- **Secure Authentication**: JWT-based tokens and session management for secure access.
- **Error Handling**: Comprehensive error handling for validation, duplicates, and more.

---

## Features
- **Role-Based Access Control**: Supports SENDER, RECEIVER, ADMIN, and SUPER_ADMIN roles.
- **Parcel Tracking**: Track parcels through various statuses (REQUESTED, APPROVED, DISPATCHED, IN_TRANSIT, DELIVERED, CANCELLED, RETURNED, BLOCKED).
- **Authentication**: Supports credential-based login and Google OAuth2.
- **Parcel Rating**: Senders and receivers can rate each other after delivery.
- **Admin Dashboard**: Admins can fetch all users and parcels, block/unblock parcels.
- **Error Handling**: Robust handling of MongoDB, Zod, and custom errors.
- **Pagination and Filtering**: Efficient querying with pagination and search functionality.

---

## Technologies Used
- **Node.js**: Runtime environment for the backend.
- **Express.js**: Web framework for building RESTful APIs.
- **TypeScript**: Adds static typing for better code reliability.
- **MongoDB & Mongoose**: Database and ODM for data storage and querying.
- **Passport.js**: Authentication middleware for Google OAuth2 and local strategy.
- **Zod**: Schema validation for request payloads.
- **JWT**: JSON Web Tokens for secure authentication.
- **Bcryptjs**: Password hashing for secure storage.
- **CORS & Cookie-Parser**: Middleware for handling cross-origin requests and cookies.
- **ESLint & Prettier**: Code linting and formatting for consistency.

---

## Getting Started

### Prerequisites
Ensure you have the following installed:
- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance, e.g., MongoDB Atlas)
- **Postman** or any API testing tool
- **Git** for version control

### Installation
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd parcel-delivery-service
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory and configure the variables (see [Environment Variables](#environment-variables)).

4. **Run the Application**:
   - Development mode:
     ```bash
     npm run dev
     ```
   - Production mode:
     ```bash
     npm run build
     npm start
     ```

5. **Access the API**:
   The server will run on `http://localhost:<PORT>` (default: 5000).

### Environment Variables
Create a `.env` file in the project root and add the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
DB_URL=mongodb://localhost:27017/parcel-delivery
EXPRESS_SESSION_SECRET=your-session-secret
BCRYPT_SALT_ROUNDS=12
JWT_ACCESS_SECRET=your-jwt-access-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret

# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL= https://parcel-delivery-api-a9en.onrender.com/api/v1/auth/google/callback
```

- **PORT**: Port for the server.
- **NODE_ENV**: Set to `development` or `production`.
- **DB_URL**: MongoDB connection string.
- **EXPRESS_SESSION_SECRET**: Secret for session management.
- **BCRYPT_SALT_ROUNDS**: Number of rounds for bcrypt hashing.
- **JWT_ACCESS_SECRET**: Secret for JWT access token.
- **JWT_REFRESH_SECRET**: Secret for JWT refresh token.
- **GOOGLE_CLIENT_ID/SECRET**: Google OAuth2 credentials.
- **GOOGLE_CALLBACK_URL**: Callback URL for Google OAuth2.

---

## API Endpoints
The API is organized into routes for authentication, user management, parcel operations, and admin tasks. All routes are prefixed with `/api/v1`.

### Authentication Routes
- **POST https://parcel-delivery-api-a9en.onrender.com//api/v1/auth/login**: Log in with email and password.
- **POST https://parcel-delivery-api-a9en.onrender.com//api/v1/auth/refresh-token**: Generate a new access token using a refresh token.

### User Routes
- **POST https://parcel-delivery-api-a9en.onrender.com//api/v1/users/register**: Register a new user.
- **PATCH https://parcel-delivery-api-a9en.onrender.com//api/v1/users/:id**: Update user profile (requires authentication).

### Parcel Routes
- **POST https://parcel-delivery-api-a9en.onrender.com//api/v1/parcels**: Create a new parcel (SENDER only).
- **PATCH https://parcel-delivery-api-a9en.onrender.com//api/v1/parcels/claim/:id**: Claim a parcel (RECEIVER only).
- **PATCH https://parcel-delivery-api-a9en.onrender.com//api/v1/parcels/update-tracking-sender**: Update parcel status (SENDER only).
- **PATCH https://parcel-delivery-api-a9en.onrender.com//api/v1/parcels/update-tracking-receiver**: Update parcel status (RECEIVER only).
- **PATCH https://parcel-delivery-api-a9en.onrender.com//api/v1/parcels/rating/:trackingId**: Rate a parcel (SENDER or RECEIVER).
- **PATCH https://parcel-delivery-api-a9en.onrender.com//api/v1/parcels/cancel/:parcelId**: Cancel a parcel (SENDER only).
- **GET https://parcel-delivery-api-a9en.onrender.com//api/v1/parcels/my-parcels-sender**: Get sender's parcels (SENDER only).
- **GET https://parcel-delivery-api-a9en.onrender.com//api/v1/parcels/my-parcels-receiver**: Get receiver's parcels (RECEIVER only).
- **GET https://parcel-delivery-api-a9en.onrender.com//api/v1/parcels/incoming-parcels**: Get unclaimed parcels (RECEIVER only).

### Admin Routes
- **GET https://parcel-delivery-api-a9en.onrender.com//api/v1/adminRoute/all-users**: Fetch all users (ADMIN or SUPER_ADMIN).
- **GET https://parcel-delivery-api-a9en.onrender.com//api/v1/adminRoute/all-parcels**: Fetch all parcels (ADMIN or SUPER_ADMIN).
- **PATCH https://parcel-delivery-api-a9en.onrender.com//api/v1/adminRoute/parcel-block/:id**: Block/unblock a parcel (ADMIN or SUPER_ADMIN).

---

## API Testing Guide
This section provides detailed instructions for testing the API using **Postman** or any other API client. Each endpoint is explained with required headers, body, and example responses.

### Testing Tools
- **Postman**: Recommended for testing API endpoints.
- **cURL**: Alternative for command-line testing.
- **Thunder Client**: VS Code extension for API testing.

### Authentication
Most endpoints require a JWT access token in the `Authorization` header:
```http
Authorization: Bearer <your-access-token>
```

To obtain a token:
1. **Log in**:
   ```http
   POST https://parcel-delivery-api-a9en.onrender.com//api/v1/auth/login
   Content-Type: application/json

   {
       "email": "user@example.com",
       "password": "Password123!"
   }
   ```
   **Response**:
   ```json
   {
       "success": true,
       "message": "User Logged in successfully",
       "data": {
           "accessToken": "<jwt-access-token>",
           "refreshToken": "<jwt-refresh-token>",
           "user": { ... }
       }
   }
   ```

2. **Refresh Token** (if access token expires):
   ```http
   POST https://parcel-delivery-api-a9en.onrender.com//api/v1/auth/refresh-token
   Content-Type: application/json

   {
       "refreshToken": "<jwt-refresh-token>"
   }
   ```
   **Response**:
   ```json
   {
       "success": true,
       "message": "New access token generated",
       "data": {
           "accessToken": "<new-jwt-access-token>"
       }
   }
   ```

### User API Testing
#### 1. Register a User
- **Endpoint**: `POST https://parcel-delivery-api-a9en.onrender.com//api/v1/users/register`
- **Body**:
  ```json
  {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "password": "Password123!",
      "phone": "+8801712345678",
      "address": "123, Dhaka",
      "role": "SENDER"
  }
  ```
- **Response**:
  ```json
  {
      "success": true,
      "message": "User created successfully",
      "data": {
          "user": {
              "name": "John Doe",
              "email": "john.doe@example.com",
              "role": "SENDER",
              ...
          }
      }
  }
  ```

#### 2. Update User Profile
- **Endpoint**: `PATCH https://parcel-delivery-api-a9en.onrender.com//api/v1/users/:id`
- **Headers**:
  ```http
  Authorization: Bearer <jwt-access-token>
  ```
- **Body**:
  ```json
  {
      "name": "John Updated",
      "phone": "+8801812345678",
      "password": "NewPassword123!",
      "oldPassword": "Password123!"
  }
  ```
- **Response**:
  ```json
  {
      "success": true,
      "message": "User updated successfully",
      "data": {
          "newUpdateUser": {
              "name": "John Updated",
              "phone": "+8801812345678",
              ...
          }
      }
  }
  ```

### Parcel API Testing
#### 1. Create a Parcel
- **Endpoint**: `POST https://parcel-delivery-api-a9en.onrender.com//api/v1/parcels`
- **Headers**:
  ```http
  Authorization: Bearer <jwt-access-token>
  ```
- **Body**:
  ```json
  {
      "type": "Document",
      "weight": 2.5,
      "deliveryDate": "2025-10-05",
      "pickupPhone": "+8801712345678",
      "deliveryPhone": "+8801812345678",
      "pickupAddress": {
          "division": "Dhaka",
          "area": "Mirpur",
          "postOffice": "Mirpur DOHS",
          "district": "Dhaka",
          "extra": "House 123"
      },
      "deliveryAddress": {
          "division": "Chittagong",
          "area": "Agrabad",
          "postOffice": "Agrabad PO",
          "district": "Chittagong"
      }
  }
  ```
- **Response**:
  ```json
  {
      "success": true,
      "message": "Parcel created successfully",
      "data": {
          "trackingId": "TRK-20250929-123456",
          "type": "Document",
          "weight": 2.5,
          "fee": 100,
          ...
      }
  }
  ```

#### 2. Claim a Parcel
- **Endpoint**: `PATCH https://parcel-delivery-api-a9en.onrender.com//api/v1/parcels/claim/:id`
- **Headers**:
  ```http
  Authorization: Bearer <jwt-access-token>
  ```
- **Body**:
  ```json
  {
      "name": "Jane Doe",
      "receiverPhone": "+8801912345678"
  }
  ```
- **Response**:
  ```json
  {
      "success": true,
      "message": "Parcel claimed successfully",
      "data": {
          "trackingId": "TRK-20250929-123456",
          "currentStatus": "DISPATCHED",
          ...
      }
  }
  ```

#### 3. Update Tracking (Receiver)
- **Endpoint**: `PATCH https://parcel-delivery-api-a9en.onrender.com//api/v1/parcels/update-tracking-receiver`
- **Headers**:
  ```http
  Authorization: Bearer <jwt-access-token>
  ```
- **Body**:
  ```json
  {
      "trackingId": "TRK-20250929-123456",
      "currentStatus": "IN_TRANSIT",
      "location": "Chittagong Port",
      "note": "Parcel in transit to destination"
  }
  ```
- **Response**:
  ```json
  {
      "success": true,
      "message": "Tracking updated successfully",
      "data": {
          "trackingId": "TRK-20250929-123456",
          "currentStatus": "IN_TRANSIT",
          ...
      }
  }
  ```

#### 4. Update Tracking (Sender)
- **Endpoint**: `PATCH https://parcel-delivery-api-a9en.onrender.com//api/v1/parcels/update-tracking-sender`
- **Headers**:
  ```http
  Authorization: Bearer <jwt-access-token>
  ```
- **Body**:
  ```json
  {
      "trackingId": "TRK-20250929-123456",
      "currentStatus": "CANCELLED"
  }
  ```
- **Response**:
  ```json
  {
      "success": true,
      "message": "Current Status updated successfully",
      "data": {
          "trackingId": "TRK-20250929-123456",
          "currentStatus": "CANCELLED",
          ...
      }
  }
  ```

#### 5. Rate a Parcel
- **Endpoint**: `PATCH https://parcel-delivery-api-a9en.onrender.com//api/v1/parcels/rating/:trackingId`
- **Headers**:
  ```http
  Authorization: Bearer <jwt-access-token>
  ```
- **Body**:
  ```json
  {
      "rating": 5,
      "feedback": "Excellent delivery service!"
  }
  ```
- **Response**:
  ```json
  {
      "success": true,
      "message": "Rating submitted successfully",
      "data": {
          "senderToReceiver": {
              "rating": 5,
              "feedback": "Excellent delivery service!",
              "createdAt": "2025-09-29T05:43:00.000Z"
          }
      }
  }
  ```

#### 6. Cancel a Parcel
- **Endpoint**: `PATCH https://parcel-delivery-api-a9en.onrender.com//api/v1/parcels/cancel/:parcelId`
- **Headers**:
  ```http
  Authorization: Bearer <jwt-access-token>
  ```
- **Response**:
  ```json
  {
      "success": true,
      "message": "Parcel cancelled successfully",
      "data": {
          "trackingId": "TRK-20250929-123456",
          "currentStatus": "CANCELLED",
          ...
      }
  }
  ```

#### 7. Get Sender's Parcels
- **Endpoint**: `GET https://parcel-delivery-api-a9en.onrender.com//api/v1/parcels/my-parcels-sender`
- **Headers**:
  ```http
  Authorization: Bearer <jwt-access-token>
  ```
- **Response**:
  ```json
  {
      "success": true,
      "message": "Parcels retrieved successfully",
      "data": [
          {
              "trackingId": "TRK-20250929-123456",
              "type": "Document",
              ...
          }
      ],
      "meta": {
          "totalCount": 5,
          "deliveredCount": 2,
          ...
      }
  }
  ```

#### 8. Get Receiver's Parcels
- **Endpoint**: `GET https://parcel-delivery-api-a9en.onrender.com//api/v1/parcels/my-parcels-receiver`
- **Headers**:
  ```http
  Authorization: Bearer <jwt-access-token>
  ```
- **Response**:
  ```json
  {
      "success": true,
      "message": "Parcels retrieved successfully",
      "data": [
          {
              "trackingId": "TRK-20250929-123456",
              "type": "Document",
              ...
          }
      ],
      "meta": {
          "totalParcel": 3,
          "deliveredCount": 1,
          ...
      }
  }
  ```

#### 9. Get Incoming Parcels
- **Endpoint**: `GET https://parcel-delivery-api-a9en.onrender.com//api/v1/parcels/incoming`
- **Headers**:
  ```http
  Authorization: Bearer <jwt-access-token>
  ```
- **Response**:
  ```json
  {
      "success": true,
      "message": "Parcels retrieved successfully",
      "data": [
          {
              "trackingId": "TRK-20250929-123456",
              "type": "Document",
              ...
          }
      ],
      "meta": {
          "total": 10
      }
  }
  ```

### Admin API Testing
#### 1. Get All Users
- **Endpoint**: `GET https://parcel-delivery-api-a9en.onrender.com//api/v1/adminRoute/all-users?search=john&page=1&limit=10`
- **Headers**:
  ```http
  Authorization: Bearer <jwt-access-token>
  ```
- **Response**:
  ```json
  {
      "success": true,
      "message": "Users fetched successfully",
      "data": [
          {
              "name": "John Doe",
              "email": "john.doe@example.com",
              ...
          }
      ],
      "meta": {
          "totalUsers": 50,
          "totalSuperAdmins": 1,
          "totalAdmins": 5,
          ...
      }
  }
  ```

#### 2. Get All Parcels
- **Endpoint**: `GET https://parcel-delivery-api-a9en.onrender.com//api/v1/adminRoute/all-parcels?search=TRK&page=1&limit=10`
- **Headers**:
  ```http
  Authorization: Bearer <jwt-access-token>
  ```
- **Response**:
  ```json
  {
      "success": true,
      "message": "Parcels fetched successfully",
      "data": [
          {
              "trackingId": "TRK-20250929-123456",
              "type": "Document",
              ...
          }
      ],
      "meta": {
          "totalParcels": 100,
          "deliveredlParcels": 50,
          ...
      }
  }
  ```

#### 3. Block/Unblock a Parcel
- **Endpoint**: `PATCH https://parcel-delivery-api-a9en.onrender.com//api/v1/adminRoute/parcel-block/:id`
- **Headers**:
  ```http
  Authorization: Bearer <jwt-access-token>
  ```
- **Body**:
  ```json
  {
      "isBlocked": true
  }
  ```
- **Response**:
  ```json
  {
      "success": true,
      "message": "Parcel updated successfully",
      "data": {
          "trackingId": "TRK-20250929-123456",
          "isBlocked": true,
          ...
      }
  }
  ```

---

## Error Handling
The application includes comprehensive error handling for:
- **MongoDB Errors**: CastError, ValidationError, and Duplicate key errors.
- **Zod Validation Errors**: Invalid request payloads.
- **Custom Errors**: AppError for specific business logic errors.
- **Unhandled Exceptions**: Graceful server shutdown on uncaught exceptions or rejections.

Error responses follow this format:
```json
{
    "success": false,
    "message": "Error message",
    "errorSouces": [
        {
            "path": "field",
            "message": "Error detail"
        }
    ],
    "err": null, // Detailed error in development mode
    "stack": null // Stack trace in development mode
}
```



## Live Server Link:
### https://parcel-delivery-api-a9en.onrender.com/



## License
This project is licensed under the MIT License.

---

## References
Here are some useful resources for understanding the technologies and concepts used in this project:
- [Node.js Official Documentation](https://nodejs.org/en/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Passport.js Documentation](http://www.passportjs.org/docs/)
- [Zod Schema Validation](https://github.com/colinhacks/zod)
- [JSON Web Tokens](https://jwt.io/)