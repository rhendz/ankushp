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
                        <svg viewBox="0 0 116.56 92.428" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8">
                            <g transform="translate(-90.221 -58.786)">
                                <g transform="translate(-9.2428 15.753)">
                                    <path className="fill-accent1" d="m174.34 134.67c-0.38893-0.48057-7.4906-14.608-7.4906-14.902 0-0.0989 3.8093-0.17975 8.4651-0.17975h8.4651l3.7058 7.4051c2.0382 4.0728 3.7058 7.5653 3.7058 7.7611 0 0.56056-16.396 0.47786-16.851-0.085z"/>
                                    <g className="fill-content">
                                        <path d="m99.464 134.76c0-0.46373 45.63-91.723 45.862-91.723 0.0981 0 4.7417 9.1281 10.319 20.285l10.141 20.285h-17.29l-1.4872-2.9986c-0.81794-1.6492-1.5708-2.9956-1.6731-2.992-0.10228 0.0037-6.6769 12.942-14.61 28.751l-14.424 28.745h-8.418c-5.3711 0-8.418-0.12755-8.418-0.35241z"/><path d="m143.29 114.56 0.091-20.902 9.3486-0.08684c5.1417-0.04776 15.143-0.12714 22.225-0.17639l12.876-0.08955 2.035-1.0311c10.178-5.157 10.02-19.35-0.27107-24.391l-2.1167-1.0367-18.697-0.22963-4.2333-7.772c-2.3283-4.2746-4.2916-7.9298-4.3628-8.1227-0.27368-0.74169 29.008-0.10752 32.409 0.7019 30.893 7.353 31.356 49.239 0.63285 57.291-2.7452 0.71948-3.8902 0.77528-18.536 0.90336l-15.61 0.13652v25.707h-15.881z"/>
                                    </g>
                                </g>
                            </g>
                        </svg>
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