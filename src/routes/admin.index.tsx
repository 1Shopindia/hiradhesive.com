import { createFileRoute, Link } from "@tanstack/react-router";
import { useAllBlogs, useAllProducts } from "@/lib/content-store";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const products = useAllProducts();
  const blogs = useAllBlogs();
  const publishedProducts = products.filter(p => p.published).length;
  const publishedBlogs = blogs.filter(b => b.published).length;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="Products" total={products.length} pub={publishedProducts} to="/admin/products" />
      <Card title="Blogs" total={blogs.length} pub={publishedBlogs} to="/admin/blogs" />
    </div>
  );
}

function Card({ title, total, pub, to }: { title: string; total: number; pub: number; to: "/admin/products" | "/admin/blogs" }) {
  return (
    <Link to={to} className="block bg-white rounded-2xl border border-border p-6 hover:shadow-elegant hover:border-brand/40 transition-all">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-4xl font-bold mt-2">{total}</p>
      <p className="text-xs text-muted-foreground mt-1">{pub} published · {total - pub} drafts</p>
      <p className="text-brand text-sm mt-4">Manage →</p>
    </Link>
  );
}
