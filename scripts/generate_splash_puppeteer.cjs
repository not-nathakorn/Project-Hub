const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// All iOS device splash screen sizes (Portrait and Landscape)
const splashSizes = [
  // iPhone sizes
  { width: 1320, height: 2868, name: "iPhone 17 Pro Max/16 Pro Max", orientation: "portrait" },
  { width: 2868, height: 1320, name: "iPhone 17 Pro Max/16 Pro Max", orientation: "landscape" },
  { width: 1260, height: 2736, name: "iPhone 17 Pro/16 Pro", orientation: "portrait" },
  { width: 2736, height: 1260, name: "iPhone 17 Pro/16 Pro", orientation: "landscape" },
  { width: 1290, height: 2796, name: "iPhone 17 Plus/16 Plus/15 Pro Max", orientation: "portrait" },
  { width: 2796, height: 1290, name: "iPhone 17 Plus/16 Plus/15 Pro Max", orientation: "landscape" },
  { width: 1206, height: 2622, name: "iPhone 16/15 Pro", orientation: "portrait" },
  { width: 2622, height: 1206, name: "iPhone 16/15 Pro", orientation: "landscape" },
  { width: 1179, height: 2556, name: "iPhone 17/16/15/14 Pro", orientation: "portrait" },
  { width: 2556, height: 1179, name: "iPhone 17/16/15/14 Pro", orientation: "landscape" },
  { width: 1170, height: 2532, name: "iPhone 14/13/12", orientation: "portrait" },
  { width: 2532, height: 1170, name: "iPhone 14/13/12", orientation: "landscape" },
  { width: 1284, height: 2778, name: "iPhone 14 Plus/13 Pro Max", orientation: "portrait" },
  { width: 2778, height: 1284, name: "iPhone 14 Plus/13 Pro Max", orientation: "landscape" },
  { width: 1242, height: 2688, name: "iPhone 11 Pro Max/XS Max", orientation: "portrait" },
  { width: 2688, height: 1242, name: "iPhone 11 Pro Max/XS Max", orientation: "landscape" },
  { width: 828, height: 1792, name: "iPhone 11/XR", orientation: "portrait" },
  { width: 1792, height: 828, name: "iPhone 11/XR", orientation: "landscape" },
  { width: 1125, height: 2436, name: "iPhone X/XS/11 Pro", orientation: "portrait" },
  { width: 2436, height: 1125, name: "iPhone X/XS/11 Pro", orientation: "landscape" },
  { width: 1242, height: 2208, name: "iPhone 8 Plus", orientation: "portrait" },
  { width: 2208, height: 1242, name: "iPhone 8 Plus", orientation: "landscape" },
  { width: 750, height: 1334, name: "iPhone SE/8/7/6s", orientation: "portrait" },
  { width: 1334, height: 750, name: "iPhone SE/8/7/6s", orientation: "landscape" },
  { width: 640, height: 1136, name: "iPhone SE 1st/5s", orientation: "portrait" },
  { width: 1136, height: 640, name: "iPhone SE 1st/5s", orientation: "landscape" },
  
  // New iPads (2024 Models - M4/M2)
  { width: 2064, height: 2752, name: "iPad Pro 13\" (M4)", orientation: "portrait" },
  { width: 2752, height: 2064, name: "iPad Pro 13\" (M4)", orientation: "landscape" },
  { width: 1668, height: 2420, name: "iPad Pro 11\" (M4)", orientation: "portrait" },
  { width: 2420, height: 1668, name: "iPad Pro 11\" (M4)", orientation: "landscape" },
  { width: 2048, height: 2732, name: "iPad Air 13\" (M2)", orientation: "portrait" },
  { width: 2732, height: 2048, name: "iPad Air 13\" (M2)", orientation: "landscape" },
  { width: 1640, height: 2360, name: "iPad Air 11\" (M2)", orientation: "portrait" },
  { width: 2360, height: 1640, name: "iPad Air 11\" (M2)", orientation: "landscape" },
  
  // iPad sizes
  { width: 2048, height: 2732, name: "iPad Pro 12.9\"", orientation: "portrait" },
  { width: 2732, height: 2048, name: "iPad Pro 12.9\"", orientation: "landscape" },
  { width: 1668, height: 2388, name: "iPad Pro 11\"", orientation: "portrait" },
  { width: 2388, height: 1668, name: "iPad Pro 11\"", orientation: "landscape" },
  { width: 1620, height: 2160, name: "iPad 10.2\"", orientation: "portrait" },
  { width: 2160, height: 1620, name: "iPad 10.2\"", orientation: "landscape" },
  { width: 1536, height: 2048, name: "iPad Air/Mini", orientation: "portrait" },
  { width: 2048, height: 1536, name: "iPad Air/Mini", orientation: "landscape" },
  { width: 1668, height: 2224, name: "iPad Pro 10.5\"", orientation: "portrait" },
  { width: 2224, height: 1668, name: "iPad Pro 10.5\"", orientation: "landscape" },
  { width: 1488, height: 2266, name: "iPad Mini 6", orientation: "portrait" },
  { width: 2266, height: 1488, name: "iPad Mini 6", orientation: "landscape" },
  { width: 1640, height: 2360, name: "iPad Air 4/5", orientation: "portrait" },
  { width: 2360, height: 1640, name: "iPad Air 4/5", orientation: "landscape" },
];

// Read SVG file and convert to base64
const svgPath = path.join(__dirname, '../public', 'Splash-Logo.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');
const svgBase64 = Buffer.from(svgContent).toString('base64');
const svgDataUri = `data:image/svg+xml;base64,${svgBase64}`;

// Generate HTML template for splash screen
function generateHTML(width, height) {
  const isLandscape = width > height;
  // Scale logo based on the smaller dimension
  const minDim = Math.min(width, height);
  const logoSize = Math.floor(minDim * 0.25); // Increased from 0.18 for larger icon
  const fontSize = Math.floor(minDim * 0.05); // Slightly larger font
  const fromFontSize = Math.floor(fontSize * 0.5);
  const bottomMargin = Math.floor(height * 0.08);
  const lineSpacing = Math.floor(fontSize * 0.3);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      width: ${width}px;
      height: ${height}px;
      background-color: #FFFFFF;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
      position: relative;
    }
    
    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      /* Move logo slightly above center as requested */
      transform: translateY(-20%);
    }
    
    .logo {
      width: ${logoSize}px;
      height: ${logoSize}px;
      /* Rounded corners for the logo - adjusted for larger size */
      border-radius: ${Math.floor(logoSize * 0.22)}px; 
      object-fit: contain;
    }
    
    .branding {
      position: absolute;
      bottom: ${bottomMargin}px;
      text-align: center;
    }
    
    .from-text {
      font-size: ${fromFontSize}px;
      color: #6B7280; /* Darker gray for better visibility */
      font-weight: 500;
      margin-bottom: ${lineSpacing}px;
    }
    
    .brand-name {
      font-size: ${fontSize}px;
      font-weight: 800; 
      background: linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #1d4ed8 100%); /* Very Dark Indigo -> Violet -> Rich Blue */
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  </style>
</head>
<body>
  <div class="logo-container">
    <img class="logo" src="${svgDataUri}" alt="Logo">
  </div>
  <div class="branding">
    <div class="from-text">from</div>
    <div class="brand-name">CodeX-TH</div>
  </div>
</body>
</html>
  `;
}

async function generateSplashScreens() {
  console.log('🚀 Starting splash screen generation...');
  
  const outputDir = path.join(__dirname, '../public', 'splash');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Clear existing files
  const existingFiles = fs.readdirSync(outputDir);
  for (const file of existingFiles) {
    fs.unlinkSync(path.join(outputDir, file));
  }
  console.log('🗑️  Cleared existing splash screens');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  let linkTags = [];
  
  for (let i = 0; i < splashSizes.length; i++) {
    const size = splashSizes[i];
    const fileName = `apple-splash-${size.width}-${size.height}.png`;
    const filePath = path.join(outputDir, fileName);
    
    console.log(`📱 Generating ${i + 1}/${splashSizes.length}: ${fileName} (${size.name} - ${size.orientation})`);
    
    // Set viewport
    await page.setViewport({
      width: size.width,
      height: size.height,
      deviceScaleFactor: 1
    });
    
    // Generate and set HTML content
    const html = generateHTML(size.width, size.height);
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 10000 });
    
    // Small delay for rendering
    await new Promise(r => setTimeout(r, 200));
    
    // Take screenshot
    await page.screenshot({
      path: filePath,
      type: 'png',
      fullPage: false
    });
    
    // Generate link tag logic with CORRECTED Pixel Ratio detection
    const isPortrait = size.height > size.width;
    let deviceWidth, deviceHeight, pixelRatio;
    
    // Robust Pixel Ratio Logic
    if (size.name.includes("iPad")) {
      pixelRatio = 2; // All iPads are @2x
    } else {
      // iPhones
      // Known @2x iPhones
      if (
        size.name.includes("11/XR") ||       // 828x1792
        size.name.includes("SE/8/7/6s") ||   // 750x1334
        size.name.includes("SE 1st/5s")      // 640x1136
      ) {
        pixelRatio = 2;
      } else {
        // All other modern iPhones (Pro, Max, Plus, X, XS, 12, 13, 14, 15, 16) are @3x
        pixelRatio = 3;
      }
    }

    // Calculate logical device dimensions based on ratio
    if (isPortrait) {
      deviceWidth = Math.round(size.width / pixelRatio);
      deviceHeight = Math.round(size.height / pixelRatio);
    } else {
      deviceWidth = Math.round(size.height / pixelRatio);
      deviceHeight = Math.round(size.width / pixelRatio);
    }
    
    linkTags.push({
      href: `/splash/${fileName}`,
      media: `(device-width: ${deviceWidth}px) and (device-height: ${deviceHeight}px) and (-webkit-device-pixel-ratio: ${pixelRatio}) and (orientation: ${size.orientation})`,
      name: size.name,
      orientation: size.orientation
    });
  }
  
  await browser.close();
  
  // Generate link tags HTML
  console.log('\n📝 Generated link tags for index.html:\n');
  let linkTagsHTML = '    <!-- iOS PWA Splash Screens (All Devices) -->\n';
  
  for (const tag of linkTags) {
    linkTagsHTML += `    <!-- ${tag.name} (${tag.orientation}) -->\n`;
    linkTagsHTML += `    <link rel="apple-touch-startup-image" href="${tag.href}" media="${tag.media}">\n`;
  }
  
  // Save link tags to a file
  fs.writeFileSync(path.join(__dirname, '../splash-link-tags.html'), linkTagsHTML);
  console.log('💾 Link tags saved to splash-link-tags.html');
  
  console.log(`\n✅ Successfully generated ${splashSizes.length} splash screens!`);
}

generateSplashScreens().catch(console.error);
