"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function EarlyAccessPage() {
  const { user } = useUser();
  const router = useRouter();

  const handleJoin = () => {
    toast.success("You're already in! 🎉");
    router.push("/dashboard");
  };

  return (
    <div className="overflow-y-hidden min-h-screen h-full bg-gradient-to-b from-blue-50 via-white to-white dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a] px-4 py-16 flex items-center justify-center">
      <Card className="w-full max-w-xl shadow-xl border-none bg-white dark:bg-neutral-900 flex flex-col items-center justify-center">
        <CardContent className="p-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
            🚀 Get Early Access
          </h1>
          <p className="mt-4 text-gray-600 dark:text-neutral-400 text-base">
            Thank you for being an early adopter. Enjoy exclusive features like
            AI Resume Analysis, Learning Roadmap Generator, and Smart AI Chat —
            before anyone else.
          </p>

          <div className="mt-8">
            <Input
              type="email"
              placeholder="you@example.com"
              className="mb-4"
              disabled
              value={user?.primaryEmailAddress?.emailAddress || ""}
            />
            <Button
              onClick={handleJoin}
              className="w-full text-white bg-blue-600 hover:bg-blue-700"
            >
              Access Now
            </Button>
          </div>

          <p className="mt-6 text-sm text-gray-400 dark:text-neutral-500">
            Questions?{" "}
            <a href="/contact" className="underline">
              Contact us
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
