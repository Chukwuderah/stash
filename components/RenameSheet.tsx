import Colors from "@/constants/colors";
import { successHaptic } from "@/utils/haptics";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface RenameSheetProps {
  title: string;
  currentName: string;
  onConfirm: (newName: string) => void;
  onDismiss?: () => void;
}

export interface RenameSheetRef {
  open: () => void;
}

const RenameSheet = forwardRef<RenameSheetRef, RenameSheetProps>(
  ({ title, currentName, onConfirm, onDismiss }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const inputRef = useRef<TextInput>(null);
    const snapPoints = useMemo(() => ["55%", "82%"], []);
    const [value, setValue] = useState(currentName);

    // Sync value when currentName changes (e.g. different tag selected)
    useEffect(() => {
      setValue(currentName);
    }, [currentName]);

    // Expose open() to parent via ref
    useImperativeHandle(ref, () => ({
      open() {
        if (Platform.OS === "ios") {
          // iOS — use native prompt, no sheet needed
          Alert.prompt(
            title,
            `Current name: ${currentName}`,
            [
              { text: "Cancel", style: "cancel", onPress: onDismiss },
              {
                text: "Save",
                onPress: (newName?: string) => {
                  if (newName?.trim() && newName.trim() !== currentName) {
                    onConfirm(newName.trim());
                  }
                },
              },
            ],
            "plain-text",
            currentName,
          );
        } else {
          // Android — open the bottom sheet
          setValue(currentName);
          bottomSheetRef.current?.expand();
          setTimeout(() => inputRef.current?.focus(), 300);
        }
      },
    }));

    function handleSave() {
      const trimmed = value.trim();
      if (!trimmed || trimmed === currentName) {
        handleDismiss();
        return;
      }
      successHaptic();
      onConfirm(trimmed);
      handleDismiss();
    }

    const handleDismiss = useCallback(() => {
      bottomSheetRef.current?.close();
      onDismiss?.();
    }, [onDismiss]);

    function handleSheetChange(index: number) {
      if (index === -1) {
        onDismiss?.();
      }
    }

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.45}
          onPress={handleDismiss}
        />
      ),
      [handleDismiss],
    );

    // On iOS this never renders — Alert.prompt handles everything
    if (Platform.OS === "ios") return null;

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={handleSheetChange}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{
          backgroundColor: Colors.cardBorder,
          width: 32,
          height: 4,
        }}
        backgroundStyle={{
          backgroundColor: Colors.cardBg,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetView className="px-5 pt-2 pb-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-5">
            <Text
              className="text-[17px] font-semibold"
              style={{ color: Colors.textPrimary }}
            >
              {title}
            </Text>
            <TouchableOpacity onPress={handleDismiss} activeOpacity={0.7}>
              <Text className="text-[15px]" style={{ color: Colors.textMuted }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input */}
          <View
            className="flex-row items-center rounded-xl px-4 py-3 mb-4 border-[0.5px]"
            style={{
              backgroundColor: Colors.screenBg,
              borderColor: Colors.cardBorder,
            }}
          >
            <TextInput
              ref={inputRef}
              className="flex-1 text-[16px]"
              style={{ color: Colors.textPrimary }}
              value={value}
              onChangeText={setValue}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSave}
              selectTextOnFocus
            />
          </View>

          {/* Save button */}
          <TouchableOpacity
            className="rounded-[14px] py-[14px] items-center"
            style={{
              backgroundColor:
                value.trim() && value.trim() !== currentName
                  ? Colors.brandTeal
                  : Colors.cardBorder,
            }}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={!value.trim() || value.trim() === currentName}
          >
            <Text
              className="text-[16px] font-semibold"
              style={{
                color:
                  value.trim() && value.trim() !== currentName
                    ? "#FFFFFF"
                    : Colors.textMuted,
              }}
            >
              Save
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

RenameSheet.displayName = "RenameSheet";
export default RenameSheet;
