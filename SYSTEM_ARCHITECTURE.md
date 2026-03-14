# Rice Mill Management System - Architecture Documentation

## System Overview

A mobile-first rice mill management application with role-based access control, designed for workers, supervisors, and investors to manage daily operations, expenses, transactions, and approvals.

## Authentication System

### Login Credentials

The system uses a mock authentication system with predefined users:

**Workers:**
- Username: `worker1` / Password: `password123` (Ram Kumar)
- Username: `worker2` / Password: `password123` (Suresh Yadav)

**Supervisors:**
- Username: `supervisor1` / Password: `password123` (Amit Singh)

**Investors:**
- Username: `investor1` / Password: `password123` (Rajesh Mehta)

### Authentication Flow

1. User enters username and password on the login screen
2. System validates credentials against mock user database
3. Upon successful authentication, user data is stored in localStorage
4. User is automatically redirected to their role-specific dashboard
5. All routes are protected and require authentication
6. Users cannot manually select their role - it's assigned based on credentials

## Role-Based Access Control (RBAC)

### Worker Permissions

**CAN:**
- Add transactions (with truck details)
- Add expenses
- Upload proof (photo/video/weighbridge) - **NO gallery access**
- View their own entries only
- View notes
- View activity timeline

**CANNOT:**
- See other workers' entries
- View profit data
- View investor information
- View analytics
- Approve transactions or expenses
- Access approval workflow

### Supervisor Permissions

**CAN:**
- View all transactions (from all workers)
- Approve or reject transactions
- Approve or reject expenses
- Add transactions and expenses
- View inventory
- Manage notes
- View activity timeline
- See all users' data

**CANNOT:**
- View investor profit distribution details
- Access investor-specific analytics

### Investor Permissions

**CAN:**
- See all data (complete transparency)
- View profit/loss reports
- View analytics
- Monitor all operations
- Approve transactions and expenses
- View activity timeline
- Access all features

**CANNOT:**
- (No restrictions - full access)

## Core Features

### 1. Transaction Management

**Enhanced Transaction Form:**
- Transaction type (Money IN / Money OUT)
- Truck number (required, uppercase format)
- Number of sacks
- Weight in kilograms
- Price per quintal (100 kg)
- **Auto-calculation** of total amount (quintals × price)
- Description/notes
- Proof capture (required)

**Proof Options:**
- Take photo (camera only)
- Record video (camera only)
- Weighbridge photo (camera only)
- **Gallery upload disabled** to prevent fake data submission

**Transaction Display:**
- Worker: sees only their own transactions
- Supervisor/Investor: sees all transactions
- Status indicators (pending/approved/rejected)
- Truck and weight details visible
- Proof type indicator

### 2. Expense Tracking

**Expense Categories:**
- Labor (मजदूरी)
- Maintenance (रखरखाव)
- Transport (परिवहन)
- Materials (सामग्री)
- Other (अन्य)

**Features:**
- Category-based submission
- Amount entry
- Detailed description
- Optional proof capture (photo/video only - no gallery)
- Status tracking (pending/approved/rejected)
- Role-based visibility

### 3. Approval Workflow

**Access:**
- Restricted to Supervisors and Investors only
- Workers see "Access Restricted" message

**Features:**
- View all pending transactions and expenses
- See submitter information
- View truck details for transactions
- View proof indicators
- Approve or reject with one tap
- Actions automatically logged to timeline

### 4. Activity Timeline

**Separate from Transaction/Expense Data:**
- Does NOT duplicate transaction or expense listings
- Shows only activity events, not raw data

**Event Types:**
- Transaction added
- Expense added
- Approval granted
- Approval rejected
- Note created
- Inventory updated

**Event Information:**
- Action performed
- User who performed it
- Timestamp (relative: "2 hours ago" or absolute)
- Optional amount
- Description

**Advanced Filters:**
- Search by description, user, or action
- Filter by activity type (transaction/expense/approval/note/inventory)
- Filter by user
- Filter by date range:
  - Today
  - Last 7 days
  - Specific month (MM/YYYY)
  - Specific year (YYYY)
  - All time
- Active filter count indicator
- Reset filters option

### 5. Notes System

**Features:**
- Create notes with title and content
- Tag-based organization:
  - Maintenance
  - Orders
  - Inventory
  - Urgent
  - Important
  - Payment
- Color-coded tags
- Search functionality
- Filter by tag
- Author and timestamp tracking
- Activity timeline integration

## Security Features

### 1. Authentication
- Session-based authentication using localStorage
- Protected routes with automatic redirect to login
- Role validation on every page

### 2. Data Access Control
- Workers can only see their own submissions
- Supervisors see all operational data except investor profits
- Investors have unrestricted access
- Component-level access restrictions

### 3. Proof Upload Security
- **Camera-only capture** for all proof uploads
- No gallery access to prevent:
  - Old/fake photo submissions
  - Tampered evidence
  - Fraudulent data entry
- Real-time capture ensures authenticity

### 4. Role Enforcement
- Users cannot manually change roles
- Role determined by login credentials
- UI elements conditionally rendered based on role
- API calls (when implemented) would validate role server-side

## Data Architecture

### Local Storage Usage

**User Session:**
```json
{
  "id": "1",
  "username": "worker1",
  "name": "Ram Kumar",
  "role": "worker"
}
```

**Activity Timeline:**
```json
[
  {
    "type": "transaction",
    "action": "Added incoming transaction",
    "description": "Rice Sale - Truck Load",
    "user": "Ram Kumar",
    "timestamp": "2026-03-13T10:30:00",
    "amount": 50000
  }
]
```

### Data Flow

1. **User Action** → Form submission (transaction/expense/note)
2. **Data Creation** → New entry created with user metadata
3. **Timeline Update** → Activity event logged separately
4. **State Update** → Component state updated
5. **Display** → Filtered based on user role

## Mobile-First Design

### UI/UX Principles
- Large touch targets (minimum 44x44 pixels)
- Bilingual labels (English/Hindi)
- Icon-heavy interface for semi-literate users
- Color-coded sections for easy navigation
- Minimal text reliance
- Clear visual hierarchy

### Responsive Design
- Optimized for mobile screens (320px - 428px)
- Card-based layouts
- Bottom navigation spacing for safe areas
- Floating action buttons for quick actions
- Sticky headers during scroll

## Future Enhancements

### Backend Integration
When moving from prototype to production:

1. **Replace localStorage with database**
   - PostgreSQL or MongoDB for data persistence
   - Proper user authentication with JWT tokens
   - Server-side role validation

2. **Real Camera/Video Capture**
   - Implement actual camera API integration
   - Video recording with size limits
   - Image compression and optimization
   - Secure file upload to cloud storage

3. **API Architecture**
   - RESTful API or GraphQL
   - Role-based API endpoints
   - Request validation and sanitization
   - Rate limiting and security headers

4. **Real-time Features**
   - WebSocket for live updates
   - Push notifications for approvals
   - Real-time activity feed

5. **Analytics Dashboard**
   - Profit/loss calculations
   - Inventory management
   - Worker performance metrics
   - Trend analysis and forecasting

## Testing Scenarios

### Worker Flow
1. Login as `worker1`
2. Add transaction with truck details
3. Capture proof (simulated)
4. View pending status
5. Check activity timeline
6. Try to access approvals (should be blocked)

### Supervisor Flow
1. Login as `supervisor1`
2. View all pending approvals
3. Approve/reject items
4. View all transactions (from all workers)
5. Add new transaction/expense
6. View comprehensive timeline

### Investor Flow
1. Login as `investor1`
2. Access all features
3. View complete data
4. Monitor operations
5. Access analytics (when implemented)

## Security Considerations

### Current Implementation
- Client-side authentication (prototype)
- localStorage for session management
- Role-based UI restrictions

### Production Requirements
- Server-side authentication
- Secure token storage (httpOnly cookies)
- HTTPS only
- CSRF protection
- XSS prevention
- SQL injection prevention
- Input sanitization
- Rate limiting
- Audit logging
- Data encryption at rest and in transit

## Deployment Notes

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

### Environment Variables (Future)
```env
DATABASE_URL=
JWT_SECRET=
STORAGE_BUCKET=
API_BASE_URL=
```

## Troubleshooting

### Cannot Login
- Verify username/password (case-sensitive)
- Clear browser cache and localStorage
- Check browser console for errors

### Data Not Persisting
- Current implementation uses localStorage
- Data clears on browser cache clear
- Backend database needed for persistence

### Timeline Not Updating
- Check localStorage for "activities" key
- Ensure form submissions complete successfully
- Refresh page to reload timeline

## Support

For issues or questions:
1. Check this documentation
2. Review console logs
3. Verify user role permissions
4. Test with different user accounts
