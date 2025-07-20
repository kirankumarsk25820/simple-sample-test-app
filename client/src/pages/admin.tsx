import AdminPanel from "@/components/AdminPanel";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Admin() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Assessment
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-slate-800">CodeAssess Admin</h1>
            </div>
          </div>
        </div>
      </nav>

      <AdminPanel />
    </div>
  );
}
