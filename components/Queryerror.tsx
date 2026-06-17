import Colors from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface QueryErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function QueryError({
  message = "Couldn't load your data. Check your connection and try again.",
  onRetry,
}: QueryErrorProps) {
  return (
    <View className="flex-1 items-center justify-center px-10 gap-4">
      <Ionicons
        name="cloud-offline-outline"
        size={44}
        color={Colors.cardBorder}
      />
      <Text
        className="text-[16px] font-medium text-center"
        style={{ color: Colors.textSubtle }}
      >
        Unable to load
      </Text>
      <Text
        className="text-[14px] text-center leading-5"
        style={{ color: Colors.textMuted }}
      >
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          className="px-6 py-3 rounded-full mt-2"
          style={{ backgroundColor: Colors.brandTeal }}
          onPress={onRetry}
          activeOpacity={0.85}
        >
          <Text className="text-[14px] font-semibold text-white">
            Try again
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
