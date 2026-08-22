# Requirements

## Functional Requirements

### FR1: Image Upload Must Return Proper File Path
**Priority**: Critical  
**Description**: When an image is uploaded through the admin panel, the system must save the file to the filesystem and return a proper URL path that can be stored in the database and used to serve the image.

**Acceptance Criteria**:
- Upload function returns URL in format `/api/public/images/{bucket}/{filename}`
- URL is valid and can be used to access the image via HTTP
- URL does not contain base64 data

### FR2: Database Must Store File Paths, Not Base64 Data
**Priority**: Critical  
**Description**: The database image fields must only store proper file paths or URLs, never base64 data URLs.

**Acceptance Criteria**:
- Product `image`, `gallery`, and `shades_image` fields contain only proper URLs
- Blog `image` field contains only proper URLs
- No field contains strings starting with `data:image/`

### FR3: Admin UI Must Wait for Upload Completion
**Priority**: Critical  
**Description**: The admin UI must wait for the upload to complete and receive the proper URL before updating the draft state with the image path.

**Acceptance Criteria**:
- Upload button shows loading state during upload
- Draft state is only updated after upload completes successfully
- Returned URL from upload function is the value stored in draft state
- No race condition between preview and upload completion

### FR4: Image Preview Should Not Interfere With Upload
**Priority**: High  
**Description**: If an image preview is shown during upload, it must not overwrite the final URL field with the base64 preview data.

**Acceptance Criteria**:
- Preview can use base64 data URL for display purposes only
- Preview does not modify the actual field value that will be saved to database
- Final field value is the URL returned from the upload function

### FR5: Upload Errors Must Be Handled Gracefully
**Priority**: High  
**Description**: If an image upload fails, the user must be informed and the field must not be updated with invalid data.

**Acceptance Criteria**:
- Upload failures show error toast with meaningful message
- Field value remains unchanged if upload fails
- User can retry the upload

## Non-Functional Requirements

### NFR1: Upload Performance
**Priority**: Medium  
**Description**: Image uploads should complete in a reasonable time frame.

**Acceptance Criteria**:
- Upload completes within 5 seconds for images up to 5MB
- User sees progress indication during upload
- UI remains responsive during upload

### NFR2: Data Validation
**Priority**: High  
**Description**: Server-side validation must prevent base64 data URLs from being stored in database.

**Acceptance Criteria**:
- Server validates that image fields do not start with `data:image/`
- Invalid data is rejected with clear error message
- Validation occurs before database write

### NFR3: Debugging and Logging
**Priority**: Medium  
**Description**: Upload process should have sufficient logging to diagnose issues.

**Acceptance Criteria**:
- Upload function logs the returned URL
- Server function logs successful file saves
- Errors are logged with full context

## Out of Scope
- Migration of existing base64 data in database (can be handled separately)
- Image compression or optimization
- Multiple file upload at once
- Drag-and-drop upload interface
- Image cropping or editing features
- CDN integration for image serving

## Constraints
- Must work with existing filesystem storage architecture
- Must maintain compatibility with existing image serving routes (`/api/public/images/...`)
- Must not break existing products/blogs with valid URLs
- Must work with current authentication system (ADMIN_TOKEN)

## Dependencies
- Existing `uploadFile()` function in `src/lib/storage/index.server.ts` must continue to work correctly
- Existing image serving routes must remain functional
- Database schema remains unchanged
