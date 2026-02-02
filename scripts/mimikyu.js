(function() {
    'use strict';

    function initMimikyu() {
        const canvasContainer = document.querySelector(".nav__canvas");
        if (!canvasContainer) {
            console.log("Mimikyu canvas container not found");
            return;
        }

        const canvas = canvasContainer.querySelector("canvas");
        if (!canvas) {
            console.log("Mimikyu canvas not found");
            return;
        }

        const ctx = canvas.getContext("2d");
        
        const img = new Image();
        img.src = "./assets/mimikyu.png";

        const SPRITE_SIZE = 64;
        const SCALE = 2;
        const SCALED_SIZE = SCALE * SPRITE_SIZE;

        function setupCanvas() {
            const navLinks = document.querySelectorAll('.nav__link');
            if (navLinks.length < 2) return;
            
            const firstLink = navLinks[0].getBoundingClientRect();
            const lastLink = navLinks[navLinks.length - 1].getBoundingClientRect();
            const navRect = document.querySelector('.nav').getBoundingClientRect();
            
            const spanStart = firstLink.left - navRect.left;
            const spanEnd = (lastLink.right - navRect.left);
            
            const padding = 40;
            canvas.width = Math.max(spanEnd - spanStart + padding * 2, 400);
            canvas.height = navRect.height || 64;
            
            canvasContainer.style.width = canvas.width + 'px';
            canvasContainer.style.left = (Math.max(0, spanStart - padding)) + 'px';
        }
        
        setupCanvas();
        window.addEventListener('resize', setupCanvas);

        let currentLoopIndex = 0;
        let currentDirectionIndex = 0;
        let currentPosition = [
            canvas.width / 2 - SCALED_SIZE / 2,
            canvas.height - SCALED_SIZE - 5
        ];
        
        let targetX = null;
        let spriteSpeed = 5;
        let isHoveringLink = false;
        let hoveredLinkElement = null;
        let bounceOffset = 0;
        let bounceDirection = 1;
        let excitedAnimation = 0;

        function drawFrame(frameX, frameY, canvasX, canvasY) {
            if (!img.complete) return;
            
            const drawY = canvasY + bounceOffset;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(
                img,
                frameX * SPRITE_SIZE, frameY * SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE,
                canvasX, drawY, SCALED_SIZE, SCALED_SIZE
            );
        }

        function setupLinkListeners() {
            const navLinks = document.querySelectorAll('.nav__link');
            const navRect = document.querySelector('.nav').getBoundingClientRect();
            
            navLinks.forEach(link => {
                link.addEventListener('mouseenter', function(e) {
                    e.stopPropagation();
                    isHoveringLink = true;
                    hoveredLinkElement = link;
                    spriteSpeed = 8;
                    excitedAnimation = 0;
                    
                    const linkRect = link.getBoundingClientRect();
                    const relativeLeft = linkRect.left - navRect.left;
                    
                    targetX = relativeLeft + linkRect.width / 2 - SCALED_SIZE / 2;
                });
                
                link.addEventListener('mouseleave', function(e) {
                    e.stopPropagation();
                    isHoveringLink = false;
                    hoveredLinkElement = null;
                    targetX = null;
                    spriteSpeed = 5;
                });
            });
        }

        function gameLoop() {
            currentLoopIndex = (currentLoopIndex + 1) % 4;

            if (isHoveringLink && targetX !== null) {
                const dx = targetX - currentPosition[0];
                const distance = Math.abs(dx);

                if (distance > 3) {
                    currentDirectionIndex = dx > 0 ? 1 : 0;
                    currentPosition[0] += (dx > 0 ? 1 : -1) * spriteSpeed;
                    
                    bounceOffset = Math.sin(Date.now() / 50) * 2;
                } else {
                    currentLoopIndex = 0;
                    bounceOffset = 0;
                    
                    if (excitedAnimation < 30) {
                        excitedAnimation++;
                        bounceOffset = Math.sin(excitedAnimation / 3) * 8;
                    }
                }
            } else {
                if (Math.random() * 100 < 1) {
                    currentDirectionIndex = Math.floor(Math.random() * 2);
                }
                
                if (Math.random() * 300 < 1) {
                    bounceOffset = -8;
                } else if (bounceOffset < 0) {
                    bounceOffset += 2;
                    if (bounceOffset > 0) bounceOffset = 0;
                }

                const moveAmount = (currentDirectionIndex === 1 ? 1 : -1) * spriteSpeed * 0.5;
                currentPosition[0] += moveAmount;

                if (currentPosition[0] >= canvas.width - SCALED_SIZE) {
                    currentDirectionIndex = 0;
                } else if (currentPosition[0] < 0) {
                    currentDirectionIndex = 1;
                }
            }

            drawFrame(currentLoopIndex, currentDirectionIndex, currentPosition[0], currentPosition[1]);
            requestAnimationFrame(gameLoop);
        }

        img.onload = function() {
            setupLinkListeners();
            setupCanvas();
            gameLoop();
        };

        if (img.complete) {
            setupLinkListeners();
            setupCanvas();
            gameLoop();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMimikyu);
    } else {
        initMimikyu();
    }
})();
