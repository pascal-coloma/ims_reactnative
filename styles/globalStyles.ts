import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'flex-start',
    padding: 10,
  },
  welcome: {
    fontSize: 12,
    color: '#666',
  },
  role: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#E53935',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  redCard: {
    backgroundColor: '#e62a2af3',
    width: '100%',
    color: 'white',
    padding: 15,
    borderRadius: 20,
    marginBottom: 20,
  },
  redCardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'medium',
  },
  dispNumb: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  redCardPills: {
    flexDirection: 'row',
    marginTop: 5,
    gap: 10,
  },
  pill: {
    backgroundColor: '#ffffff28',
    color: 'white',
    borderRadius: 20,
    padding: 7,
  },
});

export default styles;
