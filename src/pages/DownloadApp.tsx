import { Smartphone, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/sm-data-logo.jpeg";

const DownloadApp = () => {
  const playStoreUrl = "https://play.google.com/store/apps/details?id=app.lovable.d2cb55103dc048eab38dd0717d79ec9f";
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <img 
            src={logo} 
            alt="SM Data" 
            className="w-24 h-24 rounded-2xl shadow-lg"
          />
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-foreground">
            Download Our App
          </h1>
          <p className="text-muted-foreground">
            SM Data is available as a mobile app. Please download the app to access all features and enjoy the best experience.
          </p>
        </div>

        {/* Download Button */}
        <div className="space-y-4">
          <Button 
            size="lg" 
            className="w-full gap-2"
            onClick={() => window.open(playStoreUrl, '_blank')}
          >
            <Download className="w-5 h-5" />
            Download from Play Store
          </Button>
          
          <p className="text-sm text-muted-foreground">
            iOS version coming soon!
          </p>
        </div>

        {/* Website link */}
        <div className="pt-4 border-t border-border">
          <a 
            href="/website" 
            className="text-primary hover:underline text-sm"
          >
            Visit our website →
          </a>
        </div>
      </div>
    </div>
  );
};

export default DownloadApp;
