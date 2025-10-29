import {
  NativeSyntheticEvent,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";
import React, { useRef } from "react";
import { useColorScheme } from "nativewind";

type Nullable<T> = T | null;

const OtpInputField = ({ disabled }: { disabled: boolean }) => {
  const inputRefs = useRef<Array<Nullable<TextInput>>>([]);
  const { colorScheme } = useColorScheme();

  const handleChange = (text: string, idx: number) => {
    if (text.length !== 0) {
      return inputRefs?.current[idx + 1]?.focus();
    }
    return inputRefs?.current[idx - 1]?.focus();
  };

  const handleBackspace = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    idx: number
  ) => {
    const { nativeEvent } = event;
    if (nativeEvent.key === "Backspace") {
      handleChange("", idx);
    }
  };

  return (
    <View className="flex-row justify-between items-center gap-x-3 px-10  mx-auto">
      {[...new Array(4)].map((item, idx) => (
        <View
          key={idx}
          className="border rounded-lg bg-n20 dark:bg-darkN20 h-14 w-14 border-n40 dark:border-darkN40 flex-row justify-center items-center "
        >
          <TextInput
            ref={(ref) => {
              if (ref && !inputRefs.current.includes(ref)) {
                inputRefs.current = [...inputRefs.current, ref];
              }
            }}
            className="text-center text-xl dark:text-white"
            maxLength={1}
            placeholderTextColor={colorScheme === "dark" ? "#fff" : ""}
            contextMenuHidden
            selectTextOnFocus
            editable={!disabled}
            keyboardType="decimal-pad"
            testID={`OTPInput-${idx}`}
            onChangeText={(text) => handleChange(text, idx)}
            onKeyPress={(event) => handleBackspace(event, idx)}
          />
        </View>
      ))}
    </View>
  );
};

export default OtpInputField;
