import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SMM Hub",
  description: "Smm Hub Mobile Apps multi api order",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <script src="https://js.pusher.com/beams/2.1.0/push-notifications-cdn.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const beamsClient = new PusherPushNotifications.Client({
                instanceId: '6f464bbd-29d4-49ec-a6af-2b53df1e3685',
              });

              beamsClient.start()
                .then(() => beamsClient.addDeviceInterest('hello'))
                .then(() => console.log('Successfully registered and subscribed!'))
                .catch(console.error);
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
