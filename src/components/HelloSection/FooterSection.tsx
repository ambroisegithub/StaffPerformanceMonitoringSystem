import * as React from 'react';
import { FaTwitter, FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';

const FooterSection = () => {
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-300 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-cyan-500 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(255,255,255) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>

      <div className="relative max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4 group">
            <div className="relative">
              <h3 className="text-lg font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                File Management System
              </h3>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full"></div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Secure, efficient, and intelligent document management for modern organizations.
            </p>
            <div className="flex space-x-4 pt-2">
              <div className="relative group/icon">
                <FaTwitter className="w-5 h-5 hover:text-blue-400 cursor-pointer transition-all duration-300 hover:scale-110 hover:drop-shadow-lg" />
                <div className="absolute inset-0 bg-blue-400 rounded-full opacity-0 group-hover/icon:opacity-20 transition-opacity duration-300 blur-md"></div>
              </div>
              <div className="relative group/icon">
                <FaLinkedin className="w-5 h-5 hover:text-blue-400 cursor-pointer transition-all duration-300 hover:scale-110 hover:drop-shadow-lg" />
                <div className="absolute inset-0 bg-blue-400 rounded-full opacity-0 group-hover/icon:opacity-20 transition-opacity duration-300 blur-md"></div>
              </div>
              <div className="relative group/icon">
                <FaGithub className="w-5 h-5 hover:text-gray-400 cursor-pointer transition-all duration-300 hover:scale-110 hover:drop-shadow-lg" />
                <div className="absolute inset-0 bg-gray-400 rounded-full opacity-0 group-hover/icon:opacity-20 transition-opacity duration-300 blur-md"></div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="group">
            <div className="relative mb-4">
              <h3 className="text-lg font-bold text-white">Quick Links</h3>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-300 group-hover:w-full"></div>
            </div>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 relative group/link flex items-center">
                  <span className="relative z-10">Features</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-md opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 -mx-2 -my-1"></div>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 relative group/link flex items-center">
                  <span className="relative z-10">Pricing</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-md opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 -mx-2 -my-1"></div>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 relative group/link flex items-center">
                  <span className="relative z-10">Documentation</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-md opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 -mx-2 -my-1"></div>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 relative group/link flex items-center">
                  <span className="relative z-10">Support</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-md opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 -mx-2 -my-1"></div>
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="group">
            <div className="relative mb-4">
              <h3 className="text-lg font-bold text-white">Legal</h3>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300 group-hover:w-full"></div>
            </div>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 relative group/link flex items-center">
                  <span className="relative z-10">Privacy Policy</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-md opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 -mx-2 -my-1"></div>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 relative group/link flex items-center">
                  <span className="relative z-10">Terms of Service</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-md opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 -mx-2 -my-1"></div>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 relative group/link flex items-center">
                  <span className="relative z-10">Security</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-md opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 -mx-2 -my-1"></div>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 relative group/link flex items-center">
                  <span className="relative z-10">Compliance</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-md opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 -mx-2 -my-1"></div>
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="group">
            <div className="relative mb-4">
              <h3 className="text-lg font-bold text-white">Stay Updated</h3>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-300 group-hover:w-full"></div>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-400 leading-relaxed">Subscribe to our newsletter for updates and tips.</p>
              <div className="relative group/form">
                <div className="flex backdrop-blur-sm bg-slate-800/50 rounded-lg border border-slate-700/50 overflow-hidden shadow-lg transition-all duration-300 group-hover/form:border-blue-400/50 group-hover/form:shadow-blue-400/20">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2.5 bg-transparent text-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 transition-colors"
                  />
                  <button className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 transition-all duration-300 relative overflow-hidden group/btn">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    <FaEnvelope className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover/btn:scale-110" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-700/50 relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">© 2025 File Management System. All rights reserved.</p>
            <div className="flex items-center space-x-3 mt-4 md:mt-0 group/status">
              <div className="relative">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-sm text-gray-400 group-hover/status:text-green-400 transition-colors duration-300">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;