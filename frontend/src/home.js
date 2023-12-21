import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import './styles.css';
import logo from './Cos_NoBG.png'

const Home = () => {
    const PAGE_LIMIT = 12;
    const [homes, setHomes] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKey, setSearchKey] = useState('');
    const [error, setError] = useState('');

    const getHomes = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/homes?q=${searchKey}&_page=${currentPage}&_limit=${PAGE_LIMIT}`);
            console.log("Response data:", response.data);
            if (Array.isArray(response.data.data)) {
                setHomes(response.data.data);
            } else {
                setError("Invalid data format received from API");
                console.error("Response is not an array:", response.data);
            }
        } catch (err) {
            // Clear any previous errors
            setError(''); // Set error to an empty string to hide the error message
            console.error(err.message); // Optional: log the error message to the console
        }
    };
    


    useEffect(() => {
        getHomes();
    }, [currentPage, searchKey]);

    return (
        <>
            <header>
                {/* <Link to="/"><h1>Cosmo Tiles</h1></Link> */}
                <Link to="/">
                    <img src={logo} alt="Cosmo Tiles Logo" className="logo" /> {/* Logo instead of text */}
                </Link>
                <div className="search-bar">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                    <input type="search" placeholder="search" value={searchKey} onChange={(e) => setSearchKey(e.target.value)} />
                </div>
                <Link to="/new" className="accent-btn">
                    <FontAwesomeIcon icon={faPenToSquare} /> Add home
                </Link>
            </header>
            <main>
                {error && <div className="notification">{error}</div>}
                <div className="articles-wrapper">
                    {homes.map((home) => ( // Removed 'index' as key should be unique and not index-based if possible
                        <Link to={`/home/${home.id}`} key={home.id} className="card-link"> {/* Use `home.id` to construct the link */}
                            <div className="card">
                                <h2>{home.home}</h2> {/* Assuming `home.home` is the field for the home's name */}
                                <p>{home.address}</p>
                                {/* Optionally add a button or icon to signify clickable cards */}
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </>
    );
};

export default Home;
