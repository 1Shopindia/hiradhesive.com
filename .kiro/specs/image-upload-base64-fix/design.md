# Design

## Problem Analysis

The current implementation has the correct architecture but likely suffers from a timing or state management issue where the base64 data URL (used internally for the upload process) is being saved to the database instead of the returned file path.

### Current Flow
1. User selects image file → FileReader converts to base64 data URL
2. `uploadImage()` sends base64 to server
3. Server converts base64 to bytes → `uploadFile()` saves to disk → returns proper URL
4. **ISSUE**: Base64 preview is somehow being stored instead of returned URL

## Solution Design

### Root Cause Fix
The issue is in the admin UI components where image uploads may be setting the base64 data URL in the draft state either:
1. **Before the upload completes** (race condition)
2. **As a preview that overwrites the final value**
3. **Without awaiting the upload promise properly**

### Solution Approach

#### 1. **Add Explicit Logging** (Diagnostic Phase)
Add console.log statements to trace the exact flow and identify where base64 is being set:
- In `uploadImage()` - log the URL being returned
- In `adminUploadImage` - log the URL being generated
- In admin UI upload handlers - log before and after setting draft state

#### 2. **Ensure Proper Async Handling** (Fix Phase)
Verify that:
- `uploadImage()` promise is properly awaited
- Draft state is only updated AFTER the promise resolves
- No intermediate state updates occur with base64 data

#### 3. **Add Server-Side Validation** (Safety Net)
Prevent base64 data from being saved to database:
- Validate image URL fields in `adminSaveProduct` and `adminSaveBlog`
- Reject any URL starting with `data:image/`
- Return clear error message to user

#### 4. **Add Client-Side Validation** (User Feedback)
Warn user if they try to save with invalid image URL:
- Check image fields before submission
- Show warning if base64 detected
- Prevent save until proper URL is set

## Technical Design

### Component Changes

#### 1. `src/routes/admin.products.tsx` - Upload Handler
**Current Code**:
```typescript
const upload = async (file: File, target: "image" | "shades_image" | "pdf" | "gallery") => {
  try {
    const url = target === "pdf" 
      ? await uploadPdf(file) 
      : await uploadImage(file, "product-images");
    setDraft(d => {
      if (!d) return d;
      if (target === "gallery") return { ...d, gallery: d.gallery ? `${d.gallery}\n${url}` : url };
      return { ...d, [target]: url };
    });
    toast.success("Uploaded");
  } catch (e) { toast.error(e instanceof Error ? e.message : "Upload failed"); }
};
```

**Issue**: This looks correct - it awaits the upload and only sets the returned `url`. Need to verify with logging.

**Fix**: Add logging to confirm the `url` value:
```typescript
const upload = async (file: File, target: "image" | "shades_image" | "pdf" | "gallery") => {
  try {
    console.log(`[admin.products] Starting upload for ${target}, file:`, file.name);
    const url = target === "pdf" 
      ? await uploadPdf(file) 
      : await uploadImage(file, "product-images");
    console.log(`[admin.products] Upload complete for ${target}, URL:`, url);
    
    // Validate URL before setting
    if (url.startsWith('data:')) {
      throw new Error('Upload returned base64 data URL instead of file path. Please try again.');
    }
    
    setDraft(d => {
      if (!d) return d;
      if (target === "gallery") return { ...d, gallery: d.gallery ? `${d.gallery}\n${url}` : url };
      return { ...d, [target]: url };
    });
    toast.success("Uploaded");
  } catch (e) { 
    console.error(`[admin.products] Upload failed for ${target}:`, e);
    toast.error(e instanceof Error ? e.message : "Upload failed"); 
  }
};
```

#### 2. `src/routes/admin.blogs.tsx` - Upload Handler
**Similar fix**:
```typescript
const uploadImage = async (file: File) => {
  try {
    console.log('[admin.blogs] Starting upload, file:', file.name);
    const url = await uploadImageToStorage(file, "blog-images");
    console.log('[admin.blogs] Upload complete, URL:', url);
    
    // Validate URL before setting
    if (url.startsWith('data:')) {
      throw new Error('Upload returned base64 data URL instead of file path. Please try again.');
    }
    
    setDraft(d => (d ? { ...d, image: url } : d));
    toast.success("Uploaded");
  } catch (e) { 
    console.error('[admin.blogs] Upload failed:', e);
    toast.error(e instanceof Error ? e.message : "Upload failed"); 
  }
};
```

#### 3. `src/lib/settings-store.ts` - Upload Function
**Add logging**:
```typescript
export async function uploadImage(file: File, bucket: "product-images" | "blog-images"): Promise<string> {
  console.log(`[settings-store] uploadImage called for bucket: ${bucket}, file: ${file.name}`);
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(file);
  });
  console.log(`[settings-store] File read as data URL, length: ${dataUrl.length}`);
  const { url } = await uploadImageRaw(bucket, file.name, dataUrl);
  console.log(`[settings-store] Upload complete, returned URL: ${url}`);
  return url;
}
```

#### 4. `src/lib/cms.functions.ts` - Server Handler
**Add logging**:
```typescript
export const adminUploadImage = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; bucket: "product-images" | "blog-images"; filename: string; dataUrl: string }) => d)
  .handler(async ({ data }) => {
    checkToken(data.token);
    console.log(`[cms.functions] adminUploadImage called, bucket: ${data.bucket}, filename: ${data.filename}`);
    const base64 = data.dataUrl.split(",")[1] ?? "";
    if (!base64) throw new Error("Upload failed: the file could not be read.");
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    console.log(`[cms.functions] Decoded ${bytes.length} bytes`);
    
    try {
      const { uploadFile } = await import("@/lib/storage/index.server");
      const url = await uploadFile(data.bucket, data.filename || "image.jpg", bytes);
      console.log(`[cms.functions] uploadFile returned URL: ${url}`);
      
      // Validate that we're not returning base64
      if (url.startsWith('data:')) {
        throw new Error('Internal error: uploadFile returned base64 data instead of file path');
      }
      
      return { url };
    } catch (error: any) {
      console.error(`[cms.functions] Upload error:`, error);
      if (error?.statusCode) {
        throw new Error(error.message);
      }
      fail("Upload", error);
    }
  });
```

#### 5. Server-Side Validation in Save Functions

**In `adminSaveProduct`**:
```typescript
// Add after requireSlug and name validation
// Validate image URLs - reject base64 data
if (p.image && p.image.startsWith('data:')) {
  throw new Error('Invalid image URL: base64 data detected. Please upload the image again.');
}
if (p.shades_image && p.shades_image.startsWith('data:')) {
  throw new Error('Invalid shades image URL: base64 data detected. Please upload the image again.');
}
if (p.gallery && p.gallery.some((url: string) => url.startsWith('data:'))) {
  throw new Error('Invalid gallery image URL: base64 data detected. Please upload the images again.');
}
```

**In `adminSaveBlog`**:
```typescript
// Add after requireSlug and title validation
// Validate image URL - reject base64 data
if (b.image && b.image.startsWith('data:')) {
  throw new Error('Invalid image URL: base64 data detected. Please upload the image again.');
}
```

## Alternative Hypothesis

If logging shows that the correct URL IS being returned but base64 is still being saved, the issue might be:

1. **Manual URL entry**: User might be pasting base64 data directly into the URL field
   - **Solution**: Client-side validation before save, server-side validation (already covered above)

2. **Browser/FileReader issue**: The FileReader might not be completing before the URL is set
   - **Solution**: Already using proper async/await pattern

3. **State timing issue**: Multiple rapid saves might cause race conditions
   - **Solution**: Disable save buttons during upload, show loading state

## Testing Strategy

### Phase 1: Add Logging (Diagnostic)
1. Add all logging statements above
2. Test upload flow in browser
3. Check browser console and server logs
4. Identify exact point where base64 appears

### Phase 2: Apply Fix
Based on Phase 1 findings, apply the appropriate fix:
- If URL is correct but state is wrong: Fix state management
- If URL is base64: Fix server-side return value
- If race condition: Add upload state management

### Phase 3: Add Validation (Safety Net)
1. Add server-side validation to prevent base64 storage
2. Add client-side validation for user feedback
3. Test with both valid and invalid data

### Phase 4: Verify Fix
1. Upload new product image → verify database has proper URL → verify frontend displays
2. Upload new blog image → verify database has proper URL → verify frontend displays
3. Try to save with base64 URL → verify error is shown
4. Test gallery images, shades images
5. Test PDF upload (should continue to work)

## Rollout Plan

1. **Deploy with logging** (non-breaking change)
2. **Test in production** to identify root cause
3. **Deploy fix** based on findings
4. **Deploy validation** as safety net
5. **Re-upload affected content** (manual or scripted)

## Success Criteria

- [ ] New image uploads return proper file paths (not base64)
- [ ] Database only contains proper URLs after save
- [ ] Images display correctly on frontend
- [ ] Server rejects attempts to save base64 data
- [ ] Client shows clear error if upload returns invalid data
- [ ] All logging shows correct URL values throughout the flow
