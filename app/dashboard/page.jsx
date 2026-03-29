import { Header } from "@/components/header";
import ComplaintSystem from "@/components/dashboard/Dashboard";
export default function ReportPage() {
  return (
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>
      <div className="pt-20">
        <ComplaintSystem />
      </div>
    </div>
  );
}
