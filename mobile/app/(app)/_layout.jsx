import ProtectedScreen from '@/src/components/ProtectedScreen';

export default function AppLayout() {
  return (
    <ProtectedScreen>
      <Slot />
    </ProtectedScreen>
  );
}
