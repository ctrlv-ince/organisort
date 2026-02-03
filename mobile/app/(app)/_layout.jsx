import ProtectedScreen from '@/src/components/ProtectedScreen';
import { Slot } from 'expo-router';

export default function AppLayout() {
  return (
    <ProtectedScreen>
      <Slot />
    </ProtectedScreen>
  );
}
