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

async def scrape_letterboxd_poster(url, timeout=20):
    """
    Scrape poster and overview from Letterboxd film page
    """
    try:
        async with async_playwright() as p:
            # Launch browser with optimized settings
            browser = await p.chromium.launch(
                headless=True,
                args=[
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                    '--window-size=1920x1080'
                ]
            )
            
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            
            page = await context.new_page()
            
            # Set timeout
            page.set_default_timeout(timeout * 1000)
            
            # Navigate to page
            await page.goto(url, wait_until='domcontentloaded')
            
            # Wait for poster to load
            try:
                await page.wait_for_selector('img[src*="image-150"], img[src*="image-230"], .poster img', timeout=10000)
            except:
                pass  # Continue even if poster doesn't load
            
            # Extract poster URL
            poster_url = None
            
            # Method 1: Look for poster in various selectors
            poster_selectors = [
                'section.poster-list a[data-js-trigger="postermodal"]',
                '.film-poster img',
                '.poster img',
                'img[src*="image-150"]',
                'img[src*="image-230"]'
            ]
            
            for selector in poster_selectors:
                try:
                    element = await page.query_selector(selector)
                    if element:
                        if 'img' in selector:
                            poster_url = await element.get_attribute('src')
                        else:
                            poster_url = await element.get_attribute('href')
                        
                        if poster_url and 'empty-poster' not in poster_url:
                            break
                except:
                    continue
            
            # Clean up poster URL
            if poster_url:
                if poster_url.startswith('//'):
                    poster_url = 'https:' + poster_url
                elif poster_url.startswith('/'):
                    poster_url = 'https://letterboxd.com' + poster_url
            
            # Extract overview
            overview = ""
            try:
                overview_element = await page.query_selector('.film-text p, .review .body-text p')
                if overview_element:
                    overview = await overview_element.inner_text()
                    overview = overview.strip()
            except:
                pass
            
            await browser.close()
            
            return {
                'poster': poster_url or 'https://watchlistpicker.com/noimagefound.jpg',
                'overview': overview,
                'success': True
            }
            
    except Exception as e:
        return {
            'poster': 'https://watchlistpicker.com/noimagefound.jpg',
            'overview': '',
            'success': False,
            'error': str(e)
        }

def main():
    if len(sys.argv) != 2:
        print(json.dumps({'error': 'URL argument required'}))
        sys.exit(1)
    
    url = sys.argv[1]
    
    # Run async scraper
    result = asyncio.run(scrape_letterboxd_poster(url))
    
    # Output JSON result
    print(json.dumps(result))

if __name__ == '__main__':
    main()