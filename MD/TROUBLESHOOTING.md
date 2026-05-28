# Troubleshooting Guide - Festival Management System

**Version:** 1.1.0  
**Last Updated:** May 24, 2026

---

## 🔍 Common Issues & Solutions

### 1. Logos Not Displaying on ID Cards

#### Symptoms
- Church logo (`new-church-logo.png`) not visible on ID card
- Festival logo (`Arebsalin-1.png`) not visible on ID card
- Broken image icon appears where logos should be
- Console error: `Failed to load: /src/imports/...`

#### Root Cause
Using dynamic URL construction instead of static ES module imports.

#### ✅ Solution

**Use static ES module imports:**

```typescript
// ✅ CORRECT - Do this
import churchLogo from '../../imports/new-church-logo.png';
import festivalLogo from '../../imports/Arebsalin-1.png';

<img src={churchLogo} alt="Church Logo" className="..." />
<img src={festivalLogo} alt="Festival Logo" className="..." />
```

**Avoid these patterns:**

```typescript
// ❌ WRONG - Don't do this
const logoPath = new URL('../../imports/new-church-logo.png', import.meta.url).href;

// ❌ WRONG - Don't do this
<img src="../../imports/new-church-logo.png" alt="Logo" />

// ❌ WRONG - Don't do this
import logo from '../../imports/new-church-logo.png?url';

// ❌ WRONG - Don't do this (not ES modules)
const logo = require('../../imports/new-church-logo.png');
```

#### Why This Works
- Vite processes static imports at build time
- Images are hashed and copied to dist folder
- Import resolves to correct production path
- Works in both development and production

#### Verification Steps
1. Check that images exist in `/src/imports/` directory
2. Verify import statement is at top of file (not inside function)
3. Ensure no typos in filename (case-sensitive)
4. Test in both dev (`pnpm dev`) and production (`pnpm build`)

---

### 2. ID Card Download Not Working

#### Symptoms
- Click "تحميل البطاقة" button but nothing happens
- Console error about `getElementById`
- Download starts but file is empty or corrupt
- Browser shows "Failed - Network error"

#### Possible Causes & Solutions

**A. Missing ID Attribute**

```typescript
// ❌ WRONG
<div className="...">  {/* No id attribute */}
  <IDCard student={participant} />
</div>

// ✅ CORRECT
<div id="id-card" className="...">  {/* id="id-card" required */}
  <IDCard student={participant} />
</div>
```

**B. html2canvas Not Installed**

```bash
# Check if installed
pnpm list html2canvas

# If not installed
pnpm add html2canvas
```

**C. CORS Issues with Images**

```typescript
// Ensure useCORS is true
await html2canvas(element, {
  scale: 2,
  useCORS: true,  // ← Important for cross-origin images
  backgroundColor: null
});
```

**D. Browser Blocking Downloads**

- Check browser's download settings
- Ensure pop-ups are allowed for the site
- Try a different browser (Chrome, Firefox, Edge)

---

### 3. QR Code Not Scanning

#### Symptoms
- QR scanner app can't read the code
- Code scans but shows wrong ID
- Works sometimes but not consistently
- Scanner shows "Invalid QR code"

#### Solutions

**A. Increase QR Size**

```typescript
// ❌ Too small (hard to scan)
<QRCodeSVG size={80} />

// ✅ Optimal size
<QRCodeSVG size={140} />

// ✅ Even better for printing
<QRCodeSVG size={200} />
```

**B. Use Higher Error Correction**

```typescript
// ❌ Low error correction
<QRCodeSVG level="L" />  // Only 7% recovery

// ✅ High error correction
<QRCodeSVG level="H" />  // 30% recovery - recommended
```

**C. Verify Participant ID**

```typescript
// ✅ CORRECT - Valid string ID
<QRCodeSVG value="P001" />
<QRCodeSVG value={student.id} />

// ❌ WRONG - Empty or undefined
<QRCodeSVG value="" />
<QRCodeSVG value={undefined} />
```

**D. Improve Download Resolution**

```typescript
// ❌ Low resolution (pixelated QR)
await html2canvas(element, { scale: 1 });

// ✅ Good resolution
await html2canvas(element, { scale: 2 });

// ✅ Best for printing
await html2canvas(element, { scale: 3 });
```

**E. Check Scanning Conditions**

- ✅ Good lighting (not too bright, not too dark)
- ✅ Steady hands (avoid motion blur)
- ✅ Clean screen/print (no smudges or fingerprints)
- ✅ Proper distance (6-12 inches / 15-30 cm)
- ✅ Flat surface (not curved or wrinkled)

---

### 4. Arabic Text Displaying Incorrectly

#### Symptoms
- Text appears left-to-right instead of right-to-left
- Text aligned to wrong side
- Numbers mixed with Arabic text incorrectly
- Characters disconnected or backwards

#### Solutions

**A. Add RTL Direction**

```typescript
// ❌ Missing RTL direction
<div>{arabicText}</div>

// ✅ With RTL direction
<div dir="rtl">{arabicText}</div>

// ✅ For headings
<h2 dir="rtl" className="...">{student.name}</h2>
```

**B. Check Global RTL Setting**

```css
/* In theme.css or globals.css */
html {
  direction: rtl;  /* ← Should be set globally */
}
```

**C. Verify Font Support**

```css
/* Ensure Arabic fonts are loaded */
font-family: 'Tajawal', 'Cairo', sans-serif;
```

**D. Check Text Alignment**

```typescript
// For RTL text, use appropriate alignment
<div className="text-right" dir="rtl">  {/* Right align for RTL */}
  {arabicText}
</div>
```

---

### 5. Low Quality Downloaded Images

#### Symptoms
- Downloaded ID card is blurry
- Text is hard to read
- QR code is pixelated
- Image looks low resolution

#### Solutions

**A. Increase Scale Factor**

```typescript
// ❌ Low quality (350x550px)
await html2canvas(element, { scale: 1 });

// ✅ Good quality (700x1100px)
await html2canvas(element, { scale: 2 });

// ✅ Best quality (1050x1650px)
await html2canvas(element, { scale: 3 });

// ⚠️ Very high (may cause memory issues on mobile)
await html2canvas(element, { scale: 4 });
```

**B. Check Image Format**

```typescript
// ✅ PNG for quality (recommended)
canvas.toBlob((blob) => {
  // ...save blob
}, 'image/png');

// ⚠️ JPEG has lower quality but smaller file
canvas.toBlob((blob) => {
  // ...save blob
}, 'image/jpeg', 0.95);  // 95% quality
```

**C. Verify Canvas Settings**

```typescript
await html2canvas(element, {
  scale: 2,
  backgroundColor: '#ffffff',  // White background
  logging: false,
  useCORS: true,
  allowTaint: false,
  removeContainer: true,
  imageTimeout: 0  // No timeout for image loading
});
```

---

### 6. Camera Permission Denied

#### Symptoms
- QR scanner shows "Camera access denied"
- Blank screen when opening scanner
- Browser doesn't ask for permission
- Console error about getUserMedia

#### Solutions

**A. Check Browser Permissions**

**Chrome:**
1. Click padlock icon in address bar
2. Click "Site settings"
3. Find "Camera" permission
4. Select "Allow"

**Firefox:**
1. Click shield/lock icon in address bar
2. Click arrow next to "Blocked" or "Allowed"
3. Find "Camera" permission
4. Select "Allow"

**Safari:**
1. Safari > Preferences > Websites
2. Select "Camera" from left sidebar
3. Find your site and select "Allow"

**B. Use HTTPS**

```
// ❌ Camera may not work on HTTP
http://localhost:5173

// ✅ Camera works on HTTPS or localhost
https://yourdomain.com
http://localhost:5173  // Exception for localhost
```

**C. Use Image Upload Fallback**

The QRScanner component includes a fallback:

```typescript
{/* When camera is denied */}
<input
  type="file"
  accept="image/*"
  onChange={handleImageUpload}
/>
```

Users can upload a screenshot of the QR code instead.

---

### 7. Points Not Updating

#### Symptoms
- Scan QR code but points don't change
- Manual points entry doesn't save
- Points show old value after update
- Attendance registered but no +10 points

#### Solutions

**A. Check State Update**

```typescript
// ❌ Direct mutation (won't trigger re-render)
participant.points += 10;

// ✅ Proper state update
setParticipants(prev => prev.map(p =>
  p.id === participantId
    ? { ...p, points: p.points + 10 }
    : p
));
```

**B. Verify Attendance Logic**

```typescript
// Check if already attended today
const today = new Date().toISOString().split('T')[0];
const alreadyAttended = participant.attendanceDays.includes(today);

if (!alreadyAttended) {
  // Add points and record attendance
}
```

**C. Check Points Validation**

```typescript
// Ensure points is a valid number
const pointsToAdd = parseInt(inputValue);
if (isNaN(pointsToAdd) || pointsToAdd <= 0) {
  toast.error('أدخل قيمة صحيحة');  // Invalid value
  return;
}
```

---

### 8. Build Errors

#### Symptoms
- `pnpm build` fails
- TypeScript errors during build
- Vite build errors
- Module not found errors

#### Solutions

**A. Clear Cache and Reinstall**

```bash
# Remove node_modules and cache
rm -rf node_modules pnpm-lock.yaml

# Reinstall dependencies
pnpm install

# Try build again
pnpm build
```

**B. Check TypeScript Errors**

```bash
# Run TypeScript check
pnpm tsc --noEmit

# Fix any type errors shown
```

**C. Verify Imports**

```typescript
// ✅ CORRECT - Named exports
import { IDCard } from './components/IDCard';
import { toast } from 'sonner';

// ❌ WRONG - Default import for named export
import IDCard from './components/IDCard';
```

**D. Check Asset Paths**

```typescript
// ✅ Relative paths from component location
import logo from '../../imports/logo.png';

// ❌ Absolute paths (don't work in production)
import logo from '/src/imports/logo.png';
```

---

### 9. Performance Issues

#### Symptoms
- App is slow or laggy
- Scrolling is not smooth
- Scanner takes long to start
- Download takes forever

#### Solutions

**A. Optimize Re-renders**

```typescript
// Use memo for expensive components
const IDCard = React.memo(({ student }) => {
  // component code
});

// Use callback for event handlers
const handleDownload = useCallback(() => {
  // download logic
}, [dependencies]);
```

**B. Optimize Images**

```bash
# Compress images before adding to /src/imports/
# Use tools like TinyPNG, ImageOptim, etc.
```

**C. Code Splitting**

```typescript
// Lazy load heavy components
const StatisticsPage = lazy(() => import('./components/StatisticsPage'));

// Use Suspense
<Suspense fallback={<div>Loading...</div>}>
  <StatisticsPage />
</Suspense>
```

**D. Reduce Download Scale**

```typescript
// For mobile devices, use scale: 2 instead of 3
const isMobile = window.innerWidth < 768;
await html2canvas(element, { 
  scale: isMobile ? 2 : 3 
});
```

---

### 10. Toast Notifications Not Showing

#### Symptoms
- Success/error messages don't appear
- Toast shows but disappears immediately
- Toast appears in wrong position
- Toast text is not Arabic

#### Solutions

**A. Verify Toaster Component**

```typescript
// Must be included in App.tsx or root component
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Toaster 
        position="top-center"
        dir="rtl"  // ← Important for Arabic
        toastOptions={{
          style: {
            fontFamily: 'Tajawal, Cairo, sans-serif'
          }
        }}
      />
      {/* Rest of app */}
    </>
  );
}
```

**B. Check Toast Calls**

```typescript
// ✅ CORRECT
import { toast } from 'sonner';

toast.success('تم بنجاح');  // Success
toast.error('حدث خطأ');      // Error
toast.info('معلومة');        // Info

// ❌ WRONG - Wrong import
import toast from 'sonner';  // Should be named import
```

**C. Adjust Duration**

```typescript
// Show toast for longer
toast.success('تم الحفظ', {
  duration: 5000  // 5 seconds instead of default 3
});

// Keep visible until dismissed
toast.success('تم الحفظ', {
  duration: Infinity
});
```

---

## 🔧 General Debugging Tips

### Check Console

Always check browser console (F12) for errors:
- Red errors indicate critical issues
- Yellow warnings indicate potential problems
- Blue info messages are usually safe

### Verify Environment

```bash
# Check Node version (should be 16+)
node --version

# Check pnpm version
pnpm --version

# Check if dev server is running
# Should see: Local: http://localhost:5173
pnpm dev
```

### Test in Different Browsers

If something works in Chrome but not Safari:
- Check browser-specific CSS properties
- Verify JavaScript API compatibility
- Test camera/media API support

### Clear Browser Cache

Sometimes old cached files cause issues:
1. Open browser DevTools (F12)
2. Right-click on refresh button
3. Select "Empty cache and hard reload"
4. Or use Ctrl+Shift+Delete to clear all cache

---

## 📞 Still Need Help?

### Documentation Resources

1. **Main Documentation:** [DOCUMENTATION.md](DOCUMENTATION.md)
2. **ID Card Guide:** [ID_CARD_DOCUMENTATION.md](ID_CARD_DOCUMENTATION.md)
3. **Recent Changes:** [RECENT_UPDATES.md](RECENT_UPDATES.md)
4. **Version History:** [CHANGELOG.md](CHANGELOG.md)

### Code References

- Check component source code in `/src/app/components/`
- Look at working examples in EnhancedDashboard.tsx
- Review mock data in AppMain.tsx

### Search the Codebase

```bash
# Search for specific text in all files
grep -r "searchTerm" src/

# Find files by name
find src/ -name "*.tsx" | grep Component
```

---

**Last Updated:** May 24, 2026  
**Version:** 1.1.0  
**Maintained By:** Festival Development Team
