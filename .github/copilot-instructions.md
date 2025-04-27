# Copilot Project Instructions: Hotel Oasis PMS

## Project Overview
Hotel Oasis is a Property Management System (PMS) for hotels, focused on:
- Reservation management (multi-room, multi-type)
- Shift-based operations (morning, evening, night)
- End-of-shift and end-of-day cutoffs
- Guest database and CRM
- Room inventory and maintenance
- Sales and occupancy reporting
- User roles (Admin, Receptionist, Housekeeper, Superadmin)

## Tech Stack
- Next.js (API routes for backend)
- Prisma ORM (PostgreSQL)
- TypeScript (frontend and backend)
- React (dashboard UI)

## Core Domain Concepts
- **Booking**: Central entity, links guests, rooms, dates, payments, and status. Supports multi-room bookings and tracks modifications.
- **Room**: Has type, capacity, amenities, price, and availability. Linked to inventory and channel rates.
- **Guest**: Stores personal/contact info, linked to bookings.
- **User**: System users with roles for access control.
- **Shift**: Operations are organized by shifts (matutino, vespertino, nocturno). System supports shift cutoffs and end-of-day processes.
- **Payment**: Linked to bookings, tracks amount, method, and date.
- **Reports**: Sales, occupancy, and operational reports are generated per shift and per day.

## Business Rules
- Bookings can span multiple rooms and types; availability is checked per room type and date range.
- Shift cutoffs trigger operational and financial closures (e.g., sales, cash, occupancy per shift).
- End-of-day process aggregates all shifts and finalizes daily reports.
- Guests can be searched/created/updated by staff; duplicate emails are prevented.
- Room inventory tracks maintenance and availability.

## API & Services
- API routes under `/app/api/` for bookings, guests, rooms, etc.
- Service layer (`/services/`) encapsulates business logic for bookings, guests, rooms, and email notifications.
- Validation with Zod schemas.

## Data Model (Prisma)
- See `prisma/schema.prisma` for full model. Key models:
  - `Booking`, `BookingRoom`, `Room`, `Guest`, `User`, `Payment`, `RoomInventory`, `Channel`, `ChannelRate`, `Amenity`.
  - Enums: `RoomType`, `UserRole`.

## UI
- Dashboard components for bookings, rooms, guests, payments, inventory, and reports.
- Uses SWR for data fetching.

## Naming
- Project: Hotel Oasis
- Main entities: Booking, Room, Guest, User, Shift, Payment

## Special Notes
- Always consider shift context for operations affecting sales, occupancy, or cash.
- All booking and guest operations must be transactional and validated.
- End-of-day and shift cutoffs are critical for reporting and must be atomic.

---
This file is for Copilot and other AI tools to provide better context and suggestions for the Hotel Oasis PMS codebase.
