# Smart Inventory Platform

A premium, enterprise-grade inventory management system designed for speed, visibility, and accuracy in SME warehouse operations. Built with a "Mobile-First, Desktop-Premium" philosophy.

## 🚀 System Overview
Smart Inventory integrates **Professional Analytics**, **QR-Integrated Stock Management**, and **Multi-Language Support** into a single, high-performance web interface.

### Key Features
- **Real-Time Velocity Analytics**: Visualization of stock movement (Supply Flow Velocity).
- **Intelligent Stock Alerts**: Automatic highlighting of items below safety thresholds.
- **Dynamic Theme Architecture**: Professional Dark/Light modes with Slate/Indigo balancing.
- **Mobile Optimized**: Zero-clipping responsive UI with adaptive grid layouts.
- **Data Integrity**: CRUD operations reinforced by use-cases and SKU validation.

## 🛠️ Tech Stack
- **Engine**: React 18 / TypeScript / Vite
- **Styling**: Tailwind CSS v4 / Framer Motion
- **Database**: SQLite3 (better-sqlite3)
- **Port**: Fixed on `5555`

## 📦 Installation & Start
1. **Clone repository** and navigate to directory.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run Production Preview (Standard)**:
   ```bash
   npm run build
   && npm run preview
   ```
   *The app will automatically start at `http://localhost:5555`.*

4. **Development Mode**:
   ```bash
   npm run dev
   ```

## 📋 Operation Guide (for Inventory Managers)

### Data Size & Handling
- **Database Scalability**: Utilizes SQLite3, supporting databases up to 140 Terabytes. Performance remains optimal for 10,000+ unique SKUs on local hardware.
- **Data Safety**: All transactions are ACID compliant.

### Notification & Status
- **Critical Events**: Items that reach or drop below the `minStock` threshold are automatically flagged in the "Critical Events" panel.
- **Visual Cues**: Red pings and status indicators ensure no low-stock item goes unnoticed.

### Theme & UI Adjustments
- **Toggle**: Access via the **Settings** menu.
- **Dark Mode**: Optimized for low-light warehouse conditions to reduce eye strain.

## 🗺️ Future Implementation Plan
- [ ] **Cloud-Sync Protocol**: Real-time multi-device synchronization via WebSocket.
- [ ] **PDF Export Engine**: Generate professional inventory reports and stock lists and invoices.
- [ ] **Advanced Filtering**: Multi-warehouse partitioning and zone-based tracking.
- [ ] **Bulk Import**: Excel/CSV ingestion for initial stock setups.

---
*Smart Inventory - Precision in Every Transaction.*
