# ExpenseMan - Personal Business Management System

A comprehensive React-based business management application with Google Sheets integration and AI assistance.

## 🚀 Features

### 📊 **Dashboard Analytics**
- Real-time business performance metrics
- Monthly profit/loss calculations
- Interactive charts for income vs expenses
- Expense category breakdown with pie charts
- Site progress tracking
- Labour payment status

### 💰 **Payments & Expenses Management**
- Complete CRUD operations for payments and expenses
- Advanced filtering by date range, category, and amount
- Real-time search functionality
- Sortable data tables
- Export capabilities
- Category management

### 🏗️ **Sites Management**
- Project progress tracking with visual progress bars
- Payment status monitoring (Paid/Partially Paid/Pending)
- Project timeline management
- Project value tracking
- Site-specific analytics

### 👥 **Labour Management**
- Staff information and role management
- Salary and payment tracking
- Balance calculations
- Payment history
- Role-based organization

### 🤝 **Clients Management**
- Client contact information
- Payment history tracking
- Outstanding balance monitoring
- Site associations
- Client communication logs

### ✅ **Tasks & Habits**
- Task management with priority levels
- Deadline tracking
- Habit tracking with streak counters
- Status monitoring (Pending/In Progress/Completed)
- Productivity analytics

### 🤖 **AI Assistant**
- Gemini AI integration for business insights
- Context-aware responses using real business data
- Thinking mode for complex analysis
- Natural language queries about business performance
- Data-driven recommendations

## 🛠️ **Technical Features**

### 🔄 **Google Sheets Integration**
- Real-time data synchronization (every 30 seconds)
- Automatic data parsing and validation
- Error handling and retry mechanisms
- Connection status monitoring
- Offline-first approach with local mutations

### 🎨 **Modern UI/UX**
- Responsive design (Desktop + Mobile)
- Dark/Light theme support
- Tailwind CSS styling
- Smooth animations and transitions
- Mobile-first navigation
- Accessibility compliant

### ⚙️ **State Management**
- Context-based architecture
- TypeScript for type safety
- Persistent settings via localStorage
- Real-time data updates
- Optimistic UI updates

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Sheets API key
- Google Sheet with proper structure

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expenseman
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3001
   ```

### Configuration

1. **Google Sheets Setup**
   - Create a Google Sheet with the following sheets:
     - `Main` - For payments and expenses data
     - `Categories` - For expense categories
     - `Labour` - For staff information
     - `Sites` - For project information
     - `Parties` - For client information

2. **API Key Setup**
   - Get a Google Sheets API key from Google Cloud Console
   - Enable Google Sheets API
   - Configure the API key in Settings

3. **Sheet Structure**
   
   **Main Sheet Columns:**
   - Date, Type, Amount, Category, Description, Labour, Site, Party

   **Categories Sheet:**
   - Category names (one per row)

   **Labour Sheet:**
   - Staff names and details

   **Sites Sheet:**
   - Site names and project information

   **Parties Sheet:**
   - Client names and contact information

## 📱 **Usage**

### Dashboard
- View real-time business metrics
- Monitor monthly profit/loss
- Track site progress
- Analyze expense patterns

### Data Management
- Add/Edit/Delete payments and expenses
- Filter and search data
- Export reports
- Manage categories

### AI Assistant
- Ask questions about business performance
- Get insights on spending patterns
- Analyze profit trends
- Receive data-driven recommendations

### Settings
- Configure Google Sheets connection
- Set up API credentials
- Customize theme preferences
- Monitor sync status

## 🔧 **Development**

### Project Structure
```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts for state management
├── pages/              # Main application pages
├── services/           # API services and utilities
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
└── index.tsx           # Application entry point
```

### Key Technologies
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Google Sheets API** - Data source
- **Google Generative AI** - AI assistance

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🔒 **Security**

- API keys are stored securely in localStorage
- No sensitive data is exposed in the client
- HTTPS required for production deployment
- Input validation and sanitization
- Error boundaries for graceful error handling

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

## 🆘 **Support**

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

## 🎯 **Roadmap**

- [ ] Advanced reporting and analytics
- [ ] Multi-user support
- [ ] Mobile app version
- [ ] Integration with accounting software
- [ ] Advanced AI features
- [ ] Automated backup and sync
- [ ] Custom dashboard widgets
- [ ] API for third-party integrations

---

**ExpenseMan** - Streamline your business management with intelligent automation and real-time insights.