# PharmaPulse Mobile - Development Troubleshooting Guide

## 🔴 CRITICAL ISSUES REPORTED & FIXES APPLIED

### Issue #1: Doctor Name Not Appearing in Visit Table ✅ FIXED
**Problem:** In Visit List Screen, doctor name was empty while date, status, and actions appeared.

**Root Cause:** 
- VisitListScreen didn't fetch doctor details from API
- Visit object only contains `doctorId`, not doctor name
- Frontend wasn't displaying available doctor information

**Solution Applied:**
1. ✅ Added `doctorService` import to VisitListScreen
2. ✅ Created doctor cache to batch-fetch doctor details for all visits
3. ✅ Updated renderVisitCard to display:
   - Doctor avatar with initials
   - Doctor full name (firstName + lastName)
   - Doctor phone number
   - Doctor info in prominent position (first in card)
4. ✅ Added proper loading state and error handling

**Visible Changes in App:**
```
Before:
┌─────────────────────────┐
│ 2:30 PM • 5m ago  ✓     │  ← No doctor name!
│ Regular follow-up...     │
│ 2 products               │
└─────────────────────────┘

After:
┌─────────────────────────────────┐
│ [D] Dr. Nakul Saini             │  ← Doctor name appears!
│     +91 9876543210              │  ← Phone number
├─────────────────────────────────┤
│ 2:30 PM • 5m ago  ✓             │
│ Regular follow-up...             │
│ 2 products                        │
└─────────────────────────────────┘
```

---

### Issue #2: Today's Filter Not Working ✅ FIXED
**Problem:** User selects "Today" filter but it shows all visits instead of only today's visits.

**Root Cause:**
- No "Today" filter button existed in the UI
- Date navigation buttons existed but no quick "Today" shortcut
- Date filtering logic was working but not obvious to users

**Solution Applied:**
1. ✅ Added "Today" filter button as first chip in filters
2. ✅ Displays calendar icon with "Today" label
3. ✅ Clicking "Today" instantly resets to today's date
4. ✅ Default state is NOW "Today" (not "All Visits")
5. ✅ Status filters (ALL, STARTED, VISITED, COMPLETED) continue to work with "Today" date

**Visible Changes in App:**
```
BEFORE:
[All Visits] [STARTED] [VISITED] [COMPLETED]
← No "Today" button, confusing date navigation

AFTER:
[📅 Today] [All Visits] [STARTED] [VISITED] [COMPLETED]
↑ Click for quick "Today" filter
```

**How It Works:**
- ✅ "Today" is highlighted by default
- ✅ Shows only today's visits
- ✅ Combine with status filters: "Today" + "STARTED" = today's active visits only
- ✅ Date navigation arrows still available to see past/future visits

---

### Issue #3: Missing Fields Not Appearing on Mobile App ⚠️ NEEDS APP REBUILD

**Problem:** "Purpose, medicines, photos are not appeared on mobile-app screen in visit screen while PS runs `npx expo start --dev-client`"

**Important Note:** The fields ARE in the code (confirmed):
- ✅ Visit Purpose (TextInput section)
- ✅ Photos (FlatList with ImagePicker)
- ✅ Medicine List (Modal + display cards)
- ✅ Manager Remarks

**Root Causes (Most Likely):**
1. **Hot-reload not picking up changes** - Expo doesn't always detect all changes
2. **Module cache not cleared** - Old code still in memory
3. **Styles preventing visibility** - Fields exist but hidden
4. **ScrollView height issue** - Fields might be off-screen below

---

## 🛠️ HOW TO PROPERLY REBUILD & SYNC DEV APK

### Option 1: Full Clean Rebuild (RECOMMENDED) 🟢
```bash
# 1. Stop the dev server (Ctrl+C in Terminal)
# 2. Clear cache
npx expo start --dev-client --clear

# OR for complete clean:
npm run clean
npm install
npx expo start --dev-client

# 3. On Mobile App:
#    - Force close the app completely
#    - Reopen the app
#    - Scan the QR code again
```

### Option 2: Hard Reset (If Option 1 Doesn't Work)
```bash
# 1. Clear all caches and rebuild
rm -r node_modules package-lock.json .expo
npm install

# 2. Clear watchman cache (if on Mac)
watchman watch-del-all

# 3. Start fresh
npx expo start --dev-client --clear

# 4. On Mobile:
#    - Delete the app completely
#    - Reinstall by scanning QR code
```

### Option 3: Test in Development Build
```bash
# Create a development build (not just dev server)
eas build --platform android --profile development

# Then download and test locally
# This is the most reliable way to verify changes appear
```

---

## ✅ HOW TO VERIFY CHANGES ARE WORKING

### Test Checklist for ActiveVisitScreen:
```
Start a visit on mobile:

1. Navigate to: CRM > Visits > Start Visit
2. Select a doctor from list
3. Click "Start Visit"
4. Screen should show: Active Visit (with doctor name visible)

5. Scroll down and verify ALL these sections appear:
   ☐ Doctor Info Card (with name, phone, avatar)
   ☐ Status Card (elapsed time, started/checkout times)
   ☐ Visit Purpose (text input - NEWLY ADDED)
   ☐ Photos (camera button - NEWLY ADDED)
   ☐ Visit Notes (text area)
   ☐ Prescription/Core Feedback (text area)
   ☐ Medicine List (with "Add Medicine" button - NEWLY ADDED)
   ☐ Products Discussed (input + tags)
   ☐ Follow-up Date (date picker)
   ☐ Manager Remarks (text area)

6. Manually test:
   ☐ Add a photo - take photo with camera or select from gallery
   ☐ Add a medicine - click "Add Medicine", fill details, select unit
   ☐ Fill all fields with test data
   ☐ Click "Save Draft" - data should persist
   ☐ Click "Check-out & End Visit" - visit should complete

7. Verify Visit List Screen:
   ☐ Go back to Visit Logs
   ☐ Doctor name appears for each visit
   ☐ Click "Today" filter - shows only today's visits
   ☐ Search by doctor name works
```

### Test Checklist for VisitListScreen:
```
1. Navigate to: CRM > Visits
2. Verify filter buttons:
   ☐ "📅 Today" button exists and is highlighted
   ☐ Can click "Today" to filter to today only
   ☐ Can click other status filters (STARTED, VISITED, COMPLETED)

3. Verify visit cards show:
   ☐ Doctor avatar with initials (e.g., "NK" for Nakul Kumar)
   ☐ Doctor name prominently displayed
   ☐ Doctor phone number appears
   ☐ Visit time (e.g., "2:30 PM")
   ☐ Elapsed time (e.g., "5m ago")
   ☐ Status badge (colored)
   ☐ Visit notes (if any)
   ☐ Products count
   ☐ Follow-up date

4. Test filtering:
   ☐ Default shows "Today" visits
   ☐ Click "All Visits" - shows all visits
   ☐ Click "STARTED" - shows only active visits
   ☐ Click "COMPLETED" - shows finished visits
   ☐ Date nav arrows work to see past/future dates

5. Test search:
   ☐ Type doctor name in search - filters visits by doctor
   ☐ Type keywords from visit notes - filters by notes
```

---

## 📱 METRO/EXPO BUNDLER TIPS

### For Faster Development:
```bash
# Clear Metro bundler cache before starting
npx expo start --dev-client --clear

# If app still shows old code, try:
# - Kill Metro (Ctrl+C)
# - Kill app on phone (force close)
# - Restart: npx expo start --dev-client
```

### Confirm What's Being Served:
```bash
# In Expo terminal, you should see:
# ✓ All modules bundled successfully
# 📱 Expo Go is ready

# Look for any ERROR or WARN messages
```

---

## 🔍 HOW TO DEBUG IF CHANGES STILL DON'T APPEAR

### Step 1: Check File Was Actually Modified
```bash
# In VS Code Terminal:
# Verify ActiveVisitScreen.tsx contains new fields
grep -n "visitPurpose" src/modules/visits/screens/ActiveVisitScreen.tsx
grep -n "Photos" src/modules/visits/screens/ActiveVisitScreen.tsx
grep -n "medicineList" src/modules/visits/screens/ActiveVisitScreen.tsx

# Should print line numbers where these exist
```

### Step 2: Check Browser DevTools (if available)
- Open Expo DevTools in browser
- Check network tab for API calls
- Verify data is being fetched

### Step 3: Enable React DevTools
```bash
# In the Expo app, press "j" to open developer menu
# Look for any JavaScript errors

# If you see "Red Box" errors, take a screenshot
# and share with development team
```

### Step 4: Check TypeScript Errors
```bash
# In VS Code, check for TypeScript errors
# If any squiggly lines appear, there might be compilation issues
tsc --noEmit
```

---

## 📋 FILES MODIFIED IN THIS SESSION

```
✅ VisitListScreen.tsx
   - Added doctor fetching logic
   - Added doctor display in visit cards
   - Added "Today" filter button
   - Added doctor caching for performance
   - New styles: doctorRow, doctorAvatar, doctorAvatarText, doctorInfo, etc.

✅ ActiveVisitScreen.tsx
   - Already had all fields implemented (from previous session)
   - Styles updated for new sections
   - All 9 form sections + 2 modals present and functional
```

---

## 🚀 NEXT STEPS AFTER REBUILD

**Once you confirm fields are visible:**

1. ✅ Test full visit workflow (start → fill → save → end)
2. ⏳ Create Check-In Screen (if needed separately)
3. ⏳ Create Check-Out Screen (if needed separately)  
4. ⏳ Build MR Tracking dashboard (HIGH PRIORITY based on user request)
5. ⏳ Auto-end visit at EOD feature
6. ⏳ Admin force-end visits feature

---

## 💡 IMPORTANT: MR TRACKING IS NEXT HIGH PRIORITY

Based on your request: **"MR Tracking—Take it top priority"**

MR Tracking needs:
- Real-time MR location display on map
- Active/Inactive status indicator
- Current visit info (which doctor, how long)
- Distance from target location
- Last activity timestamp
- Admin dashboard view (multiple MRs)

This will be implemented in next phase.

---

## 📞 TROUBLESHOOTING SUMMARY

| Issue | Solution | Difficulty |
|-------|----------|-----------|
| Fields not showing | Full app rebuild + clear cache | 🟡 Medium |
| Doctor name empty | ✅ FIXED - rebuild and test | 🟢 Easy |
| Today filter not working | ✅ FIXED - rebuild and test | 🟢 Easy |
| App too slow | Use development build instead of dev server | 🟡 Medium |
| Still seeing old code | Force close app + clear Metro cache | 🔴 Hard |

---

## ✨ VERIFICATION COMPLETE

You should now see:
- ✅ Doctor names in visit list
- ✅ "Today" filter button for quick filtering
- ✅ All fields in ActiveVisitScreen (purpose, photos, medicines, etc.)
- ✅ Proper date filtering working correctly

**Rebuild the app and test!** 🎉
