import React, { useEffect, useRef, useState } from 'react';
import  icon  from './icon.png';

// Particle System Component
const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const c = canvas as HTMLCanvasElement;
    const context = ctx as CanvasRenderingContext2D;
    let animationFrameId;
    let particles: any[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      x!: number;
      y!: number;
      size!: number;
      speedY!: number;
      speedX!: number;
      opacity!: number;

      constructor() {
        this.reset();
        this.y = Math.random() * c.height;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      reset() {
        this.x = Math.random() * c.width;
        this.y = -10;
        this.size = Math.random() * 3 + 1;
        this.speedY = Math.random() * 0.5 + 0.2;
        this.speedX = Math.random() * 0.3 - 0.15;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

    }

    // Create particles
    for (let i = 0; i < 80; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  );
};

// Icon Display Component
const AquaIcon = () => {
  return (
    <div className="icon-container">
      <img src={icon} alt="Aqua Player Icon" className="app-icon" />
    </div>
  );
};

// Download Button Component
const DownloadButton = () => {
  const [platform, setPlatform] = useState<'windows' | 'mac'>('windows');
  const [showDropdown, setShowDropdown] = useState(false);
  const [version, setVersion] = useState<string | null>(null);
  const [releaseDate, setReleaseDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mac')) {
      setPlatform('mac');
    }

    // Fetch latest version from latest.yml
    const fetchVersion = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/zardoy/aqua-player/refs/heads/release-info/latest.yml');
        const text = await response.text();

        // Parse YAML to get version
        const versionMatch = text.match(/version:\s*([^\s]+)/);
        if (versionMatch) {
          setVersion(versionMatch[1] as string);
        }

        // Parse YAML to get release date
        const releaseDateMatch = text.match(/releaseDate:\s*'([^']+)'/);
        if (releaseDateMatch) {
          const rd = releaseDateMatch[1] as string;
          setReleaseDate(new Date(rd));
        }
      } catch (error) {
        console.error('Failed to fetch version:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVersion();
  }, []);

  const getRelativeTime = (date: Date | null): string => {
    if (!date) return '';

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
  };

  const getDownloadLink = (os) => {
    if (!version) return '#';

    const baseUrl = 'https://github.com/zardoy/aqua-player/releases/latest/download/';

    if (os === 'windows') {
      return `${baseUrl}Aqua-Player-Setup-${version}.exe`;
    } else {
      return `${baseUrl}Aqua-Player-${version}.dmg`;
    }
  };

  const platformNames = {
    windows: 'Windows',
    mac: 'macOS'
  };

  return (
    <div className="download-section">
      <a
        href={getDownloadLink(platform)}
        className={`download-button ${loading ? 'loading' : ''}`}
        download
        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
          if (loading) {
            e.preventDefault();
            return;
          }

          if (!version) {
            e.preventDefault();
            window.location.href = 'https://github.com/zardoy/aqua-player/releases';
          }
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {loading ? 'Loading...' : `Download for ${platformNames[platform]}`}
      </a>

      {version && (
        <div className="version-info">
          <span className="version-badge">v{version}</span>
          {releaseDate && (
            <>
              <span className="version-separator">•</span>
              <span className="release-time">{getRelativeTime(releaseDate)}</span>
            </>
          )}
        </div>
      )}

      <button
        className="platform-selector"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        Other platforms
      </button>

      {showDropdown && (
        <div className="platform-dropdown">
          <button onClick={() => { setPlatform('windows'); setShowDropdown(false); }}>
            Windows
          </button>
          <button onClick={() => { setPlatform('mac'); setShowDropdown(false); }}>
            macOS
          </button>
        </div>
      )}
    </div>
  );
};

// Feature Tag Component
const FeatureTag = () => {
  return (
    <div className="feature-tag">
      Feature-rich all-in-one player with best of the box config and modern UI
    </div>
  );
};

// Main Hero Section
const HeroSection = () => {
  return (
    <div className="hero">
      <AquaIcon />

      <h1 className="title">
        <span className="title-main">Aqua Player</span>
      </h1>

      <p className="description">
        A media player of my dream.
      </p>

      <DownloadButton />

      <FeatureTag />
    </div>
  );
};

// Background Gradient Component
const BackgroundGradient = () => {
  return (
    <div className="gradient-bg">
      <div className="gradient-orb orb-1"></div>
      <div className="gradient-orb orb-2"></div>
      <div className="gradient-orb orb-3"></div>
    </div>
  );
};

// Main App Component
const AquaPlayerLanding = () => {
  return (
    <div className="app">
      <BackgroundGradient />
      <ParticleField />
      <HeroSection />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          overflow-x: hidden;
        }

        .app {
          min-height: 100vh;
          background: #000000;
          color: #ffffff;
          position: relative;
          overflow: hidden;
        }

        .gradient-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          overflow: hidden;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
          animation: float 20s ease-in-out infinite;
        }

        .orb-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, #3bccff 0%, transparent 70%);
          top: -200px;
          left: -200px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, #0ea5e9 0%, transparent 70%);
          bottom: -150px;
          right: -150px;
          animation-delay: -7s;
        }

        .orb-3 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -14s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(50px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-30px, 30px) scale(0.9);
          }
        }

        .hero {
          position: relative;
          z-index: 2;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
        }

        .icon-container {
          margin-bottom: 2rem;
          animation: fadeInDown 1s ease-out;
        }

        .app-icon {
          width: 180px;
          height: 180px;
          filter: drop-shadow(0 20px 60px rgba(59, 204, 255, 0.4));
          animation: iconFloat 3s ease-in-out infinite;
        }

        @keyframes iconFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .title {
          margin-bottom: 1.5rem;
          animation: fadeInUp 1s ease-out 0.2s both;
        }

        .title-main {
          display: block;
          font-size: clamp(3.5rem, 10vw, 6rem);
          font-weight: 800;
          background: linear-gradient(135deg, #3bccff 0%, #0ea5e9 50%, #06b6d4 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.02em;
          line-height: 1.1;
          text-shadow: 0 0 80px rgba(59, 204, 255, 0.3);
        }

        .description {
          font-size: clamp(1.25rem, 3vw, 1.75rem);
          font-weight: 300;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 3rem;
          max-width: 600px;
          animation: fadeInUp 1s ease-out 0.4s both;
          letter-spacing: 0.02em;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .download-section {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2.5rem;
          animation: fadeInUp 1s ease-out 0.6s both;
        }

        .download-button {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem 3rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: #000000;
          background: linear-gradient(135deg, #3bccff 0%, #0ea5e9 100%);
          border: none;
          border-radius: 50px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 40px rgba(59, 204, 255, 0.3);
          position: relative;
          overflow: hidden;
        }

        .download-button.loading {
          opacity: 0.7;
          cursor: wait;
        }

        .download-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .download-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 50px rgba(59, 204, 255, 0.5);
        }

        .download-button:hover::before {
          opacity: 1;
        }

        .download-button:active {
          transform: translateY(0);
        }

        .download-button svg {
          width: 24px;
          height: 24px;
          stroke-width: 2.5;
        }

        .version-badge {
          font-size: 0.85rem;
          color: rgba(59, 204, 255, 0.8);
          font-weight: 500;
          padding: 0.35rem 0.85rem;
          background: rgba(59, 204, 255, 0.1);
          border: 1px solid rgba(59, 204, 255, 0.2);
          border-radius: 20px;
        }

        .version-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: fadeIn 0.5s ease;
        }

        .version-separator {
          color: rgba(59, 204, 255, 0.4);
          font-size: 0.85rem;
        }

        .release-time {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 400;
        }

        .platform-selector {
          background: rgba(59, 204, 255, 0.1);
          border: 1px solid rgba(59, 204, 255, 0.3);
          color: #3bccff;
          padding: 0.75rem 1.5rem;
          border-radius: 30px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif;
        }

        .platform-selector:hover {
          background: rgba(59, 204, 255, 0.15);
          border-color: rgba(59, 204, 255, 0.5);
        }

        .platform-dropdown {
          position: absolute;
          top: 100%;
          margin-top: 0.5rem;
          background: rgba(20, 20, 20, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(59, 204, 255, 0.2);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          animation: dropdownSlide 0.3s ease;
        }

        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .platform-dropdown button {
          display: block;
          width: 100%;
          padding: 0.875rem 2rem;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.9);
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          font-family: 'Outfit', sans-serif;
        }

        .platform-dropdown button:hover {
          background: rgba(59, 204, 255, 0.15);
          color: #3bccff;
        }

        .feature-tag {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 400;
          max-width: 500px;
          line-height: 1.6;
          animation: fadeIn 1s ease-out 0.8s both;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .app-icon {
            width: 140px;
            height: 140px;
          }

          .download-button {
            padding: 1rem 2rem;
            font-size: 1.1rem;
          }

          .orb-1, .orb-2, .orb-3 {
            width: 300px;
            height: 300px;
          }
        }
      `}</style>
    </div>
  );
};

export default AquaPlayerLanding;
