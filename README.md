# 🎯 Stock Inventory Management — Distributed System Simulation

[![Distributed Systems](https://img.shields.io/badge/Course-Distributed%20Systems-blue)](https://github.com)
[![React](https://img.shields.io/badge/React-18.2.0-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/WebSocket-Socket.IO-black)](https://socket.io/)

A full-stack educational project demonstrating **distributed system concepts** through a real-world stock inventory management platform. This project features two interfaces: an **Admin Dashboard** for monitoring distributed system behavior and a **Client Shop** interface that triggers backend operations.

## 📚 Table of Contents

- [Overview](#overview)
- [Distributed System Concepts](#distributed-system-concepts)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Usage Guide](#usage-guide)
- [How It Works](#how-it-works)
- [Educational Learning Outcomes](#educational-learning-outcomes)

---

## 🎓 Overview

This project simulates a **distributed stock inventory management system** with 6 backend server instances. It demonstrates core distributed computing concepts such as:

- **Leader Election** (Bully Algorithm)
- **Data Replication** across servers
- **Fault Tolerance** and crash recovery
- **Consistency** in distributed data
- **Request Distribution** and load balancing
- **Real-time Event Propagation** via WebSockets

Perfect for students learning distributed systems, this hands-on demo makes abstract concepts tangible through interactive visualizations and real-time logs.

---

## 🧠 Distributed System Concepts

### 1️⃣ Leader Election (Bully Algorithm)

**What it is:** A leader election algorithm where the server with the highest ID becomes the leader.

**How it works:**
1. When the leader crashes, any server can initiate an election
2. The initiating server sends ELECTION messages to all servers with higher IDs
3. If no response, it declares itself leader
4. If responses received, the highest ID server becomes leader
5. The new leader sends COORDINATOR messages to all other servers

**In this project:**
- Crash any server (including the leader) and watch automatic leader election
- Real-time logs show the election process step-by-step
- Visual indicators highlight the current leader

### 2️⃣ Data Replication

**What it is:** Keeping copies of data synchronized across multiple servers.

**How it works:**
- All write operations (create/update/delete) happen on the leader
- The leader immediately replicates changes to all active followers
- Ensures all servers have consistent data

**In this project:**
- Place an order → see it replicated across all active servers
- Product stock updates propagate to all servers
- System logs show replication events in real-time

### 3️⃣ Fault Tolerance

**What it is:** The system continues operating even when components fail.

**How it works:**
- If non-leader servers crash, the system continues normally
- If the leader crashes, a new leader is elected automatically
- Data remains available through active servers

**In this project:**
- Simulate server crashes and observe system resilience
- Watch automatic recovery and failover mechanisms
- See how requests are redirected to available servers

### 4️⃣ Crash Recovery

**What it is:** Bringing failed servers back online and synchronizing their data.

**How it works:**
1. Crashed server restarts
2. Connects to current leader
3. Synchronizes all data from leader
4. Resumes normal operation

**In this project:**
- Restart crashed servers with one click
- Watch data synchronization from leader
- Observe the server rejoining the distributed system

### 5️⃣ Consistency

**What it is:** Ensuring all servers have the same data at the same time.

**How it works:**
- Strong consistency: All writes go through leader
- Leader coordinates all updates
- Replication happens before acknowledging client

**In this project:**
- Compare data across servers in Admin Dashboard
- See consistency maintained during failures
- Observe replication ensuring uniformity

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                       │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │   Admin Dashboard    │    │    Client Shop UI    │      │
│  │  - System Overview   │    │  - Product Catalog   │      │
│  │  - Server Monitoring │    │  - Shopping Cart     │      │
│  │  - Product/Orders    │    │  - Checkout          │      │
│  │  - System Logs       │    │                      │      │
│  └──────────┬───────────┘    └──────────┬───────────┘      │
│             │                           │                   │
│             └───────────┬───────────────┘                   │
│                         │ WebSocket + REST API              │
└─────────────────────────┼───────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                    BACKEND LAYER                            │
│                         │                                   │
│  ┌──────────────────────┴──────────────────────┐           │
│  │         Socket.IO Server (WebSocket)        │           │
│  │         Express REST API Endpoints          │           │
│  └──────────────────────┬──────────────────────┘           │
│                         │                                   │
│  ┌──────────────────────┴──────────────────────┐           │
│  │        DISTRIBUTED SYSTEM CORE               │           │
│  │  ┌─────────────────────────────────────┐    │           │
│  │  │   Bully Algorithm (Leader Election) │    │           │
│  │  └─────────────────────────────────────┘    │           │
│  │  ┌─────────────────────────────────────┐    │           │
│  │  │   Replication Manager               │    │           │
│  │  └─────────────────────────────────────┘    │           │
│  │  ┌─────────────────────────────────────┐    │           │
│  │  │   Log Emitter (Event Broadcasting)  │    │           │
│  │  └─────────────────────────────────────┘    │           │
│  └──────────────────────┬──────────────────────┘           │
│                         │                                   │
│  ┌──────────────────────┴──────────────────────┐           │
│  │        6 SERVER INSTANCES (In-Memory)       │           │
│  │  ┌────────┐ ┌────────┐ ┌────────┐          │           │
│  │  │Server 1│ │Server 2│ │Server 3│          │           │
│  │  │ 👑     │ │        │ │        │          │           │
│  │  └────────┘ └────────┘ └────────┘          │           │
│  │  ┌────────┐ ┌────────┐ ┌────────┐          │           │
│  │  │Server 4│ │Server 5│ │Server 6│          │           │
│  │  │        │ │        │ │  💥    │          │           │
│  │  └────────┘ └────────┘ └────────┘          │           │
│  │  Each maintains: Products[], Orders[]       │           │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### Admin Dashboard
- **System Overview**
  - Real-time server status monitoring
  - Server crash/restart simulation
  - Current leader indication
  - System statistics
  
- **Product Management**
  - View all products in inventory
  - Stock levels and values
  - Category-based organization
  
- **Order Tracking**
  - View all placed orders
  - Order distribution by server
  - Revenue analytics
  
- **System Logs**
  - Real-time event logging
  - Color-coded log levels (INFO, SUCCESS, WARNING, ERROR)
  - Filterable and searchable logs
  - Auto-scroll console interface

### Client Shop Interface
- **Product Catalog**
  - Browse available products
  - Stock availability indicators
  - Category filtering
  
- **Shopping Cart**
  - Add/remove products
  - Quantity management
  - Real-time total calculation
  
- **Checkout Process**
  - Order summary
  - Customer information form
  - Order confirmation

### Distributed System Features
- **Automatic Leader Election** when leader crashes
- **Data Replication** across all active servers
- **Fault Tolerance** with automatic failover
- **Crash Recovery** with data synchronization
- **Real-time Updates** via WebSockets
- **Load Distribution** visualization

---

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Socket.IO Client** - WebSocket communication

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **CORS** - Cross-origin resource sharing
- **UUID** - Unique identifier generation

### Data Storage
- **In-Memory** - No external database required (educational purpose)

---

## 📁 Project Structure

```
stock-inventory-simulation/
├── backend/
│   ├── app.js                          # Main application entry
│   ├── package.json
│   ├── routes/
│   │   ├── products.js                 # Product API endpoints
│   │   └── orders.js                   # Order API endpoints
│   ├── socket/
│   │   └── socketManager.js            # WebSocket event handling
│   └── utils/
│       ├── bullyAlgorithm.js           # Leader election logic
│       ├── replicationManager.js       # Data replication
│       └── logEmitter.js               # Event logging system
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx                    # Application entry point
│       ├── App.jsx                     # Root component with routing
│       ├── index.css                   # Global styles
│       ├── components/
│       │   ├── admin/
│       │   │   ├── Sidebar.jsx
│       │   │   ├── SystemOverview.jsx
│       │   │   ├── ServerNode.jsx
│       │   │   ├── ProductTable.jsx
│       │   │   ├── OrderTable.jsx
│       │   │   ├── SystemLog.jsx
│       │   │   └── LogEntry.jsx
│       │   └── client/
│       │       ├── ProductList.jsx
│       │       ├── ProductCard.jsx
│       │       ├── Cart.jsx
│       │       ├── Checkout.jsx
│       │       └── OrderConfirmation.jsx
│       ├── context/
│       │   ├── SocketContext.jsx       # WebSocket connection
│       │   └── ServerContext.jsx       # Distributed system state
│       ├── pages/
│       │   ├── AdminDashboard.jsx
│       │   └── ClientShop.jsx
│       └── utils/
│           ├── formatTimestamp.js
│           └── generateRandomOrder.js
│
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd stock
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 4: Start the Backend Server
```bash
cd backend
npm start
```
The backend server will start on `http://localhost:3000`

### Step 5: Start the Frontend Development Server
```bash
cd frontend
npm run dev
```
The frontend will be available at `http://localhost:5173`

### Step 6: Access the Application
- **Admin Dashboard:** `http://localhost:5173/admin`
- **Client Shop:** `http://localhost:5173/client`

---

## 📖 Usage Guide

### Exploring the Admin Dashboard

1. **System Overview**
   - View all 6 server instances
   - Current leader is highlighted with 👑
   - Click "Crash" on any server to simulate failure
   - Click "Restart" to bring a crashed server back online

2. **Observing Leader Election**
   - Crash the current leader server
   - Watch the Bully Algorithm elect a new leader
   - System Logs show the election process in detail

3. **Viewing Products & Orders**
   - Navigate to Products tab to see inventory
   - Navigate to Orders tab to see all orders
   - Notice "Handled By" shows which server processed each order

4. **Monitoring System Logs**
   - Navigate to System Logs tab
   - See real-time events as they happen
   - Color coding: 🟢 Success, 🔵 Info, 🟡 Warning, 🔴 Error

### Using the Client Shop

1. **Browse Products**
   - View product catalog on the left
   - See stock availability and prices

2. **Add to Cart**
   - Click "Add to Cart" on any product
   - Cart appears on the right side
   - Adjust quantities with +/- buttons

3. **Place Order**
   - Click "Proceed to Checkout"
   - Fill in customer information (optional for demo)
   - Click "Place Order"
   - Order is processed by current leader
   - See confirmation message

4. **Observe Distributed System**
   - After placing order, go to Admin Dashboard
   - See the order replicated across all servers
   - Check System Logs for replication events

### Simulating Failures

**Scenario 1: Leader Crash**
```
1. Go to Admin → System Overview
2. Find current leader (has 👑 icon)
3. Click "Crash" on leader server
4. Watch automatic leader election
5. Go to System Logs to see Bully Algorithm in action
```

**Scenario 2: Multiple Server Crashes**
```
1. Crash 2-3 non-leader servers
2. Place an order from Client Shop
3. Observe order still processes successfully
4. See replication only to active servers
```

**Scenario 3: Recovery**
```
1. Restart a crashed server
2. Watch it sync data from leader
3. Check Products/Orders tabs to verify consistency
```

---

## ⚙️ How It Works

### Leader Election (Bully Algorithm)

```javascript
// Simplified flow
When leader crashes:
  1. Any active server detects leader failure
  2. Server sends ELECTION to all higher-ID servers
  3. If no response → declares itself leader
  4. If response → waits for COORDINATOR
  5. Highest ID server becomes leader
  6. New leader broadcasts COORDINATOR
```

### Data Replication

```javascript
// Write operation flow
Client places order:
  1. Request goes to leader server
  2. Leader processes order
  3. Leader updates local data
  4. Leader replicates to all active followers
  5. Each follower updates local copy
  6. Leader acknowledges to client
```

### Real-time Communication

```javascript
// WebSocket events
Frontend ←→ Backend:
  - serverStatusUpdate
  - leaderElected
  - orderPlaced
  - replicationEvent
  - logUpdate
  - dataSync
```

---

## 🎓 Educational Learning Outcomes

After exploring this project, you will understand:

### Distributed System Concepts
✅ Leader election algorithms (Bully Algorithm)  
✅ Data replication and consistency  
✅ Fault tolerance and high availability  
✅ Crash recovery mechanisms  
✅ Distributed state management  
✅ Event-driven architecture  

### Technical Skills
✅ Full-stack development (React + Node.js)  
✅ Real-time communication with WebSockets  
✅ State management in distributed systems  
✅ RESTful API design  
✅ Component-based UI architecture  

### System Design
✅ Scalability patterns  
✅ Failover strategies  
✅ Load distribution  
✅ System monitoring and logging  
✅ Client-server architecture  

---

## 🎯 Key Takeaways

1. **Leader Election** - Bully Algorithm elegantly solves the distributed leader selection problem
2. **Replication** - Critical for data availability and fault tolerance
3. **Consistency** - Strong consistency ensures data correctness across all servers
4. **Fault Tolerance** - Systems must gracefully handle failures
5. **Real-time Updates** - WebSockets enable immediate event propagation
6. **Observability** - Logging is essential for understanding distributed behavior

---

## 🤝 Contributing

This is an educational project. Feel free to:
- Add new distributed system concepts
- Improve the UI/UX
- Add more sophisticated algorithms
- Enhance logging and monitoring

---

## 📝 License

MIT License - Free for educational use

---

## 👨‍💻 Author

Created for **Distributed Systems Course** - Educational purposes

---

## 🙏 Acknowledgments

This project demonstrates fundamental distributed system concepts in an interactive way. Special thanks to:
- Distributed Systems course materials
- Open source community
- Socket.IO and React teams

---

## 📞 Support

For questions or issues:
1. Check the System Logs for error messages
2. Review this README
3. Examine the code comments (heavily documented)

---

**Happy Learning! 🎓**

Explore, crash servers, watch elections, and see distributed systems in action!
