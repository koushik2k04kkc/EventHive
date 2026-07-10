# EventHive 🚀

**EventHive** is a comprehensive event management platform designed to streamline the process of creating, managing, and discovering events. Built with React 19, TypeScript, and Vite, it offers a modern, responsive, and highly performant user experience.

## Features ✨

- **Modern UI**: Built with [Headless UI](https://headlessui.com/) and styled with [Tailwind CSS](https://tailwindcss.com/) for a fully customizable and accessible design system.
- **Type Safety**: Comprehensive TypeScript implementation ensures type safety across the entire application.
- **Dynamic Routing**: Utilizes React Router v7 for powerful client-side routing.
- **State Management**: Integrates with TanStack Router for robust state management and navigation.
- **Form Handling**: Enhanced forms with [Hook Form](https://www.react-hook-form.com/) and schema validation using [Zod](https://zod.dev/).
- **Data Persistence**: Seamless integration with Firestore (Google's NoSQL database) for real-time data synchronization.
- **Authentication**: Secure user authentication powered by Firebase Authentication.
- **Date Utilities**: Advanced date and time manipulation using `date-fns`.

## Tech Stack 🛠️

### Core

- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

### State & Routing

- [TanStack Router](https://tanstack.com/router/latest) - State management and routing.
- [TanStack Table](https://tanstack.com/table/latest) - Advanced table UI components.

### Forms & Validation

- [React Hook Form](https://www.react-hook-form.com/) - High-performance form handling.
- [Zod](https://zod.dev/) - Schema validation library.

### UI & Components

- [Headless UI](https://headlessui.com/) - Unstyled, fully accessible UI components.
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components (used for specific components).
- [Lucide React](https://lucide.dev/) - Icon library.

### Date & Time

- [date-fns](https://date-fns.org/) - Modern JavaScript date utility library.
- [date-fns-tz](https://date-fns.org/v2.29.3/docs/#getting-started-date-fns-tz) - Timezone support for date-fns.

### Services & APIs

- [Firebase](https://firebase.google.com/) - Authentication and Firestore database.

### Testing

- [Vitest](https://vitest.dev/) - Fast unit testing framework.
- [React Testing Library](https://testing-library.com/) - Testing utilities for React.
- [MSW](https://mswjs.io/) - Intercept and mock network requests.

## Getting Started 🚀

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd eventHive2/eventHive
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a Firebase project and configure it with your application.
   - Add the Firebase configuration to your environment variables or directly in the code where appropriate.

4. Run the development server:
```bash
npm run dev
```

## Development Scripts 💻

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Run tests**: `npm run test`
- **Lint code**: `npm run lint`

## Project Structure 📁

```
src/
├── components/       # Reusable UI components
├── features/           # Feature-specific modules (auth, events, etc.)
├── services/           # API and service integrations (firebase, etc.)
├── store/              # State management configurations
├── types/              # TypeScript type definitions
└── pages/              # Page components for routing
```

## License

ISC