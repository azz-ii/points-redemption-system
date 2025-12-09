# Image Setup Instructions

## Required Images

You need to add two images to the `src/assets` folder:

### 1. Oracle Logo (`oracle-logo.png`)

- **Location**: `client/app/src/assets/oracle-logo.png`
- **Source**: Use the Oracle Petroleum logo image you provided
- **Recommended size**: 256x256px or larger (will be displayed at ~256px width)
- **Format**: PNG with transparent background preferred

### 2. Building Image (`building.jpg`)

- **Location**: `client/app/src/assets/building.jpg`
- **Source**: Use the building exterior image you provided
- **Recommended size**: 1920x1080px or larger for best quality
- **Format**: JPG or PNG
- **Note**: This will be displayed with low opacity (30%) as a backdrop with the Oracle logo centered on top

## How to Add the Images

1. Save your Oracle Petroleum logo as `oracle-logo.png`
2. Save your building photo as `building.jpg`
3. Copy both files to: `C:\Users\Azrielle\Desktop\point-redemption-app\client\app\src\assets\`
4. Replace the existing placeholder files

## Changes Made

✅ **File renamed**: `App.tsx` → `Login.tsx`
✅ **Light/Dark mode toggle**: Added button in top-right corner
✅ **Button hover effects**: Scale animation and shadow on hover
✅ **Image layout updated**:

- Building image as backdrop with 30% opacity
- Oracle logo centered on top
- Dark overlay for better contrast

## Features

- **Theme Toggle**: Sun/Moon icon in top right switches between light and dark mode
- **Responsive**: Logo shows on mobile, building backdrop only on desktop (lg+ screens)
- **Smooth Transitions**: All color changes animate smoothly
- **Enhanced Button**: Hover effects include scale transformation and shadow
