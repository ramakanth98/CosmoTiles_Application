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
      <Link to="/">
        <img src={logo} alt="Cosmo Tiles Logo" className="logo" /> {/* Logo only appears once */}
      </Link>
  
      {homeDetails ? (
        <div>
          <center>
            <h2 className='home-name'>Home Name: {homeDetails.home}</h2>
            <h3 className="home-address">Address: {homeDetails.address}</h3>
            
            {homeDetails.pdf_url && (
              <a href={homeDetails.pdf_url} target="_blank" rel="noopener noreferrer" download className="accent-btn">
                Download PDF
              </a>
            )}
          </center>
          
          <div>
            <Link to={`/report/${homeId}`} className="accent-btn"> SC Report </Link>
            <button type="button" className="accent-btn">Report2</button>
            <button type="button" className="accent-btn">Report3</button>
            <button type="button" className="accent-btn">Report4</button>
          </div>
        </div>
      ) : (
        <div>Home not found.</div>
      )}
    </div>
  );
      }  
export default HomeDetail;
