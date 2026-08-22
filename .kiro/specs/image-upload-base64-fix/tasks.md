# Tasks

- [x] **Task 1: Add diagnostic logging to trace upload flow**
**Description**: Add console.log statements throughout the upload flow to identify where base64 data URLs are being set instead of proper file paths.

**Files to modify**:
- `src/lib/settings-store.ts` - Add logging in `uploadImage()` function
- `src/lib/cms.functions.ts` - Add logging in `adminUploadImage` handler
- `src/routes/admin.products.tsx` - Add logging in `upload()` function
- `src/routes/admin.blogs.tsx` - Add logging in `uploadImage()` function

**Acceptance criteria**:
- Logging shows file name and bucket at start of upload
- Logging shows data URL length after FileReader completes
- Logging shows returned URL from server
- Logging shows URL being set in draft state
- All log messages include component identifier prefix (e.g., `[admin.products]`)

**Implementation notes**:
- Use `console.log()` for successful operations
- Use `console.error()` for failures
- Include all relevant context (filename, bucket, URL, etc.)

---

- [x] **Task 2: Add client-side validation to reject base64 URLs**
**Description**: Add validation in the admin UI upload handlers to check if the returned URL is a base64 data URL and show an error if it is.

**Files to modify**:
- `src/routes/admin.products.tsx` - Validate URL in `upload()` function before setting draft
- `src/routes/admin.blogs.tsx` - Validate URL in `uploadImage()` function before setting draft

**Acceptance criteria**:
- After upload completes, check if returned URL starts with `data:`
- If base64 detected, throw error with message: "Upload returned base64 data URL instead of file path. Please try again."
- Draft state is NOT updated if validation fails
- Error is logged to console
- User sees error toast

**Implementation notes**:
- Add validation check: `if (url.startsWith('data:')) { throw new Error(...) }`
- Place check after successful upload but before `setDraft()`
- Error will be caught by existing try-catch and shown via toast

---

- [x] **Task 3: Add server-side validation in image upload handler**
**Description**: Add validation in the server-side upload handler to ensure the returned URL is not a base64 data URL.

**Files to modify**:
- `src/lib/cms.functions.ts` - Validate returned URL in `adminUploadImage` handler

**Acceptance criteria**:
- After `uploadFile()` returns URL, check if it starts with `data:`
- If base64 detected, throw error with message: "Internal error: uploadFile returned base64 data instead of file path"
- Log the error with full context
- Error is propagated to client

**Implementation notes**:
- Add validation after `const url = await uploadFile(...)`
- Check: `if (url.startsWith('data:')) { throw new Error(...) }`
- This catches issues in the storage layer

---

- [x] **Task 4: Add server-side validation in product save handler**
**Description**: Add validation in the product save handler to reject any product data that contains base64 data URLs in image fields.

**Files to modify**:
- `src/lib/cms.functions.ts` - Add validation in `adminSaveProduct` handler

**Acceptance criteria**:
- Before saving product, validate `image`, `shades_image`, and `gallery` fields
- Reject if any field starts with `data:`
- Show clear error message: "Invalid {field} URL: base64 data detected. Please upload the image again."
- Product is not saved if validation fails
- Error is logged

**Implementation notes**:
- Add validation after `requireSlug()` and name validation
- Check each image field separately for clear error messages
- For gallery array, use `.some()` to check if any URL is invalid

---

- [x] **Task 5: Add server-side validation in blog save handler**
**Description**: Add validation in the blog save handler to reject any blog data that contains base64 data URLs in image fields.

**Files to modify**:
- `src/lib/cms.functions.ts` - Add validation in `adminSaveBlog` handler

**Acceptance criteria**:
- Before saving blog, validate `image` field
- Reject if field starts with `data:`
- Show clear error message: "Invalid image URL: base64 data detected. Please upload the image again."
- Blog is not saved if validation fails
- Error is logged

**Implementation notes**:
- Add validation after `requireSlug()` and title validation
- Check: `if (b.image && b.image.startsWith('data:')) { throw new Error(...) }`

---

- [x] **Task 6: Test upload flow and verify fix**
**Description**: Manually test the complete upload flow to verify that images are uploaded correctly and proper URLs are stored in the database.

**Test cases**:
1. **Product main image upload**:
   - Create new product
   - Upload main image
   - Check browser console for logged URLs
   - Save product
   - Verify database contains proper URL (starts with `/api/public/images/`)
   - Verify image displays on frontend

2. **Product gallery image upload**:
   - Edit existing product
   - Upload gallery image
   - Check logged URLs
   - Save product
   - Verify database gallery array contains proper URL
   - Verify gallery displays on frontend

3. **Product shades image upload**:
   - Edit product
   - Upload shades image
   - Check logged URLs
   - Save product
   - Verify database contains proper URL
   - Verify shades image displays

4. **Blog cover image upload**:
   - Create new blog
   - Upload cover image
   - Check logged URLs
   - Save blog
   - Verify database contains proper URL
   - Verify image displays on frontend

5. **Validation tests**:
   - Attempt to manually paste base64 URL into image field
   - Try to save
   - Verify validation error is shown
   - Verify product/blog is not saved

6. **Error handling**:
   - Test with corrupted image file (if possible)
   - Verify error handling works correctly
   - Verify user sees meaningful error message

**Acceptance criteria**:
- All test cases pass
- Console logs show proper URLs throughout the flow
- Database contains only proper URLs (no base64 data)
- Images display correctly on frontend
- Validation prevents saving of base64 URLs
- Error messages are clear and actionable

**Implementation notes**:
- Use browser DevTools to check console logs
- Use database tool to verify stored values
- Test on both products and blogs
- Test both create and edit workflows

---

- [x] **Task 7: Document the fix and create cleanup plan**
**Description**: Document the changes made and create a plan for cleaning up existing base64 URLs in the database (if any exist).

**Deliverables**:
1. **Fix summary**: Brief description of what was wrong and how it was fixed
2. **Database audit query**: SQL query to find products/blogs with base64 URLs
3. **Cleanup recommendations**: How to handle existing corrupted data

**Acceptance criteria**:
- Documentation explains the root cause
- Documentation lists all changes made
- Audit query correctly identifies affected records
- Cleanup plan is clear and actionable

**Implementation notes**:
- Audit query example:
  ```sql
  SELECT slug, name, image FROM products WHERE image LIKE 'data:image%';
  SELECT slug, title, image FROM blogs WHERE image LIKE 'data:image%';
  ```
- Cleanup can be manual re-upload or bulk update (depending on volume)
- Consider creating a migration script if many records are affected
