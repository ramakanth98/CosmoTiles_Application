import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './styles.css';
import logo from './Cos_NoBG.png'

const UpdateHome = () => {
  const { homeId } = useParams(); // Assuming you're using URL params to get the home's ID
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Fetch the existing home details
    const fetchHomeDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/homes/${homeId}`);
        setTitle(response.data.data.home);
        setAddress(response.data.data.address);
        // Note: File handling will depend on how your backend serves files
      } catch (error) {
        console.error("Error fetching home data", error);
        setError(error.message);
      }
    };

    fetchHomeDetails();
  }, [homeId]);
  const navigate = useNavigate();
  const submitUpdate = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('address', address);
    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await axios.put(`http://localhost:5000/api/updatehome/${homeId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Data updated successfully");
      
      setSuccessMsg("Home updated successfully!");
      
      setTimeout(() => {
        setSuccessMsg('');
        navigate('/');
      }, 1000);
      
    } catch (error) {
      console.error("Error updating data", error);
      setError(error.message);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    await submitUpdate();
  };

  return (
    <>
      <header className="flex-row">
      <Link to="/">
        <img src={logo} alt="Cosmo Tiles Logo" className="logo" /> {/* Logo only appears once */}
      </Link>
      </header>
      <main>
        {error && (
          <div className="notification-container">
            <div className="notification">{error}</div>
            <button type="button" className="close" onClick={() => setError('')}>&times;</button>
          </div>
        )}
        {successMsg && (
          <div className="success-container">
            <div className="success-message">{successMsg}</div>
          </div>
        )}
        <div className="form-container">
          <form onSubmit={handleFormSubmit}>
            <div>
              <label htmlFor="title">Home Name</label>
              <input
                id="title"
                type="text"
                minLength="3"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="address">Address</label>
              <input
                id="address"
                type="text"
                minLength="3"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="file">Upload Vendor PDF</label>
              <input
                type="file"
                id="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
            <button type="submit" className="accent-btn">Update</button>
          </form>
        </div>
      </main>
    </>
  );
};

export default UpdateHome;
