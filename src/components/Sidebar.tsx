
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const navItems = [
    {
      title: 'Dashboard',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>,
      path: '/dashboard',
      badge: null
    },
    {
      title: 'Visualization',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M0 0h16v16H0V0zm1 1v14h14V1H1z"/>
              <path d="M13 8.5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1 0-1h5a.5.5 0 0 1 .5.5zM13 4.5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1 0-1h5a.5.5 0 0 1 .5.5zM2 12.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zM2 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zM2 4.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
            </svg>,
      path: '/visualization',
      badge: 'New'
    },
    {
      title: 'Profile',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
            </svg>,
      path: '/profile',
      badge: null
    },
    {
      title: 'Bookmarks',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
            </svg>,
      path: '/bookmarks',
      badge: null
    }
  ];

  return (
    <div className="sidebar bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="sidebar-header mb-8">
        <h1 className="text-2xl font-bold">Astrikos</h1>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item, index) => (
            <li key={index} className="mb-2">
              <Link 
                to={item.path} 
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  location.pathname === item.path 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.title}</span>
                {item.badge && (
                  <span className="ml-auto bg-indigo-500 text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="mt-auto pt-8">
        <div className="user-info flex items-center mb-4">
          <div className="avatar w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center mr-3">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="User" className="rounded-full" />
            ) : (
              <span>{currentUser?.displayName?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div>
            <div className="name text-sm font-medium">{currentUser?.displayName || 'User'}</div>
            <div className="email text-xs text-gray-400">{currentUser?.email}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;