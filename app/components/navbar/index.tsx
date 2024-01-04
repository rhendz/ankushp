import Link from "next/link";
import React, { useEffect, useState } from "react";

const Navbar = ({ onDarkModeChange }) => {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        if (theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark")
        } else {
        document.documentElement.removeAttribute("data-theme")
        }
    }, [theme]);

    const handleThemeSwitch = () => {
        // Toggle dark mode and notify the parent component
        setTheme(theme === "dark" ? "light" : "dark");
        onDarkModeChange();
    };
  
    return (
        <>
            <div className="fixed top-0 z-50 h-20 w-full bg-bkg">
                <div className="container mx-auto h-full px-4">
                    <div className="flex h-full items-center justify-between">
                        {/* <Logo /> */}
                        <ul className="hidden gap-x-6 text-content md:flex">
                        <li>
                            <Link href="/about">
                            <p>About</p>
                            </Link>
                        </li>
                        <li>
                            <Link href="/services">
                            <p>Services</p>
                            </Link>
                        </li>
                        <li>
                            <Link href="/contact">
                            <p>Contact</p>
                            </Link>
                        </li>
                        </ul>
                        <button className='rounded-3xl bg-bkg p-2 text-content' onClick={handleThemeSwitch}>
                            Dark Mode
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Navbar;