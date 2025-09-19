import React, { useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  useTheme,
  Surface,
  IconButton,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { authService } from '../../services/authService';

const LoginScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePhoneNumber = (number: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(number.replace(/\D/g, ''));
  };

  const handleSendOtp = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedNumber = `+91${phoneNumber.replace(/\D/g, '')}`;
      await authService.sendOTP(formattedNumber);
      setIsOtpSent(true);
      Alert.alert('Success', 'OTP sent to your mobile number');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedNumber = `+91${phoneNumber.replace(/\D/g, '')}`;
      const deviceInfo = await authService.getDeviceInfo();
      
      // For demo purposes, we'll use direct login instead of OTP
      await login(formattedNumber, deviceInfo);
      
      // In production, use OTP verification:
      // await authService.verifyOTP(formattedNumber, otp);
      
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    setOtp('');
    setIsOtpSent(false);
    handleSendOtp();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.surface} elevation={0}>
          <View style={styles.header}>
            <IconButton
              icon="arrow-left"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            />
            <Text variant="headlineMedium" style={styles.title}>
              Welcome Back
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Login to continue tracking your trips
            </Text>
          </View>

          <View style={styles.form}>
            {!isOtpSent ? (
              <>
                <TextInput
                  label="Mobile Number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={10}
                  left={<TextInput.Affix text="+91" />}
                  style={styles.input}
                  disabled={loading}
                  error={!!error && !isOtpSent}
                />
                
                <Button
                  mode="contained"
                  onPress={handleSendOtp}
                  loading={loading}
                  disabled={loading || !phoneNumber}
                  style={styles.button}
                >
                  Send OTP
                </Button>
              </>
            ) : (
              <>
                <Text variant="bodyLarge" style={styles.otpText}>
                  Enter the OTP sent to +91 {phoneNumber}
                </Text>
                
                <TextInput
                  label="Enter OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={styles.input}
                  disabled={loading}
                  error={!!error && isOtpSent}
                />
                
                <Button
                  mode="contained"
                  onPress={handleVerifyOtp}
                  loading={loading}
                  disabled={loading || !otp}
                  style={styles.button}
                >
                  Verify & Login
                </Button>
                
                <Button
                  mode="text"
                  onPress={handleResendOtp}
                  disabled={loading}
                  style={styles.resendButton}
                >
                  Resend OTP
                </Button>
              </>
            )}

            <View style={styles.footer}>
              <Text variant="bodyMedium" style={styles.footerText}>
                Don't have an account?{' '}
              </Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Register' as never)}
                compact
                style={styles.registerButton}
              >
                Register
              </Button>
            </View>
          </View>
        </Surface>

        <Snackbar
          visible={!!error}
          onDismiss={() => setError('')}
          duration={3000}
          style={styles.snackbar}
        >
          {error}
        </Snackbar>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  surface: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  backButton: {
    marginLeft: -8,
  },
  title: {
    marginTop: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
  form: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  otpText: {
    marginBottom: 20,
    textAlign: 'center',
  },
  resendButton: {
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    opacity: 0.7,
  },
  registerButton: {
    marginLeft: -8,
  },
  snackbar: {
    backgroundColor: '#B71C1C',
  },
});

export default LoginScreen;