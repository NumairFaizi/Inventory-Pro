import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-800 border-t border-gray-700 py-8 mt-auto no-print">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    
                    {/* Copyright Section */}
                    <div className="text-center md:text-left">
                        <p className="text-gray-400 text-sm">
                            © {currentYear} <span className="text-blue-400 font-bold">Numair Faizi</span>. 
                            <span className="hidden sm:inline"> All Rights Reserved.</span>
                        </p>
                        <p className="text-gray-600 text-[10px] mt-1 uppercase tracking-widest font-black">
                            Inventory Pro Desktop v1.0.2
                        </p>
                    </div>

                    {/* Support & Links Section */}
                    <div className="flex flex-wrap justify-center gap-6 text-sm">
                        <div className="flex flex-col items-center md:items-end">
                            <span className="text-gray-500 text-[10px] font-bold uppercase mb-1">Get Support</span>
                            <a 
                                href="mailto:support@example.com" 
                                className="text-gray-300 hover:text-blue-400 transition-colors flex items-center gap-2"
                            >
                                <span>📧</span> numair.faizi@example.com
                            </a>
                        </div>
                        
                        <div className="flex flex-col items-center md:items-end border-l border-gray-700 pl-6">
                            <span className="text-gray-500 text-[10px] font-bold uppercase mb-1">Developer</span>
                            <a 
                                href="https://github.com/numairfaizi" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <span>🔗</span> Portfolio
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </footer>
    );
};

export default Footer;