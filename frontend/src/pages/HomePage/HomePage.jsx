import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; 
import { logout } from '../../http'; 

const DashBoard = () => {
  const navigate = useNavigate();

  const logoutUser = async () => {
    try {
      // Perform the HTTP request to log out
      await logout(); 

      toast.success('Logged out successfully', {
        position: 'bottom-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'dark',
      });

      // Navigate to the home page after logout
      window.location.reload();
    } catch (error) {
      // Optionally, show an error message if logout fails
      toast.error('Logout failed, please try again', {
        position: 'bottom-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'dark',
      });

      console.error('Logout error:', error); // Log the error for debugging
    }
  };

  return (
    <div>
      <h1>Hompage</h1>
      <button onClick={logoutUser}>Logout</button>
    </div>
  );
};

export default DashBoard;
