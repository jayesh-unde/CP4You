import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  auth: false,
  user: null,
  otp:{
    hash: '',
    email:'',
    password:'',
  }
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state,action) => {
      const {user} = action.payload;
      state.user = user;
      if(user===null){
        state.auth = false;
      }else{
        state.auth = true;
      }
      
    },
    setOtp: (state,action) => {
      const {hash,email,password} = action.payload;
      state.otp.hash = hash;
      state.otp.email = email;
      state.otp.password = password;
    },
  },
})

// Action creators are generated for each case reducer function
export const { setAuth, setOtp } = authSlice.actions

export default authSlice.reducer