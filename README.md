Mini CRM — Client Lead Management System

A simple CRM to manage leads generated from website contact forms — track status, add follow-up notes, and view basic analytics from a secure admin dashboard.

Features


📋 Lead listing with name, email, source, and status
🔄 Status updates: new → contacted → converted (or lost)
📝 Notes & follow-ups on each lead, with timestamps
🔐 Secure admin login (only authenticated users can access the dashboard)
🌐 Public contact form that feeds new leads directly into the CRM
🔍 Search and filter leads by name, email, status, or source
📊 Simple analytics: total leads, status breakdown, conversion rate


Tech Stack


Frontend: React.js
Backend / Database: Node.js / Express + MongoDB (or Supabase, if using Lovable)
Auth: Email/password admin login


Getting Started

Prerequisites


Node.js (v18+)
MongoDB instance (local or Atlas) — or Supabase project, depending on stack


Installation

bashgit clone https://github.com/your-username/mini-crm.git
cd mini-crm
npm install

Environment Variables

Create a .env file in the root directory:

DATABASE_URL=your_database_connection_string
JWT_SECRET=your_secret_key
PORT=5000

Run Locally

bash# Start backend
npm run server

# Start frontend
npm run client

App will be available at http://localhost:3000.

Usage


Log in with your admin credentials at /login.
View and manage leads from the /leads dashboard.
Click a lead to update its status or add follow-up notes.
New leads submitted via the public /contact form appear automatically with status new.


Project Structure

mini-crm/
├── client/          # React frontend
├── server/          # Express backend & API routes
├── models/          # Database schemas (Lead, Notes)
└── README.md

License

MIT
