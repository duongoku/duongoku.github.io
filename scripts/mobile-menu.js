(function() {
    'use strict';

    const toggle = document.querySelector('.nav__toggle');
    const menu = document.querySelector('.nav__menu');
    const nav = document.querySelector('.nav');

    if (!toggle || !menu || !nav) {
        return;
    }

    let isOpen = false;

    function openMenu() {
        nav.classList.add('nav--open');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        isOpen = true;

        const firstLink = menu.querySelector('.nav__link');
        if (firstLink) {
            firstLink.focus();
        }
    }

    function closeMenu() {
        nav.classList.remove('nav--open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        isOpen = false;
        toggle.focus();
    }

    toggle.addEventListener('click', function() {
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    document.addEventListener('click', function(event) {
        if (!isOpen) return;

        if (!nav.contains(event.target)) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', function(event) {
        if (!isOpen) return;

        if (event.key === 'Escape') {
            closeMenu();
        }

        if (event.key === 'Tab') {
            const focusableElements = menu.querySelectorAll('.nav__link');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        }
    });

    const menuLinks = menu.querySelectorAll('.nav__link');
    menuLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            closeMenu();
        });
    });
})();
