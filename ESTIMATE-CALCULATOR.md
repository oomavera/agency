# 🏠 Agency Estimate Calculator

## 📋 Overview
A fully functional estimate calculator for Agency that allows customers to get instant pricing for house cleaning services and book their first clean directly online.

## ✅ Features Implemented

### 🎯 **Core Functionality**
- ✅ **Live pricing calculation** with frequency discounts
- ✅ **Interactive form fields** (frequency, bedrooms, bathrooms, add-ons)
- ✅ **3D house visualization** (placeholder with room counts)
- ✅ **Lead capture modal** with full validation
- ✅ **Supabase integration** for storing leads
- ✅ **Calendar redirect** to Calendly for first clean booking

### 💰 **Pricing Logic**
- **Base rates**: $35/bedroom, $50/bathroom, $30/add-on
- **Frequency discounts**:
  - One-time: No discount (1.0x)
  - Monthly: 20% off (0.8x)
  - Bi-weekly: 30% off (0.7x)
  - Weekly: 40% off (0.6x)
- **Discount applies to**: Core price + add-ons (bundled)

### 🏗️ **Architecture**

#### **Components Structure**
```
src/
├── components/
│   ├── QuoteForm/
│   │   ├── FrequencyField.tsx      # Radio buttons for cleaning frequency
│   │   ├── NumberField.tsx         # Stepper inputs for bed/bath counts
│   │   ├── AddonsField.tsx         # Checkbox list for optional services
│   │   └── EstimateBar.tsx         # Price display + Book Now button
│   ├── LeadModal/
│   │   └── LeadForm.tsx            # Customer info capture form
│   └── HouseVisualization.tsx      # 3D house preview (placeholder)
├── lib/
│   ├── config.ts                   # Configuration constants
│   ├── quote.ts                    # Pricing logic & validation
│   └── validation.ts               # Form validation functions
├── types/
│   └── quote.ts                    # TypeScript interfaces
└── app/
    └── estimate/
        └── page.tsx                # Main calculator page
```

#### **Data Flow**
1. **User Input** → QuoteInput state
2. **Live Calculation** → computeQuote() → Quote object
3. **Validation** → validateQuoteInput() → Errors object
4. **Lead Capture** → LeadForm → Supabase → Calendar redirect

### 📱 **Responsive Design**
- **Mobile**: 3D visualization on top, form below
- **Desktop**: 2-column layout (3D left, form right)
- **Sticky estimate bar** on mobile for easy access

### 🎨 **UI/UX Features**
- **Live price updates** as user changes inputs
- **Visual feedback** for selected options
- **Accessibility** with ARIA labels and keyboard navigation
- **Professional styling** matching brand aesthetics

### 🗄️ **Database Integration**
- **Enhanced leads table** with quote_payload and service type
- **Automatic lead categorization** (contact_form vs estimate_request)
- **JSON storage** of complete quote details
- **Indexed queries** for performance

## 🚀 **Setup Instructions**

### 1. **Database Migration**
Run the migration script in Supabase SQL Editor:
```sql
-- See: database-migration-estimate.sql
```

### 2. **Configuration**
Update values in `src/lib/config.ts`:
- `CALENDAR_URL_BASE`: Your Calendly booking URL
- `QUOTE_MAX_BEDROOMS/BATHROOMS`: Adjust limits as needed

### 3. **Navigation Integration**
The calculator is linked from:
- ✅ Hero section: "GET INSTANT ESTIMATE" button
- ✅ Package sections: "INSTANT ESTIMATE" buttons
- ✅ Direct URL: `/estimate`

## 📊 **Pricing Examples**

### Example 1: Standard Setup
- **3 bedrooms, 2 bathrooms, monthly cleaning**
- Core: (3×$35 + 2×$50) = $205
- Monthly discount: $205 × 0.8 = **$164.00**

### Example 2: With Add-ons
- **2 bedrooms, 1 bathroom, weekly cleaning, 2 add-ons**
- Core: (2×$35 + 1×$50) = $135
- Add-ons: 2×$30 = $60
- Weekly discount: ($135 + $60) × 0.6 = **$117.00**

## 🔧 **Customization Options**

### **Pricing Adjustments**
Edit constants in `src/lib/quote.ts`:
```typescript
const PRICE_PER_BEDROOM = 35;   // Adjust base rates
const PRICE_PER_BATHROOM = 50;
const PRICE_PER_ADDON = 30;

const FREQ_FACTOR = {           // Adjust discounts
  once: 1.00,
  monthly: 0.80,    // 20% off
  biWeekly: 0.70,   // 30% off  
  weekly: 0.60      // 40% off
};
```

### **Add-on Services**
Modify options in `src/components/QuoteForm/AddonsField.tsx`:
```typescript
const ADDON_OPTIONS = [
  { id: "oven", label: "Oven", description: "Interior oven cleaning" },
  { id: "ceilingFans", label: "Ceiling Fans", description: "Dust and wipe blades" },
  // Add new services here...
];
```

### **Copy/Text Updates**
All user-facing text is in `src/lib/config.ts`:
```typescript
export const CONFIG = {
  COPY: {
    freqLabel: "How often?",
    bedroomsLabel: "Bedrooms",
    // Update any text here...
  }
};
```

## 📈 **Analytics & Tracking**

### **Built-in Events**
The system tracks:
- Quote updates (when user changes inputs)
- Lead submissions (when form is completed)
- Calendar redirects (when first clean is booked)

### **Data Access**
- **All leads**: Supabase dashboard → `leads` table
- **Estimate requests**: Use the `estimate_requests` view
- **Quote details**: Stored in `quote_payload` JSON column

## 🎯 **Future Enhancements**

### **Immediate Improvements**
- [ ] **Enhanced 3D visualization** with Three.js
- [ ] **Email notifications** for new estimates
- [ ] **Admin dashboard** for lead management
- [ ] **SMS notifications** option

### **Advanced Features**
- [ ] **Custom pricing tiers** by location
- [ ] **Seasonal pricing** adjustments
- [ ] **Promotional codes** support
- [ ] **Multi-location** support

### **Integration Options**
- [ ] **CRM integration** (HubSpot, Salesforce)
- [ ] **Payment processing** for deposits
- [ ] **Calendar sync** with Google Calendar
- [ ] **Review request** automation

## 🐛 **Troubleshooting**

### **Common Issues**

**Issue**: Calculator not loading
- **Solution**: Check browser console for JavaScript errors
- **Check**: All components are properly imported

**Issue**: Pricing calculation incorrect
- **Solution**: Verify constants in `src/lib/quote.ts`
- **Test**: Use the example calculations above

**Issue**: Database errors
- **Solution**: Run the migration script `database-migration-estimate.sql`
- **Verify**: Table structure includes `quote_payload` and `service` columns

**Issue**: Calendar redirect not working
- **Solution**: Update `CALENDAR_URL_BASE` in config
- **Test**: Manual URL construction in browser

### **Testing Checklist**
- [ ] All form fields validate correctly
- [ ] Pricing updates live as inputs change
- [ ] Modal opens/closes properly
- [ ] Form submission creates database record
- [ ] Calendar redirect includes correct parameters
- [ ] Mobile layout works on actual devices

## 📞 **Support**

For technical issues or customization requests:
1. Check console logs for error messages
2. Verify database schema is up to date
3. Test with simple inputs first
4. Review this documentation for configuration options

---

**The estimate calculator is now live and ready to generate leads for Agency!** 🎉

Visit: `http://localhost:3001/estimate` to test the calculator. 