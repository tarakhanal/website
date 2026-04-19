# Quick Start Guide - Wedding Website

## 🚀 Get Started in 5 Steps

### Step 1: Update Your Names and Date

**File**: `src/hooks/useCountdown.ts` (line 19)
```typescript
const weddingDate = new Date('2027-05-08T00:00:00').getTime();
```

**File**: `src/components/EnvelopeLanding.tsx` (lines 107-109)
```typescript
<h2>Tara & Bandana</h2>  // Change to your names
<p>May 8, 2027 • Kenwood, CA</p>  // Change to your date & location
```

### Step 2: Update Your Story

**File**: `src/app/story/page.tsx`

Replace the placeholder text in the `storyChapters` array with your real story:
- How We Met
- First Date
- Growing Together
- The Proposal

### Step 3: Add About Information

**File**: `src/app/about/page.tsx`

Fill in:
- Bios for both of you
- Favorite quotes
- Hobbies and interests
- Fun facts

### Step 4: Update Wedding Timeline

**File**: `src/app/timeline/page.tsx`

Update the `timelineEvents` array with your actual:
- Ceremony time
- Cocktail hour
- Dinner time
- All other activities with locations

### Step 5: Customize Everything Else

- **Phone number**: Search for `+1 (415) 555-1234` and replace
- **Registry link**: Update Amazon link in `src/app/registry/page.tsx`
- **Colors**: Edit `src/config/theme.ts` to match your wedding theme
- **Gallery**: Add your photos to `public/` folder
- **FAQs**: Update `src/app/faqs/page.tsx` with your specific questions

## 🎨 Color Palette (Earthy Tones)

Currently set to:
- Primary Brown: `#8B7355`
- Gold Accent: `#D4AF85`
- Sage Green: `#A8B5A6`
- Cream/Off-white: `#FAFAF8`
- Light Tan: `#F5F1ED`

To change, edit `src/app/globals.css` and `src/config/theme.ts`

## 📸 Adding Photos

1. Place your images in the `public/` folder
2. Update image paths in the components:
   - Gallery: `src/app/gallery/page.tsx`
   - Story: `src/app/story/page.tsx`
   - About: `src/app/about/page.tsx`

## 🎵 Initial Song Suggestions

The site comes with 3 placeholder songs. Edit `src/store/songStore.ts` to change them.

## 📱 Testing on Mobile

```bash
npm run dev
```

Then visit `http://localhost:3000` on your phone or use Chrome DevTools mobile view.

## 🌐 Going Live

### Easy Option: Vercel

1. Push code to GitHub: `git push origin main`
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" → Select your repo
4. Deploy! (automatic after each push)

Your site will be live at: `your-project-name.vercel.app`

### Get a Custom Domain

- Vercel supports custom domains
- Just add your domain in project settings
- Points to your vercel deployment

## 📝 Placeholder Finder

Search your code for these to find all areas needing updates:
- `"placeholder"` (lowercase)
- `"Placeholder"` (capitalized)
- `"RSVP"` sections
- `"Update"` comments

## 🎭 Landing Page Envelope

The animated envelope on `/` (landing page):
- Tap the wax seal to open
- Animates and reveals the wedding info
- Shows countdown timer
- Redirects to `/home` page

## 🎵 Song Voting Feature

- Guests can suggest songs
- One vote per song per guest (tracked in localStorage)
- Songs sorted by votes automatically
- No database needed!

## 🖼️ Gallery Features

- 24 photo slots
- Click to open lightbox
- Navigation between photos
- Blurred background behind modal
- Close by clicking background or X button

## ⚡ Performance Tips

- Optimize images before uploading (use TinyPNG or similar)
- Keep animations smooth on mobile
- Test on actual phones before launching
- Use fast internet for demos

## 🐛 Common Issues

**Buttons not working?**
- Check that all links use `href="/page-name"`

**Colors not updating?**
- Clear `.next` folder: `rm -rf .next`
- Run `npm run dev` again

**Animations stuttering?**
- Update Framer Motion: `npm install framer-motion@latest`

**Songs not saving?**
- LocalStorage works per browser/device
- Votes reset when clearing browser data

## 💡 Pro Tips

1. **Test everything on mobile first** - 95% of guests will use phones
2. **Keep it simple** - Don't overcomplicate your story
3. **Add photos early** - They make the site much more personal
4. **Update phone number** - So guests can actually contact you!
5. **Share the link** - Send via text, email, social media
6. **Monitor songs** - See what your guests want to hear!

## 🎁 Launching Checklist

- [ ] Update couple names
- [ ] Update wedding date & location
- [ ] Add story with photos
- [ ] Update about us section
- [ ] Add timeline with correct times
- [ ] Update phone number
- [ ] Add 10-15 photos to gallery
- [ ] Update FAQs for your wedding
- [ ] Test on mobile phone
- [ ] Test all links work
- [ ] Deploy to Vercel
- [ ] Share link with guests!

## 📞 Questions?

Check the full README.md for more details on:
- Deployment options
- Advanced customization
- Technology stack
- Browser compatibility

---

**Have fun building your wedding website!** 💕

Questions? Review the full README.md or check the code comments!
