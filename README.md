# CollabCanvas

A real-time collaborative whiteboard application where teams can brainstorm, sketch ideas, and work together visually. Built with modern web technologies for seamless, instant collaboration.

## ✨ Features

### 🎨 Drawing & Canvas Tools

- **Freehand Drawing** - Smooth, responsive pencil tool for sketching
- **Shapes** - Rectangles, circles, lines for structured diagrams
- **Text & Sticky Notes** - Add text boxes and colorful sticky notes
- **Cards** - Create fancy cards with headers and descriptions
- **Eraser** - Remove elements with precision
- **Select & Move** - Drag elements around the canvas
- **Pan & Zoom** - Navigate large canvases with cursor-centered zoom

### 👥 Real-Time Collaboration

- **Live Cursors** - See where team members are on the canvas in real-time
- **Instant Sync** - All changes appear instantly on everyone's screen
- **Online Status** - See who's currently viewing the board
- **Connection Indicators** - Know when you're connected and saving

### 🔐 Access Control

- **Public/Private Boards** - Make boards public or invite-only
- **Role-Based Permissions** - Owner, Admin, Editor, and Viewer roles
- **Invite System** - Invite team members via email or shareable links
- **Member Management** - View, manage, and remove board members

### 📊 Board Management

- **Dashboard** - Organize all your boards in one place
- **Pinned Boards** - Pin frequently used boards for quick access
- **Board Settings** - Rename, delete, and configure board visibility
- **Board Cards** - Beautiful preview cards with unique backgrounds

### 💾 Data Persistence

- **Auto-Save** - All changes are automatically saved to the database
- **Undo/Redo** - Full history support for canvas actions
- **Element Persistence** - All drawings, shapes, and notes are saved

### 🎯 User Experience

- **Keyboard Shortcuts** - Quick tool switching and actions
- **Responsive Design** - Works on desktop and tablet devices
- **Modern UI** - Clean, intuitive interface with smooth animations
- **Connection Status** - Real-time connection and saving indicators

## 🚀 Tech Stack

### Frontend

- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icon library

### Backend

- **Express** - Web server framework
- **tRPC** - End-to-end typesafe APIs
- **Socket.IO** - Real-time WebSocket communication
- **Lucia Auth** - Session-based authentication
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Relational database

### Real-Time

- **Socket.IO Server** - WebSocket server for live updates
- **Socket.IO Client** - Real-time cursor and element syncing
- **Room-Based Architecture** - Each board is a separate room

## 🎮 Available Scripts

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Start both frontend and backend          |
| `npm run dev:client` | Start frontend only (Vite)               |
| `npm run dev:server` | Start backend only (Express + Socket.IO) |
| `npm run build`      | Build for production                     |
| `npm run lint`       | Run ESLint                               |
| `npm run format`     | Format code with Prettier                |
| `npm run db:push`    | Push schema changes to database          |
| `npm run db:migrate` | Create and run migrations                |
| `npm run db:studio`  | Open Prisma Studio                       |
| `npm run db:seed`    | Seed the database                        |

## 🗄️ Database Schema

### Key Models

- **users** - User accounts and authentication
- **boards** - Whiteboard boards with settings
- **board_members** - Board membership and roles
- **board_invites** - Pending invitations
- **elements** - Canvas elements (drawings, shapes, text, etc.)
- **comments** - Comments and threads on elements

See `prisma/schema.prisma` for the complete schema.

## 🔌 Real-Time Architecture

### Socket.IO Rooms

Each board is a separate Socket.IO room (`board:${boardId}`). When users join a board:

1. Client connects to Socket.IO server
2. Joins the board room
3. Receives current users and their cursor positions
4. Broadcasts cursor movements to other users
5. Receives element updates in real-time

### Element Syncing

- **Add** - New elements broadcast to all users
- **Update** - Element moves/edits sync instantly
- **Delete** - Removals appear on all screens
- **Batch Sync** - Undo/redo operations sync

### Cursor Tracking

- Cursor positions updated at ~30fps
- Each user gets a unique color
- Cursor names displayed on hover
- Automatic cleanup on disconnect

## 🎨 Canvas Features

### Drawing Tools

- **Pencil** - Freehand drawing with smooth strokes
- **Line** - Straight lines between two points
- **Rectangle** - Rectangular shapes
- **Circle** - Circular shapes
- **Text** - Text boxes with custom styling
- **Sticky Note** - Colorful sticky notes
- **Card** - Fancy cards with headers and descriptions
- **Eraser** - Remove elements by clicking

### Interaction

- **Select Tool** - Click to select, drag to move
- **Pan Tool** - Click and drag to pan canvas
- **Zoom** - Mouse wheel zooms centered on cursor
- **Keyboard Shortcuts** - Quick tool switching

## 🔐 Authentication & Authorization

### User Roles

- **Owner** - Full control, can delete board
- **Admin** - Can manage members and settings
- **Editor** - Can edit canvas content
- **Viewer** - Can view and comment only

### Board Access

- **Public Boards** - Anyone with the link can view
- **Private Boards** - Only invited members can access
- **Invite System** - Email invites or shareable links

**Made with ❤️ by [Brennon Nuckols](https://bnuckols.com)**
