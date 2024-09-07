import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLoadingWithRefresh } from './hooks/useLoadingWithRefresh';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashBoard from './pages/DashBoard/DashBoard';
import HomePage from './pages/HomePage/HomePage';

function App() {
  const { loading } = useLoadingWithRefresh();
  const { auth } = useSelector((state) => state.auth);
  console.log(auth);
  return loading ? (
    <div>loading </div>
  ) : (
    <BrowserRouter>
      <Routes>
      <Route
          path="/"
          element={auth ? <HomePage/> : <DashBoard />}
        />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
