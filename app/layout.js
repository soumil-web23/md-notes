import { AuthProvider } from '@/context/AuthContext';
import './fanta.css'
import './globals.css'
import Head from './head';

export const metadata = {
  title: "Markdown-pdf",
  description: "Convert Markdown files to PDF",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head />
      <AuthProvider>
        <body>
        <div id="app"> {children} </div>
        <div id="portal"></div>
        
      </body>
      </AuthProvider>
      
    </html>
  );
}
