import { Image, StyleSheet, View } from 'react-native';
import LoginForm from '../../components/LoginForm';

export default function LoginScreen() {
  return (
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
