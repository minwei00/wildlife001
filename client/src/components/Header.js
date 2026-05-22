import './Header.css';
import React, { useState } from 'react';

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="site-header">
            <div className="header-container">
                
                {/* Block 1: Far Left */}
                <div className="header-logo">
                    <a href="/">
                        <span className="logo-icon">
                            <img src="/logo192.png" alt="Logo" className="header-logo-img" />
                        </span>
                        <span className="logo-text">Mandai Wildlife</span>
                    </a>
                </div>

                {/* Mobile Menu Hamburger Button (Uses the function to clear the warning) */}
                <button 
                    className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} 
                    onClick={toggleMenu}
                    aria-label="Toggle navigation menu"
                >
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </button>

                {/* Block 2: Far Right (Appends 'open' class based on state changes) */}
                <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
                    <ul className="nav-list">
                        <li><a href="/" className="nav-link active">Home</a></li>
                        <li><a href="/tickets" className="nav-link">Tickets</a></li>
                        <li><a href="/animals" className="nav-link">Our Animals</a></li>
                        <li><a href="/map" className="nav-link">Zoo Map</a></li>
                        <li><a href="/contact" className="nav-link">Contact</a></li>
                    </ul>
                </nav>

            </div>
        </header>
    );
};