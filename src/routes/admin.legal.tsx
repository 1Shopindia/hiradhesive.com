import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { adminGetLegalPage, adminSaveLegalPage } from "@/lib/cms.functions";

export const Route = createFileRoute("/admin/legal")({
  component: AdminLegalPages,
});

const ADMIN_TOKEN = "Hir@2026";

interface LegalSection {
  heading: string;
  content: string | string[];
}

interface LegalPageData {
  id: string;
  title: string;
  content: {
    sections: LegalSection[];
  };
  last_updated: string;
  updated_by: string | null;
}

function AdminLegalPages() {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');
  const [termsData, setTermsData] = useState<LegalPageData | null>(null);
  const [privacyData, setPrivacyData] = useState<LegalPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const currentData = activeTab === 'terms' ? termsData : privacyData;

  useEffect(() => {
    loadLegalPages();
  }, []);

  async function loadLegalPages() {
    setLoading(true);
    try {
      const [terms, privacy] = await Promise.all([
        adminGetLegalPage({ data: { token: ADMIN_TOKEN, id: 'terms' } }),
        adminGetLegalPage({ data: { token: ADMIN_TOKEN, id: 'privacy' } }),
      ]);
      setTermsData(terms);
      setPrivacyData(privacy);
    } catch (error: any) {
      console.error('[AdminLegalPages] Failed to load:', error);
      setMessage(`Failed to load: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!currentData) return;

    setSaving(true);
    setMessage("");

    try {
      await adminSaveLegalPage({
        data: {
          token: ADMIN_TOKEN,
          id: currentData.id,
          title: currentData.title,
          content: currentData.content,
          updated_by: 'admin',
        },
      });

      setMessage(`✓ ${currentData.id === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'} saved successfully!`);

      // Reload to get updated timestamp
      await loadLegalPages();
    } catch (error: any) {
      setMessage(`✗ Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  function updateSection(index: number, field: 'heading' | 'content', value: string | string[]) {
    if (!currentData) return;

    const newData = { ...currentData };
    const newSections = [...newData.content.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    newData.content = { sections: newSections };

    if (activeTab === 'terms') {
      setTermsData(newData);
    } else {
      setPrivacyData(newData);
    }
  }

  function addSection() {
    if (!currentData) return;

    const newData = { ...currentData };
    const newSections = [...newData.content.sections];
    newSections.push({
      heading: `${newSections.length + 1}. New Section`,
      content: "Add content here..."
    });
    newData.content = { sections: newSections };

    if (activeTab === 'terms') {
      setTermsData(newData);
    } else {
      setPrivacyData(newData);
    }
  }

  function deleteSection(index: number) {
    if (!currentData) return;
    if (!confirm('Are you sure you want to delete this section?')) return;

    const newData = { ...currentData };
    const newSections = newData.content.sections.filter((_, i) => i !== index);
    newData.content = { sections: newSections };

    if (activeTab === 'terms') {
      setTermsData(newData);
    } else {
      setPrivacyData(newData);
    }
  }

  function toggleContentType(index: number) {
    if (!currentData) return;

    const section = currentData.content.sections[index];
    const newContent = typeof section.content === 'string' 
      ? [section.content] 
      : section.content.join('\n');

    updateSection(index, 'content', newContent);
  }

  if (loading) {
    return (
      <div className="bg-white border border-border rounded-2xl shadow-elegant p-8">
        <p className="text-muted-foreground">Loading legal pages...</p>
      </div>
    );
  }

  if (!currentData) {
    return (
      <div className="bg-white border border-border rounded-2xl shadow-elegant p-8">
        <p className="text-red-600">Failed to load legal pages</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Legal Pages Editor</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Edit Terms & Conditions and Privacy Policy content
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:brightness-110 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-md text-sm ${
          message.startsWith('✓') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('terms')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'terms'
              ? 'border-brand text-brand'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Terms & Conditions
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'privacy'
              ? 'border-brand text-brand'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Privacy Policy
        </button>
      </div>

      {/* Editor */}
      <div className="bg-white border border-border rounded-2xl shadow-elegant">
        <div className="p-6 border-b border-border">
          <label className="block text-sm font-medium text-foreground mb-2">Page Title</label>
          <input
            type="text"
            value={currentData.title}
            onChange={(e) => {
              const newData = { ...currentData, title: e.target.value };
              if (activeTab === 'terms') {
                setTermsData(newData);
              } else {
                setPrivacyData(newData);
              }
            }}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: {new Date(currentData.last_updated).toLocaleString()}
            {currentData.updated_by && ` by ${currentData.updated_by}`}
          </p>
        </div>

        {/* Sections */}
        <div className="p-6 space-y-6">
          {currentData.content.sections.map((section, index) => (
            <div key={index} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={section.heading}
                  onChange={(e) => updateSection(index, 'heading', e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded-md text-sm font-medium"
                  placeholder="Section heading"
                />
                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={() => toggleContentType(index)}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition"
                    title={typeof section.content === 'string' ? 'Convert to list' : 'Convert to paragraph'}
                  >
                    {typeof section.content === 'string' ? 'List' : 'Para'}
                  </button>
                  <button
                    onClick={() => deleteSection(index)}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded transition"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {typeof section.content === 'string' ? (
                <textarea
                  value={section.content}
                  onChange={(e) => updateSection(index, 'content', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm min-h-[100px]"
                  placeholder="Section content (paragraph)"
                />
              ) : (
                <div className="space-y-2">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex gap-2">
                      <span className="text-muted-foreground mt-2">•</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const newContent = [...section.content as string[]];
                          newContent[itemIndex] = e.target.value;
                          updateSection(index, 'content', newContent);
                        }}
                        className="flex-1 px-3 py-2 border border-border rounded-md text-sm"
                        placeholder="List item"
                      />
                      <button
                        onClick={() => {
                          const newContent = (section.content as string[]).filter((_, i) => i !== itemIndex);
                          updateSection(index, 'content', newContent);
                        }}
                        className="px-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newContent = [...section.content as string[], 'New item'];
                      updateSection(index, 'content', newContent);
                    }}
                    className="text-xs text-brand hover:underline"
                  >
                    + Add list item
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addSection}
            className="w-full py-3 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-brand hover:text-brand transition"
          >
            + Add New Section
          </button>
        </div>
      </div>
    </div>
  );
}
