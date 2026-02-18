"use client";

import Link from "next/link";
import {
  ArrowRight,
  Shield,
  FileText,
  Lock,
  PlusCircle,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 py-10">
      {/* Hero / Status Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider mb-4 border border-red-100">
              <span className="w-2 h-2 rounded-full bg-red-600 mr-2 animate-pulse"></span>
              System Status: Active
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-black mb-2">
              SOFT TARGET <span className="text-red-600">DASHBOARD</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-lg">
              Secure investigation documentation and target analysis system.
            </p>
          </div>

          <div className="flex gap-4">
            <Link href="/create">
              <Button
                size="lg"
                className="h-16 px-8 text-lg font-bold shadow-lg shadow-red-500/20"
              >
                <PlusCircle className="mr-2 h-6 w-6" /> INITIATE REPORT
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:border-red-600/50 transition-colors cursor-pointer group">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-full bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Standardized Reporting</h3>
              <p className="text-sm text-gray-500 mt-2">
                Generate consistent, court-ready investigation documents with a
                single click.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-red-600/50 transition-colors cursor-pointer group">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-full bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Secure Local Environment</h3>
              <p className="text-sm text-gray-500 mt-2">
                Data stays on your device. Zero server-side retention for
                maximum security.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-red-600/50 transition-colors cursor-pointer group">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-full bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <Lock className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Encrypted Export</h3>
              <p className="text-sm text-gray-500 mt-2">
                High-fidelity PDF generation with advanced layout preservation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
