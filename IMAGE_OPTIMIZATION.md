 # Image Optimization Guide

## ✅ What's Been Optimized

### 1. **Next.js Image Configuration** (`next.config.mjs`)
- **Modern formats**: AVIF and WebP automatic conversion
- **Responsive sizes**: Optimized for all device sizes (640px to 4K)
- **Caching**: 60 second minimum cache TTL for better performance

### 2. **Components Updated**
- ✅ `components/Navbar.jsx` - Logo now uses Next.js Image component
- ✅ `app/page.js` - Already using Next.js Image (verified)
- ✅ Created `components/OptimizedImage.js` - Reusable wrapper with loading states

## 📦 Available Images in `/public`

```
/logo.svg                  - Main logo (SVG)
/MyCanteen-logo.jpg        - Logo for QR codes
/food-icon.png            - Food icon
/canteen-1.jpg            - Canteen photos (3 images)
/developer1.jpg           - Developer photos (4 images)
```

## 🚀 How to Use Optimized Images

### Basic Usage (Next.js Image)

```jsx
import Image from 'next/image';

<Image
  src="/logo.svg"
  alt="MyCanteen Logo"
  width={56}
  height={56}
  priority  // Use for above-the-fold images
/>
```

### Advanced Usage (OptimizedImage component)

```jsx
import OptimizedImage from '@/components/OptimizedImage';

<OptimizedImage
  src="/canteen-1.jpg"
  alt="Canteen interior"
  width={800}
  height={600}
  quality={85}
  priority={false}  // Set true for above-fold images
  className="rounded-lg shadow-lg"
/>
```

## 🎯 Best Practices

### 1. **Always specify width and height**
```jsx
// ✅ Good
<Image src="/logo.svg" width={56} height={56} alt="Logo" />

// ❌ Bad - causes layout shift
<Image src="/logo.svg" alt="Logo" />
```

### 2. **Use `priority` for above-the-fold images**
```jsx
// Hero image, logo, main banner
<Image src="/hero.jpg" priority width={1200} height={600} alt="Hero" />
```

### 3. **Use `fill` for responsive containers**
```jsx
<div className="relative w-full h-64">
  <Image
    src="/canteen-1.jpg"
    fill
    style={{ objectFit: 'cover' }}
    alt="Canteen"
  />
</div>
```

### 4. **Optimize quality based on image type**
```jsx
// Photos: 75-85 quality
<Image src="/photo.jpg" quality={80} />

// Graphics/logos: Use SVG or 90+ quality
<Image src="/logo.png" quality={95} />
```

## 📊 Performance Benefits

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Image Format | JPG/PNG | AVIF/WebP | ~30-50% smaller |
| Loading | Eager | Lazy | Faster initial load |
| Layout Shift | ✗ | ✓ | Better CLS score |
| Responsive | ✗ | ✓ | Optimized per device |

## 🔧 Image Formats Support

Next.js automatically serves the best format based on browser support:

1. **AVIF** (best compression, newest browsers)
2. **WebP** (great compression, wide support)
3. **Original format** (fallback for older browsers)

## 💡 Tips

- **SVG files**: Already optimized, use directly with Image component
- **External images**: Add domains to `next.config.mjs` under `images.remotePatterns`
- **Static images**: Place in `/public` folder, reference with `/filename.jpg`
- **Blur placeholder**: Use for better UX during loading

## 🛠️ OptimizedImage Component Features

The custom `OptimizedImage` component includes:
- ✅ Loading skeleton animation
- ✅ Error handling with fallback UI
- ✅ Automatic blur placeholder
- ✅ All Next.js Image props supported

## 📝 Example: Complete Image Usage

```jsx
import OptimizedImage from '@/components/OptimizedImage';

export default function Gallery() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <OptimizedImage
        src="/canteen-1.jpg"
        alt="Modern canteen facility"
        width={400}
        height={300}
        quality={80}
        className="rounded-lg hover:scale-105 transition"
      />
      <OptimizedImage
        src="/canteen-2.jpg"
        alt="Dining area"
        width={400}
        height={300}
        quality={80}
        className="rounded-lg hover:scale-105 transition"
      />
      <OptimizedImage
        src="/canteen-3.jpg"
        alt="Food service counter"
        width={400}
        height={300}
        quality={80}
        className="rounded-lg hover:scale-105 transition"
      />
    </div>
  );
}
```

## 🚨 Common Issues & Solutions

### Issue: Image not loading
**Solution**: Check file exists in `/public` and path is correct (use `/` prefix)

### Issue: Layout shift
**Solution**: Always specify `width` and `height` props

### Issue: Blurry images
**Solution**: Increase `quality` prop or use larger dimensions

### Issue: External images not working
**Solution**: Add domain to `next.config.mjs`:
```js
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'example.com',
    },
  ],
}
```

## 📚 Resources

- [Next.js Image Documentation](https://nextjs.org/docs/app/api-reference/components/image)
- [Image Optimization Best Practices](https://web.dev/fast/#optimize-your-images)
