import Colors from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Component, type ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  children: ReactNode;
  // Optional custom fallback — defaults to the generic error UI below
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("[ErrorBoundary]", error);
  }

  reset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View
          className="flex-1 items-center justify-center px-10 gap-4"
          style={{ backgroundColor: Colors.screenBg }}
        >
          <View
            className="w-16 h-16 rounded-2xl items-center justify-center"
            style={{ backgroundColor: Colors.lightTeal }}
          >
            <Ionicons
              name="warning-outline"
              size={32}
              color={Colors.brandTeal}
            />
          </View>
          <Text
            className="text-[18px] font-semibold text-center"
            style={{ color: Colors.textPrimary }}
          >
            Something went wrong
          </Text>
          <Text
            className="text-[14px] text-center leading-5"
            style={{ color: Colors.textMuted }}
          >
            An unexpected error occurred. Your data is safe — tap below to try
            again.
          </Text>
          <TouchableOpacity
            className="px-6 py-3 rounded-full mt-2"
            style={{ backgroundColor: Colors.brandTeal }}
            onPress={() => this.reset()}
            activeOpacity={0.85}
          >
            <Text className="text-[14px] font-semibold text-white">
              Try again
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
