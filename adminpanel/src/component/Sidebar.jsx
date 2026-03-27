import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

const menuItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Orders',
    
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    hasDropdown: true,
    children: [
      { label: 'All Orders',      href: '/orders' },
      { label: 'Payment Success', href: '/orders/success' },
    ],
  },
  {
    label: 'Product',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    hasDropdown: true,
    children: [
      { label: 'Products',    href: '/allProduct' },
      { label: 'Add Product', href: '/addProduct' },
    ],
  },
];

const ChevronDown = ({ open }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    fill="none" stroke="currentColor" viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Auto-open parent whose child matches current path
  const defaultOpen = {};
  menuItems.forEach(item => {
    if (item.children?.some(c => c.href === currentPath)) {
      defaultOpen[item.label] = true;
    }
  });

  const [openMenus, setOpenMenus] = useState(defaultOpen);

  const toggle = (label) =>
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside className="w-72 bg-white h-screen flex flex-col shrink-0 border-r border-gray-100 shadow-sm">

      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-6 py-[18px] border-b border-gray-100">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
          N
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">New Project Tracker</span>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-5 px-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] px-2 mb-3">
          Menu
        </p>

        <ul className="space-y-0.5">
          {menuItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isOpen      = !!openMenus[item.label];
            const isActive    = item.href === currentPath ||
                                item.children?.some(c => c.href === currentPath);

            return (
              <li key={item.label}>
                {/* ── Parent row ── */}
                {item.href && !hasChildren ? (
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150
                      ${isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    <span className={isActive ? 'text-blue-500' : 'text-gray-400'}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => toggle(item.label)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150
                      ${isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    <span className={isActive ? 'text-blue-500' : 'text-gray-400'}>
                      {item.icon}
                    </span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full leading-none">
                        {item.badge}
                      </span>
                    )}
                    {hasChildren && <ChevronDown open={isOpen} />}
                  </button>
                )}

                {/* ── Children ── */}
                {hasChildren && isOpen && (
                  <ul className="mt-1 ml-4 pl-4 border-l-2 border-gray-100 space-y-0.5">
                    {item.children.map((child) => {
                      const childActive = currentPath === child.href;
                      return (
                        <li key={child.label}>
                          <Link
                            to={child.href}
                            className={`block px-3 py-2 rounded-lg text-sm transition-colors duration-150
                              ${childActive
                                ? 'text-blue-600 font-semibold bg-blue-50'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                          >
                            {child.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── User footer ── */}
      <div className="px-4 py-4 border-t border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
          A
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">Admin</p>
          <p className="text-xs text-gray-400 truncate">admin@tail.com</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;