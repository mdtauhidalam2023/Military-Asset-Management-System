# Military Asset Management System

A full-stack web application for managing military assets across multiple bases. The system provides asset movement tracking, purchases, transfers, assignments, expenditures, dashboard analytics, role-based access control, and transaction auditing.

## Features

### Dashboard
- Opening Balance
- Closing Balance
- Net Movement
- Assigned Assets
- Expended Assets
- Filter by Base
- Filter by Equipment Type
- Filter by Date Range
- Net Movement detail popup showing:
  - Purchases
  - Transfer In
  - Transfer Out

### Purchases
- Record asset purchases for a base
- View purchase history
- Filter purchases by date, base, and equipment type

### Transfers
- Transfer assets between bases
- Track source and destination bases
- Maintain transfer history
- Prevent transfers between the same base

### Assignments & Expenditures
- Assign assets to personnel
- Record expended assets
- Maintain assignment history
- Maintain expenditure history

### Role-Based Access Control

The application supports three roles:

#### Admin
- Full access to all bases
- Manage purchases
- Manage transfers
- Manage assignments
- Manage expenditures
- View organization-wide dashboard data

#### Base Commander
- Access data related to the assigned base
- Manage permitted operations for the assigned base
- View assignments and expenditures
- Cannot perform operations for another base

#### Logistics Officer
- Access purchases and transfers
- Access dashboard information for the assigned base
- Cannot access assignment and expenditure operations

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- React Router
- Axios
- Lucide React
- CSS3

React was selected because it provides a component-based architecture suitable for building a responsive and interactive dashboard. Reusable components simplify maintenance and allow pages such as purchases, transfers, and operations to share a consistent interface.

### Backend
- Python
- Django
- Django REST Framework
- Simple JWT

Django provides a mature backend framework with ORM support, authentication, security features, and administrative capabilities. Django REST Framework is used to expose RESTful APIs consumed by the React frontend.

JWT authentication provides stateless API authentication. Access tokens are sent with protected API requests.

### Database
- MySQL

MySQL was selected because the application contains strongly related structured data such as users, bases, equipment types, purchases, transfers, assignments, and expenditures.

A relational database provides:
- Referential integrity
- Foreign-key relationships
- Consistent transactional data
- Structured querying
- Reliable movement and audit records

These properties are particularly useful for maintaining accountability and movement history.

## System Architecture

```text
React Frontend
      |
      | HTTP / REST API
      | JWT Authentication
      v
Django REST Framework
      |
      | Django ORM
      v
MySQL Database
```

## Dashboard Calculations

### Net Movement

```text
Net Movement =
Purchases + Transfer In - Transfer Out
```

### Closing Balance

```text
Closing Balance =
Opening Balance + Net Movement - Expenditures
```

Assigned assets are tracked separately because assignment changes asset custody but does not necessarily remove the asset from inventory.

### Opening Balance

For a selected start date, the opening balance is calculated from asset movements that occurred before that date.

## REST API Endpoints

### Authentication

```text
POST /api/auth/login/
```

Returns JWT access and refresh tokens together with user role information.

### Dashboard

```text
GET /api/dashboard/
```

Supported filters include:

```text
?base=<id>
?equipment_type=<id>
?start_date=YYYY-MM-DD
?end_date=YYYY-MM-DD
```

### Master Data

```text
GET /api/bases/
GET /api/equipment-types/
```

### Purchases

```text
GET  /api/purchases/
POST /api/purchases/
```

### Transfers

```text
GET  /api/transfers/
POST /api/transfers/
```

### Assignments

```text
GET  /api/operations/assignments/
POST /api/operations/assignments/
```

### Expenditures

```text
GET  /api/operations/expenditures/
POST /api/operations/expenditures/
```

## Security

The application implements multiple security layers:

- JWT authentication
- Backend permission classes
- Role-Based Access Control
- Base-level data restrictions
- Protected React routes
- Environment variables for credentials
- Input validation
- Audit logging

Sensitive values such as the Django secret key and database credentials are stored in `.env` and excluded from version control.

## Audit Logging

Important operations are automatically logged for accountability.

Examples include:

```text
PURCHASE_CREATED
TRANSFER_CREATED
ASSET_ASSIGNED
ASSET_EXPENDED
```

Audit records contain information about the user, action, entity, and transaction details.

## Project Structure

```text
MilitaryAssetManagement/
|
|-- backend/
|   |-- accounts/
|   |-- assets/
|   |-- audit/
|   |-- operations/
|   |-- purchases/
|   |-- transfers/
|   |-- config/
|   |-- manage.py
|   |-- requirements.txt
|   `-- .env.example
|
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   `-- index.css
|   |
|   |-- package.json
|   `-- package-lock.json
|
|-- .gitignore
`-- README.md
```

## Local Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd MilitaryAssetManagement
```

### 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `.env` using `.env.example`:

```env
DJANGO_SECRET_KEY=your_secret_key
DB_NAME=military_asset_management
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
```

Create the MySQL database corresponding to `DB_NAME`.

Run migrations:

```bash
python manage.py migrate
```

Create an administrator:

```bash
python manage.py createsuperuser
```

Start Django:

```bash
python manage.py runserver
```

Backend:

```text
http://127.0.0.1:8000/
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173/
```

## Testing

The application has been tested for:

- Authentication
- Dashboard calculations
- Dashboard filters
- Purchase creation and history
- Asset transfers and history
- Assignments
- Expenditures
- Role restrictions
- Base-level restrictions
- Audit logging
- Protected frontend routes

## Future Improvements

Possible improvements include:

- Dedicated asset inventory ledger
- Transfer approval workflow
- Advanced reporting
- Export to PDF/Excel
- Dashboard charts
- Automated tests
- Token refresh handling
- Production deployment
- Notification system

## Author

**Md Tauhid Alam**

Full Stack Developer