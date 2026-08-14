import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Download, Trash2, Mail } from "lucide-react";
import { adminListNewsletterSubscribers, adminDeleteNewsletterSubscriber } from "@/lib/cms.functions";

const ADMIN_TOKEN = "Hir@2026";
const ADMIN_KEY = "hir_admin_authed_v2";

function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(ADMIN_KEY) === "1"; } catch { return false; }
}

export const Route = createFileRoute("/admin/newsletter")({
  component: NewsletterAdmin,
});

interface Subscriber {
  id: number;
  email: string;
  subscribed_at: string;
  ip_address: string | null;
  user_agent: string | null;
  status: 'active' | 'unsubscribed';
}

function NewsletterAdmin() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (isAdmin()) {
      loadSubscribers();
    }
  }, []);

  async function loadSubscribers() {
    try {
      setLoading(true);
      const data = await adminListNewsletterSubscribers({ token: ADMIN_TOKEN });
      setSubscribers(data);
    } catch (err) {
      console.error("Failed to load subscribers:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this subscriber?")) return;
    
    try {
      setDeleting(id);
      await adminDeleteNewsletterSubscriber({ token: ADMIN_TOKEN, id });
      setSubscribers(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err.message || "Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  function downloadExcel() {
    // Create CSV content
    const headers = ["Email", "Subscribed Date", "Subscribed Time", "IP Address", "Status"];
    const rows = subscribers.map(sub => {
      const date = new Date(sub.subscribed_at);
      return [
        sub.email,
        date.toLocaleDateString('en-IN'),
        date.toLocaleTimeString('en-IN'),
        sub.ip_address || "N/A",
        sub.status
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-secondary rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Subscribers</h1>
          <p className="text-muted-foreground mt-2">
            {subscribers.length} {subscribers.length === 1 ? 'subscriber' : 'subscribers'}
          </p>
        </div>
        
        {subscribers.length > 0 && (
          <button
            onClick={downloadExcel}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:brightness-110 transition"
          >
            <Download className="h-4 w-4" />
            Download Excel
          </button>
        )}
      </div>

      {subscribers.length === 0 ? (
        <div className="text-center py-16 bg-secondary/30 rounded-xl">
          <Mail className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No subscribers yet</h3>
          <p className="text-muted-foreground">
            When users subscribe to the newsletter, they'll appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">#</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Subscribed Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">IP Address</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subscribers.map((sub, index) => {
                  const { date, time } = formatDate(sub.subscribed_at);
                  return (
                    <tr key={sub.id} className="hover:bg-secondary/30 transition">
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-brand" />
                          <span className="font-medium">{sub.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {date}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {time}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sub.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {sub.ip_address || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => handleDelete(sub.id)}
                            disabled={deleting === sub.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            title="Delete subscriber"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
