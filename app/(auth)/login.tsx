import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import LoginForm from '../../components/LoginForm';

export default function LoginScreen() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/bootsplash/logo2x.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.logoStripe} />
          </View>
          <LoginForm />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignSelf: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 250,
    height: 200,
  },
  logoStripe: {
    height: 6,
    backgroundColor: '#E53935',
  },
});
