#!/usr/bin/env python3
"""
High-performance poster scraper using Playwright
Handles dynamic content loading efficiently
"""

import sys
import json
import asyncio
from playwright.async_api import async_playwright
import time
from PIL import Image
import requests
from io import BytesIO
import base64
import re

def is_empty_poster(url):
    """Check if URL is an empty poster placeholder"""
    if not url:
        return True
    
    empty_patterns = [
        'empty-poster',
        'placeholder',
        'default-poster',
        'no-poster',
        'blank-poster'
    ]
    
    return any(pattern in url.lower() for pattern in empty_patterns)

def debug_print(message):
    """Print debug messages to stderr so they don't interfere with JSON output"""
    print(message, file=sys.stderr)

async def try_tmdb_poster(movie_title, year=None):
    """Try to get poster from TMDB as fallback"""
    try:
        # Search TMDB for the movie
        search_url = "https://api.themoviedb.org/3/search/movie"
        params = {
            'api_key': 'your_tmdb_api_key_here',  # You'd need to add this to your .env
            'query': movie_title,
            'year': year
        }
        
        response = requests.get(search_url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('results') and len(data['results']) > 0:
                poster_path = data['results'][0].get('poster_path')
                if poster_path:
                    return f"https://image.tmdb.org/t/p/w500{poster_path}"
    except Exception as e:
        debug_print(f"TMDB fallback failed: {e}")
    
    return None

async def scrape_letterboxd_poster(url, timeout=20):
    """
    Scrape poster and overview from Letterboxd film page
    """
    try:
        async with async_playwright() as p:
            # Launch browser with optimized settings for production
            browser = await p.chromium.launch(
                headless=True,
                args=[
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    '--disable-extensions',
                    '--disable-plugins',
                    '--disable-images',  # Don't load images for faster scraping
                    '--window-size=800x600'  # Smaller viewport
                ]
            )
            
            context = await browser.new_context(
                viewport={'width': 800, 'height': 600},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                java_script_enabled=True,
                bypass_csp=True,
                # Performance optimizations
                ignore_https_errors=True,
                extra_http_headers={'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'}
            )
            
            page = await context.new_page()
            
            # Set shorter timeout for faster failure
            page.set_default_timeout(15000)  # 15 seconds instead of 20
            
            # Navigate to page with faster loading
            await page.goto(url, wait_until='domcontentloaded', timeout=10000)
            
            # Reduced wait time for dynamic content
            await page.wait_for_timeout(1000)
            
            # Extract movie title for fallback
            movie_title = None
            try:
                title_element = await page.query_selector('h1.film-title, .film-title, h1')
                if title_element:
                    movie_title = await title_element.inner_text()
                    movie_title = movie_title.strip()
                    debug_print(f"✓ Found movie title: {movie_title}")
            except:
                pass
            
            # Extract poster URL with multiple strategies
            poster_url = None
            
            # Strategy 1: Look for poster in various selectors
            poster_selectors = [
                'section.poster-list a[data-js-trigger="postermodal"]',
                '.film-poster img',
                '.poster img',
                'img[src*="image-150"]',
                'img[src*="image-230"]',
                'img[src*="image-300"]',
                'img[src*="image-500"]',
                '.film-poster-container img',
                '.poster-container img'
            ]
            
            for selector in poster_selectors:
                try:
                    elements = await page.query_selector_all(selector)
                    for element in elements:
                        if 'img' in selector:
                            src = await element.get_attribute('src')
                        else:
                            src = await element.get_attribute('href')
                        
                        if src and not is_empty_poster(src):
                            poster_url = src
                            debug_print(f"✓ Found poster via {selector}: {poster_url}")
                            break
                    
                    if poster_url:
                        break
                except Exception as e:
                    debug_print(f"Error with selector {selector}: {e}")
                    continue
            
            # Strategy 2: Look for any image that looks like a movie poster
            if not poster_url or is_empty_poster(poster_url):
                try:
                    all_images = await page.query_selector_all('img')
                    for img in all_images:
                        src = await img.get_attribute('src')
                        if src and not is_empty_poster(src):
                            # Check if it looks like a movie poster URL
                            if any(pattern in src for pattern in ['image-', 'poster', 'film', 'a.ltrbxd.com']):
                                poster_url = src
                                debug_print(f"✓ Found poster via image search: {poster_url}")
                                break
                except Exception as e:
                    debug_print(f"Error in image search: {e}")
            
            # Strategy 3: Try to scroll and wait for lazy-loaded images
            if not poster_url or is_empty_poster(poster_url):
                try:
                    await page.evaluate("window.scrollTo(0, document.body.scrollHeight/2)")
                    await page.wait_for_timeout(1000)
                    
                    # Try selectors again after scroll
                    for selector in poster_selectors:
                        try:
                            elements = await page.query_selector_all(selector)
                            for element in elements:
                                if 'img' in selector:
                                    src = await element.get_attribute('src')
                                else:
                                    src = await element.get_attribute('href')
                                
                                if src and not is_empty_poster(src):
                                    poster_url = src
                                    debug_print(f"✓ Found poster after scroll via {selector}: {poster_url}")
                                    break
                            
                            if poster_url:
                                break
                        except:
                            continue
                except Exception as e:
                    debug_print(f"Error in scroll strategy: {e}")
            
            # Strategy 4: Try alternative sources if Letterboxd has no poster
            if not poster_url or is_empty_poster(poster_url):
                if movie_title:
                    debug_print(f"⚠️ No poster found on Letterboxd, trying alternative sources for: {movie_title}")
                    # You could implement TMDB fallback here if you have an API key
                    # poster_url = await try_tmdb_poster(movie_title)
            
            # Clean up poster URL
            if poster_url and not is_empty_poster(poster_url):
                if poster_url.startswith('//'):
                    poster_url = 'https:' + poster_url
                elif poster_url.startswith('/'):
                    poster_url = 'https://letterboxd.com' + poster_url
                
                debug_print(f"✓ Final poster URL: {poster_url}")
            else:
                poster_url = 'https://watchlistpicker.com/noimagefound.jpg'
                debug_print("✗ No valid poster found, using default")
            
            # Extract overview
            overview = ""
            try:
                overview_selectors = [
                    '.film-text p',
                    '.review .body-text p',
                    '.film-overview p',
                    '.film-description p'
                ]
                
                for selector in overview_selectors:
                    try:
                        element = await page.query_selector(selector)
                        if element:
                            overview = await element.inner_text()
                            overview = overview.strip()
                            if overview:
                                debug_print(f"✓ Found overview via {selector}")
                                break
                    except:
                        continue
            except Exception as e:
                debug_print(f"Error extracting overview: {e}")
            
            await browser.close()
            
            return {
                'poster': poster_url,
                'overview': overview,
                'success': True
            }
            
    except Exception as e:
        debug_print(f"Scraper error: {e}")
        return {
            'poster': 'https://watchlistpicker.com/noimagefound.jpg',
            'overview': '',
            'success': False,
            'error': str(e)
        }

async def convert_to_webp(image_url, quality=85):
    """Convert image to WebP format"""
    try:
        # Download image
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()
        
        # Open with Pillow
        img = Image.open(BytesIO(response.content))
        
        # Convert to RGB if necessary
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGB')
        
        # Convert to WebP
        webp_buffer = BytesIO()
        img.save(webp_buffer, format='WebP', quality=quality, optimize=True)
        webp_buffer.seek(0)
        
        # Convert to base64 for inline use
        webp_base64 = base64.b64encode(webp_buffer.getvalue()).decode()
        
        return f"data:image/webp;base64,{webp_base64}"
        
    except Exception as e:
        debug_print(f"WebP conversion failed: {e}")
        return image_url  # Fallback to original URL

def main():
    if len(sys.argv) != 2:
        print(json.dumps({'error': 'URL argument required'}))
        sys.exit(1)
    
    url = sys.argv[1]
    
    # Run async scraper
    result = asyncio.run(scrape_letterboxd_poster(url))
    
    # Output JSON result to stdout (only JSON, no debug messages)
    print(json.dumps(result))

if __name__ == '__main__':
    main()