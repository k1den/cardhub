import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cardhub.ru';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/c/', '/legal/', '/legal/*'],
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/invite/',
          '/auth/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
