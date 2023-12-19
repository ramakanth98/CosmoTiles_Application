import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './styles.css';

const NewPost = () => {
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const submitPost = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('address', address);
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/api/newpost', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Data saved successfully");
      setSuccessMsg("Home added successfully!");

      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);

    } catch (error) {
      console.error("Error saving data", error);
      setError(error.message);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    await submitPost();
  };

  return (
    <>
      <header className="flex-row">
        <Link to="/"><h1>Cosmo Tiles</h1></Link>
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
            <button type="submit" className="accent-btn">Submit</button>
          </form>
        </div>
      </main>
    </>
  );
};

export default NewPost;
