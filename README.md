# NestJS Blog API

This is a RESTful API for a blogging platform built with NestJS, TypeORM, and PostgreSQL. The API supports user authentication, creating posts, and managing user roles with JWT-based authentication.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
- [License](#license)

## Features

- User authentication (register, login, logout)
- Role-based access control (admin, user)
- CRUD operations for posts
- JWT-based authentication with HTTP-only cookies
- Swagger API documentation

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (>= 12.x)
- npm (>= 6.x)
- PostgreSQL (>= 9.x)

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/your-repo.git
    cd your-repo
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

## API Endpoints

### Authentication

- **POST /auth/register**: Register a new user.
- **POST /auth/login**: Login and obtain a JWT token.
- **POST /auth/logout**: Logout and clear the JWT token.

### Users

- **GET /users**: Get all users (admin only).
- **GET /users/:id**: Get a user by ID (admin only).

### Posts

- **GET /posts**: Get all posts.
- **GET /posts/:id**: Get a post by ID.
- **POST /posts**: Create a new post (authenticated users).
- **PUT /posts/:id**: Update a post (only the owner).
- **DELETE /posts/:id**: Delete a post (only the owner).

## Usage

### Swagger Documentation

The API documentation is available via Swagger. Once the application is running, navigate to `http://localhost:3000/api` to view the API documentation and test the endpoints.

### Authentication Workflow

1. **Register**: Create a new user by sending a POST request to `/auth/register` with `username` and `password`.
2. **Login**: Authenticate by sending a POST request to `/auth/login` with `username` and `password`. The server responds with an HTTP-only cookie containing the JWT token.
3. **Authenticated Requests**: Include the JWT token in the `Authorization` header as a Bearer token or rely on the HTTP-only cookie for authenticated requests.
4. **Logout**: Clear the JWT token by sending a POST request to `/auth/logout`.

### Example Requests

#### Register

```bash
curl -X POST http://localhost:3000/auth/register \
-H "Content-Type: application/json" \
-d '{"username": "newuser", "password": "password"}'
