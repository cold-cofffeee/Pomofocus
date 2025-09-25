# Pomofocus Clone

A minimalist Pomodoro timer web app inspired by Pomofocus, built with React and Vite. Manage your focus sessions, track productivity, and customize your workflow with a clean, responsive interface.

## Features

- Pomodoro, Short Break, and Long Break timers
- Customizable timer durations
- Session tracking and statistics
- Local storage support for persistent settings
- Responsive and clean UI

## Demo

![Screenshot](screenshot.png)

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/pomofocus-clone.git
   cd pomofocus-clone
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```

### Running the App

Start the development server:
```sh
npm run dev
# or
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

### Building for Production

To build the app for production:
```sh
npm run build
# or
yarn build
```

The output will be in the `dist` folder.

### Project Structure

```
├── App.tsx              # Main React component
├── constants.ts         # Timer and app constants
├── hooks/               # Custom React hooks
│   └── useLocalStorage.ts
├── index.html           # HTML template
├── index.tsx            # App entry point
├── metadata.json        # App metadata
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── types.ts             # TypeScript types
├── vite.config.ts       # Vite configuration
```

## Customization
- Edit `constants.ts` to change default timer values.
- Use `useLocalStorage.ts` to persist user settings.

## License

This project is licensed under the MIT License.

---

Inspired by [pomofocus.io](https://pomofocus.io/). Not affiliated with Pomofocus.