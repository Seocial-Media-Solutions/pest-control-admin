# Pest Control Admin Dashboard

Welcome to the **Pest Control Admin** application. This project is a comprehensive administrative interface designed to manage a pest control business’s end-to-end operations—from customer bookings and service management to technician tracking and assignment workflows.

![Application Mockup](https://raw.githubusercontent.com/placeholder-example/mockup/main/pest_control_admin_dash_1774415194676.png)
*(Generated Preview: Pest Control Admin Dashboard Interface)*

## 🚀 Key Features

- **📊 Real-time Dashboard**: Overview of key business metrics including bookings, active services, and recent activity.
- **🗺️ Live Technician Tracking**: Integrated with **Leaflet maps** & **WebSockets** to view and track field technicians in real-time.
- **⚡ Real-time Updates**: Real-time status updates via WebSockets (Socket.io).
- **📅 Advanced Booking System**: Effortlessly create, edit, and track service bookings.
- **🛠️ Service & Product Management**: Manage the full catalog of offered services.
- **👥 Customer CRM**: Maintain a detailed database of clients and their histories.
- **📍 Assignment Workflows**: Specialized lifecycle management for assignments—moving from scheduled to completed.
- **⏰ Attendance Logs**: Monitor technician attendance and working hours.
- **🛡️ Secure Authentication**: Protected routes with token-based authentication and role enforcement.
- **🎨 Premium UI/UX**: Built with **React 19**, **Tailwind CSS**, and **Lucide Icons** with support for Dark/Light modes.

---

## 🛠️ Technology Stack

- **Frontend**: [React](https://react.dev/), [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **State Management**: [Tanstack React Query v5](https://tanstack.com/query/latest)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Maps**: [Leaflet](https://leafletjs.com/) & [React Leaflet](https://react-leaflet.js.org/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/)
- **API Interaction**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide-react](https://lucide.dev/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)

---

## 📂 Project Structure

- `src/pages`: Main view components (Dashboard, Tracking, Assignments, etc.).
- `src/components`: Reusable UI elements and layout containers.
- `src/services`: API abstraction layer for backend communication.
- `src/context`: Global state providers for Auth, Theme, Search, and Services.
- `src/utils`: Helper functions and shared business logic.

---

## 🛤️ Route Map

| Path | Purpose |
|------|---------|
| `/login` | Public Authentication |
| `/` | Main Admin Dashboard |
| `/customers` | Customer Directory & CRUD |
| `/services` | Service Catalog Management |
| `/bookings` | Booking Records & Scheduling |
| `/assignments` | Technician Job Allocations |
| `/assignments/:id/workflow` | Detailed Job Lifecycle Tracking |
| `/technicians` | Field Staff Management |
| `/tracking` | Map-based Field Force Tracking |
| `/attendance/:id` | Individual Attendance Records |
| `/reports` | Business Reporting (Placeholder) |
| `/analytics` | Data Insights (Placeholder) |
| `/settings` | Global System Configuration |

---

## ⚙️ Getting Started

1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment:** Create a `.env` file with `VITE_API_URL` pointing to your backend.
4. **Run Development Server:**
   ```bash
   npm run dev
   ```
5. **Build for Production:**
   ```bash
   npm run build
   ```

---

*This project is built for professional enterprise-grade pest control management.*
