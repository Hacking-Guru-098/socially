import 'react-native-url-polyfill/auto';
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

// Simple, minimal app component without any complex web fixes
export function App() {
  const ctx = require.context('./');
  return <ExpoRoot context={ctx} />;
}

// Default export to comply with module requirements
export default App;

registerRootComponent(App); 