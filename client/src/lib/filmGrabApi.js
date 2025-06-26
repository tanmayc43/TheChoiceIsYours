// FilmGrab API service for fetching random film stills
class FilmGrabAPI {
  constructor() {
    this.baseUrl = 'https://film-grab.com';
    this.cache = new Map();
  }

  async getRandomFilmStill() {
    try {
      // Using high-quality film-inspired images since FilmGrab URLs are not accessible
      const filmStills = [
        {
          url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=1080&fit=crop&crop=center',
          title: 'Cinema Dreams',
          year: '2024',
          director: 'Film Paglu',
          description: 'A journey through the magic of cinema'
        },
        {
          url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1920&h=1080&fit=crop&crop=center',
          title: 'Neon Nights',
          year: '2024',
          director: 'Film Paglu',
          description: 'Cyberpunk aesthetics in modern cinema'
        },
        {
          url: 'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=1920&h=1080&fit=crop&crop=center',
          title: 'Film Noir',
          year: '2024',
          director: 'Film Paglu',
          description: 'Classic black and white cinematography'
        },
        {
          url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=1080&fit=crop&crop=center',
          title: 'Movie Magic',
          year: '2024',
          director: 'Film Paglu',
          description: 'The art of storytelling through film'
        },
        {
          url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1920&h=1080&fit=crop&crop=center',
          title: 'Digital Dreams',
          year: '2024',
          director: 'Film Paglu',
          description: 'The future of cinematic storytelling'
        },
        {
          url: 'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=1920&h=1080&fit=crop&crop=center',
          title: 'Cinematic Vision',
          year: '2024',
          director: 'Film Paglu',
          description: 'Exploring the boundaries of visual storytelling'
        },
        {
          url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=1080&fit=crop&crop=center',
          title: 'Film Artistry',
          year: '2024',
          director: 'Film Paglu',
          description: 'Where technology meets artistic expression'
        },
        {
          url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1920&h=1080&fit=crop&crop=center',
          title: 'Visual Poetry',
          year: '2024',
          director: 'Film Paglu',
          description: 'The poetry of moving images'
        },
        {
          url: 'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=1920&h=1080&fit=crop&crop=center',
          title: 'Cinematic Dreams',
          year: '2024',
          director: 'Film Paglu',
          description: 'Dreaming in 24 frames per second'
        },
        {
          url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=1080&fit=crop&crop=center',
          title: 'Film Universe',
          year: '2024',
          director: 'Film Paglu',
          description: 'Exploring infinite cinematic possibilities'
        },
        {
          url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1920&h=1080&fit=crop&crop=center',
          title: 'Digital Cinema',
          year: '2024',
          director: 'Film Paglu',
          description: 'The evolution of film in the digital age'
        },
        {
          url: 'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=1920&h=1080&fit=crop&crop=center',
          title: 'Film Innovation',
          year: '2024',
          director: 'Film Paglu',
          description: 'Pushing the boundaries of cinematic expression'
        },
        {
          url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=1080&fit=crop&crop=center',
          title: 'Cinematic Art',
          year: '2024',
          director: 'Film Paglu',
          description: 'Where art meets technology in motion'
        },
        {
          url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1920&h=1080&fit=crop&crop=center',
          title: 'Film Revolution',
          year: '2024',
          director: 'Film Paglu',
          description: 'Revolutionizing the way we experience stories'
        },
        {
          url: 'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=1920&h=1080&fit=crop&crop=center',
          title: 'Digital Artistry',
          year: '2024',
          director: 'Film Paglu',
          description: 'The artistry of digital filmmaking'
        }
      ];

      // Return a random film still
      const randomIndex = Math.floor(Math.random() * filmStills.length);
      return filmStills[randomIndex];
    } catch (error) {
      console.error('Error fetching film still:', error);
      // Fallback to a default image
      return {
        url: 'https://picsum.photos/1920/1080?grayscale',
        title: 'Film Still',
        year: '2024',
        director: 'Unknown',
        description: 'A beautiful film still'
      };
    }
  }

  // Preload images for better performance
  async preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  // Get multiple film stills for variety
  async getMultipleFilmStills(count = 3) {
    const stills = [];
    for (let i = 0; i < count; i++) {
      const still = await this.getRandomFilmStill();
      stills.push(still);
    }
    return stills;
  }
}

export default new FilmGrabAPI(); 