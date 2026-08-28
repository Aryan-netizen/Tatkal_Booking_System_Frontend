# Railway Tatkal Booking System

A full-stack railway ticket booking system built to simulate the core workflow of a Tatkal-style railway reservation platform.

The system provides functionality for managing users, trains, stations, trips, coaches, seats, passengers, bookings, and payments. It also includes concurrency control to prevent multiple users from reserving the same seat at the same time.

---

## 📌 Project Overview

The Railway Tatkal Booking System is designed around the following booking flow:

```text
User
  │
  ▼
Search Train
  │
  ▼
Select Trip & Seat
  │
  ▼
Create Booking
  │
  ▼
Seat Temporarily Held
  │
  ▼
Make Payment
  │
  ├── Payment Successful ──► Booking Confirmed
  │
  └── Payment Failed ──────► Booking Remains Unconfirmed

```
# Railway Booking System API Endpoints

This document provides a complete list of all API endpoints with request/response examples for the Tatkal Railway Booking System.

## Authentication Endpoints

### Users Management

#### 1. Create User
- **POST** `/api/users`
- **Description**: Create a new user account
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```
- **Response** (201):
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2026-08-27T10:30:00Z"
}
```

#### 2. Get All Users
- **GET** `/api/users`
- **Description**: Get list of all users
- **Response** (200):
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-08-27T10:30:00Z"
  }
]
```

#### 3. Get User by ID
- **GET** `/api/users/{id}`
- **Description**: Get user details by ID
- **Response** (200):
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2026-08-27T10:30:00Z"
}
```

#### 4. Get User by Email
- **GET** `/api/users/email/{email}`
- **Description**: Get user details by email
- **Response** (200): Same as Get User by ID

#### 5. Update User
- **PUT** `/api/users/{id}`
- **Description**: Update user information
- **Request Body**:
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```
- **Response** (200): Updated user object

#### 6. Delete User
- **DELETE** `/api/users/{id}`
- **Description**: Delete user account
- **Response** (204): No content

---

## Train Management

#### 7. Create Train
- **POST** `/api/trains`
- **Description**: Add a new train
- **Request Body**:
```json
{
  
  "name": "Rajdhani Express"
}
```
- **Response** (201):
```json
{
  "number": 12345,
  "name": "Rajdhani Express"
}
```

#### 8. Get All Trains
- **GET** `/api/trains`
- **Description**: Get list of all trains
- **Response** (200):
```json
[
  {
    "number": 12345,
    "name": "Rajdhani Express"
  }
]
```

#### 9. Get Train by Number
- **GET** `/api/trains/{number}`
- **Description**: Get train details by number
- **Response** (200): Train object

#### 10. Search Trains
- **GET** `/api/trains/search?from={fromStationCode}&to={toStationCode}&date={date}`
- **Description**: Search trains between stations on a specific date
- **Example**: `/api/trains/search?from=1001&to=1002&date=2026-08-30`
- **Response** (200): Array of matching trains

#### 11. Get Train Stops
- **GET** `/api/trains/{number}/stops`
- **Description**: Get all stops for a train
- **Response** (200):
```json
[
  {
    "seq": 1,
    "arrivalTime": "08:00:00",
    "departureTime": "08:05:00",
    "trainNumber": 12345,
    "stationCode": 1001
  }
]
```

#### 12. Update Train
- **PUT** `/api/trains/{number}`
- **Description**: Update train information
- **Request Body**: Same as Create Train
- **Response** (200): Updated train object

#### 13. Delete Train
- **DELETE** `/api/trains/{number}`
- **Description**: Delete a train
- **Response** (204): No content

---

## Station Management

#### 14. Create Station
- **POST** `/api/stations`
- **Description**: Add a new station
- **Request Body**:
```json
{
  "name": "New Delhi"
}
```
- **Response** (201): Created station object

#### 15. Get All Stations / Search Stations
- **GET** `/api/stations?search={searchTerm}`
- **Description**: Get all stations or search by name
- **Example**: `/api/stations?search=Delhi`
- **Response** (200): Array of stations

#### 16. Get Station by Code
- **GET** `/api/stations/{code}`
- **Description**: Get station details by code
- **Response** (200): Station object

#### 17. Update Station
- **PUT** `/api/stations/{code}`
- **Description**: Update station information
- **Request Body**: Same as Create Station
- **Response** (200): Updated station object

#### 18. Delete Station
- **DELETE** `/api/stations/{code}`
- **Description**: Delete a station
- **Response** (204): No content

---

## Trip Management

#### 19. Create Trip
- **POST** `/api/trips`
- **Description**: Create a new trip (train running on specific date)
- **Request Body**:
```json
{
  "travelDate": "2026-08-30",
  "trainNumber": 12345
}
```
- **Response** (201):
```json
{
  "id": 1,
  "travelDate": "2026-08-30",
  "trainNumber": 12345
}
```

#### 20. Get All Trips
- **GET** `/api/trips`
- **Description**: Get all trips
- **Response** (200): Array of trips

#### 21. Get Trip by ID
- **GET** `/api/trips/{id}`
- **Description**: Get trip details by ID
- **Response** (200): Trip object

#### 22. Get Trips by Train
- **GET** `/api/trips/train/{trainNumber}`
- **Description**: Get all trips for a specific train
- **Response** (200): Array of trips

#### 23. Get Trips by Date
- **GET** `/api/trips/date/{date}`
- **Description**: Get all trips on a specific date
- **Example**: `/api/trips/date/2026-08-30`
- **Response** (200): Array of trips

#### 24. Get Trips by Train and Date
- **GET** `/api/trips/train/{trainNumber}/date/{date}`
- **Description**: Get trips for specific train on specific date
- **Response** (200): Array of trips

#### 25. Update Trip
- **PUT** `/api/trips/{id}`
- **Description**: Update trip information
- **Request Body**: Same as Create Trip
- **Response** (200): Updated trip object

#### 26. Delete Trip
- **DELETE** `/api/trips/{id}`
- **Description**: Delete a trip
- **Response** (204): No content

---

## Coach Management

#### 27. Create Coach
- **POST** `/api/coaches`
- **Description**: Add a new coach to a trip
- **Request Body**:
```json
{
  "code": "A1",
  "classCode": "AC_1",
  "tripId": 1
}
```
- **Response** (201): Created coach object

#### 28. Get All Coaches
- **GET** `/api/coaches`
- **Description**: Get all coaches
- **Response** (200): Array of coaches

#### 29. Get Coach by ID
- **GET** `/api/coaches/{id}`
- **Description**: Get coach details by ID
- **Response** (200): Coach object

#### 30. Get Coaches by Trip
- **GET** `/api/coaches/trip/{tripId}`
- **Description**: Get all coaches for a trip
- **Response** (200): Array of coaches

#### 31. Get Coach Seats
- **GET** `/api/coaches/{id}/seats`
- **Description**: Get seat information for a coach
- **Response** (200): Coach object with seat details

#### 32. Update Coach
- **PUT** `/api/coaches/{id}`
- **Description**: Update coach information
- **Request Body**: Same as Create Coach
- **Response** (200): Updated coach object

#### 33. Delete Coach
- **DELETE** `/api/coaches/{id}`
- **Description**: Delete a coach
- **Response** (204): No content

---

## Seat Management

#### 34. Create Seat
- **POST** `/api/seats`
- **Description**: Add a new seat to a coach
- **Request Body**:
```json
{
  "seatNumber": 1,
  "berthType": "LOWER",
  "status": "AVAILABLE",
  "coachId": 1
}
```
- **Response** (201): Created seat object

#### 35. Get All Seats
- **GET** `/api/seats`
- **Description**: Get all seats
- **Response** (200): Array of seats

#### 36. Get Seat by ID
- **GET** `/api/seats/{id}`
- **Description**: Get seat details by ID
- **Response** (200): Seat object

#### 37. Get Seats by Coach
- **GET** `/api/seats/coach/{coachId}`
- **Description**: Get all seats in a coach
- **Response** (200): Array of seats

#### 38. Get Available Seats by Coach
- **GET** `/api/seats/available/{coachId}`
- **Description**: Get only available seats in a coach
- **Response** (200): Array of available seats

#### 39. Update Seat
- **PUT** `/api/seats/{id}`
- **Description**: Update seat information
- **Request Body**: Same as Create Seat
- **Response** (200): Updated seat object

#### 40. Delete Seat
- **DELETE** `/api/seats/{id}`
- **Description**: Delete a seat
- **Response** (204): No content

---

## Booking Management

#### 41. Create Booking
- **POST** `/api/bookings`
- **Description**: Create a new booking
- **Request Body**:
```json
{
  "userId": 1,
  "tripId": 1,
  "fromSeq": 1,
  "toSeq": 3,
  "classCode": "AC_1",
  "amountPaise": 250000
}
```
- **Response** (201):
```json
{
  "id": 1,
  "fromSeq": 1,
  "toSeq": 3,
  "status": "HELD",
  "amountPaise": 250000,
  "createdAt": "2026-08-27T10:30:00Z",
  "user": 1,
  "trip": 1,
  "seat": 15
}
```

#### 42. Get Booking by ID
- **GET** `/api/bookings/{id}`
- **Description**: Get booking details with passengers and payments
- **Response** (200):
```json
{
  "id": 1,
  "fromSeq": 1,
  "toSeq": 3,
  "status": "CONFIRMED",
  "amountPaise": 250000,
  "createdAt": "2026-08-27T10:30:00Z",
  "userId": 1,
  "tripId": 1,
  "seatId": 15,
  "passengers": [
    {
      "id": 1,
      "name": "John Doe",
      "age": 30,
      "gender": true,
      "booking": 1
    }
  ],
  "payments": [
    {
      "id": 1,
      "amountPaise": 250000,
      "status": "SUCCESS",
      "transactionId": "txn_12345",
      "createdAt": "2026-08-27T10:35:00Z",
      "booking": 1
    }
  ]
}
```

#### 43. Get User Bookings
- **GET** `/api/bookings/user/{userId}`
- **Description**: Get all bookings for a user
- **Response** (200): Array of booking objects

#### 44. Get Trip Bookings
- **GET** `/api/bookings/trip/{tripId}`
- **Description**: Get all bookings for a trip
- **Response** (200): Array of booking objects

#### 45. Cancel Booking
- **POST** `/api/bookings/{id}/cancel`
- **Description**: Cancel a booking
- **Response** (200): Updated booking object with CANCELLED status

#### 46. Confirm Booking
- **POST** `/api/bookings/{id}/confirm`
- **Description**: Confirm a booking (after payment)
- **Response** (200): Updated booking object with CONFIRMED status

---

## Passenger Management

#### 47. Create Passenger
- **POST** `/api/passengers`
- **Description**: Add a passenger to a booking
- **Request Body**:
```json
{
  "name": "John Doe",
  "age": 30,
  "gender": true,
  "booking": 1
}
```
- **Response** (201): Created passenger object

#### 48. Get Passenger by ID
- **GET** `/api/passengers/{id}`
- **Description**: Get passenger details by ID
- **Response** (200): Passenger object

#### 49. Get Passengers by Booking
- **GET** `/api/bookings/{bookingId}/passengers`
- **Description**: Get all passengers for a booking
- **Response** (200): Array of passenger objects

#### 50. Update Passenger
- **PUT** `/api/passengers/{id}`
- **Description**: Update passenger information
- **Request Body**: Same as Create Passenger
- **Response** (200): Updated passenger object

#### 51. Delete Passenger
- **DELETE** `/api/passengers/{id}`
- **Description**: Remove a passenger
- **Response** (204): No content

---

## Payment Management

#### 52. Create Payment
- **POST** `/api/bookings/{bookingId}/payment`
- **Description**: Create a payment for a booking
- **Request Body**:
```json
{
  "amountPaise": 250000
}
```
- **Response** (201):
```json
{
  "id": 1,
  "amountPaise": 250000,
  "status": "PENDING",
  "transactionId": null,
  "createdAt": "2026-08-27T10:35:00Z",
  "booking": 1
}
```

#### 53. Get Payment by ID
- **GET** `/api/payments/{id}`
- **Description**: Get payment details by ID
- **Response** (200): Payment object

#### 54. Get Payment by Booking
- **GET** `/api/bookings/{bookingId}/payment`
- **Description**: Get latest payment for a booking
- **Response** (200): Payment object

#### 55. Payment Success Webhook
- **POST** `/api/paymentSuccess/{transactionId}`
- **Description**: Webhook endpoint for payment gateway success notifications
- **Response** (200): Success confirmation

---

## Train Stop Management

#### 56. Create Train Stop
- **POST** `/api/train-stops`
- **Description**: Add a stop to a train route
- **Request Body**:
```json
{
  "seq": 1,
  "arrivalTime": "08:00:00",
  "departureTime": "08:05:00",
  "trainNumber": 12345,
  "stationCode": 1001
}
```
- **Response** (201): Created train stop object

#### 57. Get Train Stop by ID
- **GET** `/api/train-stops/{id}`
- **Description**: Get train stop details by ID
- **Response** (200): Train stop object

#### 58. Get Stops by Train
- **GET** `/api/train-stops/train/{trainNumber}`
- **Description**: Get all stops for a train
- **Response** (200): Array of train stop objects

#### 59. Update Train Stop
- **PUT** `/api/train-stops/{id}`
- **Description**: Update train stop information
- **Request Body**: Same as Create Train Stop
- **Response** (200): Updated train stop object

#### 60. Delete Train Stop
- **DELETE** `/api/train-stops/{id}`
- **Description**: Delete a train stop
- **Response** (204): No content

---

## Response Status Codes

- **200 OK**: Successful GET, PUT requests
- **201 Created**: Successful POST requests
- **204 No Content**: Successful DELETE requests
- **400 Bad Request**: Invalid request data
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists (e.g., duplicate email)
- **500 Internal Server Error**: Server error

## Common Fields

### Booking Status
- `HELD`: Seat is temporarily reserved (pending payment)
- `CONFIRMED`: Payment completed, booking confirmed
- `CANCELLED`: Booking cancelled

### Seat Status
- `AVAILABLE`: Seat can be booked
- `HELD`: Seat temporarily reserved
- `BOOKED`: Seat permanently booked

### Payment Status
- `PENDING`: Payment initiated but not completed
- `SUCCESS`: Payment completed successfully
- `FAILED`: Payment failed

### Gender Field
- `true`: Male
- `false`: Female

### Class Codes
- `AC_1`: First AC
- `AC_2`: Second AC  
- `AC_3`: Third AC
- `SL`: Sleeper
- `2S`: Second Sitting

### Berth Types
- `LOWER`: Lower berth
- `MIDDLE`: Middle berth
- `UPPER`: Upper berth
- `SIDE_LOWER`: Side lower berth
- `SIDE_UPPER`: Side upper berth

## Notes

1. All monetary amounts are stored in paise (1 rupee = 100 paise)
2. All timestamps are in ISO 8601 format with timezone
3. Booking creation automatically finds and reserves an available seat
4. Users cannot modify booking status directly - use cancel/confirm endpoints
5. Train search requires exact station codes and date in YYYY-MM-DD format
6. Seat locking ensures thread-safe booking operations
