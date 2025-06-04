// script.js for SpaceJamz EPK

document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Initialization ---
    let db, auth;
    try {
        // Check if firebaseConfig is defined and not using a generic placeholder API key
        if (window.firebase && typeof window.firebaseConfig !== 'undefined' && 
            window.firebaseConfig.apiKey && window.firebaseConfig.apiKey !== "YOUR_API_KEY") { // This check is okay as your actual key is different

            if (!firebase.apps.length) { // Initialize only if no apps exist
                firebase.initializeApp(window.firebaseConfig);
                console.log("Firebase initialized successfully with your provided config.");
            } else {
                firebase.app(); // Use existing app
                console.log("Firebase was already initialized.");
            }
            db = firebase.firestore();
            auth = firebase.auth();
        } else {
            if (window.firebaseConfig && window.firebaseConfig.apiKey === "YOUR_API_KEY") { 
                console.warn("Firebase config is using the generic 'YOUR_API_KEY' placeholder. Dynamic features requiring Firebase will be limited.");
            } else if (!window.firebase) {
                console.error("Firebase SDK not loaded. Dynamic features requiring Firebase will be limited.");
            } else if (typeof window.firebaseConfig === 'undefined' || !window.firebaseConfig.apiKey) {
                console.error("Firebase config object is missing or incomplete (no API key). Dynamic features requiring Firebase will be limited.");
            } else {
                console.error("Firebase could not be initialized. Please check your firebaseConfig object and Firebase project setup.");
            }
        }
    } catch (error) {
        console.error("Error during Firebase initialization:", error);
    }

    // --- Navbar Scroll Effect & Mobile Menu ---
    const navbar = document.getElementById('navbar');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mainContentForPadding = document.querySelector('main'); // To adjust padding if navbar is fixed

    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            // Optional: Change hamburger icon to X and back
            const icon = mobileMenuButton.querySelector('svg');
            if (mobileMenu.classList.contains('hidden')) {
                icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>`;
            } else {
                icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>`;
            }
        });
    }
    
    // --- Smooth Scroll for Nav Links & Active State (Desktop and Mobile) ---
    // Consolidate selectors for all nav links
    const allNavLinks = document.querySelectorAll('.nav-link'); 
    const sections = document.querySelectorAll('main section[id]');

    if (allNavLinks.length > 0 && sections.length > 0 && navbar) {
        allNavLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    const navbarHeight = navbar.offsetHeight;
                    // If mobile menu is open and it's a mobile link, consider its height too, or just close it
                    let extraOffset = 0;
                    if (mobileMenu && !mobileMenu.classList.contains('hidden') && this.classList.contains('mobile-nav-link')) {
                        // extraOffset = mobileMenu.offsetHeight; // Could make it jump if menu closes after
                        mobileMenu.classList.add('hidden'); // Close mobile menu on click
                         const icon = mobileMenuButton.querySelector('svg');
                         icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>`;
                    }

                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight + extraOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        function updateActiveNavLink() {
            let currentSectionId = '';
            // Adjust for navbar height, more accurately if mobile menu is open and fixed
            let effectiveNavbarHeight = navbar.offsetHeight;
            // if (mobileMenu && !mobileMenu.classList.contains('hidden') && window.innerWidth < 768) {
            //     effectiveNavbarHeight += mobileMenu.offsetHeight; 
            // }


            sections.forEach(section => {
                const sectionTop = section.offsetTop - effectiveNavbarHeight - 20; // Added a bit more buffer
                if (window.pageYOffset >= sectionTop) {
                    currentSectionId = section.getAttribute('id');
                }
            });
            
            // Handle case for top of page before first section
            if (sections.length > 0 && window.pageYOffset < (sections[0].offsetTop - effectiveNavbarHeight - 20) && window.pageYOffset < 100) { 
                 currentSectionId = ''; 
            }


            allNavLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').substring(1) === currentSectionId) {
                    link.classList.add('active');
                }
            });
        }
        window.addEventListener('scroll', updateActiveNavLink);
        window.addEventListener('resize', updateActiveNavLink); // Recalculate on resize
        updateActiveNavLink(); // Initial call
    }

    // --- "Read More" for Bio Section ---
    const bioContent = document.getElementById('bio-content');
    const bioText = document.getElementById('bio-text'); // The actual paragraph with text
    const readMoreBioButton = document.getElementById('read-more-bio');

    if (bioContent && readMoreBioButton && bioText) {
        // Initial state: collapsed
        const initialMaxHeight = "100px"; // Should match CSS
        bioContent.style.maxHeight = initialMaxHeight;
        bioContent.classList.add('collapsed');

        // Check if content is actually overflowing to decide if button is needed
        // Needs to be un-collapsed temporarily to measure scrollHeight
        bioContent.style.maxHeight = ''; // Temporarily remove max-height
        const isOverflowing = bioText.scrollHeight > parseInt(initialMaxHeight);
        bioContent.style.maxHeight = initialMaxHeight; // Restore max-height

        if (!isOverflowing) {
            readMoreBioButton.style.display = 'none'; // Hide button if no overflow
        } else {
           readMoreBioButton.style.display = 'inline-block'; // Ensure it's visible
        }


        readMoreBioButton.addEventListener('click', () => {
            if (bioContent.classList.contains('collapsed')) {
                bioContent.style.maxHeight = bioText.scrollHeight + 'px';
                bioContent.classList.remove('collapsed');
                readMoreBioButton.textContent = 'Read Less';
            } else {
                bioContent.style.maxHeight = initialMaxHeight;
                bioContent.classList.add('collapsed');
                readMoreBioButton.textContent = 'Read More';
                // Scroll to top of bio section smoothly if desired after collapsing
                // bioContent.parentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }


    // --- Starfield Animation & Subtle Parallax & Comets ---
    const starfieldCanvas = document.getElementById('starfieldCanvas');
    if (starfieldCanvas) {
        const ctx = starfieldCanvas.getContext('2d');
        let mouseX = 0;
        let mouseY = 0;

        document.addEventListener('mousemove', (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
        });

        function resizeCanvas() {
            starfieldCanvas.width = window.innerWidth;
            starfieldCanvas.height = window.innerHeight;
        }
        
        const numStars = 250; 
        const stars = [];
        const comets = [];
        const cometSpawnInterval = 5000; 
        let lastCometSpawn = 0;

        function Star(x, y, radius, opacity) {
            this.x = x; this.originX = x; 
            this.y = y; this.originY = y; 
            this.radius = radius; this.opacity = opacity;
            this.opacityDirection = Math.random() > 0.5 ? 0.005 : -0.005; 
            this.color = `rgba(224, 231, 255, ${this.opacity})`; 
            this.parallaxFactor = Math.random() * 0.02 + 0.005; 
        }

        Star.prototype.draw = function() {
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            this.color = `rgba(224, 231, 255, ${this.opacity})`; 
            ctx.fillStyle = this.color; ctx.fill();
        };

        Star.prototype.update = function() {
            let offsetX = (mouseX - starfieldCanvas.width / 2) * this.parallaxFactor;
            let offsetY = (mouseY - starfieldCanvas.height / 2) * this.parallaxFactor;
            this.x = this.originX + offsetX; this.y = this.originY + offsetY;
            this.opacity += this.opacityDirection;
            if (this.opacity <= 0.1 || this.opacity >= 0.8) { this.opacityDirection *= -1; }
            if (Math.random() < 0.01) { this.opacityDirection = (Math.random() - 0.5) * 0.02; }
            this.draw();
        };
        
        function Comet() {
            this.radius = Math.random() * 2 + 1; this.speed = Math.random() * 3 + 2;   
            this.tailLength = Math.random() * 150 + 80; this.opacity = 1;
            const edge = Math.floor(Math.random() * 4);
            if (edge === 0) { this.x = Math.random() * starfieldCanvas.width; this.y = 0 - this.tailLength; this.angle = Math.random() * Math.PI; } 
            else if (edge === 1) { this.x = starfieldCanvas.width + this.tailLength; this.y = Math.random() * starfieldCanvas.height; this.angle = Math.random() * Math.PI + Math.PI / 2; } 
            else if (edge === 2) { this.x = Math.random() * starfieldCanvas.width; this.y = starfieldCanvas.height + this.tailLength; this.angle = Math.random() * Math.PI + Math.PI; } 
            else { this.x = 0 - this.tailLength; this.y = Math.random() * starfieldCanvas.height; this.angle = Math.random() * Math.PI - Math.PI / 2; }
            this.dx = Math.cos(this.angle) * this.speed; this.dy = Math.sin(this.angle) * this.speed;
        }

        Comet.prototype.draw = function() {
            ctx.beginPath();
            const tailX = this.x - this.dx * (this.tailLength / this.speed);
            const tailY = this.y - this.dy * (this.tailLength / this.speed);
            const gradient = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
            gradient.addColorStop(0, `rgba(0, 240, 255, ${this.opacity * 0.8})`); 
            gradient.addColorStop(0.5, `rgba(0, 240, 255, ${this.opacity * 0.3})`);
            gradient.addColorStop(1, `rgba(0, 240, 255, 0)`); 
            ctx.strokeStyle = gradient; ctx.lineWidth = this.radius * 1.5; 
            ctx.moveTo(this.x, this.y); ctx.lineTo(tailX, tailY); ctx.stroke();
        };

        Comet.prototype.update = function() {
            this.x += this.dx; this.y += this.dy; this.draw();
            const buffer = this.tailLength + 50;
            return this.x < -buffer || this.x > starfieldCanvas.width + buffer ||
                   this.y < -buffer || this.y > starfieldCanvas.height + buffer;
        };

        function initStarsAndComets() {
            stars.length = 0; comets.length = 0; 
            for (let i = 0; i < numStars; i++) {
                stars.push(new Star(Math.random() * starfieldCanvas.width, Math.random() * starfieldCanvas.height, Math.random() * 1.5 + 0.5, Math.random() * 0.7 + 0.1));
            }
        }

        function animateCosmicBackground() { 
            requestAnimationFrame(animateCosmicBackground); // Moved to the top for smoother animation start
            ctx.clearRect(0, 0, starfieldCanvas.width, starfieldCanvas.height);
            stars.forEach(star => star.update());
            const currentTime = Date.now();
            if (currentTime - lastCometSpawn > cometSpawnInterval && comets.length < 3) { 
                if (Math.random() < 0.3) { comets.push(new Comet()); }
                lastCometSpawn = currentTime;
            }
            for (let i = comets.length - 1; i >= 0; i--) {
                if (comets[i].update()) { comets.splice(i, 1); }
            }
        }
        
        window.addEventListener('resize', () => { 
            resizeCanvas();
            initStarsAndComets(); 
        });
        resizeCanvas(); 
        initStarsAndComets(); 
        animateCosmicBackground(); 
    }


    // --- Gallery Carousel & Lightbox Logic ---
    const carousel = document.getElementById('image-carousel');
    const prevButton = document.getElementById('prev-slide');
    const nextButton = document.getElementById('next-slide');
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxClose = document.getElementById('lightbox-close');
    const adminGalleryControls = document.getElementById('admin-gallery-controls');
    const newImageUrlInput = document.getElementById('new-image-url');
    const newImageAltInput = document.getElementById('new-image-alt');
    const addImageBtn = document.getElementById('add-image-btn');

    let galleryImages = []; 
    let currentIndex = 0;
    let itemsPerPage = 3; // Default for desktop

    function updateItemsPerPage() {
        if (window.innerWidth < 640) { // Tailwind 'sm' breakpoint
            itemsPerPage = 1;
        } else if (window.innerWidth < 768) { // Tailwind 'md' breakpoint
            itemsPerPage = 2;
        } else {
            itemsPerPage = 3;
        }
    }


    const prevArrowSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>`;
    const nextArrowSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>`;
    
    if (prevButton) prevButton.innerHTML = prevArrowSVG;
    if (nextButton) nextButton.innerHTML = nextArrowSVG;

    async function fetchGalleryImages() {
        if (!db) {
            console.warn("Firestore not available for gallery images. Using fallback.");
            galleryImages = [ 
                { src: "./images/artwork/spacejamz-alt.png", alt: "SpaceJamz Artwork - Alt Logo", id: "default1" },
                { src: "./images/artwork/spaceman.jpg", alt: "SpaceJamz Artwork - Spaceman", id: "default2" },
                { src: "./images/artwork/spacejamz-logo.png", alt: "SpaceJamz Logo Original", id: "default3" },
                { src: "./images/artwork/spacejamz-discord-alt.png", alt: "SpaceJamz Discord Alt", id: "default4" },
                { src: "./images/artwork/spaceman-kreepin.jpg", alt: "Spaceman Kreepin", id: "default5" },
                { src: "./images/artwork/edmspace.jpg", alt: "EDM Space", id: "default6" },
            ];
            updateItemsPerPage(); // Call before rendering
            renderCarousel();
            return;
        }
        try {
            // MODIFIED: Removed .orderBy("timestamp", "desc")
            const snapshot = await db.collection("galleryImages").get(); 
            galleryImages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // If you need to sort by timestamp, do it here in JS:
            // galleryImages.sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));

            if (galleryImages.length === 0) { 
                 galleryImages = [ 
                    { src: "./images/artwork/spacejamz-alt.png", alt: "SpaceJamz Artwork - Alt Logo", id: "default1" },
                    { src: "./images/artwork/spaceman.jpg", alt: "SpaceJamz Artwork - Spaceman", id: "default2" },
                 ];
            }
        } catch (error) {
            console.error("Error fetching gallery images: ", error);
             galleryImages = [ 
                { src: "./images/artwork/spacejamz-alt.png", alt: "SpaceJamz Artwork - Alt Logo", id: "default1" },
                { src: "./images/artwork/spaceman.jpg", alt: "SpaceJamz Artwork - Spaceman", id: "default2" },
             ];
        }
        updateItemsPerPage(); // Call before rendering
        renderCarousel();
    }

    function renderCarousel() {
        if (!carousel) return;
        carousel.innerHTML = ''; 
        
        galleryImages.forEach((image) => { 
            const item = document.createElement('div');
            // Adjust width based on itemsPerPage
            if (itemsPerPage === 1) {
                item.className = 'carousel-item flex-none w-full p-2';
            } else if (itemsPerPage === 2) {
                item.className = 'carousel-item flex-none w-1/2 p-2';
            } else {
                item.className = 'carousel-item flex-none w-1/3 p-2';
            }
            
            const card = document.createElement('div');
            card.className = 'card aspect-square overflow-hidden p-0 relative group'; 
            
            const imgElement = document.createElement('img');
            imgElement.src = image.src;
            imgElement.alt = image.alt;
            imgElement.className = 'gallery-img cursor-pointer';
            imgElement.dataset.lightboxSrc = image.src; 
            imgElement.onerror = function() { 
                this.onerror=null; this.src='https://placehold.co/600x600/1E0C4B/E0E7FF?text=Error'; 
                console.error('Gallery image not found: ' + image.src);
            };

            card.appendChild(imgElement);

            if (auth && auth.currentUser && adminGalleryControls && !adminGalleryControls.classList.contains('hidden')) {
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '×';
                deleteBtn.className = 'absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white text-xs p-1 rounded-full leading-none z-10 opacity-0 group-hover:opacity-100 transition-opacity';
                deleteBtn.title = "Delete Image";
                deleteBtn.onclick = (e) => { e.stopPropagation(); deleteGalleryImage(image.id); }; 
                card.appendChild(deleteBtn);
            }

            item.appendChild(card);
            carousel.appendChild(item);
        });
        updateCarouselView(); 
        addLightboxListeners();
    }
    
    function updateCarouselView() {
        if (!carousel) return;
        const itemWidthPercentage = 100 / itemsPerPage;
        carousel.style.transform = `translateX(-${currentIndex * itemWidthPercentage}%)`;
        updateCarouselButtons();
    }

    function updateCarouselButtons() {
        if (!prevButton || !nextButton) return;
        prevButton.disabled = currentIndex === 0;
        prevButton.classList.toggle('opacity-30', currentIndex === 0);
        prevButton.classList.toggle('cursor-not-allowed', currentIndex === 0);

        const lastPossibleIndexToStartSlide = galleryImages.length - itemsPerPage;
        nextButton.disabled = galleryImages.length <= itemsPerPage || currentIndex >= lastPossibleIndexToStartSlide;
        nextButton.classList.toggle('opacity-30', nextButton.disabled);
        nextButton.classList.toggle('cursor-not-allowed', nextButton.disabled);
    }

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarouselView();
            }
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (currentIndex < galleryImages.length - itemsPerPage) {
                currentIndex++;
                updateCarouselView();
            }
        });
    }

    window.addEventListener('resize', () => {
        const oldItemsPerPage = itemsPerPage;
        updateItemsPerPage();
        if (oldItemsPerPage !== itemsPerPage) {
            currentIndex = 0; 
            renderCarousel(); 
        } else {
            updateCarouselView(); 
        }
    });
    
    function addLightboxListeners() {
        document.querySelectorAll('.gallery-img').forEach(img => {
            img.addEventListener('click', function() {
                if (lightboxImage && lightboxModal) {
                    lightboxImage.src = this.dataset.lightboxSrc;
                    lightboxModal.classList.remove('hidden');
                    lightboxModal.classList.add('flex'); 
                }
            });
        });
    }

    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => {
            if (lightboxModal) {
                lightboxModal.classList.add('hidden');
                lightboxModal.classList.remove('flex');
            }
            if (lightboxImage) lightboxImage.src = ''; 
        });
    }

    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) {
                lightboxModal.classList.add('hidden');
                lightboxModal.classList.remove('flex');
                if (lightboxImage) lightboxImage.src = '';
            }
        });
    }

    // --- Testimonials Logic ---
    const testimonialForm = document.getElementById('testimonial-form');
    const testimonialsList = document.getElementById('testimonials-list');
    const testimonialMessage = document.getElementById('testimonial-message');

    async function fetchTestimonials() {
        if (!db || !testimonialsList) {
            if(testimonialsList) testimonialsList.innerHTML = '<p class="text-center text-gray-400">Database not connected. Signals cannot be loaded.</p>';
            return;
        }
        testimonialsList.innerHTML = '<p class="text-center text-gray-400">Loading signals...</p>';
        try {
            // MODIFIED: Removed .orderBy("timestamp", "desc")
            const snapshot = await db.collection("testimonials").where("approved", "==", true).get();
            
            let fetchedTestimonials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Optional: Sort in JavaScript if timestamps exist and are needed.
            // Ensure timestamp exists and is a Firestore Timestamp object before calling toMillis()
            fetchedTestimonials.sort((a, b) => {
                const timeA = a.timestamp && a.timestamp.toMillis ? a.timestamp.toMillis() : 0;
                const timeB = b.timestamp && b.timestamp.toMillis ? b.timestamp.toMillis() : 0;
                return timeB - timeA; // Sort descending
            });

            if (fetchedTestimonials.length === 0) {
                testimonialsList.innerHTML = '<p class="text-center text-gray-400">No signals received yet. Be the first!</p>';
                return;
            }
            testimonialsList.innerHTML = ''; 
            fetchedTestimonials.forEach(testimonialData => { // Use the mapped data
                const card = document.createElement('div');
                card.className = 'testimonial-card group relative'; 
                card.innerHTML = `
                    <p>"${testimonialData.text.replace(/\n/g, '<br>')}"</p> 
                    <p class="testimonial-author">- ${testimonialData.name}</p>
                `;
                if (auth && auth.currentUser && adminGalleryControls && !adminGalleryControls.classList.contains('hidden')) { 
                    const deleteBtn = document.createElement('button');
                    deleteBtn.innerHTML = '× Delete';
                    deleteBtn.className = 'btn-danger text-xs absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity';
                    deleteBtn.onclick = (e) => { e.stopPropagation(); deleteTestimonial(testimonialData.id); }; // Use testimonialData.id
                    card.appendChild(deleteBtn);
                }
                testimonialsList.appendChild(card);
            });
        } catch (error) {
            console.error("Error fetching testimonials: ", error);
            testimonialsList.innerHTML = '<p class="text-center text-red-400">Could not load signals. Please try again later.</p>';
        }
    }

    if (testimonialForm) {
        testimonialForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!db) {
                if(testimonialMessage) {
                    testimonialMessage.textContent = "Database not connected. Submission failed.";
                    testimonialMessage.className = "text-center mt-4 text-sm text-red-400";
                }
                return;
            }
            const name = testimonialForm.name.value.trim();
            const text = testimonialForm.text.value.trim();
            if (!name || !text) {
                if(testimonialMessage) {
                    testimonialMessage.textContent = "Please fill out all fields.";
                    testimonialMessage.className = "text-center mt-4 text-sm text-red-400";
                }
                return;
            }
            try {
                await db.collection("testimonials").add({
                    name: name,
                    text: text,
                    approved: false, 
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                if(testimonialMessage) {
                    testimonialMessage.textContent = "Signal received! Awaiting cosmic alignment (approval).";
                    testimonialMessage.className = "text-center mt-4 text-sm text-green-400";
                }
                testimonialForm.reset();
                 // After submitting a new testimonial, if admin, reload unapproved ones
                if (auth && auth.currentUser) {
                    loadUnapprovedTestimonials();
                }
            } catch (error) {
                console.error("Error submitting testimonial: ", error);
                if(testimonialMessage) {
                    testimonialMessage.textContent = "Error sending signal. Please try again.";
                    testimonialMessage.className = "text-center mt-4 text-sm text-red-400";
                }
            }
        });
    }

    // --- Admin Logic ---
    const adminStatusDiv = document.getElementById('admin-status');
    const adminStatusMobileDiv = document.getElementById('admin-status-mobile');
    const adminLoginModal = document.getElementById('admin-login-modal');
    const adminLoginForm = document.getElementById('admin-login-form');
    const closeAdminLoginModalBtn = document.getElementById('close-admin-login-modal');
    const adminLoginMessage = document.getElementById('admin-login-message');
    const unapprovedTestimonialsContainer = document.getElementById('unapproved-testimonials-container'); 


    function setupAdminUI(user) {
        const adminControlsContent = user ? 
            `<button id="admin-logout-btn" class="btn-secondary-inline">Admin Logout</button>` :
            `<button id="admin-login-prompt-btn" class="btn-secondary-inline">Admin</button>`;

        if (adminStatusDiv) adminStatusDiv.innerHTML = adminControlsContent;
        if (adminStatusMobileDiv) adminStatusMobileDiv.innerHTML = adminControlsContent; 

        const logoutBtns = document.querySelectorAll('#admin-logout-btn');
        const loginPromptBtns = document.querySelectorAll('#admin-login-prompt-btn');

        if (user) {
            logoutBtns.forEach(btn => btn.addEventListener('click', adminLogout));
            if (adminGalleryControls) adminGalleryControls.classList.remove('hidden');
            if (unapprovedTestimonialsContainer) unapprovedTestimonialsContainer.innerHTML = ''; 
            loadUnapprovedTestimonials(); 
        } else { 
            loginPromptBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    if(adminLoginModal) adminLoginModal.classList.remove('hidden');
                    if(adminLoginModal) adminLoginModal.classList.add('flex'); 
                });
            });
            if (adminGalleryControls) adminGalleryControls.classList.add('hidden');
            if (unapprovedTestimonialsContainer) unapprovedTestimonialsContainer.innerHTML = ''; 
        }
        renderCarousel(); 
        fetchTestimonials();
    }
    
    if (auth) {
        auth.onAuthStateChanged(user => {
            setupAdminUI(user);
        });
    } else {
        setupAdminUI(null); 
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!auth) {
                if(adminLoginMessage) {
                    adminLoginMessage.textContent = "Authentication service not available.";
                    adminLoginMessage.className = "text-center mt-4 text-sm text-red-400";
                }
                return;
            }
            const email = adminLoginForm['admin-email'].value;
            const password = adminLoginForm['admin-password'].value;
            try {
                await auth.signInWithEmailAndPassword(email, password);
                if(adminLoginModal) {
                     adminLoginModal.classList.add('hidden');
                     adminLoginModal.classList.remove('flex');
                }
                if(adminLoginMessage) adminLoginMessage.textContent = "";
            } catch (error) {
                console.error("Admin login error:", error);
                if(adminLoginMessage) {
                    adminLoginMessage.textContent = "Login failed: " + error.message.replace("Firebase: ", "");
                    adminLoginMessage.className = "text-center mt-4 text-sm text-red-400";
                }
            }
        });
    }

    if (closeAdminLoginModalBtn) {
        closeAdminLoginModalBtn.addEventListener('click', () => {
            if(adminLoginModal) {
                adminLoginModal.classList.add('hidden');
                adminLoginModal.classList.remove('flex');
            }
            if(adminLoginMessage) adminLoginMessage.textContent = "";
        });
    }
    if (adminLoginModal) {
        adminLoginModal.addEventListener('click', (e) => {
            if (e.target === adminLoginModal) { 
                adminLoginModal.classList.add('hidden');
                adminLoginModal.classList.remove('flex');
                if (adminLoginMessage) adminLoginMessage.textContent = "";
            }
        });
    }
    
    async function adminLogout() {
        if (!auth) return;
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Admin logout error:", error);
        }
    }

    async function loadUnapprovedTestimonials() {
        if (!db || !auth || !auth.currentUser || !unapprovedTestimonialsContainer) {
            if(unapprovedTestimonialsContainer) unapprovedTestimonialsContainer.innerHTML = ''; 
            return;
        }
        unapprovedTestimonialsContainer.innerHTML = '<h3 class="font-orbitron text-xl text-accent-pink my-6 text-center section-title">Awaiting Approval</h3>';
        try {
            // MODIFIED: Removed .orderBy("timestamp", "asc")
            const snapshot = await db.collection("testimonials").where("approved", "==", false).get();
            
            let unapproved = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Optional: Sort in JavaScript if timestamps exist and are needed.
            // Ensure timestamp exists and is a Firestore Timestamp object before calling toMillis()
             unapproved.sort((a, b) => {
                const timeA = a.timestamp && a.timestamp.toMillis ? a.timestamp.toMillis() : 0;
                const timeB = b.timestamp && b.timestamp.toMillis ? b.timestamp.toMillis() : 0;
                return timeA - timeB; // Sort ascending
            });

            if (unapproved.length === 0) {
                unapprovedTestimonialsContainer.innerHTML += '<p class="text-center text-gray-400 mb-8">No new signals to align.</p>';
            } else {
                const listEl = document.createElement('div');
                listEl.className = "space-y-4 mb-8";
                unapproved.forEach(testimonialData => { // Use the mapped data
                    const item = document.createElement('div');
                    item.className = 'testimonial-card p-4 text-sm'; 
                    item.innerHTML = `
                        <p>"${testimonialData.text.replace(/\n/g, '<br>')}"</p>
                        <p class="testimonial-author">- ${testimonialData.name}</p>
                        <div class="admin-actions mt-3 text-right">
                            <button data-id="${testimonialData.id}" class="btn-primary-small mr-2 approve-testimonial-btn">Approve</button>
                            <button data-id="${testimonialData.id}" class="btn-danger delete-testimonial-btn">Delete</button>
                        </div>
                    `;
                    listEl.appendChild(item);
                });
                unapprovedTestimonialsContainer.appendChild(listEl);
                document.querySelectorAll('.approve-testimonial-btn').forEach(btn => {
                    btn.addEventListener('click', () => approveTestimonial(btn.dataset.id));
                });
                document.querySelectorAll('.delete-testimonial-btn').forEach(btn => {
                    btn.addEventListener('click', () => deleteTestimonial(btn.dataset.id));
                });
            }
        } catch (error) {
            console.error("Error loading unapproved testimonials:", error);
            unapprovedTestimonialsContainer.innerHTML += '<p class="text-center text-red-400">Error loading signals for approval.</p>';
        }
    }

    window.approveTestimonial = async function(id) {
        if (!db || !auth || !auth.currentUser) return;
        try {
            await db.collection("testimonials").doc(id).update({ approved: true });
            fetchTestimonials(); 
            loadUnapprovedTestimonials(); 
        } catch (error) { console.error("Error approving testimonial:", error); }
    }
    window.deleteTestimonial = async function(id) {
        if (!db || !auth || !auth.currentUser) return;
        try {
            await db.collection("testimonials").doc(id).delete();
            fetchTestimonials();
            loadUnapprovedTestimonials();
        } catch (error) { console.error("Error deleting testimonial:", error); }
    }

    if (addImageBtn) {
        addImageBtn.addEventListener('click', async () => {
            if (!db || !auth || !auth.currentUser || !newImageUrlInput || !newImageAltInput) return;
            const imageUrl = newImageUrlInput.value.trim();
            const altText = newImageAltInput.value.trim();
            if (!imageUrl || !altText) {
                console.warn("Please provide both image URL and alt text for gallery addition."); 
                return;
            }
            try {
                await db.collection("galleryImages").add({
                    src: imageUrl,
                    alt: altText,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                newImageUrlInput.value = '';
                newImageAltInput.value = '';
                fetchGalleryImages(); 
                console.log("Image added to gallery by admin.");
            } catch (error) {
                console.error("Error adding image to gallery:", error);
            }
        });
    }
     window.deleteGalleryImage = async function(id) { 
        if (!db || !auth || !auth.currentUser) return;
        try {
            await db.collection("galleryImages").doc(id).delete();
            fetchGalleryImages(); 
        } catch (error) { console.error("Error deleting gallery image:", error); }
    }

    // Initial data fetches
    fetchGalleryImages(); 
    fetchTestimonials(); 

    // Set current year in footer
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});
