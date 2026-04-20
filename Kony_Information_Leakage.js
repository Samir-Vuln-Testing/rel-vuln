// InfoLeakageDemo.js
// Vulnerability: Kony_Information_Leakage

import React, { useEffect } from "react";

function InfoLeakageDemo() {

    useEffect(() => {
        const username = "admin";
        const password = "Admin@123";
        const apiKey = "INTERNAL_API_KEY_999";

        // Logging sensitive data (VULNERABLE)
        console.log("Username:", username);
        console.log("Password:", password);
        console.log("API Key:", apiKey);

        fetch("https://api.internal.example.com/login", {
            method: "POST",
            body: JSON.stringify({ username, password })
        })
        .then(res => res.json())
        .then(data => {
            // Leaking sensitive response
            console.log("Auth response:", data);
        })
        .catch(err => {
            // Detailed error leakage
            console.error("Login error:", err.message);
        });
    }, []);

    return <h2>Information Leakage Demo</h2>;
}

export default InfoLeakageDemo;
