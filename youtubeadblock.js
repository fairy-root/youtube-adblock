// ==UserScript==
// @name         AdBlock for YouTube
// @namespace    http://tampermonkey.net/
// @version      6.2
// @description  removes ads from youtube, and the annoying popups.
// @author       FairyRoot
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function() {
    // Config
    const adblocker = true;
    const removePopup = true;
    const debugMessages = true;
    const fixTimestamps = true;

    // Variables
    let currentUrl = window.location.href;
    let userPaused = false;

    // Setup
    log("Script started");

    if (adblocker) removeAds();
    if (removePopup) popupRemover();
    if (fixTimestamps) timestampFix();

    function popupRemover() {
        setInterval(() => {
            const modalOverlay = document.querySelector("tp-yt-iron-overlay-backdrop");
            const popup = document.querySelector(".style-scope ytd-enforcement-message-view-model");
            const popupButton = document.getElementById("dismiss-button");

            const video = document.querySelector('video');

            const bodyStyle = document.body.style;
            bodyStyle.setProperty('overflow-y', 'auto', 'important');

            if (modalOverlay) {
                modalOverlay.removeAttribute("opened");
                modalOverlay.remove();
            }

            if (popup) {
                log("Popup detected, removing...");

                if (popupButton) popupButton.click();

                popup.remove();
                video.play();

                setTimeout(() => {
                    video.play();
                }, 500);

                log("Popup removed");
            }

            // Remove <ytd-enforcement-message-view-model>
            const enforcementMessage = document.querySelector("ytd-enforcement-message-view-model");
            if (enforcementMessage) {
                log("Enforcement message detected, removing...");
                enforcementMessage.remove();
                log("Enforcement message removed");
            }

            if (!video.paused && !userPaused) {
                video.play();
            }
        }, 500);
    }

    function removeAds() {
        log("removeAds()");

        setInterval(() => {
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                removePageAds();
            }

            if (window.location.href.includes("shorts")) {
                log("Youtube shorts detected, ignoring...");
                return;
            }

            const video = document.querySelector('video');
            if (video && !video.paused && !userPaused) {
                video.pause();
                video.play();
            }
        }, 500);
        removePageAds();
    }

    function removePageAds() {
        const sponsor = document.querySelectorAll("div#player-ads.style-scope.ytd-watch-flexy, div#panels.style-scope.ytd-watch-flexy");
        const style = document.createElement('style');

        style.textContent = `
            ytd-action-companion-ad-renderer,
            ytd-display-ad-renderer,
            ytd-video-masthead-ad-advertiser-info-renderer,
            ytd-video-masthead-ad-primary-video-renderer,
            ytd-in-feed-ad-layout-renderer,
            ytd-ad-slot-renderer,
            yt-about-this-ad-renderer,
            #masthead-ad,
            .ytd-promoted-sparkles-text-search-renderer,
            .ytd-promoted-sparkles-web-renderer,
            .ytd-compact-promoted-video-renderer,
            .ytd-video-masthead-ad-v3-renderer,
            .ytd-promoted-sparkles-web-renderer,
            .ytd-action-companion-ad-renderer,
            .ytd-promoted-sparkles-text-search-renderer,
            .video-ads,
            #player-ads,
            #panels,
            ytd-enforcement-message-view-model
            {
                display: none !important;
            }
        `;

        document.head.appendChild(style);

        sponsor.forEach((el) => el.style.setProperty("display", "none", "important"));
    }

    function timestampFix() {
        setInterval(() => {
            const elements = document.querySelectorAll("ytd-thumbnail-overlay-time-status-renderer");
            elements.forEach(el => {
                const time = el.innerText.trim();
                const parts = time.split(":").map(Number);
                if (parts.length === 2 && parts[0] < 10) {
                    el.innerText = `0${time}`;
                }
            });
        }, 1000);
    }

    function log(message) {
        if (debugMessages) console.log(`[AdBlock for YouTube] ${message}`);
    }

    // Add event listeners to detect user interactions
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space' || event.code === 'KeyK') {
            const video = document.querySelector('video');
            if (video && !userPaused) {
                userPaused = video.paused;
            }
        }
    });

    document.addEventListener('click', (event) => {
        const video = document.querySelector('video');
        if (video && !userPaused) {
            userPaused = video.paused;
        }
    });
})();
