// Google Search Console Submission Helper
// This script provides the URLs and steps for submitting pages to GSC

const cityPages = [
  {
    url: 'https://agency.com/house-cleaning-oviedo-fl',
    city: 'Oviedo',
    primaryKeyword: 'house cleaning Oviedo FL',
    expectedTitle: 'House Cleaning Oviedo FL | Agency'
  },
  {
    url: 'https://agency.com/house-cleaning-winter-park-fl',
    city: 'Winter Park',
    primaryKeyword: 'house cleaning Winter Park FL',
    expectedTitle: 'House Cleaning Winter Park FL | Agency'
  },
  {
    url: 'https://agency.com/house-cleaning-lake-mary-fl',
    city: 'Lake Mary',
    primaryKeyword: 'house cleaning Lake Mary FL',
    expectedTitle: 'House Cleaning Lake Mary FL | Agency'
  },
  {
    url: 'https://agency.com/house-cleaning-orlando-fl',
    city: 'Orlando',
    primaryKeyword: 'house cleaning Orlando FL',
    expectedTitle: 'House Cleaning Orlando FL | Agency'
  },
  {
    url: 'https://agency.com/house-cleaning-longwood-fl',
    city: 'Longwood',
    primaryKeyword: 'house cleaning Longwood FL',
    expectedTitle: 'House Cleaning Longwood FL | Agency'
  }
];

console.log('=== Google Search Console Submission Guide ===\n');

console.log('📋 URLs to Submit for Indexing:');
cityPages.forEach((page, index) => {
  console.log(`${index + 1}. ${page.url}`);
  console.log(`   City: ${page.city}`);
  console.log(`   Primary Keyword: ${page.primaryKeyword}`);
  console.log(`   Expected Title: ${page.expectedTitle}\n`);
});

console.log('🔧 Steps for GSC Submission:');
console.log('1. Go to Google Search Console');
console.log('2. Select your property (agency.com)');
console.log('3. Use "URL Inspection" tool for each URL above');
console.log('4. Click "Request Indexing" for each page');
console.log('5. Monitor "Coverage" report for indexing status\n');

console.log('📊 Monitoring Checklist:');
console.log('- [ ] All 5 URLs show as "Submitted and Indexed"');
console.log('- [ ] No crawl errors in Coverage report');
console.log('- [ ] Sitemap.xml successfully submitted');
console.log('- [ ] Core Web Vitals data available');
console.log('- [ ] Search Analytics showing impressions\n');

console.log('⏰ Timeline Expectations:');
console.log('- Initial indexing: 1-7 days');
console.log('- Full indexing: 2-4 weeks');
console.log('- First organic traffic: 2-6 weeks');
console.log('- Ranking improvements: 4-12 weeks\n');

console.log('📈 Success Metrics to Track:');
console.log('- Organic impressions for target keywords');
console.log('- Click-through rates (CTR)');
console.log('- Average position for city-specific queries');
console.log('- Core Web Vitals scores');
console.log('- Conversion rate from organic traffic\n');

console.log('🔄 Post-Submission Actions:');
console.log('1. Set up weekly GSC monitoring');
console.log('2. Schedule 28-day title/meta review');
console.log('3. Prepare for content iteration based on performance');
console.log('4. Monitor competitor rankings for target keywords');

// Export for potential automation
module.exports = {
  cityPages,
  getSubmissionUrls: () => cityPages.map(page => page.url),
  getMonitoringChecklist: () => [
    'All 5 URLs show as "Submitted and Indexed"',
    'No crawl errors in Coverage report',
    'Sitemap.xml successfully submitted',
    'Core Web Vitals data available',
    'Search Analytics showing impressions'
  ]
}; 