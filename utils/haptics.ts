import * as Haptics from "expo-haptics";

/**
 * Light tap — card press, chip select, toggle
 */
export function tapHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/**
 * Medium tap — FAB press, sheet open, button confirm
 */
export function mediumHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

/**
 * Heavy tap — destructive actions (delete, archive confirm)
 */
export function heavyHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

/**
 * Success — idea stashed, tag created, status changed to complete
 */
export function successHaptic() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/**
 * Error — failed action, validation error
 */
export function errorHaptic() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

/**
 * Warning — long press menu, confirm destructive action
 */
export function warningHaptic() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

/**
 * Selection change — filter chip switch, priority/status button
 */
export function selectionHaptic() {
  Haptics.selectionAsync();
}
