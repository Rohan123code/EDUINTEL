import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, SearchIcon, HeartHandshakeIcon, Cookie, Menu, X, LogIn, LogOut, UserPlus, LayoutDashboard, MessageCircleQuestion } from 'lucide-react';
import { Autocomplete, TextField } from '@mui/joy';
import axios from 'axios';

const NavBar = () => {
    const [searchData, setSearchData] = useState('');
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [foods, setFood] = useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleChange = () => {
        try {
            axios.get(`https://api.spoonacular.com/recipes/autocomplete?apiKey=9e3e4e5fb1ef404495506cfc8ae5b32a&ingredients&query=${searchData}&number=10`).then((data) => {
                setFood(data?.data);
            });
        } catch (error) {
            console.error("Error fetching recipes:", error);
        }
    };

    const handleSearch = () => {
        if (searchData.trim()) {
            navigate(`/search?query=${encodeURIComponent(searchData)}`);
            setMobileMenuOpen(false);
        }
    };

    const handleLogout = () => {
        // simple placeholder
        localStorage.removeItem("token");
        window.location.reload();
    };

    const isAdmin = "admin";
    const isLoggedIn = true;

    return (
        <nav className="bg-green-500 w-full p-4 shadow-md">
            <div className="max-w-6xl mx-auto">

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center text-lg text-white space-x-2">
                        <Cookie className="mr-2" />
                        <h1 className="font-bold text-xl">EduIntel</h1>
                    </div>

                    {/* Navigation links */}
                    <div className="flex items-center space-x-6 text-white">
                        <Link to="/" className={`${pathname === "/" ? "text-cyan-200 font-semibold" : ''} flex items-center gap-2`}>
                            <Home size={20} /> Home
                        </Link>

                        {isAdmin && (
                            <Link to="/dashboard" className={`${pathname === "/dashboard" ? "text-cyan-200 font-semibold" : ''} flex items-center gap-2`}>
                                <LayoutDashboard size={18} /> Dashboard
                            </Link>
                        )}

                        {isAdmin && (
                            <Link to="/ask" className={`${pathname === "/ask" ? "text-cyan-200 font-semibold" : ''} flex items-center gap-2`}>
                                <MessageCircleQuestion size={18} /> Ask
                            </Link>
                        )}

                        {/* Auth Buttons */}
                        {!isLoggedIn ? (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="bg-white text-green-700 px-4 py-1 rounded-full font-semibold hover:bg-green-100 flex items-center gap-1 transition">
                                    <LogIn size={18} /> Login
                                </Link>
                                <Link to="/signup" className="bg-green-700 text-white px-4 py-1 rounded-full font-semibold hover:bg-green-800 flex items-center gap-1 transition">
                                    <UserPlus size={18} /> Signup
                                </Link>
                            </div>
                        ) : (
                            <button onClick={handleLogout} className="flex items-center gap-1 hover:text-red-200">
                                <LogOut size={18} /> Logout
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="flex md:hidden items-center justify-between">
                    <div className="flex items-center text-lg text-white">
                        <Cookie className="mr-2" />
                        <h1 className="font-bold text-xl">Cookease</h1>
                    </div>

                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2 transition-transform duration-300" style={{ transform: mobileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                    <div className="flex flex-col space-y-4">
                        {/* Search */}
                        <div className="relative flex items-center w-full">
                            <Autocomplete
                                placeholder="Search recipes..."
                                inputValue={searchData}
                                freeSolo
                                disableClearable
                                className="rounded-l-full w-full"
                                options={foods}
                                getOptionLabel={(option) => option.title || ''}
                                onInputChange={(e, val) => { setSearchData(val); handleChange(); }}
                                onChange={(e, value) => {
                                    if (value?.id !== undefined) {
                                        navigate(`/r/${value.id}`);
                                        setMobileMenuOpen(false);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} sx={{ input: { color: 'white' } }} />
                                )}
                            />
                            <button onClick={handleSearch} className="absolute right-0 top-0 bg-green-600 text-white h-full px-4 flex items-center justify-center">
                                <SearchIcon size={20} />
                            </button>
                        </div>

                        {/* Nav links mobile */}
                        <div className="flex flex-col space-y-3 bg-green-600 p-4 rounded-lg text-white">
                            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                                <Home size={20} /> Home
                            </Link>

                            {isAdmin && (
                                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                                    <LayoutDashboard size={18} /> Dashboard
                                </Link>
                            )}

                            {isAdmin && (
                                <Link to="/ask" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                                    <MessageCircleQuestion size={18} /> Ask
                                </Link>
                            )}

                            {!isLoggedIn ? (
                                <>
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="bg-white text-green-700 px-4 py-2 rounded-full font-semibold hover:bg-green-100 flex items-center gap-2 transition">
                                        <LogIn size={18} /> Login
                                    </Link>
                                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="bg-green-700 text-white px-4 py-2 rounded-full font-semibold hover:bg-green-800 flex items-center gap-2 transition" >
                                        <UserPlus size={18} /> Signup
                                    </Link>
                                </>
                            ) : (
                                <button onClick={handleLogout} className="flex items-center gap-2 text-red-200">
                                    <LogOut size={18} /> Logout
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
