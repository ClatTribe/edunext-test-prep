'use client'

// import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import React, { useState, useEffect } from 'react';
// import React from 'react';

// export default function AuthPage() {
//   const [isLogin] = useState(false);
//   // const [exams, setExams] = useState([]);
//   // const [regForm, setRegForm] = useState({
//   //   username: '',
//   //   fullName: '',
//   //   examId: '',
//   //   email: '',
//   //   emailOtp: '',
//   //   phone: '',
//   //   phoneOtp: '',
//   //   password: '',
//   //   confirmPassword: ''
//   // });
//   // const [emailOtpSent, setEmailOtpSent] = useState(false);
//   // const [phoneOtpSent, setPhoneOtpSent] = useState(false);
//   // const [otpTimer, setOtpTimer] = useState(0); // ✅ Timer state
//   // const [errors, setErrors] = useState({});

//   // const [loginMethod, setLoginMethod] = useState('username');
//   // const [loginForm, setLoginForm] = useState({
//   //   username: '',
//   //   password: '',
//   //   emailOrPhone: '',
//   //   otp: ''
//   // });
//   // const [loginOtpSent, setLoginOtpSent] = useState(false);

//   // const [showForgotPassword, setShowForgotPassword] = useState(false);
//   // const [resetEmail, setResetEmail] = useState('');

//   // useEffect(() => {
//   //   fetchExams();
//   //   document.body.style.overflow = 'hidden';
//   //   document.documentElement.style.overflow = 'hidden';
//   //   return () => {
//   //     document.body.style.overflow = 'auto';
//   //     document.documentElement.style.overflow = 'auto';
//   //   };
//   // }, []);

//   // const fetchExams = async () => {
//   //   try {
//   //     const { data, error } = await supabase
//   //       .from('exams')
//   //       .select('*')
//   //       .order('name', { ascending: true });
      
//   //     if (error) throw error;
//   //     console.log('Fetched exams:', data);
//   //     setExams(data || []);
//   //   } catch (err) {
//   //     console.error('Error fetching exams:', err);
//   //   }
//   // };

//   // const handleRegInputChange = (e) => {
//   //   setRegForm({ ...regForm, [e.target.name]: e.target.value });
//   //   setErrors({ ...errors, [e.target.name]: '' });
//   // };

//   // const sendEmailOtp = async () => {
//   //   if (!regForm.email) {
//   //     setErrors({ ...errors, email: 'Email required' });
//   //     return;
//   //   }

//   //   // Email validation
//   //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   //   if (!emailRegex.test(regForm.email)) {
//   //     setErrors({ ...errors, email: 'Invalid email format' });
//   //     return;
//   //   }

//   //   try {
//   //     console.log('📧 Sending OTP to:', regForm.email);
      
//   //     const { data, error } = await supabase.auth.signInWithOtp({
//   //       email: regForm.email,
//   //       options: {
//   //         shouldCreateUser: true,
//   //         emailRedirectTo: `${window.location.origin}/`
//   //       }
//   //     });

//   //     console.log('📨 OTP Response:', data);
//   //     console.log('❌ OTP Error:', error);

//   //     if (error) throw error;
      
//   //     setEmailOtpSent(true);
//   //     setOtpTimer(60); // ✅ Start 60 second timer
      
//   //     alert('✅ OTP sent to your email!\n\n⏱️ Valid for 60 seconds\n📧 Check inbox/spam folder\n🔢 Enter 6-digit code');
      
//   //     // ✅ Countdown timer
//   //     const interval = setInterval(() => {
//   //       setOtpTimer(prev => {
//   //         if (prev <= 1) {
//   //           clearInterval(interval);
//   //           return 0;
//   //         }
//   //         return prev - 1;
//   //       });
//   //     }, 1000);
      
//   //   } catch (error) {
//   //     console.error('OTP Send Error:', error);
//   //     alert('Failed to send OTP: ' + error.message);
//   //   }
//   // };
//   const handleGoogleLogin = async () => {
//     await supabase.auth.signInWithOAuth({
//       provider: 'google',
//       options: {
//         redirectTo: `${window.location.origin}/dashboard/ai-prep`,
//       },
//     });
//     console.log("Initiating Google Login...");
//   };

//   // const handleRegistration = async () => {
//   //   if (!validateRegistration()) return;
    
//   //   try {
//   //     console.log('🚀 Starting registration for:', regForm.email);
//   //     console.log('🔢 OTP entered:', regForm.emailOtp);
      
//   //     // Step 1: Verify OTP
//   //     console.log('📧 Verifying OTP...');
      
//   //     const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
//   //       email: regForm.email,
//   //       token: regForm.emailOtp.trim(),
//   //       type: 'email'
//   //     });

//   //     console.log('✅ Verify response:', verifyData);
//   //     console.log('❌ Verify error:', verifyError);

//   //     if (verifyError) {
//   //       console.error('📝 Full verify error:', JSON.stringify(verifyError, null, 2));
        
//   //       if (verifyError.message.includes('expired')) {
//   //         throw new Error('⏱️ OTP has expired! Click "Resend OTP" to get a new code.');
//   //       } else if (verifyError.message.includes('invalid') || verifyError.message.includes('Token')) {
//   //         throw new Error('❌ Invalid OTP! Please check the code and try again.');
//   //       } else {
//   //         throw new Error('OTP verification failed: ' + verifyError.message);
//   //       }
//   //     }

//   //     if (!verifyData?.user) {
//   //       throw new Error('OTP verified but user not created. Please try again.');
//   //     }

//   //     console.log('✅ User created with ID:', verifyData.user.id);

//   //     // Step 2: Set password in Supabase Auth
//   //     console.log('🔑 Setting password in Supabase Auth...');
//   //     const { error: passwordError } = await supabase.auth.updateUser({
//   //       password: regForm.password
//   //     });

//   //     if (passwordError) {
//   //       console.error('❌ Password set failed:', passwordError);
//   //       throw new Error('Failed to set password: ' + passwordError.message);
//   //     }

//   //     console.log('✅ Password set successfully in Supabase Auth!');

//   //     // Step 3: Hash password for custom table
//   //     console.log('🔒 Hashing password for custom table...');
//   //     const hashedPassword = await bcrypt.hash(regForm.password, 10);

//   //     // Step 4: Insert into custom users table
//   //     console.log('💾 Saving to users table...');
//   //     const insertData = {
//   //       id: verifyData.user.id,
//   //       username: regForm.username,
//   //       full_name: regForm.fullName,
//   //       email: regForm.email,
//   //       phone_number: regForm.phone || null,
//   //       password_hash: hashedPassword,
//   //       exam_id: regForm.examId
//   //     };

//   //     console.log('📦 Inserting:', insertData);

//   //     const { data: insertedData, error: insertError } = await supabase
//   //       .from('users')
//   //       .insert([insertData])
//   //       .select();

//   //     console.log('📊 Inserted:', insertedData);
//   //     console.log('❌ Insert Error:', insertError);

//   //     if (insertError) {
//   //       console.error('💥 Insert failed!');
//   //       throw new Error('Database error: ' + insertError.message);
//   //     }

//   //     console.log('🎉 SUCCESS! User registered completely');

//   //     // Sign out after registration
//   //     await supabase.auth.signOut();

//   //     alert('✅ Registration Successful!\n\nYour account has been created.\nYou can now login with your username and password.');
      
//   //     setIsLogin(true);
      
//   //     // Reset form
//   //     setRegForm({ 
//   //       username: '', 
//   //       fullName: '', 
//   //       examId: '', 
//   //       email: '', 
//   //       emailOtp: '', 
//   //       phone: '', 
//   //       phoneOtp: '', 
//   //       password: '', 
//   //       confirmPassword: '' 
//   //     });
//   //     setEmailOtpSent(false);
//   //     setPhoneOtpSent(false);
//   //     setOtpTimer(0);
      
//   //   } catch (error) {
//   //     console.error('❌ Registration failed:', error);
//   //     alert('Registration failed:\n\n' + error.message);
//   //   }
//   // };

//   // const sendPhoneOtp = async () => {
//   //   if (!regForm.phone) {
//   //     setErrors({ ...errors, phone: 'Phone required' });
//   //     return;
//   //   }

//   //   try {
//   //     const { error } = await supabase.auth.signInWithOtp({
//   //       phone: regForm.phone,
//   //       options: {
//   //         shouldCreateUser: false,
//   //       }
//   //     });

//   //     if (error) throw error;
      
//   //     setPhoneOtpSent(true);
//   //     alert('OTP sent to your phone!');
//   //   } catch (error) {
//   //     alert('Failed to send OTP: ' + error.message);
//   //   }
//   // };

//   // const validateRegistration = () => {
//   //   const newErrors = {};
//   //   if (!regForm.username) newErrors.username = 'Username required';
//   //   if (!regForm.fullName) newErrors.fullName = 'Full name required';
//   //   if (!regForm.examId) newErrors.examId = 'Please select exam';
//   //   if (!regForm.email) newErrors.email = 'Email required';
//   //   if (!regForm.password) newErrors.password = 'Password required';
//   //   if (regForm.password.length < 6) newErrors.password = 'Min 6 characters';
//   //   if (regForm.password !== regForm.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
//   //   if (!emailOtpSent) {
//   //     newErrors.emailOtp = 'Please send OTP first';
//   //   } else if (!regForm.emailOtp || regForm.emailOtp.length < 6) {
//   //     newErrors.emailOtp = 'Please enter valid 6-digit OTP';
//   //   }
    
//   //   setErrors(newErrors);
//   //   return Object.keys(newErrors).length === 0;
//   // };
      
//   // const handleLoginInputChange = (e) => {
//   //   setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
//   // };

//   // const sendLoginOtp = async () => {
//   //   if (!loginForm.emailOrPhone) {
//   //     alert('Enter email or phone');
//   //     return;
//   //   }

//   //   try {
//   //     const isEmail = loginForm.emailOrPhone.includes('@');
      
//   //     if (isEmail) {
//   //       const { error } = await supabase.auth.signInWithOtp({
//   //         email: loginForm.emailOrPhone
//   //       });
//   //       if (error) throw error;
//   //     } else {
//   //       const { error } = await supabase.auth.signInWithOtp({
//   //         phone: loginForm.emailOrPhone
//   //       });
//   //       if (error) throw error;
//   //     }

//   //     setLoginOtpSent(true);
//   //     alert('OTP sent successfully!');
//   //   } catch (error) {
//   //     alert('Failed to send OTP: ' + error.message);
//   //   }
//   // };

//   // const handleLogin = async () => {
//   //   try {
//   //     if (loginMethod === 'username') {
//   //       console.log('🔍 Login attempt for username:', loginForm.username);
        
//   //       if (!loginForm.username || !loginForm.password) {
//   //         alert('Please enter username and password');
//   //         return;
//   //       }
        
//   //       const { data: userData, error: userError } = await supabase
//   //         .from('users')
//   //         .select('email, password_hash, id, username')
//   //         .eq('username', loginForm.username)
//   //         .maybeSingle();

//   //       console.log('📊 User data found:', userData);
//   //       console.log('❌ Query error:', userError);

//   //       if (userError) {
//   //         throw new Error('Database error: ' + userError.message);
//   //       }

//   //       if (!userData) {
//   //         throw new Error('Username not found. Please check your username.');
//   //       }

//   //       console.log('✅ User found:', userData.username);
//   //       console.log('🔐 Attempting password verification...');

//   //       const passwordMatch = await bcrypt.compare(loginForm.password, userData.password_hash);
        
//   //       console.log('🔑 Password match:', passwordMatch);

//   //       if (!passwordMatch) {
//   //         throw new Error('Incorrect password');
//   //       }

//   //       console.log('✅ Password verified, logging in with Supabase Auth...');

//   //       const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
//   //         email: userData.email,
//   //         password: loginForm.password
//   //       });

//   //       console.log('📊 Auth response:', authData);
//   //       console.log('❌ Auth error:', authError);

//   //       if (authError) {
//   //         throw new Error('Authentication failed: ' + authError.message);
//   //       }

//   //       if (!authData?.session) {
//   //         throw new Error('Login successful but no session created');
//   //       }

//   //       console.log('✅ Session created successfully!');

//   //       await supabase
//   //         .from('users')
//   //         .update({ last_login: new Date().toISOString() })
//   //         .eq('id', userData.id);

//   //       console.log('🎉 Login successful! Redirecting...');
//   //       alert('✅ Login successful!');
        
//   //       window.location.href = '/dashboard/ai-prep/components/Dashboard';
        
//   //     } else if (loginMethod === 'otp') {
//   //       if (!loginForm.emailOrPhone) {
//   //         alert('Please enter email or phone');
//   //         return;
//   //       }

//   //       if (!loginOtpSent) {
//   //         alert('Please send OTP first');
//   //         return;
//   //       }

//   //       if (!loginForm.otp) {
//   //         alert('Please enter OTP');
//   //         return;
//   //       }

//   //       const isEmail = loginForm.emailOrPhone.includes('@');

//   //       const { data, error } = await supabase.auth.verifyOtp({
//   //         [isEmail ? 'email' : 'phone']: loginForm.emailOrPhone,
//   //         token: loginForm.otp,
//   //         type: isEmail ? 'email' : 'sms'
//   //       });

//   //       if (error) throw error;

//   //       if (data?.session) {
//   //         console.log('🎉 OTP Login successful!');
//   //         alert('✅ Login successful!');
//   //         window.location.href = '/dashboard/ai-prep/components/Dashboard';
//   //       }
//   //     }
//   //   } catch (error) {
//   //     console.error('❌ Login error:', error);
//   //     alert('Login failed: ' + error.message);
//   //   }
//   // };

//   // const handleForgotPassword = async () => {
//   //   if (!resetEmail) {
//   //     alert('Please enter your email address');
//   //     return;
//   //   }

//   //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   //   if (!emailRegex.test(resetEmail)) {
//   //     alert('Please enter a valid email address');
//   //     return;
//   //   }

//   //   try {
//   //     const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
//   //       redirectTo: `${window.location.origin}/reset-password`,
//   //     });

//   //     if (error) throw error;
      
//   //     alert('✅ Password reset link sent to your email! Please check your inbox.');
//   //     setShowForgotPassword(false);
//   //     setResetEmail('');
//   //   } catch (error) {
//   //     console.error('Forgot password error:', error);
//   //     alert('Error: ' + error.message);
//   //   }
//   // };

//   return (
//     <div style={{ 
//       height: '100vh',
//       width: '100vw',
//       backgroundColor: '#060818',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       overflow: 'hidden',
//       fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
//     }}>
//       <div style={{ 
//         width: '100%', 
//         maxWidth: '500px',
//         height: 'auto',
//         maxHeight: '90vh',
//         position: 'relative',
//         zIndex: 10,
//         display: 'flex',
//         flexDirection: 'column',
//         padding: '0 1.5rem'
//       }}>
//         {/* Logo */}
//         <div style={{ textAlign: 'center', marginBottom: '1.5rem', flexShrink: 0 }}>
//           <h1 style={{
//             fontSize: '2.75rem',
//             fontWeight: '800',
//             background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
//             WebkitBackgroundClip: 'text',
//             WebkitTextFillColor: 'transparent',
//             backgroundClip: 'text',
//             marginBottom: '0.5rem',
//             letterSpacing: '-0.02em',
//             fontFamily: "'Inter', sans-serif"
//           }}>
//             EduNext
//           </h1>
//           <p style={{ 
//             color: '#9CA3AF', 
//             fontSize: '0.875rem',
//             fontWeight: '500',
//             letterSpacing: '0.02em'
//           }}>
//             Your journey to success starts here
//           </p>
//         </div>

//         {/* Tab Switcher */}
//         <div style={{
//           backdropFilter: 'blur(20px)',
//           display: 'flex',
//           borderRadius: '1rem',
//           marginBottom: '1.5rem',
//           border: '1px solid rgba(55, 65, 81, 0.6)',
//           display: 'grid',
//           gap: '0.25rem',
//         }}>
//           <button
//             // onClick={() => { setIsLogin(false); setShowForgotPassword(false); }}
//             style={{
//               padding: '0.75rem 1.5rem',
//               alignItems: 'center',
//               borderRadius: '0.75rem',
//               fontWeight: '600',
//               fontSize: '1.3rem',
//               transition: 'all 0.3s',
//               border: 'none',
//               cursor: 'pointer',
//               background:'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
//               color: 'white',
//               boxShadow:'0 10px 20px -5px rgba(245, 158, 11, 0.4)',
//               fontFamily: "'Inter', sans-serif"
//             }}
//           >
//             Register
//           </button>
//           {/* <button
//             onClick={() => { setIsLogin(true); setShowForgotPassword(false); }}
//             style={{
//               padding: '0.75rem 1.5rem',
//               borderRadius: '0.75rem',
//               fontWeight: '600',
//               fontSize: '0.875rem',
//               transition: 'all 0.3s',
//               border: 'none',
//               cursor: 'pointer',
//               background: isLogin ? 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)' : 'transparent',
//               color: isLogin ? 'white' : '#9CA3AF',
//               boxShadow: isLogin ? '0 10px 20px -5px rgba(245, 158, 11, 0.4)' : 'none',
//               fontFamily: "'Inter', sans-serif"
//             }}
//           >
//             Login
//           </button> */}
//         </div>

//         {/* Scrollable Content Area */}
//         <div style={{
//           overflowY: 'auto',
//           overflowX: 'hidden',
//           maxHeight: 'calc(90vh - 180px)',
//           scrollbarWidth: 'thin',
//           scrollbarColor: '#F59E0B #1F2937'
//         }}>
//           {/* Registration Form */}
//           {!isLogin && (
//             <div style={{
//               background: 'rgba(17, 24, 39, 0.6)',
//               backdropFilter: 'blur(20px)',
//               borderRadius: '1.5rem',
//               padding: '2rem',
//               border: '1px solid rgba(55, 65, 81, 0.6)',
//               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
//             }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
//                 <div style={{
//                   width: '2.5rem',
//                   height: '2.5rem',
//                   borderRadius: '50%',
//                   background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   fontSize: '1.25rem',
//                   boxShadow: '0 8px 16px -4px rgba(245, 158, 11, 0.4)'
//                 }}>
//                   ✨
//                 </div>
//                 <h2 style={{ 
//                   fontSize: '1.5rem', 
//                   fontWeight: '700', 
//                   color: 'white', 
//                   margin: 0,
//                   letterSpacing: '-0.01em',
//                   fontFamily: "'Inter', sans-serif"
//                 }}>
//                   Create Account
//                 </h2>
//               </div>

//               {/* <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}> */}
//                 {/* Username */}
//                 {/* <div>
//                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#D1D5DB', marginBottom: '0.5rem' }}>
//                     Username
//                   </label>
//                   <input
//                     type="text"
//                     name="username"
//                     value={regForm.username}
//                     onChange={handleRegInputChange}
//                     placeholder="_edu.next_"
//                     style={{
//                       width: '100%',
//                       padding: '0.75rem 1rem',
//                       background: 'rgba(31, 41, 55, 0.6)',
//                       border: '1px solid rgba(75, 85, 99, 0.6)',
//                       borderRadius: '0.75rem',
//                       color: 'white',
//                       fontSize: '0.875rem',
//                       outline: 'none',
//                       transition: 'all 0.2s',
//                       fontFamily: "'Inter', sans-serif"
//                     }}
//                     onFocus={(e) => {
//                       e.target.style.borderColor = '#F59E0B';
//                       e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
//                     }}
//                     onBlur={(e) => {
//                       e.target.style.borderColor = 'rgba(75, 85, 99, 0.6)';
//                       e.target.style.boxShadow = 'none';
//                     }}
//                   />
//                   {errors.username && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.375rem', fontWeight: '500' }}>{errors.username}</p>}
//                 </div> */}

//                 {/* Full Name */}
//                 {/* <div>
//                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#D1D5DB', marginBottom: '0.5rem' }}>
//                     Full Name
//                   </label>
//                   <input
//                     type="text"
//                     name="fullName"
//                     value={regForm.fullName}
//                     onChange={handleRegInputChange}
//                     placeholder="EduNext"
//                     style={{
//                       width: '100%',
//                       padding: '0.75rem 1rem',
//                       background: 'rgba(31, 41, 55, 0.6)',
//                       border: '1px solid rgba(75, 85, 99, 0.6)',
//                       borderRadius: '0.75rem',
//                       color: 'white',
//                       fontSize: '0.875rem',
//                       outline: 'none',
//                       fontFamily: "'Inter', sans-serif"
//                     }}
//                     onFocus={(e) => {
//                       e.target.style.borderColor = '#F59E0B';
//                       e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
//                     }}
//                     onBlur={(e) => {
//                       e.target.style.borderColor = 'rgba(75, 85, 99, 0.6)';
//                       e.target.style.boxShadow = 'none';
//                     }}
//                   />
//                   {errors.fullName && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.375rem', fontWeight: '500' }}>{errors.fullName}</p>}
//                 </div> */}

//                 {/* Exam Selection */}
//                 {/* <div>
//                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#D1D5DB', marginBottom: '0.5rem' }}>
//                     Preparing For
//                   </label>
//                   <select
//                     name="examId"
//                     value={regForm.examId}
//                     onChange={handleRegInputChange}
//                     style={{
//                       width: '100%',
//                       padding: '0.75rem 1rem',
//                       background: 'rgba(31, 41, 55, 0.6)',
//                       border: '1px solid rgba(75, 85, 99, 0.6)',
//                       borderRadius: '0.75rem',
//                       color: 'white',
//                       fontSize: '0.875rem',
//                       outline: 'none',
//                       cursor: 'pointer',
//                       fontFamily: "'Inter', sans-serif"
//                     }}
//                     onFocus={(e) => {
//                       e.target.style.borderColor = '#F59E0B';
//                       e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
//                     }}
//                     onBlur={(e) => {
//                       e.target.style.borderColor = 'rgba(75, 85, 99, 0.6)';
//                       e.target.style.boxShadow = 'none';
//                     }}
//                   >
//                     <option value="" style={{ background: '#1F2937' }}>Select Exam</option>
//                     {exams.map(exam => (
//                       <option key={exam.id} value={exam.id} style={{ background: '#1F2937' }}>
//                         {exam.name}
//                       </option>
//                     ))}
//                   </select>
//                   {errors.examId && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.375rem', fontWeight: '500' }}>{errors.examId}</p>}
//                 </div> */}

//                 {/* Email with OTP */}
//                 {/* <div> */}
//                   {/* <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#D1D5DB', marginBottom: '0.5rem' }}>
//                     Email
//                   </label> */}
//                   {/* <div style={{ display: 'flex', gap: '0.5rem' }}>
//                     <input
//                       type="email"
//                       name="email"
//                       value={regForm.email}
//                       onChange={handleRegInputChange}
//                       disabled={emailOtpSent}
//                       placeholder="you@example.com"
//                       style={{
//                         flex: 1,
//                         padding: '0.75rem 1rem',
//                         background: 'rgba(31, 41, 55, 0.6)',
//                         border: '1px solid rgba(75, 85, 99, 0.6)',
//                         borderRadius: '0.75rem',
//                         color: 'white',
//                         fontSize: '0.875rem',
//                         outline: 'none',
//                         opacity: emailOtpSent ? 0.6 : 1,
//                         fontFamily: "'Inter', sans-serif"
//                       }}
//                       onFocus={(e) => {
//                         e.target.style.borderColor = '#F59E0B';
//                         e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
//                       }}
//                       onBlur={(e) => {
//                         e.target.style.borderColor = 'rgba(75, 85, 99, 0.6)';
//                         e.target.style.boxShadow = 'none';
//                       }}
//                     />
//                     <button
//                       onClick={sendEmailOtp}
//                       disabled={emailOtpSent}
//                       style={{
//                         padding: '0.75rem 1.25rem',
//                         background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
//                         color: 'white',
//                         fontSize: '0.875rem',
//                         fontWeight: '600',
//                         borderRadius: '0.75rem',
//                         border: 'none',
//                         cursor: emailOtpSent ? 'not-allowed' : 'pointer',
//                         whiteSpace: 'nowrap',
//                         opacity: emailOtpSent ? 0.6 : 1,
//                         boxShadow: '0 4px 12px -2px rgba(245, 158, 11, 0.4)',
//                         fontFamily: "'Inter', sans-serif"
//                       }}
//                     >
//                       {emailOtpSent ? '✓ Sent' : 'Send OTP'}
//                     </button>
//                   </div> */}
//                   {/* {errors.email && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.375rem', fontWeight: '500' }}>{errors.email}</p>} */}
                  
//                   {/* OTP Input + Timer + Resend */}
//                   {/* {emailOtpSent && (
//                     <>
//                       <input
//                         type="text"
//                         name="emailOtp"
//                         value={regForm.emailOtp}
//                         onChange={handleRegInputChange}
//                         maxLength="8"
//                         placeholder="Enter 8-digit OTP"
//                         style={{
//                           width: '100%',
//                           padding: '0.75rem 1rem',
//                           background: 'rgba(31, 41, 55, 0.6)',
//                           border: '1px solid rgba(75, 85, 99, 0.6)',
//                           borderRadius: '0.75rem',
//                           color: 'white',
//                           fontSize: '0.875rem',
//                           outline: 'none',
//                           marginTop: '0.5rem',
//                           fontFamily: "'Inter', sans-serif"
//                         }}
//                         onFocus={(e) => {
//                           e.target.style.borderColor = '#F59E0B';
//                           e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
//                         }}
//                         onBlur={(e) => {
//                           e.target.style.borderColor = 'rgba(75, 85, 99, 0.6)';
//                           e.target.style.boxShadow = 'none';
//                         }}
//                       />
                      
//                       {/* Timer Display */}
//                       {/* <p style={{ 
//                         color: otpTimer > 0 ? '#10B981' : '#EF4444', 
//                         fontSize: '0.75rem', 
//                         marginTop: '0.375rem',
//                         fontWeight: '500',
//                         display: 'flex',
//                         alignItems: 'center',
//                         gap: '0.25rem'
//                       }}>
//                         {otpTimer > 0 ? (
//                           <>⏱️ OTP expires in {otpTimer}s</>
//                         ) : (
//                           <>❌ OTP expired! Click "Resend OTP" below</>
//                         )}
//                       </p> */}
                      
//                       {/* Resend OTP Button */}
//                       {/* {otpTimer === 0 && (
//                         <button
//                           onClick={() => {
//                             setEmailOtpSent(false);
//                             setRegForm({ ...regForm, emailOtp: '' });
//                             sendEmailOtp();
//                           }}
//                           style={{
//                             width: '100%',
//                             padding: '0.75rem',
//                             background: 'rgba(245, 158, 11, 0.2)',
//                             border: '1px solid #F59E0B',
//                             borderRadius: '0.75rem',
//                             color: '#F59E0B',
//                             fontSize: '0.875rem',
//                             fontWeight: '600',
//                             cursor: 'pointer',
//                             marginTop: '0.5rem',
//                             transition: 'all 0.2s',
//                             fontFamily: "'Inter', sans-serif"
//                           }}
//                           onMouseEnter={(e) => {
//                             e.target.style.background = 'rgba(245, 158, 11, 0.3)';
//                           }}
//                           onMouseLeave={(e) => {
//                             e.target.style.background = 'rgba(245, 158, 11, 0.2)';
//                           }}
//                         >
//                           🔄 Resend OTP
//                         </button>
//                       )} */}
                      
//                       {/* {errors.emailOtp && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.375rem', fontWeight: '500' }}>{errors.emailOtp}</p>}
//                     </>
//                   )}
//                 </div> */} 

//                 {/* Phone with OTP */}
//                 {/* <div>
//                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#D1D5DB', marginBottom: '0.5rem' }}>
//                     Phone (Optional)
//                   </label>
//                   <input
//                     type="tel"
//                     name="phone"
//                     value={regForm.phone}
//                     onChange={handleRegInputChange}
//                     placeholder="+91 XXXXX XXXXX"
//                     style={{
//                       width: '100%',
//                       padding: '0.75rem 1rem',
//                       background: 'rgba(31, 41, 55, 0.6)',
//                       border: '1px solid rgba(75, 85, 99, 0.6)',
//                       borderRadius: '0.75rem',
//                       color: 'white',
//                       fontSize: '0.875rem',
//                       outline: 'none',
//                       fontFamily: "'Inter', sans-serif"
//                     }}
//                     onFocus={(e) => {
//                       e.target.style.borderColor = '#F59E0B';
//                       e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
//                     }}
//                     onBlur={(e) => {
//                       e.target.style.borderColor = 'rgba(75, 85, 99, 0.6)';
//                       e.target.style.boxShadow = 'none';
//                     }}
//                   />
//                   {errors.phone && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.375rem', fontWeight: '500' }}>{errors.phone}</p>}
//                 </div> */}

//                 {/* Password */}
//                 {/* <div>
//                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#D1D5DB', marginBottom: '0.5rem' }}>
//                     Password
//                   </label>
//                   <input
//                     type="password"
//                     name="password"
//                     value={regForm.password}
//                     onChange={handleRegInputChange}
//                     placeholder="Min 6 characters"
//                     style={{
//                       width: '100%',
//                       padding: '0.75rem 1rem',
//                       background: 'rgba(31, 41, 55, 0.6)',
//                       border: '1px solid rgba(75, 85, 99, 0.6)',
//                       borderRadius: '0.75rem',
//                       color: 'white',
//                       fontSize: '0.875rem',
//                       outline: 'none',
//                       fontFamily: "'Inter', sans-serif"
//                     }}
//                     onFocus={(e) => {
//                       e.target.style.borderColor = '#F59E0B';
//                       e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
//                     }}
//                     onBlur={(e) => {
//                       e.target.style.borderColor = 'rgba(75, 85, 99, 0.6)';
//                       e.target.style.boxShadow = 'none';
//                     }}
//                   />
//                   {errors.password && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.375rem', fontWeight: '500' }}>{errors.password}</p>}
//                 </div> */}

//                 {/* Confirm Password */}
//                 {/* <div>
//                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#D1D5DB', marginBottom: '0.5rem' }}>
//                     Confirm Password
//                   </label>
//                   <input
//                     type="password"
//                     name="confirmPassword"
//                     value={regForm.confirmPassword}
//                     onChange={handleRegInputChange}
//                     placeholder="Re-enter password"
//                     style={{
//                       width: '100%',
//                       padding: '0.75rem 1rem',
//                       background: 'rgba(31, 41, 55, 0.6)',
//                       border: '1px solid rgba(75, 85, 99, 0.6)',
//                       borderRadius: '0.75rem',
//                       color: 'white',
//                       fontSize: '0.875rem',
//                       outline: 'none',
//                       fontFamily: "'Inter', sans-serif"
//                     }}
//                     onFocus={(e) => {
//                       e.target.style.borderColor = '#F59E0B';
//                       e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
//                     }}
//                     onBlur={(e) => {
//                       e.target.style.borderColor = 'rgba(75, 85, 99, 0.6)';
//                       e.target.style.boxShadow = 'none';
//                     }}
//                   />
//                   {errors.confirmPassword && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.375rem', fontWeight: '500' }}>{errors.confirmPassword}</p>}
//                 </div> */}

//                 {/* Submit Button */}
//                 {/* <button
//                   onClick={handleRegistration}
//                   style={{
//                     width: '100%',
//                     padding: '1rem',
//                     background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
//                     color: 'white',
//                     fontWeight: '700',
//                     fontSize: '1rem',
//                     borderRadius: '0.75rem',
//                     border: 'none',
//                     cursor: 'pointer',
//                     marginTop: '1rem',
//                     boxShadow: '0 10px 20px -5px rgba(245, 158, 11, 0.4)',
//                     transition: 'all 0.3s',
//                     fontFamily: "'Inter', sans-serif"
//                   }}
//                   onMouseEnter={(e) => {
//                     e.target.style.transform = 'translateY(-2px)';
//                     e.target.style.boxShadow = '0 20px 30px -8px rgba(245, 158, 11, 0.5)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.target.style.transform = 'translateY(0)';
//                     e.target.style.boxShadow = '0 10px 20px -5px rgba(245, 158, 11, 0.4)';
//                   }}
//                 >
//                   Create Account
//                 </button> */}
//               {/* </div> */}
//               <button
//                   onClick={handleGoogleLogin}
//                   style={{
//                     width: '100%',
//                     display:'flex',
//                     alignItems: 'center',     
//                     padding: '1rem',
//                     paddingLeft:'5rem',
//                     background: 'white',
//                     gap: '12px',
//                     color: 'Black',
//                     fontWeight: '700',
//                     fontSize: '1rem',
//                     borderRadius: '0.75rem',
//                     border: 'none',
//                     cursor: 'pointer',
//                     marginTop: '1rem',
//                     boxShadow: '0 10px 20px -5px rgba(245, 158, 11, 0.4)',
//                     transition: 'all 0.3s',
//                     fontFamily: "'Inter', sans-serif"
//                   }}
//                   onMouseEnter={(e) => {
//                     e.target.style.transform = 'translateY(-2px)';
//                     e.target.style.boxShadow = '0 20px 30px -8px rgba(245, 158, 11, 0.5)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.target.style.transform = 'translateY(0)';
//                     e.target.style.boxShadow = '0 10px 20px -5px rgba(245, 158, 11, 0.4)';
//                   }}
//                 >
//                   <img 
//             className="w-6 h-6" 
//             src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
//             alt="Google logo" 
//           />Continue with Google       
//                 </button>
                
//     </div>
//           )}
       
          

//           {/* Login Form */}
//           {/* {isLogin && (
//             <div style={{
//               background: 'rgba(17, 24, 39, 0.6)',
//               backdropFilter: 'blur(20px)',
//               borderRadius: '1.5rem',
//               padding: '2rem',
//               border: '1px solid rgba(55, 65, 81, 0.6)',
//               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
//             }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
//                 <div style={{
//                   width: '2.5rem',
//                   height: '2.5rem',
//                   borderRadius: '50%',
//                   background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   fontSize: '1.25rem',
//                   boxShadow: '0 8px 16px -4px rgba(245, 158, 11, 0.4)'
//                 }}>
//                   👋
//                 </div>
//                 <h2 style={{ 
//                   fontSize: '1.5rem', 
//                   fontWeight: '700', 
//                   color: 'white', 
//                   margin: 0,
//                   letterSpacing: '-0.01em',
//                   fontFamily: "'Inter', sans-serif"
//                 }}>
//                   Welcome Back
//                 </h2>
//               </div>

//               {!showForgotPassword ? (
//                 <>
//                   <div style={{
//                     background: 'rgba(31, 41, 55, 0.3)',
//                     borderRadius: '0.75rem',
//                     padding: '0.25rem',
//                     marginBottom: '1.5rem',
//                     display: 'grid',
//                     gridTemplateColumns: '1fr 1fr',
//                     gap: '0.25rem'
//                   }}>
//                     <button
//                       onClick={() => setLoginMethod('username')}
//                       style={{
//                         padding: '0.625rem 1rem',
//                         borderRadius: '0.5rem',
//                         fontSize: '0.875rem',
//                         fontWeight: '600',
//                         transition: 'all 0.2s',
//                         border: 'none',
//                         cursor: 'pointer',
//                         background: loginMethod === 'username' ? 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)' : 'transparent',
//                         color: loginMethod === 'username' ? 'white' : '#9CA3AF',
//                         boxShadow: loginMethod === 'username' ? '0 4px 12px -2px rgba(245, 158, 11, 0.4)' : 'none',
//                         fontFamily: "'Inter', sans-serif"
//                       }}
//                     >
//                       Password
//                     </button>
//                     <button
//                       onClick={() => setLoginMethod('otp')}
//                       style={{
//                         padding: '0.625rem 1rem',
//                         borderRadius: '0.5rem',
//                         fontSize: '0.875rem',
//                         fontWeight: '600',
//                         transition: 'all 0.2s',
//                         border: 'none',
//                         cursor: 'pointer',
//                         background: loginMethod === 'otp' ? 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)' : 'transparent',
//                         color: loginMethod === 'otp' ? 'white' : '#9CA3AF',
//                         boxShadow: loginMethod === 'otp' ? '0 4px 12px -2px rgba(245, 158, 11, 0.4)' : 'none',
//                         fontFamily: "'Inter', sans-serif"
//                       }}
//                     >
//                       OTP
//                     </button>
//                   </div>

//                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
//                     {loginMethod === 'username' ? (
//                       <>
//                         <div>
//                           <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#D1D5DB', marginBottom: '0.5rem' }}>
//                             Username
//                           </label>
//                           <input
//                             type="text"
//                             name="username"
//                             value={loginForm.username}
//                             onChange={handleLoginInputChange}
//                             placeholder="Enter username"
//                             style={{
//                               width: '100%',
//                               padding: '0.75rem 1rem',
//                               background: 'rgba(31, 41, 55, 0.6)',
//                               border: '1px solid rgba(75, 85, 99, 0.6)',
//                               borderRadius: '0.75rem',
//                               color: 'white',
//                               fontSize: '0.875rem',
//                               outline: 'none',
//                               fontFamily: "'Inter', sans-serif"
//                             }}
//                             onFocus={(e) => {
//                               e.target.style.borderColor = '#F59E0B';
//                               e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
//                             }}
//                             onBlur={(e) => {
//                               e.target.style.borderColor = 'rgba(75, 85, 99, 0.6)';
//                               e.target.style.boxShadow = 'none';
//                             }}
//                           />
//                         </div>
//                         <div>
//                           <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#D1D5DB', marginBottom: '0.5rem' }}>
//                             Password
//                           </label>
//                           <input
//                             type="password"
//                             name="password"
//                             value={loginForm.password}
//                             onChange={handleLoginInputChange}
//                             placeholder="Enter password"
//                             style={{
//                               width: '100%',
//                               padding: '0.75rem 1rem',
//                               background: 'rgba(31, 41, 55, 0.6)',
//                               border: '1px solid rgba(75, 85, 99, 0.6)',
//                               borderRadius: '0.75rem',
//                               color: 'white',
//                               fontSize: '0.875rem',
//                               outline: 'none',
//                               fontFamily: "'Inter', sans-serif"
//                             }}
//                             onFocus={(e) => {
//                               e.target.style.borderColor = '#F59E0B';
//                               e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
//                             }}
//                             onBlur={(e) => {
//                               e.target.style.borderColor = 'rgba(75, 85, 99, 0.6)';
//                               e.target.style.boxShadow = 'none';
//                             }}
//                           />
//                         </div>
//                       </>
//                     ) : (
//                       <>
//                         <div>
//                           <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#D1D5DB', marginBottom: '0.5rem' }}>
//                             Email or Phone
//                           </label>
//                           <div style={{ display: 'flex', gap: '0.5rem' }}>
//                             <input
//                               type="text"
//                               name="emailOrPhone"
//                               value={loginForm.emailOrPhone}
//                               onChange={handleLoginInputChange}
//                               disabled={loginOtpSent}
//                               placeholder="Email or phone"
//                               style={{
//                                 flex: 1,
//                                 padding: '0.75rem 1rem',
//                                 background: 'rgba(31, 41, 55, 0.6)',
//                                 border: '1px solid rgba(75, 85, 99, 0.6)',
//                                 borderRadius: '0.75rem',
//                                 color: 'white',
//                                 fontSize: '0.875rem',
//                                 outline: 'none',
//                                 opacity: loginOtpSent ? 0.6 : 1,
//                                 fontFamily: "'Inter', sans-serif"
//                               }}
//                               onFocus={(e) => {
//                                 e.target.style.borderColor = '#F59E0B';
//                                 e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
//                               }}
//                               onBlur={(e) => {
//                                 e.target.style.borderColor = 'rgba(75, 85, 99, 0.6)';
//                                 e.target.style.boxShadow = 'none';
//                               }}
//                             />
//                             <button
//                               onClick={sendLoginOtp}
//                               disabled={loginOtpSent}
//                               style={{
//                                 padding: '0.75rem 1.25rem',
//                                 background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
//                                 color: 'white',
//                                 fontSize: '0.875rem',
//                                 fontWeight: '600',
//                                 borderRadius: '0.75rem',
//                                 border: 'none',
//                                 cursor: loginOtpSent ? 'not-allowed' : 'pointer',
//                                 whiteSpace: 'nowrap',
//                                 opacity: loginOtpSent ? 0.6 : 1,
//                                 boxShadow: '0 4px 12px -2px rgba(245, 158, 11, 0.4)',
//                                 fontFamily: "'Inter', sans-serif"
//                               }}
//                             >
//                               {loginOtpSent ? '✓' : 'Send'}
//                             </button>
//                           </div>
//                         </div>
//                         {loginOtpSent && (
//                           <div>
//                             <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#D1D5DB', marginBottom: '0.5rem' }}>
//                               Enter OTP
//                             </label>
//                             <input
//                               type="text"
//                               name="otp"
//                               value={loginForm.otp}
//                               onChange={handleLoginInputChange}
//                               maxLength="8"
//                               placeholder="8-digit OTP"
//                               style={{
//                                 width: '100%',
//                                 padding: '0.75rem 1rem',
//                                 background: 'rgba(31, 41, 55, 0.6)',
//                                 border: '1px solid rgba(75, 85, 99, 0.6)',
//                                 borderRadius: '0.75rem',
//                                 color: 'white',
//                                 fontSize: '0.875rem',
//                                 outline: 'none',
//                                 fontFamily: "'Inter', sans-serif"
//                               }}
//                               onFocus={(e) => {
//                                 e.target.style.borderColor = '#F59E0B';
//                                 e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
//                               }}
//                               onBlur={(e) => {
//                                 e.target.style.borderColor = 'rgba(75, 85, 99, 0.6)';
//                                 e.target.style.boxShadow = 'none';
//                               }}
//                             />
//                           </div>
//                         )}
//                       </>
//                     )}

//                     <button
//                       onClick={handleLogin}
//                       style={{
//                         width: '100%',
//                         padding: '1rem',
//                         background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
//                         color: 'white',
//                         fontWeight: '700',
//                         fontSize: '1rem',
//                         borderRadius: '0.75rem',
//                         border: 'none',
//                         cursor: 'pointer',
//                         marginTop: '1rem',
//                         boxShadow: '0 10px 20px -5px rgba(245, 158, 11, 0.4)',
//                         transition: 'all 0.3s',
//                         fontFamily: "'Inter', sans-serif"
//                       }}
//                       onMouseEnter={(e) => {
//                         e.target.style.transform = 'translateY(-2px)';
//                         e.target.style.boxShadow = '0 20px 30px -8px rgba(245, 158, 11, 0.5)';
//                       }}
//                       onMouseLeave={(e) => {
//                         e.target.style.transform = 'translateY(0)';
//                         e.target.style.boxShadow = '0 10px 20px -5px rgba(245, 158, 11, 0.4)';
//                       }}
//                     >
//                       Login
//                     </button>

//                     <button
//                       onClick={() => setShowForgotPassword(true)}
//                       style={{
//                         width: '100%',
//                         fontSize: '0.875rem',
//                         fontWeight: '600',
//                         color: '#F59E0B',
//                         background: 'none',
//                         border: 'none',
//                         cursor: 'pointer',
//                         marginTop: '0.5rem',
//                         transition: 'color 0.2s',
//                         fontFamily: "'Inter', sans-serif"
//                       }}
//                       onMouseEnter={(e) => e.target.style.color = '#FBBF24'}
//                       onMouseLeave={(e) => e.target.style.color = '#F59E0B'}
//                     >
//                       Forgot Password?
//                     </button>
                    
//                   </div>
//                 </>
//               ) : (
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
//                   <div>
//                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#D1D5DB', marginBottom: '0.5rem' }}>
//                       Email Address
//                     </label>
//                     <input
//                       type="email"
//                       value={resetEmail}
//                       onChange={(e) => setResetEmail(e.target.value)}
//                       placeholder="your@email.com"
//                       style={{
//                         width: '100%',
//                         padding: '0.75rem 1rem',
//                         background: 'rgba(31, 41, 55, 0.6)',
//                         border: '1px solid rgba(75, 85, 99, 0.6)',
//                         borderRadius: '0.75rem',
//                         color: 'white',
//                         fontSize: '0.875rem',
//                         outline: 'none',
//                         fontFamily: "'Inter', sans-serif"
//                       }}
//                       onFocus={(e) => {
//                         e.target.style.borderColor = '#F59E0B';
//                         e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
//                       }}
//                       onBlur={(e) => {
//                         e.target.style.borderColor = 'rgba(75, 85, 99, 0.6)';
//                         e.target.style.boxShadow = 'none';
//                       }}
//                     />
//                   </div>
//                   <button
//                     onClick={handleForgotPassword}
//                     style={{
//                       width: '100%',
//                       padding: '1rem',
//                       background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
//                       color: 'white',
//                       fontWeight: '700',
//                       fontSize: '1rem',
//                       borderRadius: '0.75rem',
//                       border: 'none',
//                       cursor: 'pointer',
//                       boxShadow: '0 10px 20px -5px rgba(245, 158, 11, 0.4)',
//                       transition: 'all 0.3s',
//                       fontFamily: "'Inter', sans-serif"
//                     }}
//                     onMouseEnter={(e) => {
//                       e.target.style.transform = 'translateY(-2px)';
//                       e.target.style.boxShadow = '0 20px 30px -8px rgba(245, 158, 11, 0.5)';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.target.style.transform = 'translateY(0)';
//                       e.target.style.boxShadow = '0 10px 20px -5px rgba(245, 158, 11, 0.4)';
//                     }}
//                   >
//                     Send Reset Link
//                   </button>
//                   <button
//                     onClick={() => setShowForgotPassword(false)}
//                     style={{
//                       width: '100%',
//                       fontSize: '0.875rem',
//                       fontWeight: '600',
//                       color: '#9CA3AF',
//                       background: 'none',
//                       border: 'none',
//                       cursor: 'pointer',
//                       transition: 'color 0.2s',
//                       fontFamily: "'Inter', sans-serif"
//                     }}
//                     onMouseEnter={(e) => e.target.style.color = 'white'}
//                     onMouseLeave={(e) => e.target.style.color = '#9CA3AF'}
//                   >
//                     ← Back to Login
//                   </button>
//                 </div>
//               )}
//             </div>
//           )} */}
//         </div>

//         {/* Footer */}
//         <p style={{ 
//           textAlign: 'center', 
//           color: '#6B7280', 
//           fontSize: '0.75rem', 
//           marginTop: '1.5rem',
//           flexShrink: 0,
//           fontWeight: '500',
//           fontFamily: "'Inter', sans-serif"
//         }}>
//           By continuing, you agree to our Terms & Privacy Policy
//         </p>
//       </div>

//       <style jsx>{`
//         div::-webkit-scrollbar {
//           width: 6px;
//         }
//         div::-webkit-scrollbar-track {
//           background: rgba(31, 41, 55, 0.3);
//           border-radius: 10px;
//         }
//         div::-webkit-scrollbar-thumb {
//           background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%);
//           border-radius: 10px;
//         }
//         div::-webkit-scrollbar-thumb:hover {
//           background: linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%);
//         }
//       `}</style>
//     </div>
//   );
// }
// import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, BookOpen, GraduationCap, Wallet, BrainCircuit } from 'lucide-react';

const FancyLoginPage = () => {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const user = session.user;
        console.log("User detected, syncing to profiles table...");
        // Sync full name from Google to your custom 'profiles' table
        const { error } = await supabase
          .from('users')
          .upsert({
            id: user.id,
            full_name: user.user_metadata.full_name,
            // avatar_url: user.user_metadata.avatar_url,
            updated_at: new Date(),
          });

        if (error) console.error('Error syncing profile:', error.message);
        else console.log("Profile synced successfully!");
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard/ai-prep`,
      },
    });
    if (error) {
      alert(error.message);
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col lg:flex-row font-sans overflow-hidden relative">
      
      {/* Fancy Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[10%] w-[30%] h-[30%] bg-blue-600/10 blur-[120px] rounded-full" />

      {/* Left Section: Content */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex flex-col justify-center px-8 lg:px-24 py-12 z-10"
      >
        <div className="flex items-center gap-3 mb-12">
          <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-lg shadow-orange-500/20">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            EDUNEXT
          </span>
        </div>

        <div className="space-y-8">
          <h1 className="text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight">
            Your <span className="text-orange-500">Gateway</span> <br /> 
            to Dream <br /> 
            <span className="text-orange-500">IIT</span> Colleges
          </h1>
          <p className="text-slate-400 text-lg max-w-md leading-relaxed border-l-2 border-orange-500/30 pl-6">
            Discover active contest, connect with mocks, and customize your experience to fuel your dreams.
          </p>
        </div>

        <div className="mt-16 space-y-6">
          <FeatureItem icon={<GraduationCap />} title="Active Contest" color="text-orange-400" delay={0.2} />
          <FeatureItem icon={<BrainCircuit />} title="Customize Mocks" color="text-blue-400" delay={0.3} />
          <FeatureItem icon={<BookOpen />} title="Personalize Learning" color="text-emerald-400" delay={0.4} />
        </div>
      </motion.div>

      {/* Right Section: Glassmorphic Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md backdrop-blur-xl bg-white/[0.02] rounded-3xl p-10 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h2>
            <p className="text-slate-500">Sign in to continue your journey</p>
          </div>

          <button onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-3.5 rounded-xl hover:bg-amber-700 transition-all duration-300 group">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium">Continue with Google</span>
          </button>

          <p className="mt-8 text-center text-slate-400 text-sm">
            By continuing, you agree to our <a href="#" className="text-orange-500 font-bold hover:underline ml-1">Terms of Service</a> and <a href="#" className="text-orange-500 font-bold hover:underline ml-1">Privacy Policy</a>
          </p>
        </motion.div>

        {/* Floating background element for "fancy" feel */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-orange-500/5 rounded-full blur-[100px] -z-10" />
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, title, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-center gap-5 group cursor-default"
  >
    <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:border-orange-500/50 transition-all duration-300 ${color}`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div>
      <h4 className="font-bold text-lg group-hover:text-orange-500 transition-colors">{title}</h4>
    </div>
  </motion.div>
);

export default FancyLoginPage;