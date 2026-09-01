import { Platform } from 'react-native';

export async function hapticMerge() {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const Haptics = await import('expo-haptics');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Simulators and some devices have no haptic hardware.
  }
}
