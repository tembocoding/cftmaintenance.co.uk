document.addEventListener('DOMContentLoaded', () => {
  // Simplified image path handling
  const imagePathHandler = {
    init() {
      this.updateAllImagePaths();
    },
    
    getPath(path) {
      if (path.startsWith('http') || path.startsWith('data:')) return path;
      
      // Clean the path of any leading slashes or 'images/'
      const cleanPath = path.replace(/^\/?(images\/)?/, '');
      
      // For CSS and JS files
      if (path.endsWith('.css') || path.endsWith('.js')) return `/${cleanPath}`;
      
      // For images - always use root level
      return `/${cleanPath}`;
    },
    
    updateAllImagePaths() {
      // Update CSS variables
      const root = document.documentElement;
      const cssImages = {
        '--logo-path': 'CFT_Maintenance_Logo.png',
        '--hero-bg-path': 'chalk-board-image.png',
        '--tools-bg-path': 'tools-background.png',
        '--support-bg-path': './support-team.png'
      };
      
      Object.entries(cssImages).forEach(([variable, image]) => {
        root.style.setProperty(variable, `url('${this.getPath(image)}')`);
      });
      
      // Update img elements
      document.querySelectorAll('img').forEach(img => {
        const originalSrc = img.getAttribute('src');
        if (originalSrc && !originalSrc.startsWith('http') && !originalSrc.startsWith('data:')) {
          const newSrc = this.getPath(originalSrc);
          if (img.getAttribute('src') !== newSrc) {
            img.setAttribute('src', newSrc);
          }
        }
      });
    }
  };

  // Initialize image path handling
  imagePathHandler.init();

  // Error handling and diagnostics
  const diagnostics = {
    resourcesLoaded: {},
    init() {
      this.checkResources();
      this.checkViewportSize();
    },
    checkResources() {
      // Check if critical resources are loaded
      const criticalResources = [
        { type: 'css', url: 'style.css' },
        { type: 'script', url: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js', globalVar: 'jQuery' },
        { type: 'script', url: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js', globalVar: 'gsap' }
      ];

      criticalResources.forEach(resource => {
        if (resource.type === 'css') {
          const styleSheets = Array.from(document.styleSheets);
          const loaded = styleSheets.some(sheet => {
            try {
              if (!sheet.href) return false;
              const sheetPath = new URL(sheet.href).pathname;
              const resourcePath = new URL(resource.url, window.location.origin).pathname;
              return sheetPath === resourcePath;
            } catch (e) {
              return false;
            }
          });
          this.resourcesLoaded[resource.url] = loaded;
          if (!loaded) {
            this.loadCSS(resource.url);
          }
        } else if (resource.type === 'script') {
          const loaded = typeof window[resource.globalVar] !== 'undefined';
          this.resourcesLoaded[resource.url] = loaded;
          if (!loaded) {
            this.loadScript(resource.url);
          }
        }
      });

      console.log('Resource loading status:', this.resourcesLoaded);
    },
    loadCSS(url) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
    },
    loadScript(url) {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      document.head.appendChild(script);
    },
    checkViewportSize() {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      };
      console.log('Viewport:', viewport);
    }
  };

  // Initialize diagnostics
  diagnostics.init();

  // Initialize AOS with error handling
  try {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: false,
        offset: 200
      });
    } else {
      console.warn('AOS not loaded');
    }
  } catch (e) {
    console.error('AOS initialization failed:', e);
  }

  // Smooth scroll for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      try {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (!targetId) return;
        
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;
        
        const offset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } catch (error) {
        console.warn('Smooth scroll error:', error);
        const targetId = this.getAttribute('href');
        if (targetId) {
          window.location.hash = targetId;
        }
      }
    });
  });

  // Custom cursor (only initialize if element exists)
  const cursor = document.querySelector('.cursor--small');
  if (cursor) {
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function updateCursor() {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;
      
      cursorX += dx * 0.1;
      cursorY += dy * 0.1;
      
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
      requestAnimationFrame(updateCursor);
    }

    updateCursor();
  }

  // Update active section in header
  const sections = document.querySelectorAll('section');
  const options = {
    threshold: 0.3
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id;
        updateActiveSection(sectionId);
      }
    });
  }, options);

  sections.forEach(section => {
    observer.observe(section);
  });

  function updateActiveSection(sectionId) {
    document.querySelectorAll('nav a').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${sectionId}`) {
        link.classList.add('active');
      }
    });
  }

  // Back to top button functionality
  const backToTopButton = document.getElementById('back-to-top');
  if (backToTopButton) {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    });

    backToTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Initialize the London map
  const initMap = () => {
    const mapElement = document.getElementById('london-map');
    if (!mapElement) return;
    
    const map = L.map('london-map', {
      center: [51.5074, -0.1278],
      zoom: 10,
      scrollWheelZoom: true,
      zoomControl: true
    });
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Define the coverage areas with their coordinates
    const coverageAreas = {
      'North London': [
        { name: 'Islington', coords: [51.5362, -0.1027] },
        { name: 'Camden', coords: [51.5390, -0.1426] },
        { name: 'Barnet', coords: [51.6252, -0.1517] },
        { name: 'Enfield', coords: [51.6538, -0.0799] },
        { name: 'Haringey', coords: [51.5906, -0.1110] }
      ],
      'South London': [
        { name: 'Croydon', coords: [51.3762, -0.0982] },
        { name: 'Bromley', coords: [51.4039, 0.0198] },
        { name: 'Southwark', coords: [51.5035, -0.0804] },
        { name: 'Lambeth', coords: [51.4571, -0.1231] },
        { name: 'Greenwich', coords: [51.4892, 0.0648] }
      ],
      'East London': [
        { name: 'Tower Hamlets', coords: [51.5195, -0.0299] },
        { name: 'Hackney', coords: [51.5450, -0.0553] },
        { name: 'Newham', coords: [51.5255, 0.0352] },
        { name: 'Redbridge', coords: [51.5590, 0.0741] },
        { name: 'Havering', coords: [51.5812, 0.1837] }
      ],
      'West London': [
        { name: 'Ealing', coords: [51.5130, -0.3089] },
        { name: 'Hounslow', coords: [51.4746, -0.3680] },
        { name: 'Hillingdon', coords: [51.5441, -0.4760] },
        { name: 'Harrow', coords: [51.5802, -0.3346] },
        { name: 'Brent', coords: [51.5588, -0.2817] }
      ]
    };

    // Custom icon for markers
    const customIcon = L.divIcon({
      className: 'custom-map-marker',
      html: '<i class="fas fa-map-marker-alt"></i>',
      iconSize: [25, 25],
      iconAnchor: [12, 24],
      popupAnchor: [0, -20]
    });

    // Add markers for each area
    Object.entries(coverageAreas).forEach(([region, areas]) => {
      areas.forEach(area => {
        const marker = L.marker(area.coords, { icon: customIcon })
          .addTo(map)
          .bindPopup(`<b>${area.name}</b><br>${region}`);
        
        // Add hover effect
        marker.on('mouseover', function() {
          this.openPopup();
        });
        marker.on('mouseout', function() {
          this.closePopup();
        });
      });
    });

    // Add a circle to show the general coverage area
    L.circle([51.5074, -0.1278], {
      color: '#060644',
      fillColor: '#060644',
      fillOpacity: 0.1,
      radius: 25000
    }).addTo(map);

    // Force a resize event to ensure the map renders correctly
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  };
  
  // Initialize accordion functionality
  const initAccordion = () => {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    // Close all accordions initially
    document.querySelectorAll('.accordion-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Add click event listener to each header
    accordionHeaders.forEach(header => {
      header.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get the parent accordion item
        const accordionItem = this.parentElement;
        
        // Toggle active class
        const wasActive = accordionItem.classList.contains('active');
        
        // First, close all accordion items
        document.querySelectorAll('.accordion-item').forEach(item => {
          item.classList.remove('active');
        });
        
        // Then, open the clicked one (if it wasn't already open)
        if (!wasActive) {
          accordionItem.classList.add('active');
        }
      });
    });
  };
  
  // Initialize features
  initMap();
  initAccordion();
});
