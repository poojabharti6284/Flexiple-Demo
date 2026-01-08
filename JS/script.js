/**
 * Flexiple Navbar - JavaScript Interactions
 * 
 * Features:
 * 1. Hover-based mega menu on desktop (with delay to prevent flicker)
 * 2. Click-based toggle on mobile
 * 3. Keyboard navigation (Tab, Enter, Escape, Arrow keys)
 * 4. ARIA attribute management
 * 5. Mobile menu toggle
 * 
 * @author Senior Frontend Engineer
 * @version 1.0.0
 */

(function () {
  'use strict';

  // ==========================================================================
  // Configuration
  // ==========================================================================

  const CONFIG = {
    // Delay before closing menu (prevents accidental close when moving between nav and menu)
    hoverCloseDelay: 150,
    // Breakpoint for mobile behavior
    mobileBreakpoint: 768,
    // CSS class names
    classes: {
      navItem: 'nav__item--has-dropdown',
      megaMenu: 'mega-menu',
      active: 'is-active',
      mobileOpen: 'is-open'
    },
    // ARIA attributes
    aria: {
      expanded: 'aria-expanded',
      haspopup: 'aria-haspopup'
    }
  };

  // ==========================================================================
  // State
  // ==========================================================================

  let closeTimeout = null;
  let currentOpenItem = null;

  // ==========================================================================
  // DOM References
  // ==========================================================================

  const header = document.querySelector('.header');
  const nav = document.querySelector('.nav');
  const navItems = document.querySelectorAll(`.${CONFIG.classes.navItem}`);
  const mobileToggle = document.querySelector('.header__mobile-toggle');

  // ==========================================================================
  // Utility Functions
  // ==========================================================================

  /**
   * Check if we're on mobile viewport
   * @returns {boolean}
   */
  function isMobile() {
    return window.innerWidth <= CONFIG.mobileBreakpoint;
  }

  /**
   * Clear any pending close timeout
   */
  function clearCloseTimeout() {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }
  }

  /**
   * Update ARIA expanded attribute
   * @param {HTMLElement} button - The nav button
   * @param {boolean} isExpanded - Whether menu is expanded
   */
  function setAriaExpanded(button, isExpanded) {
    button.setAttribute(CONFIG.aria.expanded, isExpanded.toString());
  }

  // ==========================================================================
  // Menu Open/Close Functions
  // ==========================================================================

  /**
   * Open a mega menu
   * @param {HTMLElement} navItem - The nav item containing the menu
   */
  function openMenu(navItem) {
    // Close any other open menu first
    if (currentOpenItem && currentOpenItem !== navItem) {
      closeMenu(currentOpenItem);
    }

    clearCloseTimeout();

    navItem.classList.add(CONFIG.classes.active);
    const button = navItem.querySelector('button');
    if (button) {
      setAriaExpanded(button, true);
    }

    currentOpenItem = navItem;
  }

  /**
   * Close a mega menu
   * @param {HTMLElement} navItem - The nav item containing the menu
   */
  function closeMenu(navItem) {
    navItem.classList.remove(CONFIG.classes.active);
    const button = navItem.querySelector('button');
    if (button) {
      setAriaExpanded(button, false);
    }

    if (currentOpenItem === navItem) {
      currentOpenItem = null;
    }
  }

  /**
   * Close all mega menus
   */
  function closeAllMenus() {
    navItems.forEach(item => closeMenu(item));
    currentOpenItem = null;
  }

  /**
   * Schedule menu close with delay
   * @param {HTMLElement} navItem - The nav item to close
   */
  function scheduleClose(navItem) {
    clearCloseTimeout();
    closeTimeout = setTimeout(() => {
      closeMenu(navItem);
    }, CONFIG.hoverCloseDelay);
  }

  // ==========================================================================
  // Event Handlers - Desktop (Hover)
  // ==========================================================================

  /**
   * Handle mouse enter on nav item
   * @param {MouseEvent} event
   */
  function handleNavItemMouseEnter(event) {
    if (isMobile()) return;

    const navItem = event.currentTarget;
    openMenu(navItem);
  }

  /**
   * Handle mouse leave on nav item
   * @param {MouseEvent} event
   */
  function handleNavItemMouseLeave(event) {
    if (isMobile()) return;

    const navItem = event.currentTarget;
    scheduleClose(navItem);
  }

  /**
   * Handle mouse enter on mega menu (cancel close)
   * @param {MouseEvent} event
   */
  function handleMegaMenuMouseEnter(event) {
    if (isMobile()) return;
    clearCloseTimeout();
  }

  /**
   * Handle mouse leave on mega menu
   * @param {MouseEvent} event
   */
  function handleMegaMenuMouseLeave(event) {
    if (isMobile()) return;

    const navItem = event.currentTarget.closest(`.${CONFIG.classes.navItem}`);
    if (navItem) {
      scheduleClose(navItem);
    }
  }

  // ==========================================================================
  // Event Handlers - Mobile (Click)
  // ==========================================================================

  /**
   * Handle click on nav button (mobile toggle)
   * @param {MouseEvent} event
   */
  function handleNavButtonClick(event) {
    if (!isMobile()) return;

    event.preventDefault();
    const navItem = event.currentTarget.closest(`.${CONFIG.classes.navItem}`);

    if (navItem.classList.contains(CONFIG.classes.active)) {
      closeMenu(navItem);
    } else {
      openMenu(navItem);
    }
  }

  /**
   * Handle mobile menu toggle button click
   */
  function handleMobileToggleClick() {
    const isOpen = nav.classList.toggle(CONFIG.classes.mobileOpen);
    mobileToggle.setAttribute(CONFIG.aria.expanded, isOpen.toString());

    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  // ==========================================================================
  // Event Handlers - Keyboard Navigation
  // ==========================================================================

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} event
   */
  function handleKeydown(event) {
    const { key } = event;

    switch (key) {
      case 'Escape':
        // Close all menus and return focus to trigger
        if (currentOpenItem) {
          const button = currentOpenItem.querySelector('button');
          closeAllMenus();
          if (button) button.focus();
        }
        // Also close mobile menu
        if (nav.classList.contains(CONFIG.classes.mobileOpen)) {
          nav.classList.remove(CONFIG.classes.mobileOpen);
          mobileToggle.setAttribute(CONFIG.aria.expanded, 'false');
          mobileToggle.focus();
          document.body.style.overflow = '';
        }
        break;

      case 'Enter':
      case ' ':
        // If focus is on nav button, toggle menu
        if (event.target.matches(`.${CONFIG.classes.navItem} > button`)) {
          event.preventDefault();
          const navItem = event.target.closest(`.${CONFIG.classes.navItem}`);

          if (navItem.classList.contains(CONFIG.classes.active)) {
            closeMenu(navItem);
          } else {
            openMenu(navItem);
            // Move focus to first link in menu
            const firstLink = navItem.querySelector('.mega-menu a, .mega-menu button');
            if (firstLink) {
              setTimeout(() => firstLink.focus(), 50);
            }
          }
        }
        break;

      case 'Tab':
        // If tabbing out of mega menu, close it
        if (currentOpenItem) {
          const megaMenu = currentOpenItem.querySelector(`.${CONFIG.classes.megaMenu}`);
          const focusableElements = megaMenu.querySelectorAll('a, button');
          const lastFocusable = focusableElements[focusableElements.length - 1];

          if (event.target === lastFocusable && !event.shiftKey) {
            closeMenu(currentOpenItem);
          }
        }
        break;

      case 'ArrowDown':
        // Move focus down within mega menu
        if (currentOpenItem && document.activeElement.closest('.mega-menu')) {
          event.preventDefault();
          moveFocus('next');
        }
        break;

      case 'ArrowUp':
        // Move focus up within mega menu
        if (currentOpenItem && document.activeElement.closest('.mega-menu')) {
          event.preventDefault();
          moveFocus('prev');
        }
        break;
    }
  }

  /**
   * Move focus to next/previous focusable element
   * @param {'next' | 'prev'} direction
   */
  function moveFocus(direction) {
    if (!currentOpenItem) return;

    const megaMenu = currentOpenItem.querySelector(`.${CONFIG.classes.megaMenu}`);
    const focusableElements = Array.from(megaMenu.querySelectorAll('a, button'));
    const currentIndex = focusableElements.indexOf(document.activeElement);

    let nextIndex;
    if (direction === 'next') {
      nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
    } else {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
    }

    focusableElements[nextIndex]?.focus();
  }

  // ==========================================================================
  // Event Handlers - Click Outside
  // ==========================================================================

  /**
   * Handle click outside to close menus
   * @param {MouseEvent} event
   */
  function handleClickOutside(event) {
    if (!header.contains(event.target)) {
      closeAllMenus();

      // Also close mobile menu
      if (nav.classList.contains(CONFIG.classes.mobileOpen)) {
        nav.classList.remove(CONFIG.classes.mobileOpen);
        mobileToggle.setAttribute(CONFIG.aria.expanded, 'false');
        document.body.style.overflow = '';
      }
    }
  }

  // ==========================================================================
  // Event Handlers - Resize
  // ==========================================================================

  /**
   * Handle window resize
   */
  function handleResize() {
    // Close all menus when switching between mobile/desktop
    closeAllMenus();

    // Reset mobile menu state on desktop
    if (!isMobile()) {
      nav.classList.remove(CONFIG.classes.mobileOpen);
      mobileToggle.setAttribute(CONFIG.aria.expanded, 'false');
      document.body.style.overflow = '';
    }
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================

  /**
   * Initialize all event listeners
   */
  function init() {
    // Nav items - hover events for desktop
    navItems.forEach(navItem => {
      navItem.addEventListener('mouseenter', handleNavItemMouseEnter);
      navItem.addEventListener('mouseleave', handleNavItemMouseLeave);

      // Nav button click for mobile
      const button = navItem.querySelector('button');
      if (button) {
        button.addEventListener('click', handleNavButtonClick);
      }

      // Mega menu hover events
      const megaMenu = navItem.querySelector(`.${CONFIG.classes.megaMenu}`);
      if (megaMenu) {
        megaMenu.addEventListener('mouseenter', handleMegaMenuMouseEnter);
        megaMenu.addEventListener('mouseleave', handleMegaMenuMouseLeave);
      }
    });

    // Mobile toggle
    if (mobileToggle) {
      mobileToggle.addEventListener('click', handleMobileToggleClick);
    }

    // Keyboard navigation
    document.addEventListener('keydown', handleKeydown);

    // Click outside to close
    document.addEventListener('click', handleClickOutside);

    // Resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 150);
    });

    // Log initialization
    console.log('Flexiple Navbar initialized');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

/**
 * Testimonials Carousel
 * 
 * Features:
 * 1. Shows 3 cards per view on desktop, 2 on tablet, 1 on mobile
 * 2. Proper grouping logic - last slide reuses previous cards if needed
 * 3. Smooth transform-based animations
 * 4. Responsive recalculation on window resize
 * 5. Pagination indicators
 */

(function () {
  'use strict';

  // ==========================================================================
  // Configuration
  // ==========================================================================

  const CAROUSEL_CONFIG = {
    cardsPerView: {
      desktop: 3,
      tablet: 2,
      mobile: 1
    },
    breakpoints: {
      tablet: 768,
      mobile: 480
    },
    transitionDuration: 500,
    autoPlayInterval: 5000, // Set to 0 to disable auto-play
    selectors: {
      track: '#testimonialTrack',
      indicators: '.carousel__indicators',
      indicator: '.carousel__indicator',
      card: '.testimonial-card'
    },
    classes: {
      activeIndicator: 'carousel__indicator--active'
    }
  };

  // ==========================================================================
  // State
  // ==========================================================================

  let currentSlide = 0;
  let totalSlides = 0;
  let cardsPerView = 3;
  let autoPlayTimer = null;

  // ==========================================================================
  // DOM References
  // ==========================================================================

  const track = document.querySelector(CAROUSEL_CONFIG.selectors.track);
  const indicatorsContainer = document.querySelector(CAROUSEL_CONFIG.selectors.indicators);
  let cards = [];
  let indicators = [];

  // ==========================================================================
  // Utility Functions
  // ==========================================================================

  /**
   * Get number of cards to show based on viewport
   * @returns {number}
   */
  function getCardsPerView() {
    const width = window.innerWidth;
    if (width <= CAROUSEL_CONFIG.breakpoints.mobile) {
      return CAROUSEL_CONFIG.cardsPerView.mobile;
    }
    if (width <= CAROUSEL_CONFIG.breakpoints.tablet) {
      return CAROUSEL_CONFIG.cardsPerView.tablet;
    }
    return CAROUSEL_CONFIG.cardsPerView.desktop;
  }

  /**
   * Calculate total number of slides
   * With proper grouping: if 7 cards and 3 per view, we need 3 slides:
   * Slide 0: cards 0,1,2
   * Slide 1: cards 3,4,5
   * Slide 2: cards 4,5,6 (reuses previous cards to always show 3)
   * @returns {number}
   */
  function calculateTotalSlides() {
    const totalCards = cards.length;
    if (totalCards <= cardsPerView) return 1;

    // Calculate number of complete groups
    const completeGroups = Math.floor(totalCards / cardsPerView);
    const remainder = totalCards % cardsPerView;

    // If there's a remainder, we need one more slide
    // but it will overlap with the previous one
    return remainder > 0 ? completeGroups + 1 : completeGroups;
  }

  /**
   * Calculate the offset for a given slide
   * Handles edge case where last slide needs to show previous cards
   * @param {number} slideIndex
   * @returns {number} - Percentage offset
   */
  function calculateSlideOffset(slideIndex) {
    const totalCards = cards.length;
    const cardWidth = 100 / cardsPerView;

    // Calculate starting card index for this slide
    let startCardIndex = slideIndex * cardsPerView;

    // For the last slide, if there aren't enough cards,
    // shift back to show the last 'cardsPerView' cards
    const remainingCards = totalCards - startCardIndex;
    if (remainingCards < cardsPerView && slideIndex > 0) {
      startCardIndex = totalCards - cardsPerView;
    }

    return startCardIndex * cardWidth;
  }

  // ==========================================================================
  // Carousel Navigation
  // ==========================================================================

  /**
   * Go to a specific slide
   * @param {number} slideIndex
   */
  function goToSlide(slideIndex) {
    if (slideIndex < 0) slideIndex = totalSlides - 1;
    if (slideIndex >= totalSlides) slideIndex = 0;

    currentSlide = slideIndex;

    const offset = calculateSlideOffset(currentSlide);
    track.style.transform = `translateX(-${offset}%)`;

    updateIndicators();
  }

  /**
   * Go to next slide
   */
  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  /**
   * Go to previous slide
   */
  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  // ==========================================================================
  // Indicators
  // ==========================================================================

  /**
   * Update indicator buttons to reflect current slide
   */
  function updateIndicators() {
    indicators.forEach((indicator, index) => {
      const isActive = index === currentSlide;
      indicator.classList.toggle(CAROUSEL_CONFIG.classes.activeIndicator, isActive);
      indicator.setAttribute('aria-current', isActive.toString());
    });
  }

  /**
   * Generate indicator buttons dynamically based on slide count
   */
  function generateIndicators() {
    if (!indicatorsContainer) return;

    indicatorsContainer.innerHTML = '';

    for (let i = 0; i < totalSlides; i++) {
      const button = document.createElement('button');
      button.className = 'carousel__indicator';
      if (i === 0) button.classList.add(CAROUSEL_CONFIG.classes.activeIndicator);
      button.setAttribute('data-slide', i.toString());
      button.setAttribute('aria-label', `Go to slide ${i + 1}`);
      button.setAttribute('aria-current', i === 0 ? 'true' : 'false');
      indicatorsContainer.appendChild(button);
    }

    indicators = Array.from(indicatorsContainer.querySelectorAll(CAROUSEL_CONFIG.selectors.indicator));

    // Add click handlers
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        goToSlide(index);
        resetAutoPlay();
      });
    });
  }

  // ==========================================================================
  // Auto-Play
  // ==========================================================================

  /**
   * Start auto-play
   */
  function startAutoPlay() {
    if (CAROUSEL_CONFIG.autoPlayInterval > 0) {
      autoPlayTimer = setInterval(nextSlide, CAROUSEL_CONFIG.autoPlayInterval);
    }
  }

  /**
   * Stop auto-play
   */
  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  /**
   * Reset auto-play timer
   */
  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  // ==========================================================================
  // Responsive Handling
  // ==========================================================================

  /**
   * Recalculate carousel on resize
   */
  function handleResize() {
    const newCardsPerView = getCardsPerView();

    if (newCardsPerView !== cardsPerView) {
      cardsPerView = newCardsPerView;
      totalSlides = calculateTotalSlides();

      // Reset to first slide or stay on valid slide
      if (currentSlide >= totalSlides) {
        currentSlide = totalSlides - 1;
      }

      generateIndicators();
      goToSlide(currentSlide);
    }
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================

  /**
   * Initialize the carousel
   */
  function initCarousel() {
    if (!track) {
      console.log('Testimonials carousel: Track not found');
      return;
    }

    cards = Array.from(track.querySelectorAll(CAROUSEL_CONFIG.selectors.card));
    if (cards.length === 0) {
      console.log('Testimonials carousel: No cards found');
      return;
    }

    // Initial setup
    cardsPerView = getCardsPerView();
    totalSlides = calculateTotalSlides();

    // Generate indicators
    generateIndicators();

    // Go to initial slide
    goToSlide(0);

    // Start auto-play (optional)
    // startAutoPlay();

    // Pause on hover
    track.addEventListener('mouseenter', stopAutoPlay);
    track.addEventListener('mouseleave', startAutoPlay);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!track.closest('.testimonials__carousel')?.contains(document.activeElement)) return;

      if (e.key === 'ArrowLeft') {
        prevSlide();
        resetAutoPlay();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
        resetAutoPlay();
      }
    });

    // Resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 150);
    });

    console.log('Testimonials carousel initialized:', { totalCards: cards.length, totalSlides, cardsPerView });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousel);
  } else {
    initCarousel();
  }

})();
/**
 * FAQ Accordion
 * 
 * Features:
 * 1. Single item open at a time
 * 2. Smooth height transitions
 * 3. ARIA attribute management for accessibility
 */

(function () {
  'use strict';

  const faqLists = document.querySelectorAll('.faq__list');

  faqLists.forEach(faqContainer => {
    const questions = faqContainer.querySelectorAll('.faq__question');

    questions.forEach(question => {
      question.addEventListener('click', () => {
        const isExpanded = question.getAttribute('aria-expanded') === 'true';
        const answerId = question.getAttribute('aria-controls');
        // We don't strictly *need* to get the answer element by ID if we trust the sibling structure,
        // but it's good practice for aria compliance. 
        // The CSS relies on the aria-expanded attribute on the button.

        // Close all other items IN THIS LIST
        questions.forEach(otherQuestion => {
          if (otherQuestion !== question) {
            otherQuestion.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle current item
        question.setAttribute('aria-expanded', !isExpanded);
      });
    });
  });

  console.log(`FAQ Accordion initialized for ${faqLists.length} lists`);

})();
