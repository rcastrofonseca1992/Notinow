import { useEffect } from 'react';
import { FaviconLinks, faviconUrl } from './FaviconLinks';

interface PWAHeadProps {
  article?: {
    title: string;
    summary: string;
    image?: string;
    link: string;
  };
}

/**
 * PWAHead Component
 * Ensures all necessary meta tags and links are present for PWA functionality
 * Supports dynamic Open Graph tags for article sharing
 */
export function PWAHead({ article }: PWAHeadProps = {}) {
  useEffect(() => {
    // Ensure viewport meta tag is set correctly
    let viewport = document.querySelector('meta[name="viewport"]');
    
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      document.head.appendChild(viewport);
    }
    
    viewport.setAttribute(
      'content',
      'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
    );
    
    // Set document title and description based on article or default
    if (article) {
      document.title = `${article.title} - Notinow`;
      
      let description = document.querySelector('meta[name="description"]');
      if (!description) {
        description = document.createElement('meta');
        description.setAttribute('name', 'description');
        document.head.appendChild(description);
      }
      description.setAttribute('content', article.summary.slice(0, 160));
    } else {
      document.title = 'Notinow - Pure RSS News Reader';
      
      let description = document.querySelector('meta[name="description"]');
      if (!description) {
        description = document.createElement('meta');
        description.setAttribute('name', 'description');
        document.head.appendChild(description);
      }
      description.setAttribute(
        'content',
        'Pure RSS News Reader - Get the latest updates on UX/UI Design, AI, Tennis, European Football, and Index Funds/Investing. No tracking, no ads.'
      );
    }
    
    // Add keywords meta tag
    let keywords = document.querySelector('meta[name="keywords"]');
    
    if (!keywords) {
      keywords = document.createElement('meta');
      keywords.setAttribute('name', 'keywords');
      document.head.appendChild(keywords);
    }
    
    keywords.setAttribute(
      'content',
      'RSS, news reader, UX design, UI design, AI, tennis, football, investing, index funds'
    );
    
    // Override Figma Make's default generator/application-name tags
    let generator = document.querySelector('meta[name="generator"]');
    if (!generator) {
      generator = document.createElement('meta');
      generator.setAttribute('name', 'generator');
      document.head.appendChild(generator);
    }
    generator.setAttribute('content', 'Notinow');
    
    let applicationName = document.querySelector('meta[name="application-name"]');
    if (!applicationName) {
      applicationName = document.createElement('meta');
      applicationName.setAttribute('name', 'application-name');
      document.head.appendChild(applicationName);
    }
    applicationName.setAttribute('content', 'Notinow');
    
    let author = document.querySelector('meta[name="author"]');
    if (!author) {
      author = document.createElement('meta');
      author.setAttribute('name', 'author');
      document.head.appendChild(author);
    }
    author.setAttribute('content', 'Notinow');
    
    // Add Open Graph meta tags for better sharing (WhatsApp, Telegram, etc.)
    const ogTitle = article ? article.title : 'Notinow - Pure RSS News Reader';
    const ogDescription = article 
      ? article.summary.slice(0, 200)
      : 'Get the latest updates on UX/UI Design, AI, Tennis, European Football, and Index Funds. No tracking, no ads.';
    // Use original image for WhatsApp/Telegram previews
    const rawImage = article?.image || faviconUrl;
    const ogImage = rawImage && rawImage !== faviconUrl 
      ? rawImage
      : rawImage;
    const ogUrl = article ? `https://notinow.xyz#/article/${encodeURIComponent(article.link)}` : 'https://notinow.xyz';
    
    // Debug logging for Open Graph tags
    console.log('PWAHead - Setting Open Graph tags:', {
      title: ogTitle,
      description: ogDescription.substring(0, 50) + '...',
      image: ogImage,
      url: ogUrl,
      siteName: 'Notinow',
      hasArticleImage: !!article?.image,
      rawImage,
    });
    
    const ogTags = [
      { property: 'og:type', content: article ? 'article' : 'website' },
      { property: 'og:title', content: ogTitle },
      { property: 'og:description', content: ogDescription },
      { property: 'og:site_name', content: 'Notinow' },
      { property: 'og:image', content: ogImage },
      { property: 'og:url', content: ogUrl },
    ];
    
    // Add image dimensions for better WhatsApp/Telegram previews
    if (article?.image) {
      ogTags.push(
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' }
      );
    }
    
    ogTags.forEach(({ property, content }) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    });
    
    // Add Twitter Card meta tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: ogTitle },
      { name: 'twitter:description', content: ogDescription },
      { name: 'twitter:image', content: ogImage },
    ];
    
    twitterTags.forEach(({ name, content }) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    });
    
  }, [article]);
  
  return <FaviconLinks />;
}