# Bug Conditions

## Bug Description
When uploading product or blog images through the admin panel, images are not displaying on the frontend. The database is storing base64 data URLs (like `data:image/png;base64,iVBORw0KG...`) instead of proper file paths like `/api/public/images/product-images/filename.jpg` or `https://hiradhesive.com/images/product/HIR-ALPHA.png`.

## Expected Behavior
1. Admin uploads an image file through the admin panel (products or blogs)
2. Image is saved to the filesystem in the appropriate bucket (`product-images` or `blog-images`)
3. Database stores the proper URL path (e.g., `/api/public/images/product-images/HIR-ALPHA-1234567890.jpg`)
4. Image displays correctly on the frontend when accessed via the stored URL

## Actual Behavior
1. Admin uploads an image file through the admin panel
2. Image file appears to upload successfully (toast shows "Uploaded")
3. Database stores a base64 data URL instead of a file path (e.g., `data:image/png;base64,iVBORw0KG...`)
4. Image does not display on the frontend because browsers cannot resolve the base64 string as a proper image source in the context it's being used

## Root Cause Hypothesis
The upload flow appears correct architecturally:
- `uploadImage()` in `src/lib/settings-store.ts` reads file as data URL and sends to server
- `adminUploadImage` in `src/lib/cms.functions.ts` receives data URL, converts to bytes, and calls `uploadFile()`
- `uploadFile()` in `src/lib/storage/index.server.ts` should save to filesystem and return proper URL

**Suspected Issue**: The base64 data URL used for the upload process is being saved to the database instead of waiting for and using the returned proper URL from the upload function. This could happen if:
1. The image preview (which uses the base64 data URL) is overwriting the field before the upload completes
2. The returned URL from `uploadImage()` is not being properly awaited or assigned
3. There's a race condition where the draft state is being set with the base64 preview before the upload response arrives

## Affected Components
1. **Product Images** (`src/routes/admin.products.tsx`):
   - Main product image (`image` field)
   - Gallery images (`gallery` field)
   - Shades image (`shades_image` field)

2. **Blog Images** (`src/routes/admin.blogs.tsx`):
   - Cover image (`image` field)

## Steps to Reproduce
1. Navigate to admin panel (`/admin/products` or `/admin/blogs`)
2. Create or edit a product/blog
3. Click "Upload" button for an image field
4. Select an image file from the filesystem
5. Click "Save & Publish"
6. Check the database - the image field contains `data:image/...;base64,...` instead of `/api/public/images/...`
7. View the product/blog on the frontend - image does not display

## Impact
- **Severity**: High - Images are core content for products and blogs
- **Scope**: Affects all product and blog image uploads through admin panel
- **User Impact**: Content cannot be properly displayed on the frontend
- **Data**: Existing products/blogs with base64 URLs in database need to be re-uploaded

## Evidence
- User report: "backend se upload kar rahe hain to frontend main show nahi ho raha hain"
- Database contains image URLs like: `data:image/png;base64,iVBORw0KG...`
- Expected format: `/api/public/images/product-images/HIR-ALPHA.png` or full domain URL

## Related Code Files
- `src/lib/settings-store.ts` - Contains `uploadImage()` function
- `src/lib/cms.functions.ts` - Contains `adminUploadImage` server function
- `src/lib/storage/index.server.ts` - Contains `uploadFile()` function
- `src/routes/admin.products.tsx` - Product admin UI with upload functionality
- `src/routes/admin.blogs.tsx` - Blog admin UI with upload functionality
