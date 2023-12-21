import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

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
      <header>
          <Link to="/"><h1>Cosmo Tiles</h1></Link>
      </header>
      <h1>Home Details:</h1>
      {homeDetails ? (
        <div>
          <h2>Home Name: {homeDetails.home}</h2>
          <p>Address: {homeDetails.address}</p>
          {homeDetails.pdf_url && (
            <a href={homeDetails.pdf_url} target="_blank" rel="noopener noreferrer" download className="accent-btn">
              Download PDF
            </a>
          )}
        </div>
      ) : (
        <div>Home not found.</div>
      )}

      <div className="button-group">
            <Link to={`/report/${homeId}`} className="accent-btn"> SC Report </Link>
            <button type="button" className="accent-btn">Report2</button>
            <button type="button" className="accent-btn">Report3</button>
            <button type="button" className="accent-btn">Report4</button>
      </div>
    </div>
  );
};

export default HomeDetail;
