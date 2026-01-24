/**
 * Skilled Works - Main JavaScript
 * Gallery Strip Animation & Interaction
 *
 * Desktop: Click strip to expand, close button to return
 * Mobile: Tap to change featured strip
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

  // Constants
  const MOBILE_BREAKPOINT = 600;

  /**
   * Initialize the gallery
   */
  function init() {
    galleryStrips = document.querySelector('.gallery-strips');
    strips = document.querySelectorAll('.strip');
    galleryExpanded = document.querySelector('.gallery-expanded');
    expandedImage = document.querySelector('.expanded-image');
    galleryClose = document.querySelector('.gallery-close');
    galleryCaption = document.querySelector('.gallery-caption');
    mobileCaption = document.querySelector('.mobile-caption');

    if (!galleryStrips || strips.length === 0) return;

    checkViewport();
    window.addEventListener('resize', debounce(checkViewport, 150));

    strips.forEach(function(strip, index) {
      strip.addEventListener('click', function() {
        handleStripClick(index);
      });
    });

    if (galleryClose) {
      galleryClose.addEventListener('click', closeGallery);
    }

    document.addEventListener('keydown', handleKeydown);
  }

  /**
   * Check viewport and initialize appropriate mode
   */
  function checkViewport() {
    var wasMobile = isMobile;
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
   * Initialize mobile mode
   */
  function initMobileMode() {
    closeGallery();
    featuredIndex = Math.floor(Math.random() * galleryData.length);
    updateFeaturedStrip();
  }

  /**
   * Initialize desktop mode
   */
  function initDesktopMode() {
    strips.forEach(function(strip) {
      strip.classList.remove('is-featured');
    });
    if (mobileCaption) {
      mobileCaption.classList.remove('is-visible');
      mobileCaption.textContent = '';
    }
    featuredIndex = 0;
  }

  /**
   * Update featured strip (mobile)
   */
  function updateFeaturedStrip() {
    strips.forEach(function(strip, index) {
      strip.classList.toggle('is-featured', index === featuredIndex);
    });

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
      if (index !== featuredIndex) {
        featuredIndex = index;
        updateFeaturedStrip();
      }
      // Do nothing if tapping already featured strip
    } else {
      currentIndex = index;
      expandGallery(index);
    }
  }

  /**
   * Expand gallery to show full image (desktop)
   */
  function expandGallery(index) {
    if (isAnimating || !galleryExpanded) return;
    isAnimating = true;
    isExpanded = true;
    currentIndex = index;

    var data = galleryData[index];

    galleryStrips.classList.add('is-animating');
    strips[index].classList.add('is-active');

    expandedImage.style.backgroundImage = 'url(' + data.image + ')';
    galleryCaption.textContent = data.caption;

    setTimeout(function() {
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

    galleryExpanded.classList.remove('is-visible');
    galleryExpanded.setAttribute('aria-hidden', 'true');

    setTimeout(function() {
      galleryStrips.classList.remove('is-animating');
      strips.forEach(function(strip) {
        strip.classList.remove('is-active');
      });

      isExpanded = false;
      currentIndex = -1;
      isAnimating = false;

      if (isMobile) {
        updateFeaturedStrip();
      }
    }, 300);
  }

  /**
   * Handle keyboard navigation (desktop only)
   */
  function handleKeydown(e) {
    if (isMobile || !isExpanded) return;

    if (e.key === 'Escape') {
      closeGallery();
    } else if (e.key === 'ArrowLeft') {
      navigateDesktop(-1);
    } else if (e.key === 'ArrowRight') {
      navigateDesktop(1);
    }
  }

  /**
   * Navigate in desktop expanded view
   */
  function navigateDesktop(direction) {
    if (isAnimating || !isExpanded) return;

    var newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= galleryData.length) return;

    isAnimating = true;
    currentIndex = newIndex;

    strips.forEach(function(strip) {
      strip.classList.remove('is-active');
    });
    strips[currentIndex].classList.add('is-active');

    galleryCaption.style.opacity = '0';
    expandedImage.style.opacity = '0';

    setTimeout(function() {
      var data = galleryData[currentIndex];
      expandedImage.style.backgroundImage = 'url(' + data.image + ')';
      galleryCaption.textContent = data.caption;
      expandedImage.style.opacity = '1';
      galleryCaption.style.opacity = '1';
      isAnimating = false;
    }, 200);
  }

  /**
   * Debounce helper
   */
  function debounce(func, wait) {
    var timeout;
    return function() {
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(null, args);
      }, wait);
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
