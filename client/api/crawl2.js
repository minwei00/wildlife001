import puppeteer from 'puppeteer';
import fs from 'fs';

const urlsToCrawl = [
  "https://www.mandai.com/en/singapore-zoo.html",
  "https://www.mandai.com/en/night-safari.html",
  "https://www.mandai.com/en/river-wonders.html",
  "https://www.mandai.com/en/bird-paradise.html",
  "https://www.mandai.com/en/rainforest-wild-adventure.html",
  "https://www.mandai.com/en/curiosity-cove.html",
  "https://www.mandai.com/en/exploria.html",
  "https://www.mandai.com/en/mandai-boardwalk.html",
  "https://www.mandai.com/en/mandai-gallery.html",
  "https://www.mandai.com/en/mandai-wildlife-east.html",
  "https://www.mandai.com/en/mandai-wildlife-west.html",
  "https://www.mandai.com/en/tickets-and-passes/multi-attractions.html",
  "https://www.mandai.com/en/tickets-and-passes/single-attractions.html",
  "https://www.mandai.com/en/tickets-and-passes/wildpass.html",
  "https://www.mandai.com/en/tickets-and-passes/promotions.html",
  "https://www.mandai.com/en/plan-your-visit/getting-to-and-around.html",
  "https://www.mandai.com/en/plan-your-visit/know-before-you-go.html",
  "https://www.mandai.com/en/faq.html",
  "https://www.mandai.com/en/plan-your-visit/parks-rules-conditions.html",
  "https://www.mandai.com/en/plan-your-visit/maps.html",
  "https://www.mandai.com/en/plan-your-visit/itinerary/bird-paradise-too-wild-to-miss.html",
  "https://www.mandai.com/en/plan-your-visit/itinerary/epic-day-out-a-full-day-of-wildlife-wonders.html#bird-paradise",
  "https://www.mandai.com/en/plan-your-visit/itinerary/river-wonders-too-wild-to-miss.html",
  "https://www.mandai.com/en/plan-your-visit/itinerary/singapore-zoo-too-wild-to-miss.html",
  "https://www.mandai.com/en/plan-your-visit/itinerary/night-safari-too-wild-to-miss.html",
  "https://www.mandai.com/en/plan-your-visit/itinerary/day-off-in-singapore.html",
  "https://www.mandai.com/en/plan-your-visit/mandai-mobile-app.html",
  "https://www.mandai.com/en/see-and-do/kids-play.html",
  "https://www.mandai.com/en/bird-paradise/animals-and-zones.html",
  "https://www.mandai.com/en/night-safari/animals-and-zones.html",
  "https://www.mandai.com/en/rainforest-wild-adventure/animals-and-zones.html",
  "https://www.mandai.com/en/river-wonders/animals-and-zones.html",
  "https://www.mandai.com/en/singapore-zoo/animals-and-zones.html",
  "https://www.mandai.com/en/care-for-planet/animals-under-our-care.html",
  "https://www.mandai.com/en/see-and-do/presentations.html",
  "https://www.mandai.com/en/see-and-do/feed-the-animals.html",
  "https://www.mandai.com/en/see-and-do/animal-interactions.html",
  "https://www.mandai.com/en/see-and-do/keeper-talks.html",
  "https://www.mandai.com/en/see-and-do/treks-and-trails.html",
  "https://www.mandai.com/en/see-and-do/rides.html",
  "https://www.mandai.com/en/see-and-do/rides/river-wonders/amazon-river-quest.html",
  "https://www.mandai.com/en/plan-your-visit/know-before-you-go/singapore-zoo.html#gettingaround",
  "https://www.mandai.com/en/see-and-do/digital-experiences.html",
  "https://www.mandai.com/en/dine-and-shop/dining-outlets.html",
  "https://www.mandai.com/en/dine-and-shop/wild-dining.html",
  "https://www.mandai.com/en/dine-and-shop/shopping-outlets.html",
  "https://www.mandai.com/en/dine-and-shop/lifestyle-outlets.html",
  "https://www.mandai.com/en/dine-and-shop/photo-pass-redemption.html",
  "https://www.mandai.com/en/mandai-rainforest-resort.html",
  "https://www.mandai.com/en/memberships.html"
];

async function crawl() {
  // Clear file at the very start
  fs.writeFileSync('mandai.txt', ''); 
  
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Set User-Agent to look like a real browser
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');

  for (const url of urlsToCrawl) {
    try {
      console.log("Crawling:", url);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      const text = await page.evaluate(() => document.body.innerText);
      
      fs.appendFileSync('mandai.txt', `URL: ${url}\n\n${text}\n\n--------------------------\n\n`);
      console.log("Saved content for:", url);
    } catch (err) {
      console.error("Error crawling", url, err.message);
    }
  }
  
  await browser.close();
  console.log("Scrape complete! All data saved to mandai.txt");
}

crawl();