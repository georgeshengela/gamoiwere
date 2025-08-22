import { Request, Response } from "express";
import { storage } from "../storage";

export const generateSitemap = async (req: Request, res: Response) => {
  try {
    // Fetch categories from the API
    const categoriesResponse = await fetch('https://service.devmonkeys.ge/api/getProviderBriefCatalog');
    const categoriesData = await categoriesResponse.json();
    
    let categoryUrls = '';
    
    if (categoriesData && categoriesData.Result && categoriesData.Result.Roots) {
      const categories = categoriesData.Result.Roots;
      
      // Helper function to generate category URLs recursively
      const generateCategoryUrls = (cats: any[], level = 0) => {
        cats.forEach((category: any) => {
          if (category.Id && !category.IsHidden) {
            const priority = level === 0 ? '0.9' : '0.8';
            const changefreq = level === 0 ? 'weekly' : 'monthly';
            
            categoryUrls += `
  <url>
    <loc>https://gamoiwere.ge/category/${category.Id}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
            
            // Add subcategories if they exist
            if (category.Children && Array.isArray(category.Children) && category.Children.length > 0) {
              generateCategoryUrls(category.Children, level + 1);
            }
          }
        });
      };
      
      generateCategoryUrls(categories);
    }

    // Generate search keyword URLs from database
    let searchUrls = '';
    try {
      // Fetch search keywords directly from storage
      const keywords = await storage.getRecentSearchKeywords(50);
      console.log('Sitemap: Found keywords:', keywords.length);
      if (Array.isArray(keywords) && keywords.length > 0) {
        keywords.forEach((search: any) => {
          console.log('Processing keyword:', search.keyword);
          if (search.keyword && search.lastSearched) {
            const encodedKeyword = encodeURIComponent(search.keyword);
            const searchDate = new Date(search.lastSearched).toISOString().split('T')[0];
            
            searchUrls += `
  <url>
    <loc>https://gamoiwere.ge/search/${encodedKeyword}</loc>
    <lastmod>${searchDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`;
          }
        });
        console.log('Generated search URLs:', searchUrls);
      } else {
        console.log('No keywords found for sitemap');
      }
    } catch (fetchError) {
      console.error('Error fetching search keywords for sitemap:', fetchError);
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- Homepage -->
  <url>
    <loc>https://gamoiwere.ge/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Dynamic Category Pages from API -->${categoryUrls}

  <!-- Search Keywords Pages -->${searchUrls}

  <!-- Product Pages -->
  <url>
    <loc>https://gamoiwere.ge/products/popular</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://gamoiwere.ge/products/recommended</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- User Account Pages -->
  <url>
    <loc>https://gamoiwere.ge/login</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>https://gamoiwere.ge/register</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>https://gamoiwere.ge/account</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://gamoiwere.ge/cart</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>always</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Static Pages -->
  <url>
    <loc>https://gamoiwere.ge/about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>https://gamoiwere.ge/contact</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>https://gamoiwere.ge/privacy</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <url>
    <loc>https://gamoiwere.ge/terms</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <url>
    <loc>https://gamoiwere.ge/shipping</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>https://gamoiwere.ge/returns</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>https://gamoiwere.ge/faq</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
};