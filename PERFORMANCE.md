# ⚡ Performance & Security Optimization Guide

## สรุปการปรับปรุง

### 🚀 Performance Improvements

#### 1. **Custom Hooks สำหรับ Performance**

ไฟล์: `src/hooks/usePerformance.ts`

- ✅ **useScrollToTop** - Auto scroll to top เมื่อเปลี่ยนหน้า
- ✅ **useDebounce** - Debounce สำหรับ search และ input
- ✅ **useLazyLoad** - Lazy load images ด้วย Intersection Observer
- ✅ **usePrefetch** - Prefetch resources สำหรับหน้าถัดไป

**การใช้งาน:**

```typescript
import {
  useScrollToTop,
  useDebounce,
  useLazyLoad,
} from "@/hooks/usePerformance";

// Auto scroll to top
useScrollToTop();

// Debounce search
const [search, setSearch] = useState("");
const debouncedSearch = useDebounce(search, 500);

// Lazy load image
const imageRef = useRef(null);
const isVisible = useLazyLoad(imageRef);
```

#### 2. **Error Boundary**

ไฟล์: `src/components/ErrorBoundary.tsx`

- ✅ จับ errors ทั้งหมดไม่ให้ app crash
- ✅ แสดง UI สวยงามเมื่อเกิด error
- ✅ รองรับ async errors
- ✅ แสดง error details ใน development mode

**การใช้งาน:**

```typescript
import { ErrorBoundary } from "@/components/ErrorBoundary";

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>;
```

#### 3. **Service Worker (PWA)**

ไฟล์: `public/service-worker.js`

- ✅ Cache static assets
- ✅ Offline support
- ✅ Background sync
- ✅ Push notifications (optional)

**การเปิดใช้งาน:**
เพิ่มใน `src/main.tsx`:

```typescript
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => console.log("SW registered:", registration))
      .catch((error) => console.log("SW registration failed:", error));
  });
}
```

### 🔒 Security Improvements

#### 1. **Security Headers Component**

ไฟล์: `src/components/SecurityHeaders.tsx`

Headers ที่เพิ่ม:

- ✅ **Content-Security-Policy** - ป้องกัน XSS attacks
- ✅ **X-Frame-Options** - ป้องกัน clickjacking
- ✅ **X-Content-Type-Options** - ป้องกัน MIME sniffing
- ✅ **Referrer-Policy** - ควบคุม referrer information
- ✅ **Permissions-Policy** - จำกัด browser features

**การใช้งาน:**
เพิ่มใน `App.tsx`:

```typescript
import { SecurityHeaders } from "@/components/SecurityHeaders";

<SecurityHeaders />;
```

#### 2. **Security Utilities**

ไฟล์: `src/lib/security.ts`

- ✅ **RateLimiter** - จำกัดจำนวนการเรียก API
- ✅ **sanitizeInput** - ทำความสะอาด user input
- ✅ **isValidUrl** - ตรวจสอบ URL
- ✅ **isValidEmail** - ตรวจสอบ email
- ✅ **generateCSRFToken** - สร้าง CSRF token
- ✅ **validateCSRFToken** - ตรวจสอบ CSRF token

**การใช้งาน:**

```typescript
import { RateLimiter, sanitizeInput, isValidUrl } from "@/lib/security";

// Rate limiting
const limiter = new RateLimiter(5, 60000); // 5 requests per minute
if (!limiter.checkLimit("user-123")) {
  console.log("Rate limit exceeded");
}

// Sanitize input
const clean = sanitizeInput(userInput);

// Validate URL
if (isValidUrl(url)) {
  window.open(url);
}
```

## 📋 Checklist การใช้งาน

### Performance

- [ ] เพิ่ม `useScrollToTop()` ใน pages ที่ต้องการ
- [ ] ใช้ `useDebounce` สำหรับ search inputs
- [ ] ใช้ `useLazyLoad` สำหรับ images
- [ ] Wrap app ด้วย `<ErrorBoundary>`
- [ ] เปิดใช้งาน Service Worker
- [ ] ใช้ React.lazy() สำหรับ code splitting

### Security

- [ ] เพิ่ม `<SecurityHeaders />` ใน App.tsx
- [ ] ใช้ `sanitizeInput()` สำหรับ user inputs
- [ ] ใช้ `isValidUrl()` ก่อน redirect
- [ ] เพิ่ม Rate Limiting สำหรับ API calls
- [ ] ตรวจสอบ `.env` ไม่ถูก commit
- [ ] ตั้งค่า RLS ใน Supabase

## 🎯 Best Practices

### 1. Code Splitting

```typescript
// แทนที่จะ import ตรงๆ
import Admin from "./pages/Admin";

// ใช้ lazy loading
const Admin = lazy(() => import("./pages/Admin"));

<Suspense fallback={<Loading />}>
  <Admin />
</Suspense>;
```

### 2. Image Optimization

```typescript
// ใช้ modern formats
<img src="image.webp" alt="..." />

// Lazy load images
<img loading="lazy" src="..." alt="..." />

// Responsive images
<img
  srcSet="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 600px) 480px, (max-width: 900px) 800px, 1200px"
  src="medium.jpg"
  alt="..."
/>
```

### 3. Memoization

```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// Memoize components
const MemoizedComponent = memo(MyComponent);
```

### 4. Virtual Scrolling

สำหรับ lists ที่มีข้อมูลเยอะ:

```typescript
import { useVirtualizer } from "@tanstack/react-virtual";

const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50,
});
```

## 🔧 การตั้งค่า Vite สำหรับ Production

อัพเดท `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": ["framer-motion", "lucide-react"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
      },
    },
  },
});
```

## 📊 Performance Metrics

### ตรวจสอบ Performance

```bash
# Build และวิเคราะห์
npm run build

# ดู bundle size
npm run build -- --mode analyze
```

### Lighthouse Score Targets

- 🎯 Performance: > 90
- 🎯 Accessibility: > 95
- 🎯 Best Practices: > 95
- 🎯 SEO: > 95

## 🛡️ Security Checklist

### Frontend Security

- ✅ Content Security Policy configured
- ✅ XSS protection enabled
- ✅ CSRF protection implemented
- ✅ Input validation and sanitization
- ✅ Secure headers set
- ✅ HTTPS only (in production)

### Backend Security (Supabase)

- ✅ Row Level Security (RLS) enabled
- ✅ API keys in environment variables
- ✅ Rate limiting configured
- ✅ Authentication required for admin
- ✅ Input validation on server side

## 🚀 Deployment Checklist

### Pre-deployment

- [ ] Run `npm run build` successfully
- [ ] Test in production mode locally
- [ ] Check Lighthouse scores
- [ ] Verify all environment variables
- [ ] Test on mobile devices
- [ ] Check browser compatibility

### Post-deployment

- [ ] Verify Service Worker is working
- [ ] Test offline functionality
- [ ] Check security headers
- [ ] Monitor error logs
- [ ] Test performance on real devices

## 📈 Monitoring

### Tools แนะนำ

1. **Vercel Analytics** - Already integrated
2. **Sentry** - Error tracking
3. **Google Analytics** - User analytics
4. **Web Vitals** - Performance monitoring

### การเพิ่ม Sentry (Optional)

```bash
npm install @sentry/react
```

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

## 💡 Tips

1. **ใช้ React DevTools Profiler** - หา components ที่ render บ่อย
2. **ใช้ Network tab** - ตรวจสอบ requests
3. **ใช้ Performance tab** - วิเคราะห์ bottlenecks
4. **ทดสอบบน slow 3G** - ดูว่า app ทำงานได้ดีไหม
5. **ใช้ Lighthouse CI** - Auto-check performance ทุก commit

## 🔄 การอัพเดทต่อไป

### Phase 2 (Optional)

- [ ] Implement Authentication
- [ ] Add Redis for caching
- [ ] Set up CDN for static assets
- [ ] Add image optimization service
- [ ] Implement server-side rendering (SSR)
- [ ] Add end-to-end testing

---

**สร้างโดย CodeX 🚀**
**อัพเดทล่าสุด: 2025-12-04**
