# 📱 Property Lime - App Store & Play Store Publishing Guide

## 🎯 **Complete Step-by-Step Process**

### **Phase 1: Developer Accounts Setup**

#### **1.1 Apple Developer Account ($99/year)**
1. **Visit**: [developer.apple.com](https://developer.apple.com)
2. **Click**: "Enroll" or "Start Your Enrollment"
3. **Choose**: "Individual" (simpler for starting)
4. **Fill**: Personal information and business details
5. **Pay**: $99 annual fee
6. **Wait**: Approval (24-48 hours)

#### **1.2 Google Play Console ($25 one-time)**
1. **Visit**: [play.google.com/console](https://play.google.com/console)
2. **Click**: "Get Started"
3. **Pay**: $25 registration fee
4. **Complete**: Account setup

### **Phase 2: App Store Connect Setup (iOS)**

#### **2.1 Create App in App Store Connect**
1. **Login**: [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. **Click**: "My Apps" → "+" → "New App"
3. **Fill Details**:
   - **Platforms**: iOS
   - **Name**: PropertyLime
    - **Primary Language**: English
    - **Bundle ID**: com.propertylime.app
    - **SKU**: property-lime-ios (unique identifier)
   - **User Access**: Full Access

#### **2.2 App Information**
1. **App Name**: PropertyLime
2. **Subtitle**: Make Sunnah Your Lifestyle
3. **Description**:
```
Streamline your property management with PropertyLime - your comprehensive solution for managing residents, expenses, inventory, and maintenance tickets.

🌟 FEATURES:
• Daily Prayer Times with accurate location-based calculations
• Sunnah tracking and progress monitoring
• Beautiful daily duas with elegant popup reminders
• Daily Quran verses and Hadith with translations
• Islamic challenges to strengthen your faith
• Progress tracking for prayers and sunnahs
• Elegant Islamic quotes and wisdom
• User-friendly interface with dark/light themes

🕌 PERFECT FOR:
• Muslims seeking to strengthen their daily practices
• Those wanting to track their prayer and sunnah progress
• Anyone looking for daily Islamic inspiration
• Families wanting to build Islamic habits together

📱 KEY FEATURES:
• Accurate prayer times based on your location
• Daily rotation of 20 beautiful duas
• Progress tracking for daily prayers
• Sunnah practice monitoring
• Daily Islamic content (Quran, Hadith, Dua)
• Beautiful, intuitive interface
• Works offline for prayer times
• Privacy-focused design

Start managing your property more efficiently today with PropertyLime!
```

4. **Keywords**: islamic, muslim, prayer, sunnah, quran, hadith, dua, salah, islam, daily, spiritual, religious, faith, worship, adhan, masjid, mosque

#### **2.3 App Store Screenshots**
**Required Sizes:**
- 6.7" iPhone (1290 x 2796)
- 6.5" iPhone (1242 x 2688)
- 5.5" iPhone (1242 x 2208)
- 12.9" iPad Pro (2048 x 2732)

**Screenshot Content Ideas:**
1. Home screen with prayer times and progress
2. Daily dua popup
3. Sunnah tracking interface
4. Daily content (Quran/Hadith)
5. Progress dashboard
6. Settings/Profile screen

#### **2.4 App Icon**
- **Size**: 1024 x 1024 pixels
- **Format**: PNG
- **No transparency**
- **No rounded corners** (Apple adds them automatically)

### **Phase 3: Google Play Console Setup (Android)**

#### **3.1 Create App in Play Console**
1. **Login**: [play.google.com/console](https://play.google.com/console)
2. **Click**: "Create app"
3. **Fill Details**:
   - **App name**: PropertyLime
   - **Default language**: English
   - **App or game**: App
   - **Free or paid**: Free
   - **Declarations**: Check appropriate boxes

#### **3.2 Store Listing**
1. **Short description** (80 chars): "Islamic daily practices, prayer times, and spiritual reminders"
2. **Full description** (4000 chars): Same as iOS description
3. **App category**: Lifestyle or Education
4. **Content rating**: Complete questionnaire

#### **3.3 Play Store Graphics**
**Required Assets:**
- **App icon**: 512 x 512 PNG
- **Feature graphic**: 1024 x 500 PNG
- **Screenshots**: Phone (16:9), 7" tablet, 10" tablet

### **Phase 4: Building Production Apps**

#### **4.1 Build iOS App**
```bash
# Build for iOS App Store
eas build --platform ios --profile production

eas submit --platform ios

```

#### **4.2 Build Android App**
```bash
# Build for Google Play Store
eas build --platform android --profile production
$env:EAS_NO_VCS=1; 
eas build --platform android --profile production
```

#### **Upload to Expo Go Project:**

##### **Prerequisites:**
- **Git**: EAS Update requires Git to be installed and properly configured
  - Download from [git-scm.com](https://git-scm.com/downloads)
  - Verify installation with `git --version`

##### **Standard Update Command:**
```bash
npx eas update --branch main --message "App Version 1.0.0"
```

##### **Without Git (Temporary Workaround):**
If Git is not available or properly configured, use:
```bash
npx eas update --branch main --message "App Version 1.0.0"
```

### **Phase 5: Privacy Policy & Legal**

#### **5.1 Create Privacy Policy**
**Required for both stores**. Create a simple privacy policy:

**Privacy Policy Content:**
```
Privacy Policy for PropertyLime

**Last updated**: [Date]

This Privacy Policy describes how PropertyLime ("we", "our", or "us") collects, uses, and protects your information when you use our mobile application.

Information We Collect:
- Location data (for accurate prayer times)
- Profile information (name, email)
- App usage data (for improving features)

How We Use Information:
- Provide accurate prayer times based on location
- Personalize your experience
- Improve app functionality
- Send notifications (with your permission)

Data Storage:
- Data is stored securely using Supabase
- We do not sell your personal information
- You can delete your account anytime

Contact Us:
Email: [your-email@domain.com]
```

#### **5.2 Host Privacy Policy**
- Use GitHub Pages, Netlify, or any free hosting
- Get a URL like: `https://yourdomain.com/privacy-policy`

### **Phase 6: App Store Submission**

#### **6.1 iOS App Store**
1. **Upload Build**: Use EAS Submit or App Store Connect
2. **TestFlight**: Optional but recommended for testing
3. **App Review**: Submit for review (1-7 days)
4. **Release**: Manual or automatic release

#### **6.2 Google Play Store**
1. **Upload APK/AAB**: Use Play Console
2. **Internal Testing**: Test with internal users
3. **Production Release**: Submit for review (1-3 days)

### **Phase 7: Post-Launch**

#### **7.1 Monitor & Respond**
- **App Store Connect**: Monitor reviews and crashes
- **Play Console**: Monitor performance and feedback
- **Respond**: To user reviews and feedback

#### **7.2 Updates**
- **Version Updates**: Increment version numbers
- **Feature Updates**: Add new features
- **Bug Fixes**: Address user-reported issues

## 🛠 **Technical Commands**

### **Build Commands:**
```bash
# Development build
eas build --platform ios --profile development
eas build --platform android --profile development

# Production build
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

### **Update App Version:**
```bash
# Update version in app.json
# Then rebuild and submit
eas build --platform all --profile production
eas submit --platform all --profile production
```

## 📋 **Checklist**

### **Before Building:**
- [ ] Developer accounts created
- [ ] App icons ready (1024x1024 for iOS, 512x512 for Android)
- [ ] Screenshots prepared
- [ ] App descriptions written
- [ ] Privacy policy created and hosted
- [ ] App.json configured correctly
- [ ] EAS CLI installed and logged in

### **Before Submission:**
- [ ] Apps built successfully
- [ ] Tested on real devices
- [ ] All features working
- [ ] No crashes or major bugs
- [ ] Privacy policy URL added
- [ ] Support email added

### **After Launch:**
- [ ] Monitor reviews
- [ ] Respond to user feedback
- [ ] Plan future updates
- [ ] Monitor app performance

## 🎯 **Timeline Estimate**

- **Developer Accounts**: 1-2 days
- **App Store Connect Setup**: 1 day
- **Play Console Setup**: 1 day
- **Building Apps**: 1-2 days
- **App Review**: 1-7 days (iOS), 1-3 days (Android)
- **Total**: 5-15 days

## 💡 **Tips for Success**

1. **Start Early**: Begin with developer accounts
2. **Test Thoroughly**: Test on real devices before submission
3. **Follow Guidelines**: Read store guidelines carefully
4. **Quality Screenshots**: Use high-quality, representative screenshots
5. **Clear Description**: Write clear, compelling app descriptions
6. **Respond to Reviews**: Engage with users after launch
7. **Regular Updates**: Keep the app updated with new features

## 🆘 **Common Issues & Solutions**

### **App Store Rejection:**
- **Missing Privacy Policy**: Add privacy policy URL
- **Incomplete Information**: Fill all required fields
- **Crash Issues**: Test thoroughly before submission

### **Play Store Issues:**
- **Content Rating**: Complete content rating questionnaire
- **App Bundle**: Use AAB format for new apps
- **Permissions**: Justify all permissions used

## 📞 **Support Resources**

- **Apple Developer**: [developer.apple.com/support](https://developer.apple.com/support)
- **Google Play Console**: [support.google.com/googleplay](https://support.google.com/googleplay)
- **Expo Documentation**: [docs.expo.dev](https://docs.expo.dev)
- **EAS Documentation**: [docs.expo.dev/eas](https://docs.expo.dev/eas)

---

**Good luck with your app launch! 🚀** 

---

## **How to Build and Download the .aab File**

### 1. **Run the Correct EAS Build Command**
In your project root, run:
```sh
eas build --platform android --profile production
```
- This will generate an **.aab** file for Play Store upload.
- Make sure your `eas.json` production profile is set to `"buildType": "app-bundle"` (the default for EAS).

### 2. **Wait for the Build to Complete**
- After the build finishes, EAS will give you a download link for the `.aab` file.
- The link will look like:  
  `https://expo.dev/artifacts/eas/xxxxxxxxxxxxxxxxxxxx.aab`

### 3. **Download the .aab File**
- Open the link in your browser, or go to your build dashboard:  
  [Expo Build Dashboard](https://expo.dev/accounts/m_ibrahim_zarar/projects/sunnah-daily-9jr75at/builds)
- Find your latest Android build and download the `.aab` file.

---

## **If You Only See .apk, Not .aab**
- You may have used a command or profile that builds an APK instead of an AAB.
- **Solution:** Always use the command above for Play Store builds.

---

## ✅ **Fixed Android Build Error**

### **Problem**
- ❌ **Duplicate AppTheme styles**: Two `AppTheme` style definitions in the same file
- ❌ **Build failure**: Gradle couldn't process the conflicting styles

### **Solution**
- ✅ **Merged styles**: Combined both AppTheme definitions into one
- ✅ **Kept all properties**: Preserved both `editTextBackground` and color properties
- ✅ **Used DayNight theme**: Kept the more modern `Theme.AppCompat.DayNight.NoActionBar` parent

### **What Was Fixed**
- ✅ **Single AppTheme**: Now there's only one AppTheme style definition
- ✅ **All properties preserved**: 
  - `android:editTextBackground` for input styling
  - `colorPrimary` and `colorPrimaryDark` for theming
- ✅ **Build compatibility**: Gradle can now process the styles without conflicts

Now you can run your EAS build again:

```bash
eas build --platform android --profile production
```

The build should now proceed without the duplicate style error!

---

## **Summary Table**

| File Type | Use Case                | How to Build                        |
|-----------|-------------------------|-------------------------------------|
| `.apk`    | Device testing/install  | `eas build --platform android --profile preview` (or default) |
| `.aab`    | Play Store upload       | `eas build --platform android --profile production`            |

---

**If you want, I can check your `eas.json` to ensure it’s set up for AAB builds, or guide you through the process step by step!**  
Let me know if you want to proceed with a new build or need help with your EAS config.