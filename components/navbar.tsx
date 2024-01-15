import Link from "next/link";
import React, { useEffect, useState } from "react";
import { MdHome, MdOutlineHome, MdOutlineLightMode, MdDarkMode } from 'react-icons/md';

const Navbar = ({ onDarkModeChange }) => {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const handleThemeSwitch = () => {
        // Toggle dark mode and notify the parent component
        setTheme(theme === "dark" ? "light" : "dark");
        onDarkModeChange();
    };

    return (
        <div className="container fixed inset-x-0 top-0 z-50 p-8 lg:h-40">
            <ul className="flex h-full items-center justify-between text-2xl lg:text-3xl">
                <li>
                    <Link href="/">
                        {theme === 'dark'? <MdOutlineHome /> : <MdHome /> }
                    </Link>
                </li>
                <li>
                    <button
                        type="button"
                        className=""
                        onClick={handleThemeSwitch}
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? <MdOutlineLightMode /> : <MdDarkMode />}
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default Navbar;