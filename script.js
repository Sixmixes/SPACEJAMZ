// script.js for SpaceJamz EPK

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Initialization ---
    let db, auth;
    try {
        if (window.firebase && typeof window.firebaseConfig !== 'undefined' && window.firebaseConfig.apiKey !== "YOUR_API_KEY" && window.firebaseConfig.apiKey !== "AIzaSyDa-jQTxqYhayBuYysKrr4qr_WukRWvy_g") { // Added your specific placeholder
            // Check if Firebase is already initialized to prevent re-initialization errors
            if (!firebase.apps.length) {
                firebase.initializeApp(window.firebaseConfig);
                console.log("Firebase initialized successfully.");
            } else {
                firebase.app(); // if already initialized, use that app
                console.log("Firebase was already initialized.");
            }
            db = firebase.firestore();
            auth = firebase.auth();
            // firebase.firestore.setLogLevel('debug'); 
        } else {
            if (window.firebaseConfig && (window.firebaseConfig.apiKey === "YOUR_API_KEY" || window.firebaseConfig.apiKey === "AIzaSyDa-jQTxqYhayBuYysKrr4qr_WukRWvy_g")) {
                console.warn("Firebase config is using placeholder values. Dynamic features requiring Firebase will be limited.");
            } else {
                console.error("Firebase SDK or config not found/incomplete. Dynamic features requiring Firebase will be limited.");
            }
        }
    } catch (error) {
        console.error("Error initializing Firebase:", error);
    }

    // --- Navbar Scroll Effect ---
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // --- Smooth Scroll for Nav Links & Active State ---
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main section[id]');

    if (navLinks.length > 0 && sections.length > 0 && navbar) {
        navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    const navbarHeight = navbar.offsetHeight;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        function updateActiveNavLink() {
            let currentSectionId = '';
            const navbarHeight = navbar.offsetHeight;

            sections.forEach(section => {
                const sectionTop = section.offsetTop - navbarHeight - 15; 
                if (window.pageYOffset >= sectionTop) {
                    currentSectionId = section.getAttribute('id');
                }
            });

            if (sections.length > 0 && window.pageYOffset < (sections[0].offsetTop - navbarHeight - 15) && window.pageYOffset < 100) { 
                 currentSectionId = ''; 
            }


            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').substring(1) === currentSectionId) {
                    link.classList.add('active');
                }
            });
        }
        window.addEventListener('scroll', updateActiveNavLink);
        updateActiveNavLink(); 
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
            requestAnimationFrame(animateCosmicBackground);
        }
        
        window.addEventListener('resize', () => { 
            resizeCanvas();
            initStarsAndComets(); 
        });
        resizeCanvas(); // Initial call
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
    const itemsPerPage = 3; 

    const prevArrowSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>`;
    const nextArrowSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>`;
    
    if (prevButton) prevButton.innerHTML = prevArrowSVG;
    if (nextButton) nextButton.innerHTML = nextArrowSVG;

    async function fetchGalleryImages() {
        if (!db) {
            console.warn("Firestore not available for gallery images. Using fallback.");
            galleryImages = [ // Ensure these paths are correct for your GitHub Pages structure
                { src: "./images/artwork/spacejamz-alt.png", alt: "SpaceJamz Artwork - Alt Logo", id: "default1" },
                { src: "./images/artwork/spaceman.jpg", alt: "SpaceJamz Artwork - Spaceman", id: "default2" },
                { src: "./images/artwork/spacejamz-logo.png", alt: "SpaceJamz Logo Original", id: "default3" },
                { src: "./images/artwork/spacejamz-discord-alt.png", alt: "SpaceJamz Discord Alt", id: "default4" },
                { src: "./images/artwork/spaceman-kreepin.jpg", alt: "Spaceman Kreepin", id: "default5" },
                { src: "./images/artwork/edmspace.jpg", alt: "EDM Space", id: "default6" },
            ];
            renderCarousel();
            return;
        }
        try {
            const snapshot = await db.collection("galleryImages").orderBy("timestamp", "desc").get();
            galleryImages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (galleryImages.length === 0) { 
                 galleryImages = [ // Fallback if Firestore is empty
                    { src: "./images/artwork/spacejamz-alt.png", alt: "SpaceJamz Artwork - Alt Logo", id: "default1" },
                    { src: "./images/artwork/spaceman.jpg", alt: "SpaceJamz Artwork - Spaceman", id: "default2" },
                 ];
            }
            renderCarousel();
        } catch (error) {
            console.error("Error fetching gallery images: ", error);
             galleryImages = [ // Fallback on error
                { src: "./images/artwork/spacejamz-alt.png", alt: "SpaceJamz Artwork - Alt Logo", id: "default1" },
                { src: "./images/artwork/spaceman.jpg", alt: "SpaceJamz Artwork - Spaceman", id: "default2" },
             ];
            renderCarousel();
        }
    }

    function renderCarousel() {
        if (!carousel) return;
        carousel.innerHTML = ''; 
        
        galleryImages.forEach((image) => { 
            const item = document.createElement('div');
            item.className = 'carousel-item flex-none w-full sm:w-1/2 md:w-1/3 p-2';
            
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
        const items = carousel.querySelectorAll('.carousel-item');
        items.forEach((item, i) => {
            if (i >= currentIndex && i < currentIndex + itemsPerPage) {
                item.classList.remove('hidden'); 
            } else {
                item.classList.add('hidden');    
            }
        });
        updateCarouselButtons();
    }

    function updateCarouselButtons() {
        if (!prevButton || !nextButton) return;
        prevButton.disabled = currentIndex === 0;
        prevButton.classList.toggle('opacity-30', currentIndex === 0);
        prevButton.classList.toggle('cursor-not-allowed', currentIndex === 0);

        const lastPossibleIndexToShow = galleryImages.length - itemsPerPage;
        nextButton.disabled = galleryImages.length <= itemsPerPage || currentIndex >= lastPossibleIndexToShow;
        nextButton.classList.toggle('opacity-30', nextButton.disabled);
        nextButton.classList.toggle('cursor-not-allowed', nextButton.disabled);
    }

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex = Math.max(0, currentIndex - 1); 
                updateCarouselView();
            }
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (currentIndex < galleryImages.length - itemsPerPage) {
                currentIndex = Math.min(galleryImages.length - itemsPerPage, currentIndex + 1); 
                updateCarouselView();
            } else if (galleryImages.length > itemsPerPage && currentIndex < galleryImages.length -1 && (galleryImages.length % itemsPerPage !== 0) ) {
                 currentIndex = galleryImages.length - itemsPerPage; 
                 updateCarouselView();
            }
        });
    }
    
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
            const snapshot = await db.collection("testimonials").where("approved", "==", true).orderBy("timestamp", "desc").get();
            if (snapshot.empty) {
                testimonialsList.innerHTML = '<p class="text-center text-gray-400">No signals received yet. Be the first!</p>';
                return;
            }
            testimonialsList.innerHTML = ''; 
            snapshot.forEach(doc => {
                const testimonial = doc.data();
                const card = document.createElement('div');
                card.className = 'testimonial-card group relative'; 
                card.innerHTML = `
                    <p>"${testimonial.text.replace(/\n/g, '<br>')}"</p> 
                    <p class="testimonial-author">- ${testimonial.name}</p>
                `;
                if (auth && auth.currentUser && adminGalleryControls && !adminGalleryControls.classList.contains('hidden')) { 
                    const deleteBtn = document.createElement('button');
                    deleteBtn.innerHTML = '× Delete';
                    deleteBtn.className = 'btn-danger text-xs absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity';
                    deleteBtn.onclick = (e) => { e.stopPropagation(); deleteTestimonial(doc.id); };
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
    const adminLoginModal = document.getElementById('admin-login-modal');
    const adminLoginForm = document.getElementById('admin-login-form');
    const closeAdminLoginModalBtn = document.getElementById('close-admin-login-modal');
    const adminLoginMessage = document.getElementById('admin-login-message');
    const unapprovedTestimonialsContainer = document.getElementById('unapproved-testimonials-container'); 


    function setupAdminUI(user) {
        if (!adminStatusDiv) return;
        if (user) { 
            adminStatusDiv.innerHTML = `<button id="admin-logout-btn" class="btn-secondary-inline">Admin Logout</button>`;
            const logoutBtn = document.getElementById('admin-logout-btn');
            if (logoutBtn) logoutBtn.addEventListener('click', adminLogout);
            
            if (adminGalleryControls) adminGalleryControls.classList.remove('hidden');
            if (unapprovedTestimonialsContainer) unapprovedTestimonialsContainer.innerHTML = ''; // Clear it before loading
            loadUnapprovedTestimonials(); 
        } else { 
            adminStatusDiv.innerHTML = `<button id="admin-login-prompt-btn" class="btn-secondary-inline">Admin</button>`;
            const loginPromptBtn = document.getElementById('admin-login-prompt-btn');
            if (loginPromptBtn) {
                loginPromptBtn.addEventListener('click', () => {
                    if(adminLoginModal) adminLoginModal.classList.remove('hidden');
                });
            }
            if (adminGalleryControls) adminGalleryControls.classList.add('hidden');
            if (unapprovedTestimonialsContainer) unapprovedTestimonialsContainer.innerHTML = ''; // Clear admin-only content
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
                if(adminLoginModal) adminLoginModal.classList.add('hidden');
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
            if(adminLoginModal) adminLoginModal.classList.add('hidden');
            if(adminLoginMessage) adminLoginMessage.textContent = "";
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
            const snapshot = await db.collection("testimonials").where("approved", "==", false).orderBy("timestamp", "asc").get();
            if (snapshot.empty) {
                unapprovedTestimonialsContainer.innerHTML += '<p class="text-center text-gray-400 mb-8">No new signals to align.</p>';
            } else {
                const listEl = document.createElement('div');
                listEl.className = "space-y-4 mb-8";
                snapshot.forEach(doc => {
                    const testimonial = doc.data();
                    const item = document.createElement('div');
                    item.className = 'testimonial-card p-4 text-sm'; 
                    item.innerHTML = `
                        <p>"${testimonial.text.replace(/\n/g, '<br>')}"</p>
                        <p class="testimonial-author">- ${testimonial.name}</p>
                        <div class="admin-actions mt-3 text-right">
                            <button data-id="${doc.id}" class="btn-primary-small mr-2 approve-testimonial-btn">Approve</button>
                            <button data-id="${doc.id}" class="btn-danger delete-testimonial-btn">Delete</button>
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
                console.warn("Please provide both image URL and alt text."); // Consider a user-facing message
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
                console.log("Image added to gallery!"); // Consider a user-facing success message
            } catch (error) {
                console.error("Error adding image to gallery:", error);
                console.error("Error adding image. See console."); // Consider a user-facing error message
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
});

