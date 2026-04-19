# Quick Reference - Where to Customize Everything

## 🎯 Find & Replace Your Information

### Names (4 places)
Search for: `"Tara & Bandana"` and replace with your names
- `src/components/EnvelopeLanding.tsx` - Line 103
- `src/app/home/page.tsx` - Line 27
- `src/app/layout.tsx` - Line 5 (in metadata)
- `src/app/gallery/page.tsx` - Line 170 (hashtag)

### Wedding Date (2 places)
Search for: `"May 8, 2027"` and replace with your date
- `src/hooks/useCountdown.ts` - Line 19 (also update this for countdown)
- `src/components/EnvelopeLanding.tsx` - Line 108
- `src/app/home/page.tsx` - Line 30

### Location (2 places)
Search for: `"Kenwood, California"` or `"Kenwood, CA"`
- `src/components/EnvelopeLanding.tsx` - Line 109
- `src/app/home/page.tsx` - Line 31
- `src/app/timeline/page.tsx` - Line 125

### Phone Number (2 places)
Search for: `"+1 (415) 555-1234"` and replace with your number
- `src/app/home/page.tsx` - Line 62
- `src/app/faqs/page.tsx` - Line 318

---

## 📝 Page-by-Page Customization

### 1. Landing Page (`src/app/page.tsx`)
✅ No changes needed - pulls from EnvelopeLanding component

### 2. Envelope Component (`src/components/EnvelopeLanding.tsx`)
- **Line 103**: Update couple names
- **Line 108**: Update wedding date
- **Line 109**: Update location
- **Line 110**: Update date text format

### 3. Home Page (`src/app/home/page.tsx`)
- **Line 27**: Couple names (in h2)
- **Line 30**: Wedding date
- **Line 31**: Location
- **Line 34**: Days to go text
- **Line 55**: "Learn More" button text
- **Line 62**: Phone number (href and display)
- **Line 74**: Contact info
- **Line 85**: Location info
- **Line 101**: Registry section

### 4. Story Page (`src/app/story/page.tsx`)
- **Lines 25-70**: Update `storyChapters` array with your chapters
  - Change titles, dates, descriptions
  - Add photo paths
- **Line 154**: Update inspirational quote

### 5. About Us Page (`src/app/about/page.tsx`)
- **Lines 78-88**: Tara's bio text
- **Lines 102-115**: Tara's fun facts
- **Lines 137-147**: Bandana's bio text
- **Lines 161-174**: Bandana's fun facts
- **Lines 203-217**: Fun facts for both (6 items)

### 6. Timeline Page (`src/app/timeline/page.tsx`)
- **Lines 21-53**: Update `timelineEvents` array
  - Change times (3:00 PM, 4:00 PM, etc.)
  - Change event names
  - Change descriptions
  - Change locations
- **Lines 149-165**: Update important notes

### 7. Gallery Page (`src/app/gallery/page.tsx`)
- **Lines 23-25**: Add photo URLs instead of placeholders
- **Line 170**: Update wedding hashtag

### 8. Music Page (`src/app/music/page.tsx`)
- No changes needed - dynamic with user input
- **Optional**: Edit demo songs in `src/store/songStore.ts`

### 9. Registry Page (`src/app/registry/page.tsx`)
- **Line 50**: Update Amazon registry URL
- **Lines 81-92**: Update registry items list
- **Lines 98-109**: Update FAQs

### 10. FAQs Page (`src/app/faqs/page.tsx`)
- **Lines 21-73**: Update `faqItems` array (12 questions)
  - Change questions and answers to be specific to your wedding

### 11. Navigation (`src/components/Navigation.tsx`)
- **Line 26**: Update logo/initials ("T & B" → your initials)

---

## 🎨 Customizing Design Elements

### Colors
**File**: `src/app/globals.css` (Lines 11-18)
```css
--color-primary: #8B7355;      /* Warm brown */
--color-secondary: #D4AF85;    /* Gold */
--color-accent: #C1A78C;       /* Soft tan */
--color-light: #F5F1ED;        /* Cream */
--color-lighter: #FAFAF8;      /* Off-white */
--color-dark: #3D3D3D;         /* Charcoal */
--color-sage: #A8B5A6;         /* Sage green */
--color-terracotta: #C85A54;   /* Terracotta */
--color-border: #E8DDD5;       /* Light border */
```

### Fonts
**File**: `src/app/globals.css` (Line 1)
- Playfair Display: Headers
- Lora: Quotes and subheadings
- Inter: Body text
These are imported from Google Fonts

---

## 📸 Adding Photos

1. Create `public/images/` folder
2. Add your photos there:
   - `public/images/story-1.jpg`
   - `public/images/gallery-1.jpg`
   - etc.

3. Update photo paths in components:
   - `src/app/story/page.tsx` - Line 60
   - `src/app/about/page.tsx` - Lines 70, 148
   - `src/app/gallery/page.tsx` - Line 70

---

## 📊 Song Voting System

**File**: `src/store/songStore.ts`

Initial demo songs (Lines 19-35):
```typescript
songs: [
  { id: '1', title: 'Song Title', artist: 'Artist', votes: 0, votedBy: new Set() },
  // Add/modify initial songs here
]
```

The system uses localStorage, so votes persist per device!

---

## ⚡ Quick Edit Guide

### Most Important Files (Edit First)
1. `src/hooks/useCountdown.ts` - Wedding date
2. `src/components/EnvelopeLanding.tsx` - Names & location
3. `src/app/story/page.tsx` - Your love story
4. `src/app/timeline/page.tsx` - Wedding schedule
5. `src/app/about/page.tsx` - About you both

### Secondary Files (Edit Next)
6. `src/app/home/page.tsx` - Welcome page
7. `src/app/faqs/page.tsx` - FAQs for your wedding
8. `src/app/gallery/page.tsx` - Add photos
9. `src/app/registry/page.tsx` - Registry link
10. `src/components/Navigation.tsx` - Logo/initials

### Nice-to-Have
11. `src/app/globals.css` - Colors (optional)
12. `src/store/songStore.ts` - Initial songs

---

## 🔍 Search & Replace Tips

Use Ctrl+H (or Cmd+H on Mac) to open Find & Replace in VS Code:

| Find | Replace With |
|------|---|
| `Tara & Bandana` | Your names |
| `May 8, 2027` | Your date |
| `Kenwood, CA` | Your location |
| `+1 (415) 555-1234` | Your phone |
| `Playfair Display` | Different serif font |
| `Inter` | Different sans-serif |
| `#8B7355` | Different primary color |
| `#D4AF85` | Different accent color |

---

## 📋 Customization Checklist

**Essential** (Must do):
- [ ] Update wedding date in countdown hook
- [ ] Update couple names everywhere
- [ ] Update location
- [ ] Update phone number
- [ ] Add your story (4 chapters)
- [ ] Add about us information
- [ ] Update timeline with correct times
- [ ] Update FAQs for your wedding

**Important** (Should do):
- [ ] Add 10-15 photos to gallery
- [ ] Update registry link
- [ ] Update initial song suggestions
- [ ] Update hashtag for photos

**Optional** (Nice to have):
- [ ] Change color palette if you want
- [ ] Update fonts if you prefer different ones
- [ ] Customize wording/descriptions

---

## 🎊 Testing After Changes

After making edits:
1. Save file (Ctrl+S)
2. Check browser (http://localhost:3000) - auto-refreshes
3. Test on mobile view
4. Click all buttons and links
5. Test forms (add song, expand FAQs, etc.)
6. Verify all photos load

---

## 📦 File Size Limits

- Images: Optimize before uploading (TinyPNG is great!)
- Keep everything under 5MB total if possible
- Gallery images should be compressed (50-100KB each)

---

## 🚀 When You're Done

1. Build for production: `npm run build`
2. Check for any errors
3. Deploy to Vercel (or hosting of choice)
4. Share link with guests!

---

## 💾 Backup Your Changes

Before making large changes:
```bash
git add .
git commit -m "Backup before changes"
```

Or save a copy of edited files!

---

## 🆘 If Something Breaks

1. Check for red errors in terminal
2. Clear cache: `rm -rf .next`
3. Restart: `npm run dev`
4. Review your last changes
5. Revert if needed: `git checkout [filename]`

---

**Good luck customizing your beautiful wedding website!** 💕
