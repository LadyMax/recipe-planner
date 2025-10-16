import React from 'react';
import { Button } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Button Section */}
      {isAuthenticated && (
        <div style={{ 
          position: 'absolute',
          top: '150px', // Adjusted for new banner height
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          padding: 0,
          margin: 0
        }}>
          <Link to="/recipes">
            <Button variant="success" size="lg">
              Create Recipe
            </Button>
          </Link>
        </div>
      )}

      {/* Full Width Image */}
      <div 
        style={{ 
          height: '100vh', 
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          marginTop: '-150px', // Adjusted for new banner height
          marginBottom: 0,
          padding: 0,
          backgroundImage: 'url("/images/paris_breakfast.jpg"), linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: -1
        }}
      >
        {/* Overlay for better text readability */}
        <div 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)'
          }}
        ></div>
        
        <div style={{ 
          color: 'white', 
          position: 'absolute',
          top: '50%',
          left: '50px',
          transform: 'translateY(-50%)',
          zIndex: 1, 
          textAlign: 'left',
          maxWidth: '400px'
        }}>
          <div style={{ 
            fontSize: '2.5rem', 
            marginBottom: '1rem', 
            fontWeight: '300',
            fontFamily: 'Georgia, serif',
            lineHeight: '1.2'
          }}>
            Bon Appétit!
          </div>
          <div style={{ 
            fontSize: '1.1rem', 
            marginBottom: '0.8rem', 
            opacity: 0.9,
            fontWeight: '400',
            lineHeight: '1.4'
          }}>
            From Parisian Cafés to Your Kitchen
          </div>
          <div style={{ 
            fontSize: '0.95rem', 
            opacity: 0.8,
            fontWeight: '300',
            lineHeight: '1.3'
          }}>
            Start Your Culinary Journey Today
          </div>
        </div>
        
        {/* Login reminder on the right */}
        <div style={{ 
          color: 'white', 
          position: 'absolute',
          top: '40%',
          right: '50px',
          transform: 'translateY(-50%)',
          zIndex: 1, 
          textAlign: 'right',
          maxWidth: '300px'
        }}>
          <div style={{ 
            fontSize: '1.3rem', 
            opacity: 1,
            fontWeight: '500',
            lineHeight: '1.2',
            textShadow: '0 3px 6px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 255, 255, 0.3)',
            fontStyle: 'italic',
            letterSpacing: '0.5px'
          }}>
            Login to explore recipes
          </div>
        </div>
      </div>
    </>
  );
};

// Add route configuration
(HomePage as React.ComponentType & { route?: { path: string; menuLabel?: string; index?: number } }).route = {
  path: '/',
  index: 0,
};

export default HomePage;
