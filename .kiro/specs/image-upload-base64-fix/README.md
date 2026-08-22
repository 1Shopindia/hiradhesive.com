# Image Upload Base64 Fix

## Overview
This bugfix addresses an issue where product and blog images uploaded through the admin panel are being stored as base64 data URLs in the database instead of proper file paths, causing images not to display on the frontend.

## Problem
- **Symptom**: Images uploaded via admin panel don't show on frontend
- **Root Cause**: Database stores `data:image/png;base64,...` instead of `/api/public/images/...`
- **Impact**: All product and blog image uploads are affected

## Expected Behavior
- Admin uploads image → File saved to filesystem → Database stores proper URL path → Image displays on frontend

## Solution Approach
1. **Add diagnostic logging** to trace where base64 is being set
2. **Add client-side validation** to reject base64 URLs after upload
3. **Add server-side validation** to prevent base64 from reaching database
4. **Test thoroughly** to verify fix works for all image types

## Files Affected
- `src/lib/settings-store.ts` - Upload function
- `src/lib/cms.functions.ts` - Server handlers and validation
- `src/routes/admin.products.tsx` - Product admin UI
- `src/routes/admin.blogs.tsx` - Blog admin UI

## Documentation
- [Bug Conditions](./bug-conditions.md) - Detailed problem description
- [Requirements](./requirements.md) - Functional and non-functional requirements
- [Design](./design.md) - Technical design and solution approach
- [Tasks](./tasks.md) - Implementation task breakdown

## Workflow
This spec follows the **bugfix workflow** methodology:
1. ✅ Bug conditions defined
2. ✅ Requirements documented
3. ✅ Design created
4. ✅ Tasks broken down
5. ⏳ Ready for implementation

## Quick Start
To implement this fix:
1. Review the [bug-conditions.md](./bug-conditions.md) to understand the problem
2. Review the [design.md](./design.md) to understand the solution
3. Follow [tasks.md](./tasks.md) in order to implement
4. Run manual tests described in Task 6
5. Clean up existing corrupted data as per Task 7

## Testing Strategy
1. Add logging to identify root cause
2. Apply fix based on findings
3. Add validation as safety net
4. Test all upload scenarios (products, blogs, gallery, etc.)
5. Verify database contains proper URLs
6. Verify images display on frontend

## Success Criteria
- [ ] New uploads store proper file paths (not base64)
- [ ] Images display correctly on frontend
- [ ] Server validates and rejects base64 data
- [ ] Client shows clear errors for invalid uploads
- [ ] All image types work (main, gallery, shades, blog cover)
