import { TextInput, TextInputProps } from 'react-native';

const AppTextInput = ({ placeholderTextColor = '#9ca3af', style, ...props }: TextInputProps) => {
  return (
    <TextInput
      placeholderTextColor={placeholderTextColor}
      style={[{ backgroundColor: '#ffffff' }, style]}
      {...props}
    />
  );
};

export default AppTextInput;
