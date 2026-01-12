import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    console.error("404 Error: Non-existent route:", location.pathname);
  }, [location.pathname]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return navigate("/");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-indigo-950 transition-colors duration-500 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full relative z-10"
      >
        <Card className="glass border-white/40 dark:border-white/10 shadow-2xl backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 overflow-hidden">
          <CardContent className="p-8 sm:p-12 text-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <img
                src="/Logo.svg"
                alt="CodeX Logo"
                className="mx-auto w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-xl"
              />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-8xl sm:text-9xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 filter drop-shadow-sm">
                404
              </h1>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                ขอโทษด้วย — ไม่พบหน้านี้
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto leading-relaxed">
                ดูเหมือนว่าหน้าที่คุณกำลังค้นหาจะถูกย้าย ลบ หรือไม่มีอยู่จริง
                <br />
                <span className="text-sm font-mono text-muted-foreground mt-2 block bg-slate-100 dark:bg-slate-800/50 py-1 px-3 rounded-full mx-auto w-fit border border-slate-200 dark:border-slate-700">
                  {location.pathname}
                </span>
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <form onSubmit={handleSearch} className="max-w-md mx-auto relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-lg p-1 shadow-lg border border-slate-200 dark:border-slate-700">
                  <Search className="w-5 h-5 text-slate-400 ml-3" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ค้นหา..."
                    className="border-0 shadow-none focus-visible:ring-0 bg-transparent flex-1 text-base h-11"
                  />
                  <Button type="submit" size="sm" className="mr-1 bg-blue-600 hover:bg-blue-700 shadow-md">
                    ค้นหา
                  </Button>
                </div>
              </form>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button
                  onClick={() => navigate("/")}
                  size="lg"
                  className="w-full sm:w-auto gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  <Home className="w-4 h-4" />
                  กลับหน้าหลัก
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  size="lg"
                  className="w-full sm:w-auto gap-2 border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  ย้อนกลับ
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400 mix-blend-plus-darker"
        >
          หรือคุณอาจลองตรวจสอบ URL อีกครั้ง
        </motion.p>
      </motion.div>
    </div>
  );
};

export default NotFound;
