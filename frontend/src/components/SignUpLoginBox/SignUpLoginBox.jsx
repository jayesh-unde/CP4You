import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { sendOtpEmail, loginEmail, verifyOtp, googleLogin } from '../../http'; // Adjust import paths accordingly
import { setOtp, setAuth } from '../../store/authSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const SignupLoginBox = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtpValue] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const dispatch = useDispatch();
  const hash = useSelector((state) => state.auth.otp?.hash); // Retrieve hash from Redux state
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (showOtpField) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpField]);

  const responseGoogle = async (response) => {
    try {
      const { data } = await googleLogin({ token: response.credential });
      dispatch(setAuth(data));
      navigate('/');
    } catch (error) {
      toast.error('Google login failed');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Email and password are required', {
        position: 'bottom-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: 1,
        theme: 'dark',
      });
      return;
    }

    try {
      const { data } = await loginEmail({ email, password });

      if (data.requiresOtp) {
        // If OTP is required, send OTP and show OTP field
        const otpResponse = await sendOtpEmail({ email });
        dispatch(setOtp({ email, hash: otpResponse.data.hash })); // Store hash in Redux state
        setShowOtpField(true);
        setTimer(30);
        setCanResend(false);
      } else if (data.auth) {
        // Directly navigate if OTP is not required
        dispatch(setAuth(data));
        navigate('/');
      }
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message;
        toast.error(message, {
          position: 'bottom-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: 1,
          theme: 'dark',
        });
      } else {
        console.error(error);
      }
    }
  };

  const handleResendOtp = async (event) => {
    event.preventDefault();
    try {
      const { data } = await sendOtpEmail({ email });
      dispatch(setOtp({ email, hash: data.hash })); // Store new hash in Redux state
      setTimer(30);
      setCanResend(false);
    } catch (error) {
      toast.error('Error resending OTP', {
        position: 'bottom-center',
        autoClose: 5000,
        theme: 'dark',
      });
      console.error('Error resending OTP:', error);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error('Please enter the OTP', {
        position: 'bottom-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: 1,
        theme: 'dark',
      });
      return;
    }

    try {
      const { data } = await verifyOtp({ otp, email, hash, password }); // Use the correct hash
      if (!data.isValid) {
        toast.error('Invalid OTP', { position: 'bottom-center', autoClose: 5000, theme: 'dark' });
      } else {
        dispatch(setAuth(data));
        navigate('/');
      }
    } catch (error) {
      toast.error('Error verifying OTP', { position: 'bottom-center', autoClose: 5000, theme: 'dark' });
      console.error('Error verifying OTP', error);
    }
  };

  return (
    <div>
      <h2>Welcome to CodeJourney</h2>
      <form>
        <div>
          <label>Email:</label>
          <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {showOtpField && (
          <div>
            <label>OTP:</label>
            <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtpValue(e.target.value)} />
            {timer > 0 ? (
              <span>Resend OTP in {timer} seconds</span>
            ) : (
              <button onClick={handleResendOtp} disabled={!canResend}>
                Resend OTP
              </button>
            )}
          </div>
        )}
        <button type="button" onClick={showOtpField ? handleVerifyOtp : handleLogin}>
          {showOtpField ? 'Verify' : 'Login / Register'}
        </button>
      </form>
      <GoogleOAuthProvider clientId="30593915275-v57qg0fnb45hn5f9divrtg1mbh290p5h.apps.googleusercontent.com">
        <GoogleLogin
          onSuccess={responseGoogle}
          onError={() => {
            toast.error('Google login failed');
          }}
          theme="outline"
          text="Continue with Google"
        />
      </GoogleOAuthProvider>
    </div>
  );
};

SignupLoginBox.propTypes = {
  className: PropTypes.string,
};

export default SignupLoginBox;
