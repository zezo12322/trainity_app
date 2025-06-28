// Load web polyfills first on web platform
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  require('./web-polyfills');
}

// Initialize gesture handler
import './gesture-handler-setup';
import { registerRootComponent } from 'expo';

// Import the main App component
import App from './App';

// Register the main component
registerRootComponent(App);
