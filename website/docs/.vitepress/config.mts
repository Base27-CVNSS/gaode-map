import { defineConfig, type HeadConfig, type TransformContext } from 'vitepress'

const siteUrl = 'https://tomwq.github.io'
const siteBase = '/expo-gaode-map/'
const siteOrigin = `${siteUrl}${siteBase}`
const defaultOgImage = `${siteOrigin}bg.png`

function toRoutePath(relativePath: string): string {
  if (relativePath === 'index.md') {
    return '/'
  }

  if (relativePath.endsWith('/index.md')) {
    return `/${relativePath.slice(0, -'index.md'.length)}`
  }

  return `/${relativePath.replace(/\.md$/, '')}`
}

function resolveCanonicalUrl(routePath: string): string {
  const normalizedPath = routePath === '/' ? '' : routePath.replace(/^\//, '')

  return `${siteOrigin}${normalizedPath}`
}

function removeHtmlExtension(url: string): string {
  return url.endsWith('.html') ? url.slice(0, -'.html'.length) : url
}

function resolveAlternateLinks(routePath: string): Array<{ lang: string; url: string }> {
  const isEnglish = routePath.startsWith('/en/')
  const isVietnamese = routePath.startsWith('/vi/')
  const basePath = isEnglish
    ? routePath.replace(/^\/en/, '') || '/'
    : isVietnamese
      ? routePath.replace(/^\/vi/, '') || '/'
      : routePath
  const enPath = basePath === '/' ? '/en/' : `/en${basePath}`
  const viPath = basePath === '/' ? '/vi/' : `/vi${basePath}`

  return [
    { lang: 'zh-CN', url: resolveCanonicalUrl(basePath) },
    { lang: 'en', url: resolveCanonicalUrl(enPath) },
    { lang: 'vi-VN', url: resolveCanonicalUrl(viPath) },
    { lang: 'x-default', url: resolveCanonicalUrl(basePath) },
  ]
}

function resolvePageDescription(context: TransformContext): string {
  if (context.pageData.description) {
    return context.pageData.description
  }

  if (context.pageData.relativePath.startsWith('en/')) {
    return 'Expo / React Native AMap documentation for maps, location, search, navigation, offline maps, and Web API helpers.'
  }
  if (context.pageData.relativePath.startsWith('vi/')) {
    return 'Tài liệu AMap cho Expo / React Native: bản đồ, định vị, tìm kiếm, dẫn đường, bản đồ ngoại tuyến và Web API.'
  }
  return 'Expo / React Native 高德地图文档：地图、定位、搜索、导航、离线地图与 Web API。'
}

function createJsonLd(context: TransformContext, canonicalUrl: string): string {
  const pageTitle = context.pageData.title || 'expo-gaode-map'
  const pageDescription = resolvePageDescription(context)
  const inEnglish = context.pageData.relativePath.startsWith('en/')
  const inVietnamese = context.pageData.relativePath.startsWith('vi/')
  const isHomePage = ['index.md', 'en/index.md', 'vi/index.md'].includes(context.pageData.relativePath)

  if (isHomePage) {
    return JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': `${siteOrigin}#website`,
            name: 'expo-gaode-map',
            description: pageDescription,
            url: siteOrigin,
            inLanguage: ['zh-CN', 'en-US', 'vi-VN'],
          },
          {
            '@type': 'SoftwareSourceCode',
            '@id': `${siteOrigin}#software`,
            name: 'expo-gaode-map',
            description: pageDescription,
            url: canonicalUrl,
            codeRepository: 'https://github.com/TomWq/expo-gaode-map',
            license: 'https://opensource.org/license/mit',
            programmingLanguage: ['TypeScript', 'Kotlin', 'Swift', 'C++'],
            runtimePlatform: ['Android', 'iOS', 'Expo', 'React Native'],
            isAccessibleForFree: true,
            isPartOf: { '@id': `${siteOrigin}#website` },
            author: {
              '@type': 'Person',
              name: 'TomWq',
              url: 'https://github.com/TomWq',
            },
            sameAs: [
              'https://www.npmjs.com/package/expo-gaode-map',
              'https://www.npmjs.com/package/expo-gaode-map-navigation',
              'https://www.npmjs.com/package/expo-gaode-map-web-api',
            ],
          },
        ],
      },
      null,
      0
    )
  }

  return JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      inLanguage: inEnglish ? 'en-US' : inVietnamese ? 'vi-VN' : 'zh-CN',
      isPartOf: {
        '@type': 'WebSite',
        '@id': `${siteOrigin}#website`,
        name: 'expo-gaode-map',
        url: siteOrigin,
      },
      mainEntityOfPage: canonicalUrl,
      author: {
        '@type': 'Person',
        name: 'TomWq',
        url: 'https://github.com/TomWq',
      },
      publisher: {
        '@type': 'Person',
        name: 'TomWq',
        url: 'https://github.com/TomWq',
      },
      image: defaultOgImage,
    },
    null,
    0
  )
}

function buildSeoHead(context: TransformContext): HeadConfig[] {
  const routePath = toRoutePath(context.pageData.relativePath)
  const canonicalUrl = resolveCanonicalUrl(routePath)
  const alternateLinks = resolveAlternateLinks(routePath)
  const pageTitle = context.pageData.title || 'expo-gaode-map'
  const pageDescription = resolvePageDescription(context)
  const locale = context.pageData.relativePath.startsWith('en/')
    ? 'en_US'
    : context.pageData.relativePath.startsWith('vi/')
      ? 'vi_VN'
      : 'zh_CN'

  return [
    ['link', { rel: 'canonical', href: canonicalUrl }],
    ...alternateLinks.map(({ lang, url }) => ['link', { rel: 'alternate', hreflang: lang, href: url }] as HeadConfig),
    ['meta', { property: 'og:url', content: canonicalUrl }],
    ['meta', { property: 'og:title', content: pageTitle }],
    ['meta', { property: 'og:description', content: pageDescription }],
    ['meta', { property: 'og:locale', content: locale }],
    ['meta', { name: 'twitter:title', content: pageTitle }],
    ['meta', { name: 'twitter:description', content: pageDescription }],
    ['script', { type: 'application/ld+json' }, createJsonLd(context, canonicalUrl)],
  ]
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-CN',
  title: "expo-gaode-map",
  description: "Expo / React Native 高德地图（AMap）组件库文档：地图、定位、搜索、导航、离线地图。",
  sitemap: {
    hostname: siteOrigin,
    transformItems(items) {
      return items.map((item) => ({
        ...item,
        url: removeHtmlExtension(item.url),
        links: item.links?.map((link) => ({
          ...link,
          url: removeHtmlExtension(link.url),
        })),
      }))
    },
  },
  transformHead(context) {
    return buildSeoHead(context)
  },
  head: [
    [
      'meta',
      {
        name: 'keywords',
        content: 'rn 高德地图, react native 高德地图, expo 高德地图, react native amap, expo amap, gaode map react native, amap react native, react-native-amap3d, amap3d, expo-gaode-map, gaode map, china map'
      }
    ],
    [
      'meta',
      {
        property: 'og:type',
        content: 'website'
      }
    ],
    [
      'meta',
      {
        property: 'og:title',
        content: 'expo-gaode-map | React Native 高德地图'
      }
    ],
    [
      'meta',
      {
        property: 'og:description',
        content: 'Expo / React Native 高德地图组件库：地图、定位、覆盖物、搜索、导航、离线地图。'
      }
    ],
    [
      'meta',
      {
        property: 'og:url',
        content: siteOrigin
      }
    ],
    [
      'meta',
      {
        property: 'og:image',
        content: defaultOgImage
      }
    ],
    [
      'meta',
      {
        name: 'twitter:card',
        content: 'summary_large_image'
      }
    ],
    [
      'meta',
      {
        name: 'twitter:title',
        content: 'expo-gaode-map | React Native 高德地图'
      }
    ],
    [
      'meta',
      {
        name: 'twitter:description',
        content: 'Expo / React Native 高德地图组件库：地图、定位、覆盖物、搜索、导航、离线地图。'
      }
    ],
    [
      'meta',
      {
        name: 'twitter:image',
        content: defaultOgImage
      }
    ]
  ],
  base: siteBase,
  
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'expo-gaode-map',
      description: 'Expo / React Native 高德地图文档：地图、定位、搜索、导航、离线地图与 Web API。',
      themeConfig: {
        nav: [
          { text: '首页', link: '/' },
          { text: '概览', link: '/overview' },
          { text: '选型', link: '/guide/choosing-amap-library' },
          { text: '快速开始', link: '/guide/getting-started' },
          { text: 'API', link: '/api/' },
          { text: '示例', link: '/examples/' },
          { text: 'GitHub', link: 'https://github.com/TomWq/expo-gaode-map' }
        ],
        sidebar: {
          '/guide/': [
            {
              text: '指南',
              items: [
                { text: '选型指南', link: '/guide/choosing-amap-library' },
                { text: '从 react-native-amap3d 迁移', link: '/guide/migrating-from-react-native-amap3d' },
                { text: '兼容性矩阵', link: '/guide/compatibility' },
                { text: '快速开始', link: '/guide/getting-started' },
                { text: '初始化', link: '/guide/initialization' },
                { text: 'Config Plugin', link: '/guide/config-plugin' },
                { text: '错误处理', link: '/guide/error-handling' },
                { text: '测试与质量保证', link: '/guide/testing' },
                { text: '架构说明', link: '/guide/architecture' },
                { text: '搜索功能', link: '/guide/search' },
                { text: '导航功能', link: '/guide/navigation' },
                { text: '离线地图', link: '/guide/offline-map' },
                { text: 'Web API', link: '/guide/web-api' }
              ]
            }
          ],
          '/api/': [
            {
              text: '核心功能',
              items: [
                { text: 'API 总览', link: '/api/' },
                { text: 'MapView Props', link: '/api/mapview' },
                { text: '组件与 Hooks', link: '/api/components' },
                { text: '定位 API', link: '/api/location' },
                { text: '几何计算', link: '/api/geometry' },
                { text: '覆盖物', link: '/api/overlays' },
                { text: '类型定义', link: '/api/types' }
              ]
            },
            {
              text: '扩展功能',
              items: [
                { text: '搜索 API', link: '/api/search' },
                { text: '导航 API', link: '/api/navigation' },
                { text: '离线地图 API', link: '/api/offline-map' },
                { text: 'Web API', link: '/api/web-api' }
              ]
            }
          ],
          '/examples/': [
            {
              text: '使用示例',
              items: [
                { text: '示例总览', link: '/examples/' },
                { text: '场景推荐', link: '/examples/scenarios' },
                { text: '基础地图', link: '/examples/basic-map' },
                { text: '定位追踪', link: '/examples/location-tracking' },
                { text: '几何计算', link: '/examples/geometry' },
                { text: '覆盖物', link: '/examples/overlays' },
                { text: '搜索功能', link: '/examples/search' }
              ]
            }
          ]
        },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/TomWq/expo-gaode-map' }
        ],
        footer: {
          message: 'Released under the MIT License.',
          copyright: 'Copyright © 2024-present expo-gaode-map'
        }
      }
    },
    vi: {
      label: 'Tiếng Việt',
      lang: 'vi-VN',
      link: '/vi/',
      title: 'expo-gaode-map',
      description: 'Tài liệu AMap cho Expo / React Native: bản đồ, định vị, tìm kiếm, dẫn đường, bản đồ ngoại tuyến và Web API.',
      themeConfig: {
        nav: [
          { text: 'Trang chủ', link: '/vi/' },
          { text: 'Tổng quan', link: '/vi/overview' },
          { text: 'Chọn thư viện', link: '/vi/guide/choosing-amap-library' },
          { text: 'Bắt đầu', link: '/vi/guide/getting-started' },
          { text: 'API', link: '/vi/api/' },
          { text: 'Ví dụ', link: '/vi/examples/' },
          { text: 'GitHub', link: 'https://github.com/TomWq/expo-gaode-map' }
        ],
        sidebar: {
          '/vi/guide/': [
            {
              text: 'Hướng dẫn',
              items: [
                { text: 'Chọn thư viện AMap', link: '/vi/guide/choosing-amap-library' },
                { text: 'Bắt đầu nhanh', link: '/vi/guide/getting-started' },
                { text: 'Khởi tạo', link: '/en/guide/initialization' },
                { text: 'Config Plugin', link: '/en/guide/config-plugin' },
                { text: 'Xử lý lỗi', link: '/en/guide/error-handling' },
                { text: 'Kiểm thử & QA', link: '/en/guide/testing' },
                { text: 'Kiến trúc', link: '/en/guide/architecture' },
                { text: 'Tìm kiếm', link: '/en/guide/search' },
                { text: 'Dẫn đường', link: '/en/guide/navigation' },
                { text: 'Bản đồ ngoại tuyến', link: '/en/guide/offline-map' },
                { text: 'Web API', link: '/en/guide/web-api' }
              ]
            }
          ],
          '/vi/api/': [
            {
              text: 'API',
              items: [
                { text: 'Tổng quan API', link: '/vi/api/' },
                { text: 'MapView', link: '/en/api/mapview' },
                { text: 'Component & Hook', link: '/en/api/components' },
                { text: 'Định vị', link: '/en/api/location' },
                { text: 'Hình học', link: '/en/api/geometry' },
                { text: 'Lớp phủ', link: '/en/api/overlays' },
                { text: 'Kiểu dữ liệu', link: '/en/api/types' },
                { text: 'Tìm kiếm', link: '/en/api/search' },
                { text: 'Dẫn đường', link: '/en/api/navigation' },
                { text: 'Bản đồ ngoại tuyến', link: '/en/api/offline-map' },
                { text: 'Web API', link: '/en/api/web-api' }
              ]
            }
          ],
          '/vi/examples/': [
            {
              text: 'Ví dụ',
              items: [
                { text: 'Tổng quan ví dụ', link: '/vi/examples/' },
                { text: 'Bản đồ cơ bản', link: '/en/examples/basic-map' },
                { text: 'Theo dõi vị trí', link: '/en/examples/location-tracking' },
                { text: 'Hình học', link: '/en/examples/geometry' },
                { text: 'Lớp phủ', link: '/en/examples/overlays' },
                { text: 'Tìm kiếm', link: '/en/examples/search' }
              ]
            }
          ]
        },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/TomWq/expo-gaode-map' }
        ],
        footer: {
          message: 'Phát hành theo giấy phép MIT.',
          copyright: 'Copyright © 2024-present expo-gaode-map'
        }
      }
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      title: 'expo-gaode-map',
      description: 'Expo / React Native AMap documentation for maps, location, search, navigation, offline maps, and Web API helpers.',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Overview', link: '/en/overview' },
          { text: 'Choosing', link: '/en/guide/choosing-amap-library' },
          { text: 'Get Started', link: '/en/guide/getting-started' },
          { text: 'API', link: '/en/api/' },
          { text: 'Examples', link: '/en/examples/' },
          { text: 'GitHub', link: 'https://github.com/TomWq/expo-gaode-map' }
        ],
        sidebar: {
          '/en/guide/': [
            {
              text: 'Guide',
              items: [
                { text: 'Choosing an AMap Library', link: '/en/guide/choosing-amap-library' },
                { text: 'Migrating from react-native-amap3d', link: '/en/guide/migrating-from-react-native-amap3d' },
                { text: 'Compatibility Matrix', link: '/en/guide/compatibility' },
                { text: 'Getting Started', link: '/en/guide/getting-started' },
                { text: 'Initialization', link: '/en/guide/initialization' },
                { text: 'Config Plugin', link: '/en/guide/config-plugin' },
                { text: 'Error Handling', link: '/en/guide/error-handling' },
                { text: 'Testing & QA', link: '/en/guide/testing' },
                { text: 'Architecture', link: '/en/guide/architecture' },
                { text: 'Search Features', link: '/en/guide/search' },
                { text: 'Navigation', link: '/en/guide/navigation' },
                { text: 'Offline Maps', link: '/en/guide/offline-map' },
                { text: 'Web API', link: '/en/guide/web-api' }
              ]
            }
          ],
          '/en/api/': [
            {
              text: 'Core Features',
              items: [
                { text: 'API Overview', link: '/en/api/' },
                { text: 'MapView & Components', link: '/en/api/mapview' },
                { text: 'Components & Hooks', link: '/en/api/components' },
                { text: 'Location API', link: '/en/api/location' },
                { text: 'Geometry Utils', link: '/en/api/geometry' },
                { text: 'Overlays', link: '/en/api/overlays' },
                { text: 'Type Definitions', link: '/en/api/types' }
              ]
            },
            {
              text: 'Extended Features',
              items: [
                { text: 'Search API', link: '/en/api/search' },
                { text: 'Navigation API', link: '/en/api/navigation' },
                { text: 'Offline Maps API', link: '/en/api/offline-map' },
                { text: 'Web API', link: '/en/api/web-api' }
              ]
            }
          ],
          '/en/examples/': [
            {
              text: 'Examples',
              items: [
                { text: 'Examples Overview', link: '/en/examples/' },
                { text: 'Scenarios', link: '/en/examples/scenarios' },
                { text: 'Basic Map', link: '/en/examples/basic-map' },
                { text: 'Location Tracking', link: '/en/examples/location-tracking' },
                { text: 'Geometry', link: '/en/examples/geometry' },
                { text: 'Overlays', link: '/en/examples/overlays' },
                { text: 'Search Features', link: '/en/examples/search' }
              ]
            }
          ]
        },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/TomWq/expo-gaode-map' }
        ]
      }
    }
  },

  themeConfig: {
    search: {
      provider: 'local',
      options: {
        locales: {
          vi: {
            translations: {
              button: {
                buttonText: 'Tìm kiếm tài liệu',
                buttonAriaLabel: 'Tìm kiếm tài liệu'
              },
              modal: {
                noResultsText: 'Không tìm thấy kết quả phù hợp',
                resetButtonTitle: 'Xóa nội dung tìm kiếm',
                footer: {
                  selectText: 'Chọn',
                  navigateText: 'Di chuyển'
                }
              }
            }
          },
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
                }
              }
            }
          }
        }
      }
    }
  }
})
