import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import logo from './Cos_NoBG.png'

const HomeDetail = () => {
  const [homeDetails, setHomeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  let { homeId } = useParams(); // This assumes you're using a route like "/home/:homeId"

  useEffect(() => {
    const fetchHomeDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/homes/${homeId}`);
        setHomeDetails(response.data.data);
      } catch (err) {
        setError('Failed to fetch home details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeDetails();
  }, [homeId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {/* <header>
          <Link to="/"><h1>Cosmo Tiles</h1></Link>
      </header> */}
      <Link to="/">
          <img src={logo} alt="Cosmo Tiles Logo" className="logo" /> {/* Logo instead of text */}
      </Link>
      {/* <h1><center></center>Home Details:</h1> */}
      {homeDetails ? (
        <div>
          <h2 className='home-name'><center>Home Name: {homeDetails.home}</center></h2>
          <h3 className="home-address" style={{ color: '#510564', textAlign: 'center' }}>Address: {homeDetails.address}</h3>
          {homeDetails.pdf_url && (
            <center>
            <a href={homeDetails.pdf_url} target="_blank" rel="noopener noreferrer" download className="accent-btn">
              Download Vendor PDF
            </a>
            </center>
          )}
        </div>
      ) : (
        <div>Home not found.</div>
      )}

      <div className="button-group">
            <Link to="/report" className="accent-btn"> SC Report </Link>
            <button type="button" className="accent-btn">Report2</button>
            <button type="button" className="accent-btn">Report3</button>
            <button type="button" className="accent-btn">Report4</button>
      </div>
    </div>
  );
};

export default HomeDetail;
