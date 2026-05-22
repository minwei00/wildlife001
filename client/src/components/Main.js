import React from 'react';
import './Main.css';

export const Main = () => {
  return (
    <main className="wildworld-main">
      {/* Luminous Sun Element top right */}
      <div className="sky-sun"></div>

      {/* Main Copy & Content Area */}
      <div className="hero-content-wrapper">
        <h3 className="hero-tagline">WELCOME TO MANDAI ZOO</h3>
        
        <h1 className="hero-headline">
        Step Into <br />
        <span className="gradient-text">the Wild</span>
        </h1>
        
        <p className="hero-subtext">
          500+ incredible species from the world's<br />
          most breathtaking wild habitats.
        </p>

        {/* CTA Buttons Grid */}
        <div className="hero-actions">
          <button className="btn-cta btn-yellow">
            Get Tickets <span className="btn-icon">🎟️</span>
          </button>
          <button className="btn-cta btn-outline">
            Explore Map <span className="btn-icon">🗺️</span>
          </button>
        </div>

        {/* Dynamic Chat Hint */}
        <div className="chat-hint-container">
          <p className="chat-hint-text">Have questions? Chat with your Wild Guide below</p>
          <div className="chevron-down-animated"></div>
        </div>
      </div>

      {/* Floating Mascot Layer */}
      <div className="mascot-parrot">🦜</div>

      {/* Illustrated Layered Base (Landscape & Animals) */}
      <div className="landscape-footer-layer">
        
        {/* Dynamic Stylized Background Hills */}
        <div className="hill hill-back"></div>
        <div className="hill hill-middle"></div>
        <div className="hill hill-front"></div>

        {/* Vector Botanical Trees Arrangement */}
        <div className="tree tree-left-1">🌴</div>
        <div className="tree tree-left-2">🌳</div>
        <div className="tree tree-right-1">🌴</div>
        <div className="tree tree-right-2">🌳</div>

        {/* Animal Graphics positioning aligned with layout */}
        <div className="zoo-animal giraffe-asset">🦒</div>
        <div className="zoo-animal zebra-asset">🦓</div>
        <div className="zoo-animal lion-cub-asset">🦁</div>
        <div className="zoo-animal elephant-asset">🐘</div>
      </div>
    </main>
  );
};

export default Main;