// app/layout.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';

export default function RootLayout({children,}: {
    children: React.ReactNode;
}) {
    return <html lang="ja">
    <body>{children}</body>
    </html>;
}
