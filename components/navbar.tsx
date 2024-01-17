"use client";

import Link from "next/link";
import React from "react";
import { MdHome, MdOutlineHome, MdOutlineLightMode, MdDarkMode } from 'react-icons/md';

import { useTheme } from "@/components/theme-provider";

const Navbar = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <div className="container fixed inset-x-0 top-4 z-50 mx-auto max-w-screen-lg sm:top-8 lg:top-16 xl:top-20 2xl:top-24">
            <ul className="flex h-full items-center justify-between text-3xl lg:text-4xl">
                <li>
                    <Link href="/">
                        {isDarkMode ? <MdOutlineHome aria-label="Home" /> : <MdHome aria-label="Home" />}
                    </Link>
                </li>
                <li>
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                    >
                        {isDarkMode ? <MdOutlineLightMode aria-label="Light Mode" /> : <MdDarkMode aria-label="Dark Mode" />}
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default Navbar;