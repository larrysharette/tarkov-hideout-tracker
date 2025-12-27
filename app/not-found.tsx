import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 md:px-6 max-w-7xl py-12 md:py-20">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">
              Page not found
            </CardTitle>
            <CardDescription>
              The page you're looking for doesn't exist or has been moved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                You might have mistyped the address, or the page may have been
                moved to a different location.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link href="/" className="w-full">
                <Button variant="default" className="flex-1">
                  Go home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
