/**
 * Skilled Works - Main JavaScript
 * Gallery Strip Animation & Interaction
 *
 * Desktop: Click strip to expand, close button to return
 * Mobile: Cover Flow - swipe or tap to change featured strip (no expand)
 */

(function() {
  'use strict';

  // Gallery data with captions
  const galleryData = [
    {
      image: 'https://images.unsplash.com/photo-1577720643272-265f09367456?w=1200',
      caption: 'National Gallery Installation — Large-scale artwork mounting'
    },
    {
      image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=1200',
      caption: 'Modern Architecture Display — Commercial space installation'
    },
    {
      image: 'https://images.unsplash.com/photo-1572947650440-e8a97ef053b2?w=1200',
      caption: 'Gallery Wall Arrangement — Curated residential collection'
    },
    {
      image: 'https://images.unsplash.com/photo-1574182245530-967d9b3831af?w=1200',
      caption: 'Contemporary Art Hanging — Mixed media installation'
    },
    {
      image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200',
      caption: 'Bold Statement Pieces — Feature wall design'
    },
    {
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
      caption: 'Residential Art Display — Private collection installation'
    },
    {
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200',
      caption: 'Sculpture Installation — 3D artwork mounting'
    },
    {
      image: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1200',
      caption: 'Natural Light Gallery — Heritage building installation'
    },
    {
      image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200',
      caption: 'Custom Framing Project — Bespoke frame and mounting'
    }
  ];

  // DOM Elements
  let galleryStrips;
  let strips;
  let galleryExpanded;
  let expandedImage;
  let galleryClose;
  let galleryCaption;
  let mobileCaption;

  // State
  let currentIndex = -1;
  let featuredIndex = 0;
  let isExpanded = false;
  let isAnimating = false;
  let isMobile = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let inertiaAnimationId = null;

  // Constants
  const MOBILE_BREAKPOINT = 600;
  const SWIPE_THRESHOLD = 30;
  const VELOCITY_THRESHOLD = 0.3; // pixels per ms
  const FRICTION = 0.92; // deceleration factor
  const MIN_VELOCITY = 0.5; // stop inertia below this

  /**
   * Initialize the gallery
   */
  function init() {
    // Cache DOM elements
    galleryStrips = document.querySelector('.gallery-strips');
    strips = document.querySelectorAll('.strip');
    galleryExpanded = document.querySelector('.gallery-expanded');
    expandedImage = document.querySelector('.expanded-image');
    galleryClose = document.querySelector('.gallery-close');
    galleryCaption = document.querySelector('.gallery-caption');
    mobileCaption = document.querySelector('.mobile-caption');

    if (!galleryStrips || strips.length === 0) return;

    // Check viewport and set up appropriate mode
    checkViewport();
    window.addEventListener('resize', debounce(handleResize, 150));

    // Attach event listeners
    strips.forEach((strip, index) => {
      strip.addEventListener('click', () => handleStripClick(index));
    });

    if (galleryClose) {
      galleryClose.addEventListener('click', closeGallery);
    }

    // Keyboard navigation (desktop)
    document.addEventListener('keydown', handleKeydown);

    // Touch/swipe support
    galleryStrips.addEventListener('touchstart', handleTouchStart, { passive: true });
    galleryStrips.addEventListener('touchend', handleTouchEnd, { passive: true });
  }

  /**
   * Check viewport and initialize appropriate mode
   */
  function checkViewport() {
    const wasMobile = isMobile;
    isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

    if (isMobile !== wasMobile) {
      if (isMobile) {
        initMobileMode();
      } else {
        initDesktopMode();
      }
    }
  }

  /**
   * Handle resize
   */
  function handleResize() {
    checkViewport();
  }

  /**
   * Initialize mobile Cover Flow mode
   */
  function initMobileMode() {
    // Reset desktop state
    closeGallery();

    // Set random featured strip on load
    featuredIndex = Math.floor(Math.random() * galleryData.length);
    updateFeaturedStrip();
  }

  /**
   * Initialize desktop mode
   */
  function initDesktopMode() {
    // Clear mobile classes
    strips.forEach(strip => strip.classList.remove('is-featured'));
    if (mobileCaption) {
      mobileCaption.classList.remove('is-visible');
      mobileCaption.textContent = '';
    }
    featuredIndex = 0;
  }

  /**
   * Update featured strip (mobile Cover Flow)
   */
  function updateFeaturedStrip() {
    strips.forEach((strip, index) => {
      strip.classList.toggle('is-featured', index === featuredIndex);
    });

    // Update mobile caption
    if (mobileCaption) {
      mobileCaption.textContent = galleryData[featuredIndex].caption;
      mobileCaption.classList.add('is-visible');
    }
  }

  /**
   * Handle strip click
   */
  function handleStripClick(index) {
    if (isAnimating) return;

    if (isMobile) {
      // Mobile: Tap any strip to make it featured (no expand)
      if (index !== featuredIndex) {
        featuredIndex = index;
        updateFeaturedStrip();
      }
    } else {
      // Desktop: Expand clicked strip
      currentIndex = index;
      expandGallery(index);
    }
  }

  /**
   * Expand gallery to show full image (desktop behavior)
   */
  function expandGallery(index) {
    if (isAnimating || !galleryExpanded) return;
    isAnimating = true;
    isExpanded = true;
    currentIndex = index;

    const data = galleryData[index];

    // Add animating class to trigger strip collapse
    galleryStrips.classList.add('is-animating');
    strips[index].classList.add('is-active');

    // Set the expanded image and caption
    expandedImage.style.backgroundImage = `url('${data.image}')`;
    galleryCaption.textContent = data.caption;

    // Show expanded view after strip animation
    setTimeout(() => {
      galleryExpanded.classList.add('is-visible');
      galleryExpanded.setAttribute('aria-hidden', 'false');
      isAnimating = false;
    }, 400);
  }

  /**
   * Close gallery and return to strip view
   */
  function closeGallery() {
    if (isAnimating || !isExpanded || !galleryExpanded) return;
    isAnimating = true;

    // Hide expanded view first
    galleryExpanded.classList.remove('is-visible');
    galleryExpanded.setAttribute('aria-hidden', 'true');

    // Remove animating class after a delay to reverse strip animation
    setTimeout(() => {
      galleryStrips.classList.remove('is-animating');
      strips.forEach(strip => strip.classList.remove('is-active'));

      isExpanded = false;
      currentIndex = -1;
      isAnimating = false;

      // Restore mobile featured state if in mobile mode
      if (isMobile) {
        updateFeaturedStrip();
      }
    }, 300);
  }

  /**
   * Handle keyboard navigation
   */
  function handleKeydown(e) {
    if (isMobile) return; // Keyboard nav is desktop only
    if (!isExpanded) return;

    switch (e.key) {
      case 'Escape':
        closeGallery();
        break;
      case 'ArrowLeft':
        navigateDesktop(-1);
        break;
      case 'ArrowRight':
        navigateDesktop(1);
        break;
    }
  }

  /**
   * Navigate in desktop expanded view
   */
  function navigateDesktop(direction) {
    if (isAnimating || !isExpanded) return;

    const newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= galleryData.length) return;

    isAnimating = true;
    currentIndex = newIndex;

    // Update active strip
    strips.forEach(strip => strip.classList.remove('is-active'));
    strips[currentIndex].classList.add('is-active');

    // Fade transition
    galleryCaption.style.opacity = '0';
    expandedImage.style.opacity = '0';

    setTimeout(() => {
      const data = galleryData[currentIndex];
      expandedImage.style.backgroundImage = `url('${data.image}')`;
      galleryCaption.textContent = data.caption;
      expandedImage.style.opacity = '1';
      galleryCaption.style.opacity = '1';
      isAnimating = false;
    }, 200);
  }

  /**
   * Touch start handler
   */
  function handleTouchStart(e) {
    // Cancel any ongoing inertia animation
    if (inertiaAnimationId) {
      cancelAnimationFrame(inertiaAnimationId);
      inertiaAnimationId = null;
    }

    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    touchStartTime = Date.now();
  }

  /**
   * Touch end handler
   */
  function handleTouchEnd(e) {
    if (!isMobile) return;

    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const touchEndTime = Date.now();

    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    const timeDiff = touchEndTime - touchStartTime;

    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(diffX) < SWIPE_THRESHOLD || Math.abs(diffY) > Math.abs(diffX)) {
      return;
    }

    // Calculate velocity (pixels per millisecond)
    const velocity = diffX / timeDiff;

    // Start inertia animation
    startInertia(velocity);
  }

  /**
   * Start inertia scrolling animation
   */
  function startInertia(initialVelocity) {
    let velocity = initialVelocity;
    let accumulated = 0;
    const stripWidth = 100; // virtual "width" per strip for accumulation

    function animateInertia() {
      // Apply friction
      velocity *= FRICTION;

      // Accumulate movement
      accumulated += velocity * 16; // approximate 16ms per frame

      // Check if we've accumulated enough to move one strip
      while (Math.abs(accumulated) >= stripWidth) {
        const direction = accumulated > 0 ? 1 : -1;
        const newIndex = featuredIndex + direction;

        // Stop at ends
        if (newIndex < 0 || newIndex >= galleryData.length) {
          velocity = 0;
          accumulated = 0;
          break;
        }

        featuredIndex = newIndex;
        updateFeaturedStrip();
        accumulated -= direction * stripWidth;
      }

      // Continue animation if velocity is still significant
      if (Math.abs(velocity) > MIN_VELOCITY && featuredIndex > 0 && featuredIndex < galleryData.length - 1) {
        inertiaAnimationId = requestAnimationFrame(animateInertia);
      } else {
        inertiaAnimationId = null;
      }
    }

    // Only start inertia if velocity is above threshold
    if (Math.abs(initialVelocity) > VELOCITY_THRESHOLD) {
      inertiaAnimationId = requestAnimationFrame(animateInertia);
    } else {
      // Below threshold, just move one strip
      const direction = initialVelocity > 0 ? 1 : -1;
      navigateMobile(direction);
    }
  }

  /**
   * Navigate Cover Flow (mobile) - single step
   */
  function navigateMobile(direction) {
    const newIndex = featuredIndex + direction;

    if (newIndex < 0 || newIndex >= galleryData.length) return;

    featuredIndex = newIndex;
    updateFeaturedStrip();
  }

  /**
   * Debounce helper
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
