# Software Requirements Specification (SRS) - Smart Inventory

## 1. Overview
Mobile-first, desktop-optimized inventory management platform designed for SMEs. Provides high-fidelity UI/UX with professional analytics and clean data management.

## 2. Technical Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS v4, Framer Motion
- **Runtime**: Vite, Node.js (Better-SQLite3 connectivity)
- **i18n**: i18next (JA/EN support)
- **Theming**: Class-based Adaptive Theme (Indigo-centric)
- **Database**: 
    - **Production**: SQLite3 (Local file persistence)
    - **Preview/Web**: InMemory Repository (for stateless verification)

## 3. Structural Design (C4 Model Level 3 & 4)

### C4 Level 3: Component Diagram
```mermaid
graph TD
    User((Warehouse Staff))
    UI[React Presentation Layer]
    Hook[useInventory Hook]
    UC[Application UseCases]
    Repo[Domain Repository Interface]
    Impl[Infrastructure Repository Implementation]
    DB[(SQLite3 Database)]

    User --> UI
    UI --> Hook
    Hook --> UC
    UC --> Repo
    Repo --- Impl
    Impl --> DB
```

### C4 Level 4: Class Responsibility & Roles
| Layer              | Component             | Responsibility                                                    |
| :----------------- | :-------------------- | :---------------------------------------------------------------- |
| **Presentation**   | `Layout.tsx`          | Viewport management, Header/Nav state, Ambient gradients.         |
| Presentation | `Dashboard.tsx` | Visualizing total value and stock velocity (moving average/sum for 14 days). |
|              | `ProductList.tsx` | SKU-centric list, search, CSV export, and filtered views (e.g., Low Stock). |
|                    | `useInventory`        | State management using React Hooks (Redux-less architecture).     |
| **Application**    | `ListProductsUseCase` | Data retrieval logic, filtering, sorting.                         |
|                    | `UpdateStockUseCase`  | Advanced stock calculation, movement tracking, and metadata updates. |
| **Domain**         | `Product Entity`      | Core business model/schema.                                       |
|                    | `MovementStatus`      | Movement type definitions (IN, OUT, RETURN, etc.).                |
|                    | `IProductRepo`        | Behavioral contract (Interface) for data access.                  |
| **Infrastructure** | `SqliteProductRepo`   | implementation of IProductRepo using `better-sqlite3`.            |
|                    | `SqliteDatabase`      | DB Singleton instance & Schema migration manager.                 |


### Access Sequence Diagram (Stock Movement/Inventory Update)
```mermaid
sequenceDiagram
    participant U as User (UI)
    participant H as useInventory
    participant UC as UpdateStockUseCase
    participant R as ProductRepository
    participant DB as SQLite3

    U->>H: updateStock({productId, statusId, quantity, reason, productData})
    H->>UC: execute(params)
    UC->>R: getMovementStatuses()
    R-->>UC: StatusEntity (Action: ADD/SUB/SET)
    UC->>R: findById(id)
    R-->>UC: ProductEntity
    Note over UC: Calculate newStock based on status.action
    UC->>R: update(updatedProduct)
    R->>DB: UPDATE products SET stock = ? WHERE id = ?
    UC->>R: addMovement(movement)
    R->>DB: INSERT INTO movements (...)
    UC-->>H: void
    H->>U: Refresh product list & Close modal
```

## 4. UI/UX Specifications

### Color Palette (Indigo-Professional)
| Variant   | Primary   | Secondary | Background | Surface   |
| :-------- | :-------- | :-------- | :--------- | :-------- |
| **Light** | `#3730A3` | `#BE185D` | `#F1F5F9`  | `#FFFFFF` |
| **Dark**  | `#6366F1` | `#D946EF` | `#020617`  | `#0F172A` |

### Responsive Breakpoints
- **Mobile (< 640px)**: 1 column grid, compact header.
- **Tablet (640px - 1024px)**: 2 columns, adaptive charts.
- **Desktop (> 1024px)**: 4 columns for stats, 3 columns for lists, container padding scaled to `xl:px-40`.

## 5. Entities & Schema

### Domain Entities
- **Product**: `id(UUID)`, `sku(unique)`, `name`, `price`, `stock`, `unit`, `minStock`, `metadata(JSON)`, `imageUrl`, `createdAt`, `updatedAt`.
    - `metadata`: Stores `category`, `location`, `condition`, `notes`.
- **MovementStatus**: `id`, `name`, `action(ADD|SUBTRACT|SET)`, `color`.
- **StockMovement**: `id`, `productId`, `statusId`, `quantity`, `unitPrice`, `totalAmount`, `reason`, `timestamp`.

### SQLite Physical Table Definition
```sql
-- Products Table
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price REAL DEFAULT 0,
    stock REAL DEFAULT 0,
    unit TEXT,
    minStock REAL DEFAULT 0,
    metadata TEXT, -- JSON string: {category, location, condition, notes}
    imageUrl TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);

-- Movement Statuses Table
CREATE TABLE movement_statuses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    action TEXT CHECK(action IN ('ADD', 'SUBTRACT', 'SET')) NOT NULL,
    color TEXT NOT NULL
);

-- Movements Table
CREATE TABLE movements (
    id TEXT PRIMARY KEY,
    productId TEXT NOT NULL,
    statusId TEXT NOT NULL,
    quantity REAL NOT NULL,
    unitPrice REAL DEFAULT 0,
    totalAmount REAL DEFAULT 0,
    reason TEXT,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY (productId) REFERENCES products(id),
    FOREIGN KEY (statusId) REFERENCES movement_statuses(id)
);
```

## 6. UI Wireframes

### [WF-01] Inventory List (Home/Products)
```text
| Smart Inventory                       |
+---------------------------------------+
| [ Search SKU / Name... ] [Filter]     |
+---------------------------------------+
| Grid:                                 |
| +-----------+  +-----------+          |
| | iPhone 15 |  | MacBook   |          |
| | Qty: 45   |  | Qty: 12   |          |
| +-----------+  +-----------+          |
+---------------------------------------+
| [Home] [Inventory] [History] [Settings]|
+---------------------------------------+
```

### [WF-02] Stock Movement Entry (Modal)
```text
+---------------------------------------+
| Update Stock: Product Name       (X)  |
+---------------------------------------+
| [ Status ]                            |
| ( IN ) ( OUT ) ( RET ) ( CANCEL) (ADJ)|
+---------------------------------------+
| Metadata:                             |
| Name: [ iPhone 15 ] Cat: [ Smartph ]  |
| Loc: [ Wh A ] Cond: [ New ]           |
+---------------------------------------+
| Quantity: [ 10 ]  Unit: [ un ]        |
| Current: 45  -> Result: 55            |
+---------------------------------------+
| Reason: [ Optional text... ]          |
+---------------------------------------+
| [       SAVE MOVEMENT        ]        |
+---------------------------------------+
```

## 7. API I/O Specification (Use Case Level)

### UpdateStockUseCase.execute(input)
- **Input**:
    - `productId`: String (UUID)
    - `statusId`: String (ID of Status Entity)
    - `quantity`: Number
    - `reason`: String
    - `productData`: { name, category, unit, location, condition }
- **Output**: `Promise<void>`
- **Errors**: `Product not found`, `Invalid movement status`, `Stock cannot be negative`.


## 8. State Transition Sequence Diagram

### Inventory Change Lifecycle
```mermaid
stateDiagram-v2
    [*] --> Idle: App Load
    Idle --> Selecting: Click Product Card
    Selecting --> Editing: Open Stock Modal
    
    state Editing {
        [*] --> ChoosingStatus: Select Movement Type (StatusID)
        ChoosingStatus --> Calculating: Input Quantity
        Calculating --> Validating: Click Save
        Validating --> Persisting: Logic Check (Stock >= 0)
        Validating --> ChoosingStatus: Error (Negative Stock)
    }
    
    Persisting --> Idle: Refresh UI & Close Modal
```

## 9. Port Specification
- Default fixed port: `5555`.
